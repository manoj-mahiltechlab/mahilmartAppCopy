import React, {FC, useEffect, useCallback, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  BackHandler,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Colors} from '@utils/Constants';
import Logo from '@assets/images/logo.jpeg';
import {screenHeight, screenWidth} from '@utils/Scaling';
import Geolocation from '@react-native-community/geolocation';
import {useAuthStore} from '@state/authStore';
import {mmkvStorage} from '@state/storage';
import jwtDecode from 'jwt-decode';
import {refetchUser, refresh_Tokens} from '@service/authService';
import {resetAndNavigate} from '@utils/NavigationUtils';
import {
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

interface DecodedToken {
  exp: number;
}

const SplashScreen: FC = () => {
  const {user, setUser} = useAuthStore();
  const isFocused = useIsFocused();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const [loading, setLoading] = useState(false);
  const [locationAlertShown, setLocationAlertShown] = useState(false);

  const locationPermissions =
    Platform.OS === 'android'
      ? [
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ]
      : [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];

  const exitApp = () => {
    resetAndNavigate('CustomerLogin');
  };

  const clearCache = async () => {
    try {
      await mmkvStorage.clearAll();
    } catch (error) {
      console.log('Error clearing cache:', error);
    }
  };

  const navigateBasedOnRole = useCallback(() => {
    if (user?.role === 'Customer') {
      resetAndNavigate('ProductDashboard');
    } else {
      resetAndNavigate('DeliveryDashboard');
    }
  }, [user]);

  const validateTokens = useCallback(async () => {
    try {
      const accessToken = mmkvStorage.getString('accessToken');
      const refreshToken = mmkvStorage.getString('refreshToken');

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
        await refresh_Tokens();
      }

      await refetchUser(setUser);
      navigateBasedOnRole();
    } catch (error) {
      console.log('Token validation error:', error);
      resetAndNavigate('CustomerLogin');
    }
  }, [setUser, navigateBasedOnRole]);

  const requestPermissions = async (): Promise<boolean> => {
    for (const permission of locationPermissions) {
      const result = await request(permission);
      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Location permission is blocked. Please enable it in settings.',
          [
            {text: 'Open Settings', onPress: () => openSettings()},
            {text: 'Back to Login', style: 'cancel', onPress: exitApp},
          ],
          {cancelable: false},
        );

        return false;
      }
      if (result !== RESULTS.GRANTED) {
        return false;
      }
    }
    return true;
  };

  const checkLocationServicesEnabled = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const enabled = await DeviceInfo.isLocationEnabled();
        if (!enabled) return false;
      }

      return new Promise(resolve => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          error => {
            console.log('Geolocation error:', error);

            if (error.code === 1) {
              // PERMISSION_DENIED
              resolve(false);
            } else {
              resolve(true);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      });
    } catch (error) {
      console.log('Error checking location services:', error);
      return false;
    }
  };

  const checkLocationAndPermission = useCallback(async () => {
    setLoading(true);
    try {
      const permissionsGranted = await requestPermissions();

      if (!permissionsGranted) {
        setLoading(false);
        Alert.alert(
          'Permission Required',
          'Location permission is required to continue.',
          [
            {text: 'Retry', onPress: () => checkLocationAndPermission()},
            {text: 'Exit', onPress: exitApp, style: 'cancel'},
          ],
          {cancelable: false},
        );
        return;
      }

      const isLocationOn = await checkLocationServicesEnabled();

      if (!isLocationOn && !locationAlertShown) {
        setLocationAlertShown(true);
        setLoading(false);
        Alert.alert(
          'Location Required',
          'Please enable GPS/location services.',
          [
            {text: 'Open Settings', onPress: () => openSettings()},
            {text: 'Exit', style: 'cancel', onPress: exitApp},
          ],
          {cancelable: false},
        );
        return;
      }

      await clearCache();
      await validateTokens();
    } catch (error) {
      console.log('Error checking location:', error);
      Alert.alert(
        'Error',
        'Something went wrong checking location.',
        [{text: 'Exit', onPress: exitApp}],
        {cancelable: false},
      );
    } finally {
      setLoading(false);
    }
  }, [validateTokens, locationAlertShown]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setLocationAlertShown(false);
        checkLocationAndPermission();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [checkLocationAndPermission]);

  useEffect(() => {
    if (isFocused) {
      checkLocationAndPermission();
    }
  }, [isFocused, checkLocationAndPermission]);

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logoImage} />
      {loading && (
        <ActivityIndicator
          size="large"
          color={Colors.white}
          style={{marginTop: 20}}
        />
      )}
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
