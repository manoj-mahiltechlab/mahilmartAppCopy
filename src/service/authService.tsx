import axios from 'axios';
import {BASE_URL} from './config';
import {mmkvStorage, tokenStorage} from '@state/storage';
import {useAuthStore} from '@state/authStore';

import {appAxios} from './apiInterceptors';
import {resetAndNavigate} from '@utils/NavigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    //   console.log('Location updated successfully:', data);
    const response = await appAxios.patch('/user', data);
    // console.log('Location updated successfully:', response.data);
    refetchUser(setUser);
  } catch (error) {
    console.log('update User Location Error', error);
  }
};
export const sendCustomerOtp = async (phone: string) => {
  const res = await axios.post(`${BASE_URL}/customer/send-otp`, {phone});

  console.log('✅ OTP Sent:', res.data);

  if (res.data.otpToken) {
    await AsyncStorage.setItem('otpToken', res.data.otpToken);
  }

  return res.data;
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
    return response.data;
  } catch (error) {
    console.log('Search Product Error:', error);
    return [];
  }
};

export const getSupportInfo = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/support`);
    return res.data.data; // This returns { email, phone, whatsapp, createdAt, updatedAt }
  } catch (error) {
    console.log('Fetch Support Info Error:', error);
    return null;
  }
};
export const getAdImages = async (title: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/adData/get?title=${title}`);
    // console.log('All fetched images:', response.data);
    return response.data.images; // ✅ RETURN the images
  } catch (error) {
    console.error('Error fetching ad images:', error.message);
    return []; // return empty array on error
  }
};

export const getAllSections = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sections`);
    // console.log('📦 All sections fetched:', response.data);
    return response.data; // ✅ Not response.data.sections
  } catch (error) {
    console.error('❌ Failed to fetch all sections:', error);
    return {success: false, sections: []};
  }
};
