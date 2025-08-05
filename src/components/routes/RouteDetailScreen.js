import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { IconButton } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getBusRouteDetail, getBusRouteLocations } from "../../services/busRouteService";

const { height } = Dimensions.get("window");

const tabs = ["Biểu đồ giờ", "Trạm dừng", "Thông tin", "Giá vé"];

export default function RouteDetailScreen() {
  const navigation = useNavigation();
  const routeParams = useRoute();
  const { id, code } = routeParams.params;

  const [routeData, setRouteData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState("Biểu đồ giờ");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const [routeDetail, locationData] = await Promise.all([
      getBusRouteDetail(id),
      getBusRouteLocations(code),
    ]);
    setRouteData(routeDetail);
    setLocations(locationData.Locations || []);
  } catch (error) {
    console.error("Fetch route detail or locations failed", error);
  }
};


  const isPastTrip = (tripHour) => {
    const [startTime] = tripHour.split(" - ");
    const now = new Date();
    const tripDate = new Date();
    const [h, m] = startTime.split(":").map(Number);
    tripDate.setHours(h);
    tripDate.setMinutes(m);
    tripDate.setSeconds(0);
    return tripDate < now;
  };

  const renderTabContent = () => {
    if (!routeData) return null;

    switch (activeTab) {
      case "Biểu đồ giờ":
        return (
          <ScrollView style={styles.scrollTab}>
            <View style={styles.tripGrid}>
              {routeData.TripHours?.map((time, index) => {
                const isPast = isPastTrip(time);
                return (
                  <View
                    key={index}
                    style={[
                      styles.tripItem,
                      isPast && styles.tripItemPast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripText,
                        isPast && styles.tripTextPast,
                      ]}
                    >
                      {time}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        );

      case "Trạm dừng":
        return (
          <ScrollView style={styles.scrollTab}>
            {routeData.StopNames?.map((stop, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoText}>• {stop}</Text>
              </View>
            ))}
          </ScrollView>
        );

      case "Thông tin":
        return (
          <ScrollView style={styles.scrollTab}>
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Tuyến số: {routeData.RouteCode}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Tên tuyến: {routeData.RouteName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Khoảng cách: {routeData.DistanceKm} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Loại xe: {routeData.BusType}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Thời gian hoạt động: {routeData.StartTime} - {routeData.EndTime}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Số chuyến/ngày: {routeData.TripsPerDay}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Thời lượng: {routeData.TripDuration} phút</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Tần suất: {routeData.TripInterval}</Text>
              </View>
            </View>
          </ScrollView>
        );

      case "Giá vé":
        return (
          <ScrollView style={styles.scrollTab}>
            {routeData.TicketPrices?.map((price, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoText}>• {price}</Text>
              </View>
            ))}
          </ScrollView>
        );

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
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {locations.map((loc, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: loc.Latitude,
              longitude: loc.Longitude,
            }}
            title={loc.StopName}
          />
        ))}
      </MapView>

      <View style={styles.contentBox}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IconButton icon="arrow-left" size={24} />
          </TouchableOpacity>
          <Text style={styles.routeName}>
            {routeData?.RouteName || "Đang tải..."}
          </Text>
          <TouchableOpacity>
            <IconButton icon="heart-outline" />
          </TouchableOpacity>
        </View>

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

        <View style={styles.tabContent}>{renderTabContent()}</View>
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
    maxHeight: height * 0.5,
    minHeight: height * 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeName: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 12,
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
  tabContent: {
    flex: 1,
  },
  scrollTab: {
    paddingHorizontal: 12,
  },
  rowText: {
    paddingVertical: 4,
    fontSize: 14,
    color: "#333",
  },
  tripGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  tripItem: {
    width: "48%",
    backgroundColor: "#f2f2f2",
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  tripItemPast: {
    backgroundColor: "#e0e0e0",
  },
  tripText: {
    fontSize: 13,
    color: "#333",
  },
  tripTextPast: {
    color: "#999",
  },
  infoBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  ticketBox: {
    paddingHorizontal: 12,
    gap: 6,
  },
  infoItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  ticketText: {
    fontSize: 14,
    color: "#333",
  },
});
