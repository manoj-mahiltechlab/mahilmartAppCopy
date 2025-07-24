import {StyleSheet, View} from 'react-native';
import React from 'react';
import {
  StickyView,
  useCollapsibleContext,
} from '@r0b0t3d/react-native-collapsible';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import SearchBar from '@components/dashboard/SearchBar';
import {Colors} from '@utils/Constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const StickySearchBar = () => {
  const {scrollY} = useCollapsibleContext();
  const insets = useSafeAreaInsets();

  const animatedShadow = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 140], [0, 1]);
    return {opacity};
  });

  const backgroundColorChanges = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [1, 80], [0, 1]);
    return {backgroundColor: `rgba(255,255,255,${opacity})`};
  });

  return (
    <StickyView style={[backgroundColorChanges, {paddingTop: insets.top}]}>
      <View style={styles.searchContainer}>
        <SearchBar />
      </View>
      <Animated.View style={[styles.shadow, animatedShadow]} />
    </StickyView>
  );
};

const styles = StyleSheet.create({
  shadow: {
    height: 0,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  searchContainer: {
    paddingHorizontal: 10,
  },
});

export default StickySearchBar;
