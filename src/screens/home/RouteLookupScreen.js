import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getAllBusRoutes } from "../../redux/slices/busRouteSlice";

import RouteItem from "../../components/routes/RouteItem";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";

export default function RouteLookupScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { routes, status } = useSelector((state) => state.busRoutes);

  useEffect(() => {
    dispatch(getAllBusRoutes());
  }, []);

  const filtered = routes.filter((route) =>
    route.RouteName.toLowerCase().includes(search.toLowerCase()) ||
    route.RouteCode.includes(search)
  );

  return (
    <View style={{ flex: 1 }}>
      <Navbar showBack />

      <View style={styles.header}>
        <Text style={styles.title}>Chọn tuyến xe buýt</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm tuyến"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.Id}
        renderItem={({ item }) => (
          <RouteItem
            item={{
              code: item.RouteCode,
              name: item.RouteName,
              distance: item.DistanceKm,
              startTime: item.StartTime,
              endTime: item.EndTime,
              interval: item.TripInterval,
            }}
            onPress={() =>
              navigation.navigate("RouteDetail", { code: item.RouteCode, id: item.Id })
            }
          />
        )}
        contentContainerStyle={styles.list}
      />

      <BottomNavigationBar
        activeTab="search"
        onTabPress={(key) => {
          if (key === "map") navigation.navigate("Home");
          else if (key === "tickets") navigation.navigate("MyTickets");
          else if (key === "account") navigation.navigate("Account");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
  },
  list: {
    paddingBottom: 100,
  },
});
