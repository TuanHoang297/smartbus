import React, { useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Text } from "react-native";
import RouteItem from "../../components/routes/RouteItem";
import Navbar from "../../components/Navbar";
import BottomNavigationBar from "../../components/BottomNavigation";
import { useNavigation } from "@react-navigation/native";

const dummyRoutes = [
  {
    code: "001",
    name: "Bến Thành - Suối Tiên",
    stops: 52,
    time: "06:00-22:00",
    price: "7.000 VND",
    isNew: true,
    isFavorited: true,
  },
  {
    code: "002",
    name: "VinHomes - Bến xe Sài Gòn",
    stops: 38,
    time: "05:30-21:00",
    price: "7.000 VND",
    isNew: false,
    isFavorited: false,
  },
  // thêm các tuyến khác...
];

export default function RouteLookupScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  const filtered = dummyRoutes.filter((route) =>
    route.name.toLowerCase().includes(search.toLowerCase()) ||
    route.code.includes(search)
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
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <RouteItem item={item} onPress={() => navigation.navigate("RouteDetail", { code: item.code })} />
        )}
        contentContainerStyle={styles.list}
      />

      <BottomNavigationBar activeTab="search" onTabPress={(key) => {
        if (key === "map") navigation.navigate("Home");
        else if (key === "tickets") navigation.navigate("MyTickets");
        else if (key === "account") navigation.navigate("Account");
      }} />
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
