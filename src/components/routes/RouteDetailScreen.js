import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { IconButton } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  getBusRouteDetail,
  getBusRouteLocations,
} from "../../services/busRouteService";
import { geocodeStation } from "../../services/stationService";

const { height } = Dimensions.get("window");
const tabs = ["Biểu đồ giờ", "Trạm dừng", "Thông tin", "Giá vé"];
const BUS_ICON_URL =
  "https://img.icons8.com/?size=100&id=9351&format=png&color=00B050";

export default function RouteDetailScreen() {
  const navigation = useNavigation();
  const routeParams = useRoute();
  const { id, code } = routeParams.params;

  const [routeData, setRouteData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeTab, setActiveTab] = useState("Biểu đồ giờ");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routeDetail, locationData] = await Promise.all([
        getBusRouteDetail(id),
        getBusRouteLocations(code),
      ]);

      setRouteData(routeDetail);

      const apiLocations = locationData?.Locations || [];
      if (apiLocations.length > 0) {
        const mapped = apiLocations
          .filter(
            (loc) =>
              typeof loc.Latitude === "number" &&
              typeof loc.Longitude === "number"
          )
          .map((loc) => ({
            name: loc.StopName || "",
            latitude: loc.Latitude,
            longitude: loc.Longitude,
          }));
        setMarkers(mapped);
      } else {
        const stopNames = routeDetail?.StopNames || [];
        const uniqueStops = Array.from(
          new Set(stopNames.filter((s) => !!s && s.trim().length > 0))
        );
        const results = await Promise.all(
          uniqueStops.map(async (name) => {
            const g = await geocodeStation(name);
            if (!g) return null;
            return {
              name: g.name,
              latitude: g.coords.latitude,
              longitude: g.coords.longitude,
            };
          })
        );
        setMarkers(results.filter(Boolean));
      }
    } catch (error) {
      console.error("Fetch route detail or locations failed", error);
    } finally {
      setLoading(false);
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
                    style={[styles.tripItem, isPast && styles.tripItemPast]}
                  >
                    <Text
                      style={[styles.tripText, isPast && styles.tripTextPast]}
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
                <Text style={styles.infoText}>
                  Tuyến số: {routeData.RouteCode}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Tên tuyến: {routeData.RouteName}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Khoảng cách: {routeData.DistanceKm} km
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>Loại xe: {routeData.BusType}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Thời gian hoạt động: {routeData.StartTime} -{" "}
                  {routeData.EndTime}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Số chuyến/ngày: {routeData.TripsPerDay}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Thời lượng: {routeData.TripDuration} phút
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoText}>
                  Tần suất: {routeData.TripInterval}
                </Text>
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

  const initialRegion = useMemo(() => {
    if (markers.length > 0) {
      return {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return {
      latitude: 10.7769,
      longitude: 106.7009,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [markers]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map((m, index) => (
          <Marker
            key={`${m.name}-${index}`}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.name}
            onPress={() =>
              navigation.navigate("TrackingTransportInfo", {
                latitude: m.latitude,
                longitude: m.longitude,
                title: m.name,
                code: routeData?.RouteCode ?? "",
                simulate: true, // bật mô phỏng di chuyển nếu muốn
              })
            }
          >
            <Image
              source={{ uri: BUS_ICON_URL }}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.contentBox}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IconButton icon="arrow-left" size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.routeName}>
          {routeData?.RouteName || "Đang tải..."}
        </Text>

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

        <View style={styles.tabContent}>
          {loading ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator />
            </View>
          ) : (
            renderTabContent()
          )}
        </View>
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
    textAlign: "center",
    marginTop: 4,
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
  infoItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
