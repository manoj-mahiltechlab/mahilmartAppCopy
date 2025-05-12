import React, {FC} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import {StyleSheet, View} from 'react-native';

const walletItem: FC<{icon: string; label: string}> = ({icon, label}) => {
  return (
    <View style={styles.WalletItemContainer}>
      <Icon name={icon} color={Colors.text} size={RFValue(20)} />
      <CustomText variant="h8" fontFamily={Fonts.Medium}>
        {label}
      </CustomText>
    </View>
  );
};
const styles = StyleSheet.create({
  WalletItemContainer: {
    alignItems: 'center',
  },
});
export default walletItem;
