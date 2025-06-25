import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, IconButton } from "react-native-paper";

export default function RouteCardMini({ time = "14:05", note = "23 phút, không đổi trạm", from = "Trạm Ngã Tư Thủ Đức", onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.note}>{note}</Text>
        <IconButton icon="dots-horizontal" size={18} style={styles.optionsIcon} />
      </View>

      <View style={styles.rowBottom}>
        <Image
          source={{ uri: "https://img.freepik.com/free-icon/bus-stop_318-130578.jpg" }}
          style={styles.icon}
        />
        <Text style={styles.from}>Từ {from}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    width: 200,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  note: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  optionsIcon: {
    margin: 0,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  from: {
    fontSize: 13,
    color: "#444",
  },
});
