import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Navbar from "./Navbar";

const notifications = [
  {
    time: "14:00",
    title: "Vé đã mua",
    message: "Tuyến đường bết đầu từ Ga Ngã tư Thủ Đức bị chậm 5 phút.",
  },
  {
    time: "13:45",
    title: "Vé đã mua",
    message: "Tuyến đường bết đầu từ Ga Ngã tư Thủ Đức bị chậm 5 phút.",
    action: "Xem vé của bạn",
  },
];

export default function NotificationPanel() {
  return (
    <View contentContainerStyle={styles.container}>
        <Navbar/>
 <ScrollView >
        
      <Text style={styles.header}>Thông báo mới</Text>

      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterText}>Mới nhất</Text>
        <Icon name="chevron-down" size={18} color="#00B050" />
      </TouchableOpacity>

      <Text style={styles.date}>Thứ ba, Hôm nay</Text>

      {notifications.map((n, idx) => (
        <View key={idx} style={styles.notificationCard}>
          <View style={styles.leftIcon}>
            <Icon name="ticket-confirmation" color="white" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>{n.title}</Text>
            <Text style={styles.notifMsg}>{n.message}</Text>
            {n.action && <Text style={styles.notifAction}>{n.action} →</Text>}
          </View>
          <Text style={styles.notifTime}>{n.time}</Text>
        </View>
      ))}

      <Text style={styles.date}>Mandag, 27 sep</Text>
    </ScrollView>
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    marginTop:20
  },
  filterButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00B050",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  filterText: {
    color: "#00B050",
    fontWeight: "500",
    marginRight: 4,
  },
  date: {
    fontSize: 13,
    color: "#777",
    marginBottom: 12,
    textAlign: "center",
   
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F6F6F6",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  leftIcon: {
    backgroundColor: "#00B050",
    padding: 8,
    borderRadius: 30,
    marginRight: 12,
  },
  notifTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  notifMsg: {
    fontSize: 13,
    color: "#444",
  },
  notifAction: {
    color: "#00B050",
    fontWeight: "bold",
    marginTop: 6,
  },
  notifTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
});
