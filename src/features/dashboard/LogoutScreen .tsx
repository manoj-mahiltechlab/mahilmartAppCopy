import {useEffect} from 'react';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useAuthStore} from '@state/authStore';

const LogoutScreen = () => {
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  useEffect(() => {
    logout(); // clear Zustand auth state
    navigation.dispatch(StackActions.replace('CustomerLogin'));
  }, []);

  return null;
};

export default LogoutScreen;
