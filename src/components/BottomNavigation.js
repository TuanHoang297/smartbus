import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native"; // ✅ thêm dòng này

const tabs = [
  { label: "Tra cứu", icon: "magnify", key: "search" },
  { label: "Bản đồ", icon: "map-outline", key: "map" },
  { label: "Vé của tôi", icon: "ticket-outline", key: "tickets" },
  { label: "Tài khoản", icon: "account-outline", key: "account" },
];

export default function BottomNavigationBar({ activeTab }) {
  const navigation = useNavigation(); // ✅ dùng navigation tại đây

  const handleTabPress = (key) => {
    switch (key) {
      case "search":
        navigation.navigate("RouteLookup");
        break;
      case "map":
        navigation.navigate("Home");
        break;
      case "tickets":
        navigation.navigate("TicketsScreen");
        break;
      case "account":
        navigation.navigate("ProfileScreen");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab.key)} 
          >
            <Icon
              name={tab.icon}
              size={24}
              color={isActive ? "#00B050" : "#555"}
            />
            <Text
              style={[
                styles.label,
                isActive && { color: "#00B050", fontWeight: "600" },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 12,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  tab: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  indicator: {
    height: 3,
    width: 24,
    backgroundColor: "#00B050",
    borderRadius: 2,
    marginTop: 4,
  },
});
