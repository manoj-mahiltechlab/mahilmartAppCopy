import axios from 'axios';
import {BASE_URL} from './config';
import {tokenStorage} from '@state/storage';
import {useAuthStore} from '@state/authStore';

import {appAxios} from './apiInterceptors';
import {resetAndNavigate} from '@utils/NavigationUtils';

export const customerLogin = async (phone: string) => {
  try {
    console.log('customerLogin phone', phone);
    const response = await axios.post(`${BASE_URL}/customer/login`, {phone});
    const {accessToken, refreshToken, customer} = response.data;
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    console.log('customer', customer);

    tokenStorage.set('accessToken', accessToken);
    tokenStorage.set('refreshToken', refreshToken);

    const {setUser} = useAuthStore.getState();

    // ✅ Add token to Zustand user object
    setUser({
      ...customer,
      token: accessToken, // ✅ Store token here
    });

    console.log(`"customer Details": `, customer);
  } catch (error) {
    console.log('Login Error', error);
  }
};

export const deliveryLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/delivery/login`, {
      email,
      password,
    });
    const {accessToken, refreshToken, deliveryPartner} = response.data;
    tokenStorage.set('accessToken', accessToken);
    tokenStorage.set('refreshToken', refreshToken);
    const {setUser} = useAuthStore.getState();
    setUser(deliveryPartner);
  } catch (error) {
    console.log('Login Error', error);
  }
};

export const refresh_Tokens = async () => {
  try {
    const refreshToken = tokenStorage.getString('refreshToken');
    const response = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken,
    });
    const new_access_token = response.data.accessToken;
    const new_refresh_token = response.data.refreshToken;

    tokenStorage.set('accessToken', new_access_token);
    tokenStorage.set('refreshToken', new_refresh_token);
    return new_access_token;
  } catch (error) {
    console.log('REFRESH TOKEN ERROR : ', error);
    tokenStorage.clearAll();
    resetAndNavigate('CustomerLogin');
  }
};

export const refetchUser = async (setUser: any) => {
  try {
    const token = tokenStorage.getString('accessToken'); // ✅ Fetch token again
    const response = await appAxios.get('/user');
    setUser({
      ...response.data.user,
      token, // ✅ Reattach token
    });
  } catch (error) {
    console.log('Login Error', error);
  }
};

export const updateUserLocation = async (data: any, setUser: any) => {
  try {
    console.log('Location updated successfully:', data);
    const response = await appAxios.patch('/user', data);
    console.log('Location updated successfully:', response.data);
    refetchUser(setUser);
  } catch (error) {
    console.log('update User Location Error', error);
  }
};
