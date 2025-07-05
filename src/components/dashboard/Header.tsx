import {View, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import React, {FC, useEffect} from 'react';
import {useAuthStore} from '@state/authStore';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {navigate} from '@utils/NavigationUtils';
import Geolocation from '@react-native-community/geolocation';
import {reverseGeocode} from '@service/mapService';

const Header: FC<{showNotice: () => void}> = ({showNotice}) => {
  const {setUser, user} = useAuthStore();

  useEffect(() => {
    const updateUserLocation = async () => {
      Geolocation.requestAuthorization();
      Geolocation.getCurrentPosition(
        position => {
          console.log('latitude****', position.coords.latitude);
          console.log('longitude**', position.coords.longitude);
          const {latitude, longitude} = position.coords;
          reverseGeocode(latitude, longitude, setUser);
        },
        error => console.log(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
        },
      );
    };

    updateUserLocation();
  }, [setUser]);

  return (
    <View style={styles.subContainer}>
      <TouchableOpacity activeOpacity={0.6}>
        <CustomText fontFamily={Fonts.Bold} variant="h5" style={styles.text}>
          Delivery in
        </CustomText>

        <View style={styles.flexRow}>
          <CustomText
            variant="h8"
            numberOfLines={2}
            fontFamily={Fonts.Medium}
            style={styles.text2}>
            {user?.PrimaryAddress || 'Knowhere, Somewhere 😄'}
          </CustomText>
          <Icon
            name="menu-down"
            color="#fff"
            size={RFValue(20)}
            style={{bottom: -1}}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigate('Profile')}>
        <Icon name="account-circle-outline" size={RFValue(36)} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#fff',
  },
  text2: {
    color: '#fff',
    width: '90%',
    textAlign: 'center',
  },
  flexRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    width: '90%',
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingTop: Platform.OS === 'android' ? 5 : 9,
    justifyContent: 'space-between',
  },
  flexRowGap: {
    //paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  noticeBtn: {
    backgroundColor: '#E8EAF5',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    bottom: -2,
  },
});

export default Header;
