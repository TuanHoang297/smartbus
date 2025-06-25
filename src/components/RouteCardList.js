import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RouteCard from "./routes/RouteCard";

export default function RouteCardList({ from, to, onCardPress }) {
  const routes = [
    {
      time: "14:05",
      duration: "23 phút",
      station: "Trạm Ngã tư Thủ Đức",
      price: "10.000",
    },
    {
      time: "14:35",
      duration: "25 phút",
      station: "Trạm Ngã tư Thủ Đức",
      price: "10.000",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Các chuyến khởi hành tiếp theo</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.timeBtn}>
          <Text style={styles.timeText}>14:00</Text>
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

      {routes.map((r, idx) => (
        <TouchableOpacity key={idx} onPress={() => onCardPress?.(r)}>
          <RouteCard
            time={r.time}
            duration={r.duration}
            station={r.station}
            price={r.price}
            from={from}
            to={to}
          />
        </TouchableOpacity>
      ))}
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
