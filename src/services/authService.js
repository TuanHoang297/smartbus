import api from './api';

export const registerAPI = (email, password, fullName, phoneNumber, otp) =>
  api.post('/auth/register', {
    Email: email,
    Password: password,
    FullName: fullName,
    PhoneNumber: phoneNumber,
    Otp: otp,
  });

export const sendOtpAPI = (email) =>
  api.post(`/auth/send-otp?email=${encodeURIComponent(email)}`);

export const loginAPI = (email, password) =>
  api.post('/auth/login', {
    Email: email,
    Password: password,
  });

export const resetPasswordAPI = (email, newPassword, otp) =>
  api.post('/auth/reset-password', {
    Email: email,
    Otp: otp,
    NewPassword: newPassword,
  });

export const logoutAPI = () => api.post('/auth/logout');
