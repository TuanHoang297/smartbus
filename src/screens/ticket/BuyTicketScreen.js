import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";

const ticketOptions = [
  {
    id: "regular_subsidized",
    title: "Vé lượt trợ giá",
    description: "Giá vé: 5,000 VNĐ",
  },
  {
    id: "student_subsidized",
    title: "Vé lượt trợ giá HSSV",
    description: "Giá vé: 3,000 VNĐ",
  },
  {
    id: "bulk_ticket",
    title: "Vé tập",
    description: "Giá vé: 112,500 VNĐ",
  },
];

export default function BuyTicketScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState("regular_subsidized");

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
            <Navbar showBack />
      {/* Title section */}
      <View style={{ position: "relative", marginBottom: 30 }}>
        <LinearGradient
                    colors={["#71e077ff", "#337e36ff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerCard}
                  >
                    <Text style={styles.headerTitle}>Chọn loại vé</Text>
                  </LinearGradient>
      </View>

      {/* Vé list */}
      <ScrollView contentContainerStyle={styles.container}>
        {ticketOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setSelected(option.id)}
            style={styles.optionRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons
              name={selected === option.id ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={selected === option.id ? "#4CAF50" : "#aaa"}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nút chọn */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() =>
            navigation.navigate("ConfirmTicketScreen", {
              ticketType: selected,
            })
          }
        >
          <Text style={styles.confirmButtonText}>
            Chọn {ticketOptions.find((t) => t.id === selected)?.title}
          </Text>
        </TouchableOpacity>
      </View>
       <BottomNavigationBar
              activeTab="tickets"
              onTabPress={(key) => {
                if (key === "map") navigation.navigate("Home");
                else if (key === "search") navigation.navigate("RouteLookup");
                else if (key === "account") navigation.navigate("Account");
              }}
            />
    </View>
  );
}

const styles = StyleSheet.create({
 headerCard: {
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 50,
    position: "relative",
    zIndex: 1,
  },

  headerTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "700",
  },
 
  container: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 100,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
