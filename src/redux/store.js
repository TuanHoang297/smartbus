import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import busRouteReducer from './slices/busRouteSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
     busRoutes: busRouteReducer,
     notifications: notificationsReducer,
  },
});
