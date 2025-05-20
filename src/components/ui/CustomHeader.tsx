import {View, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import {goBack} from '@utils/NavigationUtils';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from './CustomText';
import {Fonts} from '@utils/Constants';
import ScalePress from './ScallPress';

const CustomHeader: FC<{title: string; search?: boolean}> = ({
  title,
  search,
}) => {
  return (
    <SafeAreaView>
      <View style={styles.flexRow}>
        <TouchableOpacity onPress={() => goBack()}>
          <Icon name="chevron-back" color={Colors.text} size={RFValue(25)} />
        </TouchableOpacity>

        <CustomText
          style={styles.text}
          variant="h5"
          fontFamily={Fonts.SemiBold}>
          {title}
        </CustomText>

        <View>
          {search && (
            <Icon name="search" color={Colors.text} size={RFValue(20)} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'space-between',
    padding: 15,
    paddingRight: 25,
    paddingLeft: 25,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
  },
  text: {
    textAlign: 'center',
  },
});

export default CustomHeader;
