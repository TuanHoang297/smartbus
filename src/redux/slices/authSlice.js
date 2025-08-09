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
  token: null,         // <-- thêm token
  status: 'idle',
  error: null,
};

const extractToken = (payload) => {
  if (!payload) return null;
  // hỗ trợ nhiều schema trả về từ backend
  return (
    payload.token || payload.accessToken || payload.jwt || payload.id_token ||
    payload.data?.token || payload.data?.accessToken || null
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
      return res.data; // kỳ vọng { token, user } hoặc tương tự
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
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await logoutAPI();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // tuỳ chọn: set thủ công nếu cần
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
        state.token = extractToken(action.payload);   // <-- lưu token
        state.user = extractUser(action.payload);     // <-- lưu user
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.token = null;
        state.user = null;
      })

      // REGISTER (nếu backend trả luôn token sau đăng ký)
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const tk = extractToken(action.payload);
        if (tk) state.token = tk;
        const u = extractUser(action.payload);
        if (u) state.user = u;
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
        // ngay cả khi API fail vẫn xoá local
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = action.payload;
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
