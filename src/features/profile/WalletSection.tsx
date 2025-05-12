import {View, StyleSheet} from 'react-native';
import React from 'react';
import WalletItem from './WalletItem';
import {Colors} from '@utils/Constants';

const WalletSection = () => {
  return (
    <View style={styles.WalletItemContainer}>
      <WalletItem icon="wallet-outline" label="wallet" />
      <WalletItem icon="chatbubble-ellipses-outline" label="Support" />
      <WalletItem icon="card-outline" label="Payments" />
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
