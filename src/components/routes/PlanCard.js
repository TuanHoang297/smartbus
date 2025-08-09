import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const FARE_PER_SEGMENT = 5000; // 5.000 đ / tuyến bus

/* ---------------- utils ---------------- */
function fmtMeters(m) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}
function fmtDuration(min) {
  if (min == null) return "";
  return `${Math.round(min)} phút`;
}
function fmtVND(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "";
  return v.toLocaleString("vi-VN");
}
function nowHHmm() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
// Đọc tên trạm từ nhiều kiểu dữ liệu
function readName(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return (
    v.name ||
    v.label ||
    v.title ||
    v.stationName ||
    v.stopName ||
    v.place_name ||
    ""
  );
}

// lấy routeId/routeCode an toàn từ 1 leg bus
function readLegRouteId(leg) {
  if (!leg) return null;
  return (
    leg.routeId ||
    leg.routeCode || // nhiều dữ liệu chỉ có code
    (leg.route && (leg.route.id || leg.route.code)) ||
    leg.code ||
    leg.id ||
    null
  );
}

/**
 * PlanCard - giữ nguyên dữ liệu, đổi UI theo RouteCard + build trip cho TripDetailCard
 * props:
 * - plan: { totalMinutes, transfers, legs: [ {type:'walk'|'bus', ...} ] }
 * - time?: string   (vd "08:35"; nếu thiếu sẽ dùng giờ máy)
 * - price?: number  (tổng giá nếu muốn override)
 * - onPress?: (trip) => void
 */
