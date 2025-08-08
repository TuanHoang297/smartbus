import React, { useEffect, useState } from "react";
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
import { findBusRoutesFromTo } from "../services/routeSearchService";

export default function RouteCardList({ from, to, onCardPress }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!from || !to) return;
      setLoading(true);
      const result = await findBusRoutesFromTo(from, to);
      setRoutes(result);
      setLoading(false);
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

      {!loading && routes.length === 0 && from && to && (
        <Text style={{ textAlign: "center", color: "#888", marginTop: 12 }}>
          Không tìm thấy chuyến xe phù hợp
        </Text>
      )}

      {routes.map((r, idx) => {
        const trip = {
          time: r.time,
          note: r.duration + (r.transfer ? `, ${r.transfer}` : ", không đổi trạm"),
          from,
          to,
          price: "5.000", // hoặc r.price nếu có
          details: [
            { icon: "map-marker", label: `Từ ${from}`, note: "Điểm đón" },
            { icon: "walk", label: "Đi bộ tới trạm", note: "Khoảng 5 phút" },
            { icon: "bus", label: `Tuyến ${r.routeCode}`, note: r.routeName },
            { icon: "map-marker-check", label: `Đến ${to}`, note: "Điểm xuống" },
          ],
        };

        return (
          <TouchableOpacity key={idx} onPress={() => onCardPress?.(trip)}>
            <RouteCard
              time={r.time}
              duration={r.duration}
              station={r.station}
              price="5.000"
              from={from}
              to={to}
              routeCode={r.routeCode}
              routeName={r.routeName}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
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
  timeText: {
    fontWeight: "600",
    color: "#333",
  },
  iconGroup: {
    flexDirection: "row",
  },
  icon: {
    marginHorizontal: 4,
  },
  settingBtn: {
    backgroundColor: "#00B050",
    borderRadius: 10,
  },
});
