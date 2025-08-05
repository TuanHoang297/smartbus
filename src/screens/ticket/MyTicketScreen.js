import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomNavigationBar from "../../components/BottomNavigation";
import Navbar from "../../components/Navbar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const mockTickets = [
  {
    id: "1",
    time: "14:02",
    date: "Ngày 2 tháng 3",
    from: "Ngã tư Thủ Đức",
    to: "Đại học FPT",
    price: "10.000 vnd",
    startStation: "Trạm C",
    endStation: "Trạm D",
  },
];

export default function MyTicketScreen({ navigation }) {
  const [tab, setTab] = useState("single");
  const renderTicketCard = (ticket) => (
    <View style={styles.ticketCard} key={ticket.id}>
      <View style={styles.ticketHeader}>
        <Text style={styles.time}>{ticket.time}</Text>
        <MaterialIcons name="directions-bus" size={20} color="#fff" />
      </View>
      <Text style={styles.date}>{ticket.date}</Text>

      <View style={styles.stationRow}>
        <Text style={styles.stationLabel}>{ticket.startStation}</Text>
        <Text style={styles.stationLabel}>{ticket.endStation}</Text>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationText}>{ticket.from}</Text>
        <Text style={styles.locationText}>{ticket.to}</Text>
      </View>

      <View style={styles.dashedLine} />
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Giá vé</Text>
        <Text style={styles.priceText}>{ticket.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />
      <ScrollView style={{ backgroundColor: "#fff" }} contentContainerStyle={styles.container}>
        <View style={{ position: "relative", marginBottom: 30 }}>
          <LinearGradient
            colors={["#71e077ff", "#337e36ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <Text style={styles.headerTitle}>Vé của tôi</Text>
            <Text style={styles.headerSubtitle}>Mua vé hoặc xem vé hiện tại của bạn.</Text>
          </LinearGradient>

          <TouchableOpacity
            style={styles.buyButtonFloating}
            onPress={() => navigation.navigate("BuyTicketsScreen")}
          >
            <Text style={styles.buyButtonText}>Mua vé</Text>
          </TouchableOpacity>

        </View>




        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === "single" && styles.activeTab]}
            onPress={() => setTab("single")}
          >
            <Text style={tab === "single" ? styles.activeTabText : styles.tabText}>Vé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "monthly" && styles.activeTab]}
            onPress={() => setTab("monthly")}
          >
            <Text style={tab === "monthly" ? styles.activeTabText : styles.tabText}>Vé tháng</Text>
          </TouchableOpacity>
        </View>

        {/* Vé có thể sử dụng */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎫 Vé có thể sử dụng</Text>
          <TouchableOpacity>
            <Text style={styles.dropdown}>Mới nhất ⌄</Text>
          </TouchableOpacity>
        </View>

        {mockTickets.map(renderTicketCard)}

        {/* Vé đã sử dụng */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕓 Vé đã sử dụng</Text>
          <TouchableOpacity>
            <Text style={styles.dropdown}>Mới nhất ⌄</Text>
          </TouchableOpacity>
        </View>

        {mockTickets.map(renderTicketCard)}
      </ScrollView>

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
    paddingBottom: 60,
    position: "relative",
    zIndex: 1,
  },

  headerTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#000",
    fontSize: 14,
  },
  buyButtonFloating: {
    position: "absolute",
    bottom: -15,
    left: 18,
    alignSelf: "left",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  container: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  buyButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    color: "#555",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    fontSize: 14,
    color: "#000",
  },
  ticketCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  date: {
    color: "#000",
    marginBottom: 8,
  },
  stationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stationLabel: {
    color: "#000",
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationText: {
    color: "#000",
    fontSize: 14,
  },
  dashedLine: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fff",
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#000",
    fontWeight: "600",
  },
  priceText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
