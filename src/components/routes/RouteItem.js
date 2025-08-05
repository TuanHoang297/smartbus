import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function RouteItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Icon name="bus" size={24} color="#00B050" />
        <View style={{ marginLeft: 10, flexShrink: 1 }}>
          <Text style={styles.routeCode}>Tuyến xe {item.code}</Text>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.distance} km · {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)} · {item.interval}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>Mới!</Text>
          </View>
        )}
        <Icon
          name={item.isFavorited ? "heart" : "heart-outline"}
          size={20}
          color={item.isFavorited ? "#F55" : "#999"}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  routeCode: {
    fontWeight: "bold",
    fontSize: 14,
  },
  routeName: {
    fontSize: 13,
    color: "#333",
    marginTop: 2,
    flexWrap: "wrap",
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  right: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  newBadge: {
    backgroundColor: "#F33",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  newText: {
    color: "white",
    fontSize: 10,
  },
});
