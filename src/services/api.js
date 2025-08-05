import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smartbus-68ae.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Tự động thêm Firebase token nếu cần
// import { getAuth } from 'firebase/auth';
// api.interceptors.request.use(async (config) => {
//   const token = await getAuth().currentUser?.getIdToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
