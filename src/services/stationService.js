import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllBusRoutes } from './busRouteService';
import { getDistance } from 'geolib';

const TRACK_ASIA_BASE_URL = 'https://maps.track-asia.com/api/v1';
const TRACK_ASIA_API_KEY = '5b3e9e6c7e38175467614550ef4b48b420';
const CACHE_KEY = 'cached_stations';

// 1. Trích xuất tất cả tên trạm từ API tuyến
export const extractStationsFromRoutes = async () => {
  try {
    const response = await fetchAllBusRoutes();
    const routes = response.data?.Data || [];

    const stationNames = routes.flatMap(route =>
      [route.PathToDestination, route.PathToStart]
        .filter(Boolean)
        .flatMap(path => path.split(" - "))
    );

    return Array.from(new Set(stationNames));
  } catch (err) {
    console.error("❌ Failed to extract station names:", err.message);
    return [];
  }
};

// 2. Geocode 1 trạm từ tên
export const geocodeStation = async (stationName) => {
  try {
    const res = await fetch(
      `${TRACK_ASIA_BASE_URL}/search?text=${encodeURIComponent(stationName)}&limit=1&lang=vi&key=${TRACK_ASIA_API_KEY}`
    );
    const json = await res.json();
    const feature = json?.features?.[0];

    if (feature) {
      console.log(`📍 Geocoded: ${stationName}`);
      return {
        name: stationName,
        coords: {
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        },
      };
    } else {
      console.warn(`⚠️ No geocode result for: ${stationName}`);
    }
  } catch (err) {
    console.warn("❌ Geocode error for", stationName, err.message);
  }
  return null;
};

// 3. Xoá cache
export const clearStationCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log("🗑️ Đã xoá cache trạm.");
  } catch (err) {
    console.error("❌ Không thể xoá cache:", err.message);
  }
};

// 4. Lấy danh sách các trạm gần vị trí hiện tại
export const getNearbyStationMarkers = async (radiusKm = 5) => {
  try {
    // Lấy vị trí người dùng
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('🚫 Không có quyền truy cập vị trí.');
      return [];
    }

    const location = await Location.getCurrentPositionAsync({});
    const currentCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    console.log("📍 Vị trí hiện tại:", currentCoords);

    // Kiểm tra cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    let geocodedStations = [];

    if (cached) {
      console.log("📦 Dùng cache trạm.");
      geocodedStations = JSON.parse(cached);
    } else {
      console.log("🌐 Đang gọi API geocode toàn bộ trạm...");
      const stationNames = await extractStationsFromRoutes();
      const results = await Promise.all(
        stationNames.map((name) => geocodeStation(name))
      );
      geocodedStations = results.filter(Boolean);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(geocodedStations));
      console.log("✅ Đã lưu cache trạm.");
    }

    // Lọc theo bán kính
    const nearbyStations = geocodedStations.filter(station => {
      const distance = getDistance(currentCoords, station.coords);
      return distance <= radiusKm * 1000;
    });

    console.log(`✅ ${nearbyStations.length} trạm trong bán kính ${radiusKm}km`);
    return nearbyStations;
  } catch (err) {
    console.error("🚨 Lỗi khi lấy nearby station markers:", err.message);
    return [];
  }
};
