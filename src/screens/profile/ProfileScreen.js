import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1, }}>
      <Navbar showBack />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <LinearGradient
          colors={["#71e077ff", "#337e36ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          {/* Header avatar + info */}
          <View style={styles.headerCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require("../../../assets/spiderman.png")}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("EditProfileScreen")}
              >
                <Feather name="edit-3" size={14} color="#000" />
              </TouchableOpacity>

            </View>
            <Text style={styles.username}>thientruong51</Text>
            <View style={styles.phoneContainer}>
              <Ionicons name="copy-outline" size={16} color="#4CAF50" />
              <Text style={styles.phoneText}>0912345678</Text>
            </View>
          </View>
        </LinearGradient>


        {/* Hành trình bạn theo dõi */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hành trình bạn theo dõi</Text>
            <TouchableOpacity>
              <Text style={styles.dropdown}>Mới nhất ⌄</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tripCard}>
            <Text style={styles.timeText}>14:05</Text>
            <Text style={styles.detailText}>23 phút, không đổi trạm</Text>
            <Text style={styles.routeText}>Từ Trạm Ngã tư Thủ Đức</Text>
          </View>
        </View>

        {/* Các tuyến trước đó */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Các tuyến đường trước đó</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.ticketCard}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketTime}>14:05</Text>
              <Text style={styles.ticketTime}>14:31</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketStop}>Trạm C</Text>
              <Text style={styles.ticketStop}>Trạm D</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketFrom}>Ngã tư Thủ Đức</Text>
              <Text style={styles.ticketTo}>Đại học FPT</Text>
            </View>
          </View>
        </View>

        {/* Thống kê */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitle}>Thống kê của bạn</Text>
          <Text style={styles.sectionDesc}>
            Nhận thông tin chi tiết về các chuyến đi của bạn.
          </Text>

          <View style={styles.kmRow}>
            <Text style={styles.kmValue}>912,2</Text>
            <View>
              <Text style={styles.kmLabel}>km</Text>
              <Text style={styles.kmDate}>01/08 - 30/09, 2024</Text>
            </View>
            <TouchableOpacity style={styles.monthDropdown}>
              <Text style={styles.monthDropdownText}>Tháng 8 ⌄</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../../assets/chart.png")}
            style={{ height: 120, resizeMode: "cover", marginTop: 8 }}
          />
        </View>

        {/* Chỉ số thêm */}
        <View style={styles.infoRow}>
          <View style={styles.infoCardGreen}>
            <Text style={styles.infoValue}>64</Text>
            <Text style={styles.infoLabel}>Số chuyến đã đi</Text>
            <Text style={styles.infoDesc}>
              Xe Bus là phương tiện bạn sử dụng nhiều nhất
            </Text>
          </View>
          <View style={styles.infoCardWhite}>
            <Text style={styles.infoValueBlack}>18 km</Text>
            <Text style={styles.infoLabelBlack}>Chuyến đi dài nhất của bạn</Text>
            <Text style={styles.infoDescBlack}>Quận 9 - Quận Gò Vấp</Text>
          </View>
        </View>

        <View style={styles.infoCardGreenFull}>
          <Text style={styles.infoValue}>50 KG</Text>
          <Text style={styles.infoLabel}>Giảm thiểu CO2</Text>
          <Text style={styles.infoDesc}>Tương đương với tiết kiệm 240 lít xăng</Text>
        </View>
      </ScrollView>

      <BottomNavigationBar
        activeTab="account"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "search") navigation.navigate("RouteLookup");
          else if (key === "tickets") navigation.navigate("TicketsScreen");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#fff",
  },
  headerCard: {
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 15,
    paddingBottom: 15,
  },
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
    backgroundColor: "#197419ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#000",
  },
  editButton: {
    position: "absolute",
    bottom: -12,
    right: 33,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  phoneContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  phoneText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionWhite: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionDesc: {
    color: "#555",
    fontSize: 13,
    marginBottom: 12,
  },
  dropdown: {
    fontSize: 14,
    color: "#555",
  },
  tripCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  timeText: {
    fontWeight: "700",
    fontSize: 16,
  },
  detailText: {
    fontSize: 13,
    color: "#333",
  },
  routeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  ticketCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketTime: {
    fontSize: 16,
    fontWeight: "700",
  },
  ticketStop: {
    fontSize: 14,
    fontWeight: "600",
  },
  ticketFrom: {
    fontSize: 14,
    color: "#555",
  },
  ticketTo: {
    fontSize: 14,
    color: "#555",
  },
  kmRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  kmValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  kmLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  kmDate: {
    fontSize: 12,
    color: "#555",
  },
  monthDropdown: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
  },
  monthDropdownText: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  infoCardGreen: {
    backgroundColor: "#4CAF50",
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoCardWhite: {
    backgroundColor: "#F5F5F5",
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoCardGreenFull: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  infoDesc: {
    fontSize: 12,
    color: "#fff",
  },
  infoValueBlack: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  infoLabelBlack: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  infoDescBlack: {
    fontSize: 12,
    color: "#000",
  },
});