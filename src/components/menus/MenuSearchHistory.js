import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AutoCompleteInput from "../AutoCompleteInput";
import { extractStationsFromRoutes } from "../../services/stationService";

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
  const [stationSuggestions, setStationSuggestions] = useState([]);

  useEffect(() => {
    extractStationsFromRoutes().then(setStationSuggestions);
  }, []);

  const handleConfirm = () => {
    if (!from || !to) {
      alert("Vui lòng nhập đầy đủ điểm bắt đầu và điểm đến");
      return;
    }
    onConfirm?.(from, to);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Điểm đến của bạn</Text>

      <View style={styles.inputRow}>
        <Icon name="map-marker-outline" size={20} color="#00B050" />
        <View style={styles.inputFlex}>
          <AutoCompleteInput
            label="Chọn điểm bắt đầu"
            value={from}
            onChange={setFrom}
            suggestions={stationSuggestions}
            onSelect={setFrom}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <Icon name="map-marker" size={20} color="#00B050" />
        <View style={styles.inputFlex}>
          <AutoCompleteInput
            label="Bạn đang muốn đi đâu?"
            value={to}
            onChange={setTo}
            suggestions={stationSuggestions}
            onSelect={setTo}
          />
        </View>
      </View>

      <Text style={styles.section}>Chuyến đi gần đây</Text>
      {recentPlaces.map((place, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.recentItem}
          onPress={() => {
            setFrom(place.from);
            setTo(place.to);
          }}
        >
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
          <TouchableOpacity
            key={idx}
            style={styles.savedBtn}
            onPress={() => setFrom(item.label)}
          >
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
  inputFlex: {
    flex: 1,
    marginLeft: 8,
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
