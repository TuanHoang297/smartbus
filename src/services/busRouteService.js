import api from './api';

export const fetchAllBusRoutes = (page = 1, pageSize = 1000) =>
  api.get(`/busroutes?page=${page}&pageSize=${pageSize}`);

export const getBusRouteDetail = async (id) => {
  try {
    const response = await api.get(`/busroutes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bus route detail:", error);
    return null;
  }
};

export const getBusRouteLocations = async (code) => {
  try {
    const response = await api.get(`/busroutes/${code}/locations`);
    return response.data || { Locations: [] };
  } catch (error) {
    console.error("Failed to fetch bus route locations:", error);
    return { Locations: [] };  
  }
};