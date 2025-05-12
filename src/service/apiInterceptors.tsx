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
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      try {
        const newAccessToken = await refresh_Tokens();
        if (newAccessToken) {
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        }
      } catch (err) {
        console.log('ERROR REFRESHING TOKEN', err);
      }
    }
    if (error.response && error.response.status !== 401) {
      const errorMessage =
        error.response.data.message || 'something went wrong';
      console.log(errorMessage);
    }
    return Promise.reject(error);
  },
);
