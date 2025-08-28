import axios from 'axios';
import {BASE_URL} from './config';
import {mmkvStorage, tokenStorage} from '@state/storage';
import {useAuthStore} from '@state/authStore';

import {appAxios} from './apiInterceptors';
import {resetAndNavigate} from '@utils/NavigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

export const customerLogin = async (phone: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/customer/login`, {phone});
    const {accessToken, refreshToken, customer} = response.data;

    tokenStorage.set('accessToken', accessToken);
    tokenStorage.set('refreshToken', refreshToken);

    const {setUser} = useAuthStore.getState();
    setUser({...customer, token: accessToken});

    return {success: true, customer, accessToken};
  } catch (error) {
    console.error('Login Error', error);
    return {success: false, error};
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

    return {success: true}; // ✅ <-- this was missing
  } catch (error) {
    console.log('Login Error', error);
    return {success: false}; // ✅ Return failure status too
  }
};

export const refresh_Tokens = async () => {
  try {
    const refreshToken = tokenStorage.getString('refreshToken');

    if (!refreshToken) {
      console.warn('⚠ No refresh token available. Logging out.');
      tokenStorage.clearAll();
      resetAndNavigate('CustomerLogin');
      return null;
    }

    const response = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken,
    });

    if (!response?.data?.accessToken) {
      throw new Error(response.data?.message || 'No access token in response');
    }

    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken || refreshToken; // fallback to old if not returned

    // Store updated tokens
    tokenStorage.set('accessToken', newAccessToken);
    tokenStorage.set('refreshToken', newRefreshToken);

    console.log('✅ Token refreshed successfully');

    return newAccessToken;
  } catch (error: any) {
    console.error(
      '❌ REFRESH TOKEN ERROR:',
      error?.response?.data || error.message,
    );

    // Cleanup & redirect
    tokenStorage.clearAll();
    resetAndNavigate('CustomerLogin');
    return null;
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
    //   console.log('Location updated successfully:', data);
    const response = await appAxios.patch('/user', data);
    // console.log('Location updated successfully:', response.data);
    refetchUser(setUser);
  } catch (error) {
    console.log('update User Location Error', error);
  }
};
export const sendCustomerOtp = async (phone: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/customer/send-otp`, {
      phone,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      '❌ OTP Send Error:',
      error?.response?.data || error.message,
      '\nStatus:',
      error?.response?.status,
    );
    throw error;
  }
};

// ✅ Step 2: Verify OTP
export const verifyCustomerOtp = async (
  phone: string,
  otp: string,
  otpToken: string,
) => {
  const res = await axios.post(`${BASE_URL}/customer/verify-otp`, {
    phone,
    otp,
    otpToken,
  });

  const {accessToken, refreshToken, customer} = res.data;

  tokenStorage.set('accessToken', accessToken);
  tokenStorage.set('refreshToken', refreshToken);

  const {setUser} = useAuthStore.getState();
  setUser({
    ...customer,
    token: accessToken,
  });

  return {
    success: true,
    accessToken,
    refreshToken,
    customer,
  };
};

export const searchProducts = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/products/search`, {
      params: {q: query},
    });
    console.log('data :', response);
    return response.data;
  } catch (error) {
    console.log('Search Product Error:', error);
    return [];
  }
};

export const getSupportInfo = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/support`);
    return res.data.data;
  } catch (error) {
    console.log('Fetch Support Info Error:', error);
    return null;
  }
};
export const getAdImages = async (title: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/adData/get?title=${title}`);

    return response.data.images;
  } catch (error) {
    return [];
  }
};

export const getAllSections = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sections`);
    // console.log('📦 All sections fetched:', response.data);
    return response.data; // ✅ Not response.data.sections
  } catch (error) {
    // console.error('❌ Failed to fetch all sections:', error);
    return {success: false, sections: []};
  }
};

export const fetchProductByUnitId = async unitId => {
  try {
    const response = await axios.get(`${BASE_URL}/product/unit/${unitId}`);
    console.log('response data in touched units :: ', response.data);
    return response.data; // The product object
  } catch (error) {
    console.error('Error fetching product by unit id:', error);
    return null;
  }
};
export const fetchProductByProductId = async productId => {
  try {
    const url = `${BASE_URL}/product/${productId}`;
    console.log('Request URL:', url);
    const response = await axios.get(url);
    console.log('Fetched product by productRef:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by productRef:', error);
    return null;
  }
};
