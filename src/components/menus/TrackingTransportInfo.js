import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, AnimatedRegion } from "react-native-maps";

export default function TrackingTransportInfo({ onClose }) {
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [coordinate] = useState(
    new AnimatedRegion({
      latitude: 10.763622,
      longitude: 106.660872,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newLat = coordinate.__getValue().latitude + (Math.random() - 0.5) * 0.0002;
      const newLng = coordinate.__getValue().longitude + (Math.random() - 0.5) * 0.0002;

      const newCoordinate = {
        latitude: newLat,
        longitude: newLng,
      };

      coordinate.timing({
        ...newCoordinate,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newCoordinate,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [coordinate]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={coordinate.__getValue()}
        showsUserLocation
      >
        <Marker.Animated
          ref={markerRef}
          coordinate={coordinate}
          title="Bus đang di chuyển"
        >
          <View style={styles.trackingMarker}>
            <Text style={styles.markerText}>026</Text>
          </View>
        </Marker.Animated>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
  },
  trackingMarker: {
    backgroundColor: "#00B050",
    padding: 6,
    borderRadius: 8,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
  },
});
