// WalletSection.tsx
import React from 'react';
import {View, StyleSheet, Alert, Linking} from 'react-native';
import WalletItem from './WalletItem';
import {Colors} from '@utils/Constants';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {RootStackParamList} from '@navigation/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type NavigationType = CompositeNavigationProp<
  BottomTabNavigationProp<RootStackParamList, 'BottomTabs'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const WalletSection = () => {
  const navigation = useNavigation<NavigationType>();

  return (
    <View style={styles.WalletItemContainer}>
      <WalletItem
        icon="wallet-outline"
        label="Wallet"
        onPress={() => {
          Alert.alert('Wallet', 'Wallet Pressed');
        }}
      />

      <WalletItem
        icon="chatbubble-ellipses-outline"
        label="Support"
        onPress={() => {
          navigation.navigate('BottomTabs', {
            screen: 'Home', // the name of your tab that holds CustomerStack
            params: {
              screen: 'Support', // the screen inside CustomerStack
            },
          });
        }}
      />

      <WalletItem
        icon="card-outline"
        label="Payments"
        onPress={() => {
          Alert.alert('Support', 'Support button pressed!');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  WalletItemContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 15,
    borderRadius: 15,
    marginVertical: 20,
  },
});

export default WalletSection;
