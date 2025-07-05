// WalletSection.tsx
import React from 'react';
import {View, StyleSheet, Alert, Linking} from 'react-native';
import WalletItem from './WalletItem';
import {Colors} from '@utils/Constants';

const WalletSection = () => {
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
          Alert.alert('Support', 'Support Pressed');
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
