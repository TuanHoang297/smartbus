import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function RouteCard({
  time,
  duration,
  station,
  price,
  from,
  to,
  routeName, 
  routeId,   
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.detail}>{duration}, không đổi trạm</Text>

      {routeName && <Text style={styles.routeName}>Tuyến: {routeName}</Text>}
      
      {/* 👇 hiển thị routeId nếu có */}
      {routeId && <Text style={styles.routeId}>Tuyến xe bus số: {routeId}</Text>}

      <Text style={styles.label}>Trạm lên xe</Text>
      <Text style={styles.station}>{station}</Text>

      <View style={styles.routeRow}>
        <Icon name="walk" size={20} />
        <Icon name="arrow-right" size={20} />
        <Icon name="bus" size={20} />
        <Text style={styles.price}>{price} đ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detail: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  routeName: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  routeId: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "#888",
  },
  station: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 12,
    color: "#000",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
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
});
