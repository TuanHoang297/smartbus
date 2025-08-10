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
import api from "../../services/api";
import Svg, { Path } from "react-native-svg";

// --- JWT helpers ---
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

// SVG mép xé
const TornCornerSVG = ({ fill = "#FFFFFF", stroke = "#E5E7EB" }) => (
  <View style={styles.tornCornerWrap} pointerEvents="none">
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Path
        d="M72,0 L72,44 L62,38 L57,44 L52,38 L47,44 L42,38 L37,44 L32,38 L27,44 L22,38 L0,38 L0,0 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
    </Svg>
    <View style={styles.tornShadow} />
  </View>
);

export default function MyTicketScreen({ navigation }) {
  const [tab, setTab] = useState("single");
  const [usableCards, setUsableCards] = useState([]);
  const [usedCards, setUsedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = useSelector((s) => s.auth?.token);
  const now = useMemo(() => new Date(), [refreshing, loading]);
  const isMonthlyTab = tab === "monthly";

  const isSameYMD = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const pickIssuedDate = (t) => {
    const d = t.IssuedAt ? new Date(t.IssuedAt) : null;
    return isNaN(d?.getTime?.()) ? null : d;
  };

  const pickExpiredDate = (t) => {
    const d = t.ExpiredAt ? new Date(t.ExpiredAt) : null;
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

  const mapToCard = (t) => {
    const issued = pickIssuedDate(t);
    const expired = pickExpiredDate(t);
    const priceNum =
      typeof t.Price === "number" ? t.Price : Number(String(t.Price || 0));
    return {
      id: String(t.Qrcode || Math.random()),
      qrcode: t.Qrcode || null,
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
      rawExpired: expired, // ✅ Dùng ExpiredAt từ API
      ticketTypeName: t.TicketTypeName || "",
      raw: t,
    };
  };

  const splitTickets = (list) => {
    const usable = [];
    const used = [];

    list.forEach((t) => {
      if (!t.rawExpired) {
        used.push(t);
        return;
      }
      if (now >= t.rawExpired || (t.raw?.RemainingUses ?? 0) <= 0) {
        used.push(t);
      } else {
        usable.push(t);
      }
    });

    const sortDesc = (a, b) =>
      new Date(b.rawIssued).getTime() - new Date(a.rawIssued).getTime();

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
      const mapped = data.map(mapToCard);
      const { usable, used } = splitTickets(mapped);
      setUsableCards(usable);
      setUsedCards(used);
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
    }, [token, tab])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  }, [token, tab]);

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

  const CardContent = ({ ticket }) => {
    const sameLine = !ticket.to || ticket.from === ticket.to;
    let expireText = "";
    if (ticket.rawExpired) {
      expireText = `Hết hạn: ${String(ticket.rawExpired.getDate()).padStart(
        2,
        "0"
      )}/${String(ticket.rawExpired.getMonth() + 1).padStart(
        2,
        "0"
      )}/${ticket.rawExpired.getFullYear()}`;
    }
    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.time}>{ticket.time}</Text>
          <MaterialIcons name="directions-bus" size={20} color="#fff" />
        </View>
        <Text style={styles.date}>{ticket.dateText}</Text>
        {expireText ? <Text style={styles.expireDate}>{expireText}</Text> : null}

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

        <View style={{ marginTop: 4 }}>
          <Text style={{ color: "#000", fontSize: 13 }}>
            {isMonthlyTab
              ? `Còn lại: ${ticket.raw?.RemainingUses ?? 0}/30 lượt`
              : `Còn lại: ${ticket.raw?.RemainingUses ?? 0} lượt`}
          </Text>
        </View>
      </View>
    );
  };

  const renderUsableCard = (ticket) => (
    <TouchableOpacity
      key={ticket.id}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("TicketDetail", {
          ticket,
          raw: ticket.raw,
          qrcode: ticket.qrcode,
        })
      }
    >
      <CardContent ticket={ticket} />
    </TouchableOpacity>
  );

  const renderUsedCard = (ticket) => (
    <View key={ticket.id} style={styles.usedTicketWrapper}>
      <TornCornerSVG />
      <View style={{ opacity: 0.55 }}>
        <CardContent ticket={ticket} />
      </View>
    </View>
  );

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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎫 Vé có thể sử dụng</Text>
              <TouchableOpacity>
                <Text style={styles.dropdown}>Mới nhất ⌄</Text>
              </TouchableOpacity>
            </View>
            {usableToRender.length === 0 ? (
              <Text>Chưa có vé khả dụng.</Text>
            ) : (
              usableToRender.map(renderUsableCard)
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🕓 Vé đã sử dụng</Text>
              <TouchableOpacity>
                <Text style={styles.dropdown}>Mới nhất ⌄</Text>
              </TouchableOpacity>
            </View>
            {usedToRender.length === 0 ? (
              <Text>Chưa có vé đã sử dụng.</Text>
            ) : (
              usedToRender.map(renderUsedCard)
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
  headerTitle: { color: "#000", fontSize: 20, fontWeight: "700", marginBottom: 6 },
  headerSubtitle: { color: "#000", fontSize: 14 },
  buyButtonFloating: {
    position: "absolute",
    bottom: -15,
    left: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 2,
    elevation: 5,
  },
  container: { padding: 16, paddingTop: 0, paddingBottom: 120 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTab: { backgroundColor: "#4CAF50" },
  tabText: { color: "#555" },
  activeTabText: { color: "#000", fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  dropdown: { fontSize: 14, color: "#000" },
  ticketCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  ticketHeader: { flexDirection: "row", justifyContent: "space-between" },
  time: { fontSize: 18, fontWeight: "700", color: "#000" },
  date: { color: "#000" },
  expireDate: { color: "#000", fontSize: 13, marginBottom: 4, fontStyle: "italic" },
  stationRow: { flexDirection: "row", justifyContent: "space-between" },
  stationLabel: { color: "#000", fontWeight: "600" },
  locationRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  locationText: { color: "#000", fontSize: 14 },
  locationSingle: { color: "#000", fontSize: 14, marginBottom: 8 },
  dashedLine: { borderTopWidth: 1, borderStyle: "dashed", borderColor: "#fff", marginVertical: 8 },
  priceRow: { flexDirection: "row", justifyContent: "space-between" },
  priceLabel: { color: "#000", fontWeight: "600" },
  priceText: { color: "#000", fontSize: 16, fontWeight: "700" },
  usedTicketWrapper: { position: "relative", marginBottom: 12 },
  tornCornerWrap: { position: "absolute", top: -2, right: -2, width: 72, height: 72, zIndex: 10 },
  tornShadow: {
    position: "absolute",
    top: 40,
    right: 8,
    width: 40,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 4,
    transform: [{ rotate: "12deg" }],
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
