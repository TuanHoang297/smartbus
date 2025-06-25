import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function PreviousRoute() {
  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Text style={styles.time}>14:05</Text>
        <Icon name="circle-small" size={24} color="#00B050" />
        <View style={styles.line} />
        <Icon name="circle-small" size={24} color="#00B050" />
        <Text style={styles.time}>14:31</Text>
      </View>

      <View style={styles.stationRow}>
        <Text style={styles.station}>Trạm C</Text>
        <Text style={styles.station}>Trạm D</Text>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Ngã tư Thủ Đức</Text>
        <Text style={styles.label}>Đại học FPT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  time: {
    fontWeight: "bold",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#00B050",
    marginHorizontal: 4,
  },
  stationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  station: {
    fontSize: 12,
    color: "#555",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});
