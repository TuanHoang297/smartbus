import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Navbar from "./Navbar";
// Đổi path nếu khác
import { selectAuthToken } from "../redux/slices/authSlice";
import { addMany, markAllRead } from "../redux/slices/notificationsSlice";

// ==== Polyfill atob/btoa cho React Native (nếu thiếu) ====
import { decode as _atob, encode as _btoa } from "base-64";
if (typeof global.atob === "undefined") global.atob = _atob;
if (typeof global.btoa === "undefined") global.btoa = _btoa;

// ===== helpers =====
const formatTime = (isoLike) => {
  if (!isoLike) return "";
  try {
    const d = new Date(isoLike);
    if (isNaN(d.getTime())) return isoLike;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return isoLike;
  }
};

/** Giải mã JWT (base64url) để lấy payload */
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log("⚠️ [NotificationPanel] decodeJwt error:", e);
    return null;
  }
};

// Lấy token + userId (linh động – giống style bạn làm ở BuyTicketScreen)
const useAuthTokenAndUserId = () => {
  const auth = useSelector((s) => s?.auth);
  const directToken = auth?.token ?? auth?.user?.token ?? null;

  let userId = auth?.user?.id ?? auth?.user?.userId ?? auth?.user?.UserId ?? null;
  if (!userId && directToken) {
    const payload = decodeJwt(directToken);
    userId =
      payload?.id ??
      payload?.userId ??
      payload?.uid ??
      payload?.sub ??
      payload?.user?._id ??
      payload?.user?.id ??
      null;
  }
  return { token: directToken, userId };
};

const buildNotificationFromTicket = (ticket) => {
  const routeName = ticket?.RouteName || ticket?.route?.name || ticket?.routeName;
  const routeCode = ticket?.RouteCode || ticket?.route?.code || ticket?.routeCode;
  const startTime =
    ticket?.tripTime ||
    ticket?.StartTime ||
    ticket?.startTime ||
    ticket?.createdAt ||
    ticket?.purchaseTime;

  let message = "Bạn vừa mua vé.";
  if (routeName && routeCode) message = `Bạn vừa mua vé ${routeName} (${routeCode}).`;
  else if (routeName) message = `Bạn vừa mua vé tuyến ${routeName}.`;
  else if (routeCode) message = `Bạn vừa mua vé tuyến ${routeCode}.`;
  if (ticket?.delayMinutes > 0) message += ` Chuyến đi dự kiến chậm ${ticket.delayMinutes} phút.`;

  return {
    id: ticket?._id || ticket?.id || `${Date.now()}-${Math.random()}`,
    time: formatTime(startTime) || "--:--",
    title: "Vé đã mua",
    message,
    action: "Xem vé của bạn",
    raw: ticket,
  };
};

export default function NotificationPanel() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { token, userId } = useAuthTokenAndUserId();
  console.log("🔐 [NotificationPanel] token?", !!token, "userId:", userId);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const seenIdsRef = useRef(new Set());

  const apiUrl = useMemo(() => {
    if (!userId) return null;
    return `https://smartbus-68ae.onrender.com/api/tickets/user/${userId}/tickets`;
  }, [userId]);

  const seenKey = useMemo(
    () => `@seen_ticket_ids_user_${userId ?? "guest"}`,
    [userId]
  );

  // Mark all read khi vào màn hình (giống UX bạn yêu cầu)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(markAllRead());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  // init + poll
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // khôi phục các vé đã thấy để không tạo lại thông báo
        const raw = await AsyncStorage.getItem(seenKey);
        seenIdsRef.current = new Set(raw ? JSON.parse(raw) : []);
        setNotifications([]);

        // fetch lần đầu
        await fetchTicketsAndDetectNew();
      } catch (e) {
        setError("Không tải được thông báo.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Poll mỗi 20s khi có token + userId
    const itv = token && userId ? setInterval(fetchTicketsAndDetectNew, 20000) : null;

    return () => {
      mounted = false;
      if (itv) clearInterval(itv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, apiUrl, seenKey]);

  const persistSeen = async () => {
    try {
      await AsyncStorage.setItem(
        seenKey,
        JSON.stringify(Array.from(seenIdsRef.current))
      );
    } catch {}
  };

  const fetchTicketsAndDetectNew = async () => {
    if (!apiUrl || !token) return;
    try {
      const res = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.");
        }
        return;
      }
      const data = await res.json();
      const tickets = Array.isArray(data) ? data : data?.items || [];

      const newTickets = [];
      for (const t of tickets) {
        const tid = t?._id || t?.id;
        if (!tid) continue;
        if (!seenIdsRef.current.has(tid)) {
          newTickets.push(t);
          seenIdsRef.current.add(tid);
        }
      }

      if (newTickets.length) {
        const newNotifs = newTickets.map(buildNotificationFromTicket);
        // cập nhật UI local
        setNotifications((prev) => [...newNotifs, ...prev]);
        // cập nhật Redux để tăng badge chuông
        dispatch(addMany(newNotifs));
        // lưu dedupe
        persistSeen();
      }
    } catch (e) {
      console.log("💥 [NotificationPanel] fetch error:", e);
    }
  };

  const handleActionPress = (notif) => {
    // Ví dụ điều hướng đến vé:
    // navigation.navigate("MyTicketScreen");
    // hoặc:
    // navigation.navigate("TicketDetail", { ticket: notif.raw });
  };

  const todayLabel = useMemo(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString("vi-VN", { weekday: "long" });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, Hôm nay`;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#666" }}>Đang tải thông báo…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Thông báo mới</Text>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Mới nhất</Text>
            <Icon name="chevron-down" size={18} color="#00B050" />
          </TouchableOpacity>

          <Text style={styles.date}>{todayLabel}</Text>

          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Chưa có thông báo mới</Text>
            </View>
          ) : (
            notifications.map((n) => (
              <View key={n.id} style={styles.notificationCard}>
                <View style={styles.leftIcon}>
                  <Icon name="ticket-confirmation" color="white" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMsg}>{n.message}</Text>
                  {!!n.action && (
                    <TouchableOpacity onPress={() => handleActionPress(n)}>
                      <Text style={styles.notifAction}>{n.action} →</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  filterButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00B050",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  filterText: { color: "#00B050", fontWeight: "500", marginRight: 4 },
  date: { fontSize: 13, color: "#777", marginBottom: 12, textAlign: "center" },

  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F6F6F6",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  leftIcon: {
    backgroundColor: "#00B050",
    padding: 8,
    borderRadius: 30,
    marginRight: 12,
  },
  notifTitle: { fontWeight: "bold", marginBottom: 4 },
  notifMsg: { fontSize: 13, color: "#444" },
  notifAction: { color: "#00B050", fontWeight: "bold", marginTop: 6 },
  notifTime: { fontSize: 12, color: "#999", marginLeft: 8 },

  emptyBox: {
    backgroundColor: "#F6F6F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: { color: "#888" },
});
