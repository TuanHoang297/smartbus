import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import MapView, { Marker, AnimatedRegion } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";

const BUS_ICON_URL =
  "https://img.icons8.com/?size=100&id=9351&format=png&color=00B050";

export default function TrackingTransportInfo() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const {
    latitude = 10.763622,
    longitude = 106.660872,
    title = "Xe buýt",
    code = "",
    simulate = false,
  } = params || {};

  const markerRef = useRef(null);
  const mapRef = useRef(null);

  const [coordinate] = useState(
    new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    })
  );

  // Zoom vào vị trí được truyền sang khi mở màn
  useEffect(() => {
    const r = coordinate.__getValue();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...r,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        600
      );
    }
  }, [coordinate]);

  // Tuỳ chọn: mô phỏng xe di chuyển (nếu simulate = true)
  useEffect(() => {
    if (!simulate) return;
    const interval = setInterval(() => {
      const cur = coordinate.__getValue();
      const newCoordinate = {
        latitude: cur.latitude + (Math.random() - 0.5) * 0.0002,
        longitude: cur.longitude + (Math.random() - 0.5) * 0.0002,
      };

      coordinate.timing({
        ...newCoordinate,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...newCoordinate,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          },
          1000
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [coordinate, simulate]);

  const initialRegion = coordinate.__getValue();

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        <Marker.Animated ref={markerRef} coordinate={coordinate} title={title}>
          <View style={styles.wrapper}>
            <View style={styles.badge}>
              <Image
                source={{ uri: BUS_ICON_URL }}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
            </View>
            {code ? <Text style={styles.codeText}>{code}</Text> : null}
          </View>
        </Marker.Animated>
      </MapView>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeTxt}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, width: "100%" },
  wrapper: { alignItems: "center" },
  badge: {
    padding: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  codeText: {
    marginTop: 4,
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "bold",
    color: "#00B050",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  closeTxt: { color: "#00B050", fontWeight: "600" },
});
