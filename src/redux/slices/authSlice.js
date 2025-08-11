import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginAPI,
  logoutAPI,
  registerAPI,
  sendOtpAPI,
  resetPasswordAPI,
} from '../../services/authService';

const initialState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

const extractToken = (payload) => {
  if (!payload) return null;
  return (
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload.id_token ||
    payload.data?.token ||
    payload.data?.accessToken ||
    null
  );
};

const extractUser = (payload) => {
  if (!payload) return null;
  return payload.user || payload.profile || payload.data?.user || payload;
};

// 🔐 Đăng nhập
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginAPI(email, password);
      const token = extractToken(res.data);
      const user = extractUser(res.data);
      
      // Lưu vào AsyncStorage
      if (token) {
        await AsyncStorage.setItem('authToken', token);
      }
      if (user) {
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
      }
      
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 📝 Đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const res = await registerAPI(email, password, fullName, phoneNumber, otp);
      const token = extractToken(res.data);
      const user = extractUser(res.data);
      
      // Lưu vào AsyncStorage
      if (token) {
        await AsyncStorage.setItem('authToken', token);
      }
      if (user) {
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
      }
      
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 📩 Gửi OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const res = await sendOtpAPI(email);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔁 Reset mật khẩu
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword, otp }, { rejectWithValue }) => {
    try {
      const res = await resetPasswordAPI(email, newPassword, otp);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🚪 Đăng xuất
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const res = await logoutAPI();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    return res.data;
  } catch (err) {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    return rejectWithValue(err.response?.data || err.message);
  }
});

// 📥 Load Auth từ AsyncStorage khi mở app
export const loadAuthFromStorage = createAsyncThunk(
  'auth/loadAuthFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('authUser');
      return {
        token: token || null,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload || null;
    },
    setUser(state, action) {
      state.user = action.payload || null;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = extractToken(action.payload);
        state.user = extractUser(action.payload);
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.token = null;
        state.user = null;
      })

      // REGISTER
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = extractToken(action.payload);
        state.user = extractUser(action.payload);
        state.error = null;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = action.payload;
      })

      // LOAD AUTH FROM STORAGE
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      });
  },
});

export const { setToken, setUser, clearAuth } = authSlice.actions;

// Selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
