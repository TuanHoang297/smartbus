import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const recentPlaces = [
  { from: "Đại học FPT", to: "Làng đại học" },
  { from: "Đại học FPT", to: "MegaMall" },
  { from: "Đại học FPT", to: "Vinhomes Grand Park" },
];

const savedPlaces = [
  { icon: "home", label: "Nhà" },
  { icon: "office-building", label: "Công ty" },
  { icon: "school", label: "Trường học" },
];

export default function MenuSearchHistory({ onConfirm }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleConfirm = () => {
    if (!from || !to) {
      alert("Vui lòng nhập đầy đủ điểm bắt đầu và điểm đến");
      return;
    }
    onConfirm?.(from, to); // This will trigger modal in RouteSearch
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Điểm đến của bạn</Text>

      <View style={styles.inputRow}>
        <Icon name="map-marker-outline" size={20} color="#00B050" />
        <TextInput
          value={from}
          onChangeText={setFrom}
          placeholder="Chọn điểm bắt đầu"
          style={styles.input}
          mode="outlined"
        />
      </View>

      <View style={styles.inputRow}>
        <Icon name="map-marker" size={20} color="#00B050" />
        <TextInput
          value={to}
          onChangeText={setTo}
          placeholder="Bạn đang muốn đi đâu ?"
          style={styles.input}
          mode="outlined"
        />
      </View>

      <Text style={styles.section}>Chuyến đi gần đây</Text>
      {recentPlaces.map((place, idx) => (
        <TouchableOpacity key={idx} style={styles.recentItem}>
          <Icon name="history" color="white" size={24} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.recentFrom}>{place.from}</Text>
            <Text style={styles.recentTo}>{place.to}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>Địa điểm đã lưu</Text>
      <View style={styles.savedRow}>
        {savedPlaces.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.savedBtn}>
            <Icon name={item.icon} size={20} color="#00B050" />
            <Text style={styles.savedLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleConfirm}
        style={styles.confirmBtn}
        labelStyle={{ fontWeight: "bold" }}
      >
        Xác nhận lựa chọn
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "white",
  },
  section: {
    marginTop: 16,
    fontWeight: "500",
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A8F0C6",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  recentFrom: {
    fontWeight: "bold",
    fontSize: 14,
  },
  recentTo: {
    fontSize: 13,
    color: "#555",
  },
  savedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  savedBtn: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  savedLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#00B050",
  },
  confirmBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    marginTop: 8,
  },
});