export default function PlanCard({ plan, time, price, onPress }) {
  const { totalMinutes = 0, transfers = 0, legs = [] } = plan || {};

  // các leg bus
  const busLegs = useMemo(() => legs.filter((l) => l.type === "bus"), [legs]);
  const firstBusLeg = busLegs[0];
  const lastBusLeg = busLegs[busLegs.length - 1];

  // gom tất cả routeIds (unique) từ các leg bus
  const routeIds = useMemo(() => {
    const set = new Set();
    busLegs.forEach((lg) => {
      const rid = readLegRouteId(lg);
      if (rid) set.add(String(rid));
    });
    return Array.from(set);
  }, [busLegs]);

  const primaryRouteId = routeIds[0] || null; // dùng để hiển thị “Mã tuyến: …”
  const displayTime = time || nowHHmm();

  // tên tuyến (nếu có)
  const routeName =
    firstBusLeg?.routeName ||
    (firstBusLeg?.routeCode ? `Bus ${firstBusLeg.routeCode}` : undefined);

  // mô tả tổng quan
  const detailText =
    transfers === 0
      ? `${fmtDuration(totalMinutes)}, không đổi trạm`
      : `${fmtDuration(totalMinutes)}, ${transfers} lần chuyển tuyến`;

  // trạm lên xe hiển thị
  const stationUp =
    readName(firstBusLeg?.from) || readName(legs[0]?.from) || "";

  /* -------------- build trip for TripDetailCard -------------- */
  const buildTrip = () => {
    const details = [];
    const segments = [];

    legs.forEach((leg, idx) => {
      if (leg.type === "walk") {
        const fromN = readName(leg.from);
        const toN = readName(leg.to);
        details.push({
          icon: "walk",
          label: `Đi bộ: ${fromN} → ${toN}`,
          note:
            leg.meters != null
              ? `${fmtMeters(leg.meters)}${
                  leg.minutes ? ` • ${fmtDuration(leg.minutes)}` : ""
                }`
              : fmtDuration(leg.minutes),
        });
        return;
      }

      if (leg.type === "bus") {
        const fromN = readName(leg.from);
        const toN = readName(leg.to);
        const code = leg.routeCode || leg.code || primaryRouteId || "";
        const stops = typeof leg.stops === "number" ? `${leg.stops} chặng` : "";
        const dur = leg.minutes ? fmtDuration(leg.minutes) : "";
        const sub = [stops, dur].filter(Boolean).join(" • ");
        const rid = readLegRouteId(leg);

        // fallback phẳng (giữ đủ info như bản gốc)
        details.push({
          icon: "bus",
          label: `Bus ${code}: ${fromN} → ${toN}`,
          note: sub,
        });

        // segment theo từng tuyến bus (giá cố định 5.000)
        const steps = [];
        const prev = legs[idx - 1];
        if (prev && prev.type === "walk") {
          const wFrom = readName(prev.from);
          const wTo = readName(prev.to);
          steps.push({
            icon: "walk",
            label: `Đi bộ: ${wFrom} → ${wTo}`,
            note:
              prev.meters != null
                ? `${fmtMeters(prev.meters)}${
                    prev.minutes ? ` • ${fmtDuration(prev.minutes)}` : ""
                  }`
                : fmtDuration(prev.minutes),
          });
        }
        steps.push({
          icon: "bus",
          label: `Bus ${code}: ${fromN} → ${toN}`,
          note: sub,
        });

        segments.push({
          title: `Bus ${code} (${fromN} → ${toN})`,
          price: fmtVND(FARE_PER_SEGMENT), // 5.000 cho từng tuyến bus
          steps,
          routeId: rid || primaryRouteId || null, // ⬅️ gắn routeId vào từng segment
        });
      }
    });

    // tổng giá = số tuyến bus × 5.000 (trừ khi prop price truyền vào để override)
    const totalPriceNumber =
      typeof price === "number" ? price : busLegs.length * FARE_PER_SEGMENT;

    return {
      time: displayTime,
      note: detailText,
      from: readName(firstBusLeg?.from) || "",
      to: readName(lastBusLeg?.to) || "",
      price: fmtVND(totalPriceNumber), // ví dụ "10.000"
      routeName,
      // ⬇️ QUAN TRỌNG: thêm đầy đủ mảng routeIds để màn mua vé gọi API theo từng tuyến
      routeIds,
      details, // fallback
      segments, // để TripDetailCard hiển thị theo tuyến + giá (đã có routeId từng segment)
    };
  };

  const handlePress = () => onPress && onPress(buildTrip());

  // strip icon ngắn gọn + giá tổng
  const iconStrip = (() => {
    const hasWalkToBus = legs.some((l) => l.type === "walk") && firstBusLeg;
    const busCount = busLegs.length;
    const totalPrice = fmtVND(
      typeof price === "number" ? price : busCount * FARE_PER_SEGMENT
    );
    return (
      <View style={styles.routeRow}>
        {hasWalkToBus && <Icon name="walk" size={20} />}
        {hasWalkToBus && <Icon name="arrow-right" size={20} />}
        {busCount >= 1 && <Icon name="bus" size={20} />}
        {busCount > 1 && (
          <Text style={styles.transferBadge}>+{busCount - 1} đổi</Text>
        )}
        {!!totalPrice && <Text style={styles.price}>{totalPrice} đ</Text>}
      </View>
    );
  })();

  // danh sách legs — giữ đủ info, chỉ đổi style
  const renderLegs = () => {
    const rows = [];
    let prevLegType = null;

    legs.forEach((leg, i) => {
      if (leg.type === "walk") {
        rows.push(
          <View key={`walk-${i}`} style={styles.legRow}>
            <View style={styles.legIconCircle}>
              <Icon name="walk" size={14} color="#fff" />
            </View>
            <View style={styles.legTexts}>
              <Text style={styles.legTitle}>
                Đi bộ: “{readName(leg.from)} → {readName(leg.to)}”
              </Text>
              <Text style={styles.legSub}>
                {leg.meters != null
                  ? fmtMeters(leg.meters)
                  : fmtDuration(leg.minutes)}
              </Text>
            </View>
          </View>
        );
      } else if (leg.type === "bus") {
        const prefix = prevLegType === "bus" ? "Đổi qua " : "";
        rows.push(
          <View key={`bus-${i}`} style={styles.legRow}>
            <View
              style={[styles.legIconCircle, { backgroundColor: "#0078D4" }]}
            >
              <Icon name="bus" size={14} color="#fff" />
            </View>
            <View style={styles.legTexts}>
              <Text style={styles.legTitle}>
                {prefix}Bus {leg.routeCode}
                {typeof leg.stops === "number" ? ` (${leg.stops} chặng)` : ""} → “
                {readName(leg.to)}”
              </Text>
              <Text style={styles.legSub}>
                {leg.minutes ? fmtDuration(leg.minutes) : ""}
              </Text>
            </View>
          </View>
        );
      }
      prevLegType = leg.type;
    });

    return rows;
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.card}>
        {/* Header theo RouteCard */}
        <Text style={styles.time}>{displayTime}</Text>
        <Text style={styles.detail}>{detailText}</Text>
        {!!routeName && <Text style={styles.routeName}>Tuyến: {routeName}</Text>}
        {/* ⬇️ THÊM: hiển thị mã tuyến chính (không đổi layout, chỉ thêm 1 dòng dưới routeName) */}
        {!!primaryRouteId && (
          <Text style={styles.routeId}>Tuyến xe bus số: {primaryRouteId}</Text>
        )}

        {/* Trạm lên xe */}
        {!!stationUp && <Text style={styles.label}>Trạm lên xe</Text>}
        {!!stationUp && <Text style={styles.station}>{stationUp}</Text>}

        {/* Icon strip + tổng giá */}
        {iconStrip}

        {/* Divider */}
        {legs.length > 0 && <View style={styles.divider} />}

        {/* Danh sách legs */}
        {renderLegs()}

        {/* Tổng kết */}
        <View style={styles.summaryRow}>
          <Icon
            name="clock-outline"
            size={18}
            color="#444"
            style={styles.summaryIcon}
          />
          <Text style={styles.summary}>
            Tổng ~ {totalMinutes} phút, {transfers} lần chuyển tuyến
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  card: { backgroundColor: "#f2f2f2", borderRadius: 12, padding: 16, marginBottom: 12 },
  time: { fontSize: 16, fontWeight: "bold", color: "#333" },
  detail: { fontSize: 13, color: "#555", marginBottom: 4 },
  routeName: { fontSize: 13, color: "#888", marginBottom: 4 },
  // ⬇️ thêm style giống RouteCard
  routeId: { fontSize: 13, color: "#888", marginBottom: 8 },
  label: { fontSize: 12, color: "#888" },
  station: { fontWeight: "bold", fontSize: 14, marginBottom: 12, color: "#000" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  transferBadge: { marginLeft: 6, fontSize: 12, color: "#666" },
  price: {
    marginLeft: "auto",
    backgroundColor: "#00B050",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  divider: { height: 1, backgroundColor: "#e5e5e5", marginVertical: 12 },
  legRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  legIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#00B050",
    alignItems: "center",
    justifyContent: "center",
  },
  legTexts: { marginLeft: 10, flex: 1 },
  legTitle: { fontSize: 13, fontWeight: "600", color: "#222" },
  legSub: { fontSize: 12, color: "#666", marginTop: 2 },
  summaryRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  summaryIcon: { marginRight: 8 },
  summary: { fontWeight: "600", color: "#222" },
});
