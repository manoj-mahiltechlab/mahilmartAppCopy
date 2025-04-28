import {StyleSheet} from 'react-native';
import React from 'react';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  StickyView,
  useCollapsibleContext,
} from '@r0b0t3d/react-native-collapsible';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import SearchBar from '@components/dashboard/SearchBar';

const StickySearchBar = () => {
  const {scrollY} = useCollapsibleContext();
  const animatedShadow = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 140], [0, 1]);
    return {opacity};
  });
  const backgroundColorChanges = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [1, 80], [0, 1]);
    return {backgroundColor: `rgba(255,255,255,${opacity})`};
  });
  return (
    <StickyView style={backgroundColorChanges}>
      <SearchBar />
      <Animated.View style={[style.shadow, animatedShadow]} />
    </StickyView>
  );
};
const style = StyleSheet.create({
  shadow: {
    height: 15,
    width: '100%',
    borderBottomWidth: 1,
    borderBlockColor: Colors.border,
  },
});

export default StickySearchBar;
