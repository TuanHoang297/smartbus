import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TrackingTransportInfo from "./TrackingTransportInfo";

const busSchedule = [
  { time: "14:05", inMinutes: "10 phút nữa", station: "Trạm Ngã tư Thủ Đức" },
  { time: "14:35", inMinutes: "40 phút nữa", station: "Trạm Ngã tư Thủ Đức" },
  { time: "15:05", inMinutes: "1 giờ nữa", station: "Trạm Ngã tư Thủ Đức" },
];

export default function MenuLiveTransportInfo({ onConfirm }) {
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [showTracking, setShowTracking] = useState(false);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Phương tiện di chuyển của bạn</Text>

        <View style={styles.busInfoRow}>
          <View style={styles.iconWrapper}>
            <Icon name="bus" size={32} color="white" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.busCode}>026</Text>
            <Text style={styles.busLabel}>Bus</Text>
          </View>
          <TouchableOpacity style={styles.liveView} onPress={() => setShowTracking(true)}>
            <Text style={styles.liveText}>Xem trực tiếp</Text>
            <Icon name="chevron-right" color="#00B050" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleLabel}>Chuyến tiếp theo</Text>
          <TouchableOpacity style={styles.timeSelect}>
            <Text style={{ color: "#00B050", fontWeight: "600" }}>{selectedTime}</Text>
            <Icon name="chevron-down" size={18} color="#00B050" />
          </TouchableOpacity>
        </View>

        {busSchedule.map((bus, idx) => (
          <TouchableOpacity key={idx} style={styles.busItem}>
            <Text style={styles.busTime}>{bus.time}</Text>
            <View>
              <Text style={styles.busNote}>{bus.inMinutes}</Text>
              <Text style={styles.busStation}>{bus.station}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#555" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))}

        <Button
          mode="contained"
          onPress={onConfirm}
          style={styles.confirmBtn}
          labelStyle={{ fontWeight: "bold" }}
        >
          Xác nhận lựa chọn
        </Button>
      </ScrollView>

      <Modal visible={showTracking} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Nút đóng modal */}
      <TouchableOpacity style={styles.closeButton} onPress={() => setShowTracking(false)}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <TrackingTransportInfo onClose={() => setShowTracking(false)} />
    </View>
  </View>
</Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 20,
  },
  busInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    backgroundColor: "#00B050",
    padding: 10,
    borderRadius: 12,
  },
  busCode: {
    fontSize: 20,
    fontWeight: "bold",
  },
  busLabel: {
    fontSize: 14,
    color: "#888",
  },
  liveView: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  liveText: {
    fontSize: 13,
    color: "#00B050",
    fontWeight: "600",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  scheduleLabel: {
    fontWeight: "500",
  },
  timeSelect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2fff3",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  busItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  busTime: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
    width: 60,
  },
  busNote: {
    fontSize: 12,
    color: "#666",
  },
  busStation: {
    fontSize: 13,
    fontWeight: "500",
  },
  confirmBtn: {
    backgroundColor: "#00B050",
    borderRadius: 8,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  closeButton: {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 10,
  backgroundColor: "white",
  borderRadius: 20,
  width: 32,
  height: 32,
  alignItems: "center",
  justifyContent: "center",
  elevation: 3,
},
closeText: {
  fontSize: 18,
  color: "#333",
},

});
