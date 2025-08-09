// components/RouteCardList.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import RouteCard from "./routes/RouteCard";
import PlanCard from "./routes/PlanCard"; // thẻ hiển thị legs (walk/bus)
import { findBusRoutesFromTo } from "../services/routeSearchService";

/* ============ constants & utils ============ */
const FARE_PER_SEGMENT = 5000; // 5.000đ / tuyến bus

const fmtVND = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "";
  return v.toLocaleString("vi-VN");
};
const nowHHmm = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const safeName = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.name || v.label || v.title || v.stationName || v.stopName || v.place_name || "";
};
const safeRouteId = (r) =>
  r?.routeId || r?.id || r?.routeCode || r?.code || null;

// gom routeIds từ plan (đa chặng)
const extractRouteIdsFromPlan = (plan) => {
  const ids = new Set();
  const legs = plan?.legs || plan?.segments || [];
  legs.forEach((lg) => {
    const rid =
      lg?.routeId || lg?.route?.id || lg?.routeCode || lg?.code || lg?.id || null;
    if (rid) ids.add(String(rid));
  });
  return Array.from(ids);
};

/* ============ build trip cho DIRECT (1 segment) ============ */
function buildTripFromDirect(r, from, to) {
  const note = r?.duration ? `${r.duration}, không đổi trạm` : "không đổi trạm";
  const timeStr = r?.time || nowHHmm();

  const rid = safeRouteId(r); // 👈 lấy routeId
  const board = safeName(r?.station) || safeName(r?.boardingStop) || safeName(from);
  const dest = safeName(to);

  const steps = [];
  if (safeName(from) && board && safeName(from) !== board) {
    steps.push({
      icon: "walk",
      label: `Đi bộ: ${safeName(from)} → ${board}`,
      note: "",
    });
  }
  steps.push({
    icon: "bus",
    label: `Bus: ${board} → ${dest}`,
    note: r?.duration || "",
  });

  const segPrice = fmtVND(FARE_PER_SEGMENT); // 5.000 cho tuyến direct

  return {
    time: timeStr,
    note,
    from: board,
    to: dest,
    price: segPrice, // tổng (1 tuyến)
    routeName: r?.routeName,
    routeId: rid,               // 👈 đơn lẻ
    routeIds: rid ? [rid] : [], // 👈 mảng để BuyTicketScreen gọi API vé
    details: steps,             // fallback
    segments: [
      {
        title: `Bus ${r?.routeName || ""} (${board} → ${dest})`.trim(),
        price: segPrice,
        steps,
        routeId: rid,           // (tuỳ chọn) gắn id vào từng segment
      },
    ],
  };
}

/* ============ component ============ */
export default function RouteCardList({ from, to, onCardPress }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // tránh gọi lại nếu text không đổi
  const lastQueryRef = useRef({ from: null, to: null });

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!from || !to) return;

      if (lastQueryRef.current.from === from && lastQueryRef.current.to === to) {
        return;
      }

      lastQueryRef.current = { from, to };
      setErr(null);
      setLoading(true);

      try {
        const result = await findBusRoutesFromTo(from, to);
        setRoutes(result || []);
      } catch (e) {
        setErr(e?.message || "Có lỗi xảy ra");
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [from, to]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        {from && to
          ? `Các chuyến từ "${from}" đến "${to}"`
          : "Chọn điểm bắt đầu và điểm đến"}
      </Text>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.timeBtn}>
          <Text style={styles.timeText}>Bây giờ</Text>
          <Icon name="chevron-down" size={18} color="#00B050" />
        </TouchableOpacity>
        <View style={styles.iconGroup}>
          <Icon name="walk" size={20} color="#00B050" style={styles.icon} />
          <Icon name="bus" size={20} color="#00B050" style={styles.icon} />
          <Icon name="train" size={20} color="#00B050" style={styles.icon} />
        </View>
        <View style={styles.settingBtn}>
          <IconButton icon="cog" iconColor="white" size={20} />
        </View>
      </View>

      {loading && <ActivityIndicator color="#00B050" style={{ marginTop: 12 }} />}

      {!loading && err && <Text style={styles.error}>{err}</Text>}

      {!loading && routes.length === 0 && from && to && !err && (
        <Text style={styles.empty}>Không tìm thấy chuyến xe phù hợp</Text>
      )}

      {/* Render danh sách kết quả */}
      {!loading &&
        routes.map((r, idx) => {
          // Planner (multi: walk + nhiều bus) -> dùng PlanCard & truyền routeIds
          if (r.type === "multi") {
            const routeIds = extractRouteIdsFromPlan(r);
            const primaryRouteId = routeIds[0] || null;

            return (
              <PlanCard
                key={`plan-${idx}`}
                plan={r}
                time={r.time || nowHHmm()} // giữ UI của bạn
                // 👇 thêm để PlanCard hiển thị/ghi nhớ
                routeIds={routeIds}
                primaryRouteId={primaryRouteId}
                // khi người dùng bấm: PlanCard trả về trip có routeIds đầy đủ
                onPress={(trip) => onCardPress?.(trip)}
              />
            );
          }

          // Mặc định: tuyến direct -> build trip chuẩn có 1 segment
          return (
            <TouchableOpacity
              key={`direct-${idx}`}
              onPress={() => onCardPress?.(buildTripFromDirect(r, from, to))}
              activeOpacity={0.85}
            >
              <RouteCard
                time={r.time || nowHHmm()}
                duration={r.duration}
                station={safeName(r.station)}
                price={`${fmtVND(FARE_PER_SEGMENT)}`} // hiển thị 5.000
                from={from}
                to={to}
                routeName={r.routeName}
                routeId={safeRouteId(r)} // 👈 TRUYỀN XUỐNG CARD
              />
            </TouchableOpacity>
          );
        })}
    </ScrollView>
  );
}

/* ============ styles ============ */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  header: { fontWeight: "600", fontSize: 16, textAlign: "center", marginBottom: 12 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeText: { fontWeight: "600", color: "#333" },
  iconGroup: { flexDirection: "row" },
  icon: { marginHorizontal: 4 },
  settingBtn: { backgroundColor: "#00B050", borderRadius: 10 },
  empty: { textAlign: "center", color: "#888", marginTop: 12 },
  error: { textAlign: "center", color: "#d33", marginTop: 12 },
});
