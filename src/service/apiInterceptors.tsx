import axios from 'axios';
import {BASE_URL} from './config';
import {tokenStorage} from '@state/storage';
import {refresh_Tokens} from './authService';

export const appAxios = axios.create({
  baseURL: BASE_URL,
});

appAxios.interceptors.request.use(async config => {
  const accessToken = tokenStorage.getString('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
appAxios.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Check for both 401 and 403, and avoid infinite loops
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refresh_Tokens();
        if (newAccessToken) {
          tokenStorage.set('accessToken', newAccessToken); // store it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return appAxios(originalRequest); // retry with new token
        }
      } catch (err) {
        console.log('ERROR REFRESHING TOKEN', err);
      }
    }

    // For other errors, log the message
    if (error.response && error.response.status !== 401) {
      const errorMessage =
        error.response.data?.message || 'Something went wrong';
      console.log(errorMessage);
    }

    return Promise.reject(error);
  },
);
