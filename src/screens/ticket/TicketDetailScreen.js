// screens/Tickets/TicketDetailScreen.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import SvgQRCode from "react-native-qrcode-svg";
import Navbar from "../../components/Navbar";

export default function TicketDetailScreen({ route }) {
  const { ticket, raw, qrcode } = route.params || {};

  const issued =
    ticket?.rawIssued ?? (raw?.IssuedAt ? new Date(raw.IssuedAt) : null);
  const expiredAt =
    ticket?.rawExpired ?? (raw?.ExpiredAt ? new Date(raw.ExpiredAt) : null);

  const price =
    typeof raw?.Price === "number"
      ? raw.Price
      : Number(String(ticket?.price || "").replace(/\D/g, "")) || 0;

  const routeName = raw?.RouteName || ticket?.from || "";
  const routeCode = raw?.RouteId || "";

  const now = new Date();
  const isExpired = expiredAt ? expiredAt.getTime() <= now.getTime() : false;
  const isUsedOut = Number(raw?.RemainingUses ?? 1) <= 0;
  const status = isExpired ? "Hết hạn" : isUsedOut ? "Đã dùng" : "Hợp lệ";

  const qrCodeString = useMemo(() => {
    const code = qrcode || raw?.Qrcode || ticket?.id || "";
    return `https://smartbus-68ae.onrender.com/api/tickets/verify?code=${encodeURIComponent(
      String(code)
    )}`;
  }, [qrcode, raw, ticket]);

  const fmtHM = (d) =>
    d
      ? `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      : "--:--";

  const timeText = fmtHM(issued);
  const dateText = issued
    ? `ngày ${issued.getDate()} tháng ${issued.getMonth() + 1}`
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={["#71e077ff", "#337e36ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Đã mua vé</Text>
          <View style={styles.headerRow}>
            <Text style={styles.price}>{price.toLocaleString("vi-VN")} vnd</Text>
            <View style={styles.badge}>
              <MaterialIcons name="person" size={16} color="#000" />
              <Text style={styles.badgeText}>Người lớn</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.ticketWrapper}>
          <View style={styles.ticketCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.time}>{timeText}</Text>
              <View style={styles.smallBadge}>
                <MaterialIcons name="payments" size={14} color="#000" />
                <Text style={styles.smallBadgeText}>₫</Text>
              </View>
            </View>
            <Text style={styles.date}>{dateText}</Text>

            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.stationLabel}>Tuyến</Text>
                <Text style={styles.stationValue}>{routeName || "—"}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.stationLabel}>Mã tuyến</Text>
                <Text style={styles.stationValue}>{routeCode || "—"}</Text>
              </View>
            </View>

            <View style={styles.qrBox}>
              <SvgQRCode value={qrCodeString} size={210} />
            </View>

            <View style={[styles.rowBetween, { marginTop: 12 }]}>
              <Text style={styles.dimText}>Mã vé</Text>
              <Text style={[styles.dimText, styles.mono]}>
                {(qrcode || raw?.Qrcode || ticket?.id || "").slice(0, 16)}
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={styles.dimText}>Hết hạn</Text>
              <Text style={styles.dimText}>
                {expiredAt
                  ? `${fmtHM(expiredAt)} • ${expiredAt.getDate()}/${
                      expiredAt.getMonth() + 1
                    }`
                  : "—"}
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={styles.dimText}>Trạng thái</Text>
              <Text
                style={[
                  styles.dimText,
                  { fontWeight: "700", color: isExpired ? "#b00020" : "#0a7" },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.secureBtn}>
            <MaterialIcons name="verified-user" size={18} color="#000" />
            <Text style={styles.secureBtnText}>Bảo đảm chuyến đi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { color: "#000", fontSize: 16, fontWeight: "700" },
  badge: {
    backgroundColor: "rgba(255,255,255,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: { color: "#000", fontWeight: "600" },
  ticketWrapper: { padding: 16, marginTop: 8 },
  ticketCard: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: { fontSize: 22, fontWeight: "800", color: "#000" },
  date: { color: "#000", opacity: 0.9, marginTop: 4 },
  stationLabel: { color: "#000", fontWeight: "700" },
  stationValue: { color: "#000", marginTop: 2 },
  qrBox: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  dimText: { color: "#000", opacity: 0.85 },
  mono: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  bottomRow: { paddingHorizontal: 16, marginTop: 8 },
  secureBtn: {
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secureBtnText: { color: "#000", fontWeight: "600" },
  smallBadge: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  smallBadgeText: { color: "#000", fontWeight: "700" },
});
