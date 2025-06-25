import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { IconButton } from "react-native-paper";
import MapView from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const tabs = ["Biểu đồ giờ", "Trạm dừng", "Thông tin", "Đánh giá"];

export default function RouteDetailScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Biểu đồ giờ");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Biểu đồ giờ":
        return (
          <View style={styles.scheduleTable}>
            <View style={styles.rowHeader}>
              <Text style={styles.cell}>Biểu đồ giờ</Text>
              <Text style={styles.cell}>Trạm dừng</Text>
              <Text style={styles.cell}>Thông tin</Text>
              <Text style={styles.cell}>Đánh giá</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>11:12</Text>
              <Text style={styles.cell}>11:30</Text>
              <Text style={styles.cell}>11:50</Text>
              <Text style={styles.cell}>12:00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>12:30</Text>
              <Text style={styles.cell}>12:50</Text>
              <Text style={styles.cell}>13:00</Text>
              <Text style={styles.cell}>13:15</Text>
            </View>
          </View>
        );
      case "Trạm dừng":
        return (
          <View style={styles.stopList}>
            <Text style={styles.stop}>Ga Bến Thành</Text>
            <Text style={styles.stop}>Ga Nhà hát Thành phố</Text>
            <Text style={styles.stop}>Ga Ba Son</Text>
            <Text style={styles.stop}>Ga Văn Thánh</Text>
            <Text style={styles.stop}>Ga Tân Cảng</Text>
            <Text style={styles.stop}>Ga Thảo Điền</Text>
          </View>
        );
      case "Thông tin":
        return (
          <View style={styles.infoBox}>
            <Text>Tuyến số: Metro 1</Text>
            <Text>Tên tuyến: Bến Thành - Suối Tiên</Text>
            <Text>Thời gian hoạt động: 05:00 - 22:00</Text>
            <Text>Giá vé: 20.000 VND</Text>
          </View>
        );
      case "Đánh giá":
        return <Text style={{ padding: 12 }}>Chưa có đánh giá nào.</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.7769,
          longitude: 106.7009,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />

      <View style={styles.contentBox}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IconButton icon="arrow-left" size={24} />
          </TouchableOpacity>
          <Text style={styles.routeName}>Bến Thành - Suối Tiên</Text>
          <TouchableOpacity>
            <IconButton icon="heart-outline" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.tabItemActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }}>{renderTabContent()}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  contentBox: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "40%",
    minHeight: "40%",

  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  tabItem: {
    fontSize: 14,
    color: "#888",
    paddingBottom: 6,
  },
  tabItemActive: {
    color: "#00B050",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#00B050",
  },
  scheduleTable: {
    paddingHorizontal: 8,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
  },
  stopList: {
    paddingHorizontal: 12,
  },
  stop: {
    paddingVertical: 6,
    fontSize: 14,
  },
  infoBox: {
    paddingHorizontal: 12,
    gap: 6,
  },
});
