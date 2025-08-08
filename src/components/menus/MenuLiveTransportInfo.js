import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Text, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TrackingTransportInfo from "./TrackingTransportInfo";
import { getRoutesByStationName } from "../../services/stationRouteService";

export default function MenuLiveTransportInfo({ marker, onConfirm }) {
  const [showTracking, setShowTracking] = useState(false);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (marker?.name) {
      getRoutesByStationName(marker.name).then(setRoutes);
    }
  }, [marker]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Trạm: {marker?.name}</Text>

        {routes.map((route, idx) => (
          <View key={idx} style={styles.busItem}>
            <View style={styles.busInfoRow}>
              <View style={styles.iconWrapper}>
                <Icon name="bus" size={26} color="white" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.busCode}>{route.RouteCode}</Text>
                <Text style={styles.busLabel}>{route.RouteName}</Text>
              </View>
              <TouchableOpacity style={styles.liveView} onPress={() => setShowTracking(true)}>
                <Text style={styles.liveText}>Xem trực tiếp</Text>
                <Icon name="chevron-right" color="#00B050" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Button mode="contained" onPress={onConfirm} style={styles.confirmBtn}>
          Xác nhận
        </Button>
      </ScrollView>

      <Modal visible={showTracking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
  },
  iconWrapper: {
    backgroundColor: "#00B050",
    padding: 10,
    borderRadius: 12,
  },
  busItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  busInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  busCode: {
    fontSize: 18,
    fontWeight: "bold",
  },
  busLabel: {
    fontSize: 13,
    color: "#555",
  },
  liveView: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  liveText: {
    color: "#00B050",
    fontWeight: "600",
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
