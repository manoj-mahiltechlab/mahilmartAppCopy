import React, {FC, useEffect} from 'react';
import {View, StyleSheet, Image, Alert, Platform} from 'react-native';
import {Colors} from '@utils/Constants';
import Logo from '@assets/images/logo.jpeg';
import {screenHeight, screenWidth} from '@utils/Scaling';
import GeoLocation from '@react-native-community/geolocation';
import {useAuthStore} from '@state/authStore';
import {tokenStorage} from '@state/storage';
import {jwtDecode} from 'jwt-decode';
import {refetchUser, refresh_Tokens} from '@service/authService';
import {resetAndNavigate} from '@utils/NavigationUtils';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

GeoLocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
});

interface DecodedToken {
  exp: number;
}

const SplashScreen: FC = () => {
  const {user, setUser} = useAuthStore();

  const navigateBasedOnRole = () => {
    if (user?.role === 'Customer') {
      resetAndNavigate('ProductDashboard');
    } else {
      resetAndNavigate('DeliveryDashboard');
    }
  };

  const validateTokens = async () => {
    try {
      const accessToken = tokenStorage.getString('accessToken');
      const refreshToken = tokenStorage.getString('refreshToken');

      if (!accessToken || !refreshToken) {
        resetAndNavigate('CustomerLogin');
        return;
      }

      const currentTime = Date.now() / 1000;
      const decodedAccess = jwtDecode<DecodedToken>(accessToken);
      const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);

      if (decodedRefresh.exp < currentTime) {
        Alert.alert('Session Expired', 'Please login again');
        resetAndNavigate('CustomerLogin');
        return;
      }

      if (decodedAccess.exp < currentTime) {
        await refresh_Tokens(); // get new access token
      }

      await refetchUser(setUser);
      navigateBasedOnRole();
    } catch (error) {
      console.log('Token validation error:', error);
      Alert.alert('Something went wrong', 'Please login again');
      resetAndNavigate('CustomerLogin');
    }
  };

  const handleLocationPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const status = await check(permission);

    switch (status) {
      case RESULTS.GRANTED:
        console.log('Permission granted');
        validateTokens();
        break;
      case RESULTS.DENIED:
        const newStatus = await request(permission);
        if (newStatus === RESULTS.GRANTED) {
          validateTokens();
        } else {
          Alert.alert(
            'Permission Needed',
            'Location access is required to continue.',
          );
        }
        break;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Permission Blocked',
          'Please enable location access in your settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        break;
    }
  };

  useEffect(() => {
    handleLocationPermission();
  });

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logoImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: screenHeight * 0.4,
    width: screenWidth * 0.4,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
