import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TripDetailCard({ trip }) {
  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có chuyến nào được chọn.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hành trình của bạn</Text>

      <View style={styles.headerRow}>
        <Text style={styles.time}>{trip.time}</Text>
        <Text style={styles.note}>{trip.note}</Text>
        <Icon name="dots-horizontal" size={24} color="#00B050" />
      </View>

      <View style={styles.stationRow}>
        <View style={styles.stationBlock}>
          <Text style={styles.stationCode}>Trạm </Text>
          <Text style={styles.stationName}>{trip.from}</Text>
        </View>
        <Text style={styles.direction}>Đến</Text>
        <View style={styles.stationBlock}>
          <Text style={styles.stationCode}>Trạm </Text>
          <Text style={styles.stationName}>{trip.to}</Text>
        </View>
      </View>

      <View style={styles.fareRow}>
        <Button mode="outlined" icon="account">Vé người lớn</Button>
        <Button mode="contained" style={styles.fareBtn} labelStyle={{ color: "white" }}>
          <Text style={{ color: "white" }}>{trip.price} VND</Text>
        </Button>
      </View>


      <Text style={styles.sectionTitle}>Chi tiết chuyến đi</Text>
      {trip.details?.map((item, idx) => (
        <View key={idx} style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Icon name={item.icon} size={16} color="white" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.detailTitle}>{item.label}</Text>
            <Text style={styles.detailSub}>{item.note}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  time: {
    fontSize: 24,
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#777",
    maxWidth: "70%",
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  stationBlock: {
    alignItems: "center",
    flex: 1,
  },
  stationCode: {
    fontSize: 12,
    color: "#666",
  },
  stationName: {
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  direction: {
    color: "#666",
    paddingHorizontal: 8,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  fareBtn: {
    backgroundColor: "#00B050",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  iconCircle: {
    backgroundColor: "#00B050",
    padding: 6,
    borderRadius: 20,
  },
  detailTitle: {
    fontWeight: "bold",
    fontSize: 13,
  },
  detailSub: {
    fontSize: 12,
    color: "#666",
  },
});
