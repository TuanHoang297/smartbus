import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginAPI,
  logoutAPI,
  registerAPI,
  sendOtpAPI,
  resetPasswordAPI,
} from '../../services/authService';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
};

// 🔐 Đăng nhập: gửi email + password tới API backend
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginAPI(email, password);
      return response.data; // Backend trả về thông tin người dùng
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 📝 Đăng ký tài khoản mới qua API
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const response = await registerAPI(email, password, fullName, phoneNumber, otp);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 📩 Gửi mã OTP tới email
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await sendOtpAPI(email);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔁 Reset mật khẩu bằng OTP
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword, otp }, { rejectWithValue }) => {
    try {
      const response = await resetPasswordAPI(email, newPassword, otp);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🚪 Đăng xuất
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutAPI();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 📦 Slice xử lý state
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
