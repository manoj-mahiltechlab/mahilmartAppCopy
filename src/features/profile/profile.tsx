import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useAuthStore} from '@state/authStore';
import {useCartStore} from '@state/CartStore';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import ActionButton from './ActionButton';
import {storage, tokenStorage} from '@state/storage';
import WalletSection from './WalletSection';
import {CommonActions, useNavigation} from '@react-navigation/native';

const Profile = () => {
  const {logout, user} = useAuthStore();
  const {clearCart} = useCartStore();
  const navigation = useNavigation();

  const handleLogout = () => {
    clearCart();
    useAuthStore.getState().setUser(null);
    tokenStorage.clearAll();
    storage.clearAll();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'CustomerLogin'}],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Profile" />

      <View style={styles.scrollViewContent}>
        <CustomText variant="h3" fontFamily={Fonts.SemiBold}>
          Your Account
        </CustomText>
        <CustomText variant="h7" fontFamily={Fonts.Medium} style={styles.phone}>
          {user?.phone}
        </CustomText>

        <View style={styles.section}>
          <WalletSection />
        </View>

        <CustomText variant="h8" style={styles.sectionTitle}>
          YOUR INFORMATION
        </CustomText>

        <View style={styles.section}>
          <ActionButton
            icon="book-outline"
            label="Address Book"
            onPress={() =>
              navigation.navigate('EditAddressScreen', {
                addressType: 'primary',
                existingAddress: user?.primaryAddress || null,
              })
            }
          />
          <View style={styles.divider} />
          <ActionButton icon="information-outline" label="About Us" />
          <View style={styles.divider} />
          <ActionButton
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 100,
  },
  phone: {
    color: '#666',
    marginTop: 2,
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#F4F6F8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 6,
  },
});

export default Profile;
