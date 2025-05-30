import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {FC, useEffect, useRef} from 'react';
import {ScrollView} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';

interface SidebarProps {
  selectedCategory: any;
  categories: any;
  onCategoryPress: (category: any) => void;
}

const Sidebar: FC<SidebarProps> = ({
  selectedCategory,
  categories,
  onCategoryPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorPosition = useSharedValue(0);
  const animatedValues = categories?.map(() => useSharedValue(0));
  const CATEGORY_HEIGHT = 100;
  const INDICATOR_HEIGHT = 10;
  const VERTICAL_OFFSET = (CATEGORY_HEIGHT - INDICATOR_HEIGHT) / 2;

  useEffect(() => {
    let targetIndex = -1;
    categories?.forEach((category: any, index: number) => {
      const isSelected = selectedCategory?._id === category?._id;
      animatedValues[index].value = withTiming(isSelected ? 2 : -15, {
        duration: 500,
      });
      if (isSelected) targetIndex = index;
    });

    if (targetIndex !== -1) {
      const CATEGORY_HEIGHT = 100;
      const INDICATOR_HEIGHT = 90;
      const VERTICAL_OFFSET = (CATEGORY_HEIGHT - INDICATOR_HEIGHT) / 2;

      indicatorPosition.value = withTiming(
        targetIndex * CATEGORY_HEIGHT + VERTICAL_OFFSET,
        {duration: 300},
      );

      scrollViewRef.current?.scrollTo({
        y: targetIndex * CATEGORY_HEIGHT,
        animated: true,
      });
    }
  }, [selectedCategory]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateY: indicatorPosition.value}],
  }));

  return (
    <View style={styles.SideBar}>
      <View style={{flex: 1}}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{paddingBottom: 50}}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.indicator, indicatorStyle]} />
          {categories?.map((category: any, index: number) => {
            const animatedStyle = useAnimatedStyle(() => ({
              bottom: animatedValues[index].value,
            }));
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={styles.categoryButton}
                onPress={() => onCategoryPress(category)}>
                <View
                  style={[
                    styles.imageContainer,
                    selectedCategory?._id === category?._id &&
                      styles.selectedImageContainer,
                  ]}>
                  <Animated.Image
                    source={{uri: category?.image}}
                    style={[styles.image, animatedStyle]}
                  />
                </View>
                <CustomText fontSize={RFValue(9)} style={{textAlign: 'center'}}>
                  {category?.name}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  SideBar: {
    width: '24%',
    backgroundColor: '#fff',
    borderRightWidth: 0.8,
    borderRightColor: '#eee',
    position: 'relative',
  },
  indicator: {
    width: '4%',
    height: 80,
    right: 0,
    backgroundColor: Colors.secondary ?? 'green',
    position: 'absolute',
    borderRadius: 10,
  },

  categoryButton: {
    padding: 10,
    height: 100,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    borderRadius: 100,
    height: '55%',
    marginBottom: 10,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F7',
    overflow: 'hidden',
  },
  selectedImageContainer: {
    backgroundColor: '#CFFFDB',
  },
  image: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default Sidebar;
