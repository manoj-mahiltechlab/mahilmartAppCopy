// src/features/auth/LogoutScreen.tsx
import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '@state/authStore';

const LogoutScreen = () => {
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  useEffect(() => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{name: 'CustomerLogin'}], // this must match your root stack
    });
  }, []);

  return null;
};

export default LogoutScreen;
