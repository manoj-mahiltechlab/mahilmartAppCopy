import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import React, {FC} from 'react';
import CustomText from './CustomText';
import {Fonts, Colors} from '@utils/Constants';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  disabled: boolean;
  loading: boolean;
}

const CustomButton: FC<CustomButtonProps> = ({
  onPress,
  loading,
  title,
  disabled,
}) => {
  const getButtonStyle = (disabled: boolean) => ({
    backgroundColor: disabled ? '#ccc' : Colors.secondary ?? '#007bff',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.5}
      style={[styles.btn, getButtonStyle(disabled)]}>
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <CustomText
            style={styles.text}
            variant="h9"
            fontFamily={Fonts.SemiBold}>
            {title}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    width: '100%',
  },
});

export default CustomButton;
