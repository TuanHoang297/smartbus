import React, { useState, useEffect } from "react";
import { StyleSheet, View, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert, Button, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "react-native-paper";
import MenuLiveTransportInfo from "./menus/MenuLiveTransportInfo";
import { getNearbyStationMarkers, clearStationCache } from "../services/stationService";

const MapViewComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStations = async () => {
    setLoading(true);
    try {
      const nearbyStations = await getNearbyStationMarkers(5); // bán kính 5km
      setMarkers(nearbyStations);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải các trạm gần bạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleRefresh = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn làm mới dữ liệu trạm?",
      [
        { text: "Huỷ" },
        {
          text: "Làm mới",
          onPress: async () => {
            await clearStationCache();
            await loadStations();
          },
        },
      ]
    );
  };

  return (
    <View>
      

      <View style={styles.mapContainer}>
  {loading ? (
    <ActivityIndicator size="large" color="#00B050" style={{ marginTop: 16 }} />
  ) : (
    <>
      {/* Nút làm mới nằm phía trên giữa Map */}
      <View style={styles.refreshOverlay}>
  <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
    <Text style={styles.refreshText}>🔄</Text>
  </TouchableOpacity>
</View>


      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 10.762622,
          longitude: 106.660172,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation
      >
        {markers.map((marker) => (
          <Marker
            key={marker.name}
            coordinate={marker.coords}
            title={marker.name}
            pinColor="#00B050"
            onPress={() => setSelectedMarker(marker)}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>🚌</Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </>
  )}
</View>

    </View>
  );
};

export default MapViewComponent;

const styles = StyleSheet.create({
  mapContainer: {
    height: 500,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  marker: {
    backgroundColor: "#00B050",
    padding: 6,
    borderRadius: 8,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
 refreshOverlay: {
  position: "absolute",
  top: 10,
  left: 0,
  right: 0,
  alignItems: "center",
  zIndex: 999,
},
refreshButton: {
  backgroundColor: "#ccc",
  borderRadius: 24,
  padding: 8,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
},
refreshText: {
  fontSize: 20,
  color: "white",
},


});
