import {View} from 'react-native';
import React, {FC} from 'react';
import StickySearchBar from '@features/dashboard/StickySearchBar';

const Header: FC<{showNotice: () => void}> = ({showNotice}) => {
  return (
    <View>
      <StickySearchBar />
    </View>
  );
};
export default Header;
