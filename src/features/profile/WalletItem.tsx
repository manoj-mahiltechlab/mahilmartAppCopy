import React, {FC} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts} from '@utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import {StyleSheet, View, TouchableOpacity} from 'react-native';

interface WalletItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

const WalletItem: FC<WalletItemProps> = ({icon, label, onPress}) => {
  return (
    <TouchableOpacity style={styles.WalletItemContainer} onPress={onPress}>
      <Icon name={icon} color={Colors.text} size={RFValue(20)} />
      <CustomText variant="h8" fontFamily={Fonts.Medium}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  WalletItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});

export default WalletItem;
