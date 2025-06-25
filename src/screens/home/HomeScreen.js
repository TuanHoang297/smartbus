import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Navbar from "../../components/Navbar";
import RouteSearch from "../../components/RouteSearch";
import MapViewComponent from "../../components/MapViewComponent";
import BottomNavigationBar from "../../components/BottomNavigation";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <RouteSearch />
        <MapViewComponent />


      </ScrollView>

      <BottomNavigationBar activeTab="map" onTabPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
    paddingBottom: 80,
  },
  recentContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  liveContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  advancedFilterContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },
});
