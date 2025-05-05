import React, {FC, useEffect, useCallback} from 'react';
import {View, StyleSheet, Image, Alert, Platform, Linking} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Colors} from '@utils/Constants';
import Logo from '@assets/images/logo.jpeg';
import {screenHeight, screenWidth} from '@utils/Scaling';
import GeoLocation from '@react-native-community/geolocation';
import {useAuthStore} from '@state/authStore';
import {mmkvStorage} from '@state/storage'; // Updated import for mmkvStorage
import {jwtDecode} from 'jwt-decode';
import {refetchUser, refresh_Tokens} from '@service/authService';
import {resetAndNavigate} from '@utils/NavigationUtils';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

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
  const isFocused = useIsFocused();

  const navigateBasedOnRole = () => {
    if (user?.role === 'Customer') {
      resetAndNavigate('ProductDashboard');
    } else {
      resetAndNavigate('DeliveryDashboard');
    }
  };

  const validateTokens = async () => {
    try {
      // Use mmkvStorage for consistent token retrieval
      const accessToken = mmkvStorage.getItem('accessToken');
      const refreshToken = mmkvStorage.getItem('refreshToken');

      console.log('Access token ******', accessToken);

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
        await refresh_Tokens(); // Get a new access token
      }

      await refetchUser(setUser);
      navigateBasedOnRole();
    } catch (error) {
      console.log('Token validation error:', error);
      Alert.alert('Something went wrong', 'Please login again');
      resetAndNavigate('CustomerLogin');
    }
  };

  const checkLocationServices = useCallback(async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (result === RESULTS.GRANTED) {
        validateTokens(); // GPS is ON
      } else {
        const requestResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        if (requestResult === RESULTS.GRANTED) {
          validateTokens(); // Now permission is granted
        } else {
          Alert.alert(
            'Enable Location',
            'Location permission is required to use the app.',
            [{text: 'OK'}],
          );
        }
      }
    } catch (error) {
      console.log('Error checking GPS status:', error);
      Alert.alert('Error', 'Unable to check location services.');
    }
  }, [validateTokens]);

  const handleLocationPermission = useCallback(async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const status = await check(permission);

    switch (status) {
      case RESULTS.GRANTED:
        console.log('Permission granted');
        checkLocationServices();
        break;
      case RESULTS.DENIED:
      case RESULTS.UNAVAILABLE:
      case RESULTS.LIMITED:
        const newStatus = await request(permission);
        if (newStatus === RESULTS.GRANTED) {
          checkLocationServices();
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
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings().catch(() => {
                  Alert.alert('Error', 'Unable to open settings');
                });
              },
            },
          ],
        );
        break;
    }
  }, [checkLocationServices]); // Add checkLocationServices to dependencies

  useEffect(() => {
    if (isFocused) {
      handleLocationPermission();
    }
  }, [isFocused, handleLocationPermission]);

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
