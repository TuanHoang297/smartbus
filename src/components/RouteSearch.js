import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Text, IconButton, Portal } from "react-native-paper"; // <-- thêm Portal

import MenuTransportType from "./menus/MenuTransportType";
import MenuSearchHistory from "./menus/MenuSearchHistory";
import RouteCardList from "./RouteCardList";
import TripDetailCard from "./routes/TripDetailCard";

export default function RouteSearch({
  from = "",
  to = "",
  onSwap,
  onSettings,
  onChangeFrom,
  onChangeTo,
}) {
  const [showTransportMenu, setShowTransportMenu] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showTripDetailModal, setShowTripDetailModal] = useState(false);
  const [routeParams, setRouteParams] = useState({ from: "", to: "" });

  const [selectedTrip, setSelectedTrip] = useState(null);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const formattedTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const handleSubmitRoute = (fromValue, toValue) => {
    setShowSearchHistory(false);
    setRouteParams({ from: fromValue, to: toValue });
    setShowRouteModal(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.card}
    >
      {/* FROM */}
      <View style={styles.inputWrapper}>
        <IconButton icon="crosshairs-gps" size={20} />
        <TextInput
          placeholder="Chọn điểm bắt đầu"
          style={styles.input}
          value={from}
          onChangeText={onChangeFrom}
          onFocus={() => setShowSearchHistory(true)}
        />
        <IconButton icon="close" size={20} onPress={() => onChangeFrom("")} />
      </View>

      {/* TO */}
      <View style={styles.inputWrapper}>
        <IconButton icon="map-marker-outline" size={20} />
        <TextInput
          placeholder="Chọn điểm đến"
          style={styles.input}
          value={to}
          onChangeText={onChangeTo}
          onFocus={() => setShowSearchHistory(true)}
        />
        <IconButton icon="swap-vertical" size={20} onPress={onSwap} />
      </View>

      {/* Time + Transport Icons */}
      <View style={styles.infoRow}>
        <View style={styles.timeTransport}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <IconButton icon="clock-outline" size={18} />
          <TouchableOpacity
            style={styles.transportIcons}
            onPress={() => setShowTransportMenu(true)}
          >
            <IconButton icon="bus" size={20} />
            <IconButton icon="train" size={20} />
            <IconButton icon="tram" size={20} />
            <IconButton icon="chevron-down" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingsBtn} onPress={onSettings}>
          <IconButton icon="cog" iconColor="white" />
        </TouchableOpacity>
      </View>

      {/* MODAL: Transport Type */}
      <Modal visible={showTransportMenu} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowTransportMenu(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <MenuTransportType onConfirm={() => setShowTransportMenu(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: Search History — thêm Portal.Host để dropdown hiển thị đúng lớp */}
      <Modal visible={showSearchHistory} transparent animationType="none" presentationStyle="overFullScreen">
        <TouchableWithoutFeedback onPress={() => setShowSearchHistory(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              {/* Host cục bộ cho mọi Portal bên trong MenuSearchHistory */}
              
              <Portal.Host hostName="menuHost">
                <View style={{ height: 175, backgroundColor: "rgba(0,0,0,0.3)" }} />
                <View style={styles.bottomSheet}>
                  <MenuSearchHistory
                    onConfirm={handleSubmitRoute}
                    portalHostName="menuHost"   // <-- truyền xuống input con
                  />
                </View>
              </Portal.Host>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: RouteCardList */}
      <Modal visible={showRouteModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowRouteModal(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.routeSheet}>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowRouteModal(false)}
                  style={{ alignSelf: "flex-end", margin: 8 }}
                />
                <RouteCardList
                  from={routeParams.from}
                  to={routeParams.to}
                  onCardPress={(trip) => {
                    setSelectedTrip(trip);
                    setShowTripDetailModal(true);
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: Trip Detail */}
      <Modal visible={showTripDetailModal} transparent animationType="slide">
        <TouchableWithoutFeedback
          onPress={() => {
            setShowTripDetailModal(false);
            setSelectedTrip(null);
          }}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.routeSheet}>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => {
                    setShowTripDetailModal(false);
                    setSelectedTrip(null);
                  }}
                  style={{ alignSelf: "flex-end", margin: 8 }}
                />
                {selectedTrip && <TripDetailCard trip={selectedTrip} />}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeTransport: {
    flexDirection: "row",
    alignItems: "center",
  },
  transportIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  settingsBtn: {
    backgroundColor: "#00B050",
    borderRadius: 10,
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  routeSheet: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
});
