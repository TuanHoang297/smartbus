import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

export default function TripDetailCard({ trip, detailsMaxHeight = 420 }) {
  const navigation = useNavigation();

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có chuyến nào được chọn.</Text>
      </View>
    );
  }

  const hasSegments = Array.isArray(trip.segments) && trip.segments.length > 0;

  // ==== utils ====
  const firstNonEmpty = (...vals) => {
    for (const v of vals) {
      if (v !== undefined && v !== null) {
        const s = String(v).trim();
        if (s !== "") return s;
      }
    }
    return null;
  };
  const stepLabel = (s) => s?.label ?? s?.name ?? s?.stopName ?? s?.title ?? "";

  // routeIds tổng để fallback
  const routeIdsRaw =
    Array.isArray(trip?.routeIds) && trip.routeIds.length > 0
      ? trip.routeIds
      : trip?.routeId
      ? [trip.routeId]
      : trip?.RouteId
      ? [trip.RouteId]
      : [];
  const routeIds = Array.from(new Set((routeIdsRaw || []).filter(Boolean))).map(String);

  // ===== build routes to pass to BuyTicketScreen =====
  const buildRoutesForTicket = () => {
    if (hasSegments) {
      const items = trip.segments.map((seg, idx) => {
        const steps = Array.isArray(seg?.steps) ? seg.steps : [];
        const firstStep = steps[0] || null;
        const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

        const rid = firstNonEmpty(
          seg?.routeId,
          seg?.RouteId,
          seg?.routeCode,
          seg?.RouteCode,
          routeIds[idx],
          routeIds[0],
          trip?.routeId,
          trip?.RouteId,
          trip?.routeCode,
          trip?.RouteCode,
          trip?.Id,
          trip?.id,
          trip?.code,
          trip?.Code
        );

        return {
          routeId: rid,
          routeName: seg?.title || trip?.routeName || trip?.RouteName || "",
          from: firstNonEmpty(stepLabel(firstStep), trip?.from, trip?.start) || "",
          to: firstNonEmpty(stepLabel(lastStep), trip?.to, trip?.end) || "",
          price: seg?.price ?? trip?.price ?? null,
        };
      });

      // lọc item hợp lệ & unique theo (routeId, from, to)
      const seen = new Set();
      return items
        .filter((r) => !!r.routeId)
        .filter((r) => {
          const k = `${r.routeId}|${r.from}|${r.to}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
    }

    // ---- single route (không có segments) ----
    const rid = firstNonEmpty(
      routeIds[0],
      trip?.routeId,
      trip?.RouteId,
      trip?.routeCode,
      trip?.RouteCode,
      trip?.Id,
      trip?.id,
      trip?.code,
      trip?.Code
    );

    const one = {
      routeId: rid,
      routeName: trip?.routeName || trip?.RouteName || "",
      from: firstNonEmpty(trip?.from, trip?.start) || "",
      to: firstNonEmpty(trip?.to, trip?.end) || "",
      price: trip?.price ?? null,
    };

    return one.routeId ? [one] : [];
  };

  const routesForTicket = buildRoutesForTicket();

  const handlePressPrice = () => {
    if (!routesForTicket.length) return;
    // @ts-ignore
    navigation.navigate("BuyTicketScreen", { routes: routesForTicket });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hành trình của bạn</Text>

      <View style={styles.headerRow}>
        <Text style={styles.time}>{trip.time || "--:--"}</Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          {!!trip.routeName && (
            <Text style={styles.routeName}>Tuyến: {trip.routeName}</Text>
          )}
          {!!trip.RouteName && !trip.routeName && (
            <Text style={styles.routeName}>Tuyến: {trip.RouteName}</Text>
          )}
        </View>
        <Icon name="dots-horizontal" size={24} color="#00B050" />
      </View>

      {!!trip.note && <Text style={styles.note}>{trip.note}</Text>}

      <View style={styles.stationRow}>
        <View style={styles.stationBlock}>
          <Text style={styles.stationCode}>Trạm</Text>
          <Text style={styles.stationName}>{firstNonEmpty(trip.from, trip.start) || "-"}</Text>
        </View>
        <Text style={styles.direction}>Đến</Text>
        <View style={styles.stationBlock}>
          <Text style={styles.stationCode}>Trạm</Text>
          <Text style={styles.stationName}>{firstNonEmpty(trip.to, trip.end) || "-"}</Text>
        </View>
      </View>

      <View style={styles.fareRow}>
        <Button mode="outlined" icon="account">Vé người lớn</Button>
        <Button
          mode="contained"
          style={styles.fareBtn}
          labelStyle={{ color: "white" }}
          onPress={handlePressPrice}
          disabled={!routesForTicket.length}
        >
          {trip.price ? `${trip.price} VND` : "—"}
        </Button>
      </View>

      <ScrollView
        style={[styles.detailsScroll, { maxHeight: detailsMaxHeight }]}
        contentContainerStyle={styles.detailsContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {hasSegments ? (
          <>
            <Text style={styles.sectionTitle}>Các chặng (theo tuyến)</Text>

            {trip.segments.map((seg, idx) => {
              const segRouteId = firstNonEmpty(
                seg?.routeId,
                seg?.RouteId,
                seg?.routeCode,
                seg?.RouteCode,
                routeIds[idx],
                routeIds[0],
                trip?.routeId,
                trip?.RouteId,
                trip?.routeCode,
                trip?.RouteCode,
                trip?.Id,
                trip?.id,
                trip?.code,
                trip?.Code
              );

              return (
                <View key={`${segRouteId ?? "seg"}-${idx}`} style={styles.segmentCard}>
                  <View style={styles.segmentHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={styles.segmentIconCircle}>
                        <Icon name="bus" size={16} color="#fff" />
                      </View>
                      <Text style={styles.segmentTitle}>
                        {seg.title || `Chặng ${idx + 1}`}
                      </Text>
                    </View>

                    {!!seg.price && (
                      <Text style={styles.segmentPrice}>{seg.price} đ</Text>
                    )}
                  </View>

                  {!!segRouteId && (
                    <Text style={styles.segmentRouteInline}>
                      Tuyến xe buýt số: {segRouteId}
                    </Text>
                  )}

                  {seg.steps?.map((st, i) => (
                    <View key={i} style={styles.detailItem}>
                      <View style={styles.iconCircle}>
                        <Icon name={st.icon || "map-marker"} size={16} color="white" />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.detailTitle}>{stepLabel(st) || "-"}</Text>
                        {!!st.note && <Text style={styles.detailSub}>{st.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Chi tiết chuyến đi</Text>
            {trip.details?.map((item, idx) => (
              <View key={idx} style={styles.detailItem}>
                <View style={styles.iconCircle}>
                  <Icon name={item.icon || "map-marker"} size={16} color="white" />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.detailTitle}>{item.label}</Text>
                  {!!item.note && <Text style={styles.detailSub}>{item.note}</Text>}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "white", borderRadius: 16 },
  emptyContainer: { padding: 20, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, color: "#888" },
  title: { textAlign: "center", fontWeight: "bold", fontSize: 16, marginBottom: 12 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  time: { fontSize: 24, fontWeight: "bold" },
  routeName: { fontSize: 12, color: "#00B050", maxWidth: "100%", textAlign: "right" },

  note: { fontSize: 12, color: "#777", marginBottom: 8 },

  stationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 16 },
  stationBlock: { alignItems: "center", flex: 1 },
  stationCode: { fontSize: 12, color: "#666" },
  stationName: { fontWeight: "bold", fontSize: 13, textAlign: "center" },
  direction: { color: "#666", paddingHorizontal: 8 },

  fareRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  fareBtn: { backgroundColor: "#00B050" },

  detailsScroll: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee", paddingTop: 10 },
  detailsContent: { paddingBottom: 8 },

  sectionTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 6 },

  detailItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 12, padding: 10, marginBottom: 10 },
  iconCircle: { backgroundColor: "#00B050", padding: 6, borderRadius: 20 },
  detailTitle: { fontWeight: "bold", fontSize: 13 },
  detailSub: { fontSize: 12, color: "#666" },

  segmentCard: { backgroundColor: "#fafafa", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  segmentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4, justifyContent: "space-between" },
  segmentIconCircle: { backgroundColor: "#0078D4", padding: 6, borderRadius: 20, marginRight: 8 },
  segmentTitle: { fontWeight: "700", fontSize: 13, color: "#222" },

  segmentRouteInline: { fontSize: 12, color: "#2e7d32", marginBottom: 8, marginLeft: 24 },

  segmentPrice: {
    backgroundColor: "#00B050",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    position: "absolute",
    top: -22,
    right: -15,
    zIndex: 9999,
    elevation: 5,
  },
});
