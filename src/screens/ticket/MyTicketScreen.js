// screens/Tickets/MyTicketScreen.js
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNavigationBar from "../../components/BottomNavigation";
import Navbar from "../../components/Navbar";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import api from "../../services/api"; // axios baseURL: https://smartbus-68ae.onrender.com/api

// --- JWT helpers: FE tự decode ---
function base64UrlDecode(input) {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    if (typeof atob === "function") {
      const binary = atob(padded);
      let str = "";
      for (let i = 0; i < binary.length; i++) {
        str += String.fromCharCode(binary.charCodeAt(i));
      }
      try {
        return decodeURIComponent(escape(str));
      } catch {
        return str;
      }
    } else if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {}
  return "";
}

function decodeJwtPayload(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const json = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;
  return (
    payload.userId ||
    payload.id ||
    payload.sub ||
    payload.uid ||
    payload.user_id ||
    null
  );
}

export default function MyTicketScreen({ navigation }) {
  const [tab, setTab] = useState("single"); // 'single' | 'monthly'
  const [usableCards, setUsableCards] = useState([]); // cùng ngày
  const [usedCards, setUsedCards] = useState([]); // qua ngày
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = useSelector((s) => s.auth?.token);

  const now = useMemo(() => new Date(), [refreshing, loading]);

  // So sánh theo ngày-tháng-năm (local device)
  const isSameYMD = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const pickIssuedDate = (t) => {
    const d = t.IssuedAt ? new Date(t.IssuedAt) : null;
    return isNaN(d?.getTime?.()) ? null : d;
  };

  const formatTime = (d) =>
    d
      ? `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      : "--:--";

  const formatDateVN = (d) =>
    d ? `Ngày ${d.getDate()} tháng ${d.getMonth() + 1}` : "";

  // Map từ vé thật sang card UI
  const mapToCard = (t) => {
    const issued = pickIssuedDate(t);
    const priceNum =
      typeof t.Price === "number" ? t.Price : Number(String(t.Price || 0));
    return {
      id: String(t.Qrcode || Math.random()),
      time: formatTime(issued),
      dateText: formatDateVN(issued),
      from: t.RouteName || "—",
      to: t.RouteName || "—",
      price:
        Number.isFinite(priceNum) && priceNum >= 0
          ? `${priceNum.toLocaleString("vi-VN")} đ`
          : `${t.Price}`,
      startStation: t.TicketTypeName || "—",
      endStation: `Mã tuyến ${t.RouteId ?? "—"}`,
      rawIssued: issued,
      rawExpired: t.ExpiredAt ? new Date(t.ExpiredAt) : null,
      ticketTypeName: t.TicketTypeName || "",
    };
  };

  // Phân loại: trong ngày (IssuedAt cùng ngày) vs qua ngày
  const splitTickets = (list) => {
    const usable = [];
    const used = [];
    list.forEach((t) => {
      const issued = t.IssuedAt ? new Date(t.IssuedAt) : null;
      if (issued && isSameYMD(issued, now)) usable.push(t);
      else used.push(t);
    });
    const sortDesc = (a, b) =>
      new Date(b.IssuedAt).getTime() - new Date(a.IssuedAt).getTime();
    return { usable: usable.sort(sortDesc), used: used.sort(sortDesc) };
  };

  const fetchTickets = async () => {
    if (!token) {
      setError("Thiếu token. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
      setError("Không đọc được userId từ JWT. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    try {
      setError("");
      setLoading(true);
      const res = await api.get(`/tickets/user/${userId}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const { usable, used } = splitTickets(data);
      setUsableCards(usable.map(mapToCard));
      setUsedCards(used.map(mapToCard));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Không tải được danh sách vé. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [token])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [token]);

  // ---- Lọc theo TAB ----
  const isMonthlyTab = tab === "monthly";
  const isVeTap = (name) => name === "Vé tập";

  const filterByTab = (card) =>
    isMonthlyTab ? isVeTap(card.ticketTypeName) : !isVeTap(card.ticketTypeName);

  const usableToRender = useMemo(
    () => usableCards.filter(filterByTab),
    [usableCards, tab]
  );
  const usedToRender = useMemo(
    () => usedCards.filter(filterByTab),
    [usedCards, tab]
  );

  // ---- Render card: tránh lặp tên tuyến ----
  const renderTicketCard = (ticket) => {
    const sameLine = !ticket.to || ticket.from === ticket.to;

    return (
      <View style={styles.ticketCard} key={ticket.id}>
        <View style={styles.ticketHeader}>
          <Text style={styles.time}>{ticket.time}</Text>
          <MaterialIcons name="directions-bus" size={20} color="#fff" />
        </View>
        <Text style={styles.date}>{ticket.dateText}</Text>

        <View style={styles.stationRow}>
          <Text style={styles.stationLabel}>{ticket.startStation}</Text>
          <Text style={styles.stationLabel}>{ticket.endStation}</Text>
        </View>

        {sameLine ? (
          <Text style={styles.locationSingle}>
            {ticket.from || ticket.to || "—"}
          </Text>
        ) : (
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>{ticket.from}</Text>
            <Text style={styles.locationText}>{ticket.to}</Text>
          </View>
        )}

        <View style={styles.dashedLine} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá vé</Text>
          <Text style={styles.priceText}>{ticket.price}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />
      <ScrollView
        style={{ backgroundColor: "#fff" }}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ position: "relative", marginBottom: 30 }}>
          <LinearGradient
            colors={["#71e077ff", "#337e36ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <Text style={styles.headerTitle}>Vé của tôi</Text>
            <Text style={styles.headerSubtitle}>
              Mua vé hoặc xem vé hiện tại của bạn.
            </Text>
          </LinearGradient>

          <TouchableOpacity
            style={styles.buyButtonFloating}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buyButtonText}>Mua vé</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === "single" && styles.activeTab]}
            onPress={() => setTab("single")}
          >
            <Text style={tab === "single" ? styles.activeTabText : styles.tabText}>
              Vé
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "monthly" && styles.activeTab]}
            onPress={() => setTab("monthly")}
          >
            <Text
              style={tab === "monthly" ? styles.activeTabText : styles.tabText}
            >
              Vé tháng
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          <>
            {/* Vé có thể sử dụng */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎫 Vé có thể sử dụng</Text>
              <TouchableOpacity>
                <Text style={styles.dropdown}>Mới nhất ⌄</Text>
              </TouchableOpacity>
            </View>
            {usableToRender.length === 0 ? (
              <Text>Chưa có vé khả dụng cho tab này.</Text>
            ) : (
              usableToRender.map(renderTicketCard)
            )}

            {/* Vé đã sử dụng */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🕓 Vé đã sử dụng</Text>
              <TouchableOpacity>
                <Text style={styles.dropdown}>Mới nhất ⌄</Text>
              </TouchableOpacity>
            </View>
            {usedToRender.length === 0 ? (
              <Text>Chưa có vé đã sử dụng cho tab này.</Text>
            ) : (
              usedToRender.map(renderTicketCard)
            )}
          </>
        )}
      </ScrollView>

      <BottomNavigationBar
        activeTab="tickets"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "search") navigation.navigate("RouteLookup");
          else if (key === "account") navigation.navigate("Account");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 60,
    position: "relative",
    zIndex: 1,
  },
  headerTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#000",
    fontSize: 14,
  },
  buyButtonFloating: {
    position: "absolute",
    bottom: -15,
    left: 18,
    alignSelf: "left",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  container: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    color: "#555",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    fontSize: 14,
    color: "#000",
  },
  ticketCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  date: {
    color: "#000",
    marginBottom: 8,
  },
  stationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationLabel: {
    color: "#000",
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationText: {
    color: "#000",
    fontSize: 14,
  },
  locationSingle: {
    color: "#000",
    fontSize: 14,
    marginBottom: 8,
  },
  dashedLine: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fff",
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#000",
    fontWeight: "600",
  },
  priceText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
