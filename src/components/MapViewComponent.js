import React, { useState } from "react";
import { StyleSheet, View, Modal, TouchableWithoutFeedback } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "react-native-paper";
import MenuLiveTransportInfo from "./menus/MenuLiveTransportInfo";

const MapViewComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const markers = [
    { id: "026", title: "Bus 026", latitude: 10.762622, longitude: 106.660172 },
    { id: "110", title: "Bus 110", latitude: 10.763622, longitude: 106.661172 },
    { id: "161", title: "Bus 161", latitude: 10.764622, longitude: 106.662172 },
    { id: "00L", title: "Bus 00L", latitude: 10.761622, longitude: 106.663172 },
  ];

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 10.762622,
          longitude: 106.660172,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            pinColor="#00B050"
            onPress={() => setSelectedMarker(marker.id)}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>{marker.id}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Modal hiển thị thông tin xe bus */}
      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedMarker(null)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalWrapper}>
                <MenuLiveTransportInfo onConfirm={() => setSelectedMarker(null)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
});
