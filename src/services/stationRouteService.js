import { fetchAllBusRoutes } from './busRouteService';

export const getRoutesByStationName = async (stationName) => {
  try {
    const response = await fetchAllBusRoutes();
    const allRoutes = response.data?.Data || [];

    return allRoutes.filter(route => {
      const allStations = [
        ...(route.PathToStart?.split(" - ") || []),
        ...(route.PathToDestination?.split(" - ") || [])
      ];
      return allStations.includes(stationName);
    });
  } catch (error) {
    console.error("❌ Failed to get routes for station:", stationName, error);
    return [];
  }
};
