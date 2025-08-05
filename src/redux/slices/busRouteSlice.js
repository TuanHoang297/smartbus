import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllBusRoutes,
  fetchBusRouteDetail,
  fetchRouteLocations,
} from "../../services/busRouteService";

export const getAllBusRoutes = createAsyncThunk(
  "busRoutes/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllBusRoutes();
      return response.data.Data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getBusRouteDetail = createAsyncThunk(
  "busRoutes/getDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchBusRouteDetail(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getRouteLocations = createAsyncThunk(
  "busRoutes/getLocations",
  async (code, { rejectWithValue }) => {
    try {
      const response = await fetchRouteLocations(code);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const busRouteSlice = createSlice({
  name: "busRoutes",
  initialState: {
    routes: [],
    selectedRoute: null,
    routeLocations: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllBusRoutes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllBusRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = action.payload;
      })
      .addCase(getAllBusRoutes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(getBusRouteDetail.fulfilled, (state, action) => {
        state.selectedRoute = action.payload;
      })
      .addCase(getRouteLocations.fulfilled, (state, action) => {
        state.routeLocations = action.payload;
      });
  },
});

export default busRouteSlice.reducer;
