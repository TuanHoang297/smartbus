import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const transportOptions = [
  { key: "all", label: "Tất cả", icon: "bus-multiple" },
  { key: "bus", label: "Bus", icon: "bus" },
  { key: "vinbus", label: "Vin Bus", icon: "bus-electric" },
  { key: "metro", label: "Metro", icon: "train" },
];

export default function MenuTransportType({ selected, onSelect, onConfirm }) {
  const [current, setCurrent] = useState(selected || "all");

  const handleSelect = (key) => {
    setCurrent(key);
    onSelect?.(key);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Chọn phương tiện di chuyển</Text>
      <Text style={styles.subheading}>Phương tiện công cộng</Text>

      <View style={styles.optionsRow}>
        {transportOptions.map((item) => {
          const isActive = current === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.option, isActive && styles.optionActive]}
              onPress={() => handleSelect(item.key)}
            >
              <Icon
                name={item.icon}
                size={28}
                color={isActive ? "#00B050" : "#444"}
              />
              <Text
                style={[styles.optionLabel, isActive && { color: "#00B050" }]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        mode="contained"
        onPress={() => onConfirm?.(current)}
        style={styles.confirmBtn}
        labelStyle={{ color: "white", fontWeight: "bold" }}
      >
        Xác nhận lựa chọn
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  heading: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  subheading: {
    textAlign: "center",
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  option: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    width: 70,
  },
  optionActive: {
    backgroundColor: "#e8f7ee",
    borderColor: "#00B050",
    borderWidth: 1.5,
  },
  optionLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
    color: "#444",
  },
  confirmBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    paddingVertical: 6,
  },
});
