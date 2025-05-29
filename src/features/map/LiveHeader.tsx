import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, {FC} from 'react';
import {useAuthStore} from '@state/authStore';
import {navigate} from '@utils/NavigationUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';

const LiveHeader: FC<{
  type: 'Customer' | 'Delivery';
  title: string;
  secondTitle: string;
}> = ({title, type, secondTitle}) => {
  const isCustomer = type === 'Customer';
  const {currentOrder, setCurrentOrder} = useAuthStore();

  return (
    <SafeAreaView>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            requestAnimationFrame(() => {
              if (isCustomer) {
                navigate('ProductDashboard');
                if (currentOrder?.status === 'delivered') {
                  setCurrentOrder(null);
                }
              } else {
                navigate('DeliveryDashboard');
              }
            });
          }}>
          <Icon
            name="chevron-back"
            size={RFValue(16)}
            color={isCustomer ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <CustomText
          variant="h7"
          fontFamily={Fonts.Medium}
          style={isCustomer ? styles.titleTextWhite : styles.titleTextBlack}>
          {title}
        </CustomText>
        <CustomText
          variant="h4"
          fontFamily={Fonts.SemiBold}
          style={isCustomer ? styles.titleTextWhite : styles.titleTextBlack}>
          {secondTitle}
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 10, // or safe area inset
    left: 10,
    zIndex: 10, // ensures it's on top
    padding: 10,
  },

  titleTextBlack: {
    color: 'black',
  },
  titleTextWhite: {
    color: 'white',
  },
});

export default LiveHeader;
