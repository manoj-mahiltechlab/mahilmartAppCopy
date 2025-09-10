import React, {useEffect} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  CollapsibleHeaderContainer,
  CollapsibleScrollView,
  useCollapsibleContext,
  withCollapsibleContext,
  CollapsibleContainer,
} from '@r0b0t3d/react-native-collapsible';
import Geolocation from '@react-native-community/geolocation';
import {useAuthStore} from '@state/authStore';
import NoticeAnimation from './NoticeAnimation';
import Visuals from './Visuals';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';
import AnimatedHeader from './AnimaterHeader';
import Content from '@components/dashboard/Content';
import withCart from '@features/cart/WithCart';
import {reverseGeocode} from '@service/mapService';
import withLiveStatus from '@features/map/withLiveStatus';

const ProductDashboard = () => {
  const {setUser} = useAuthStore();
  const insets = useSafeAreaInsets();
  const noticePosition = useSharedValue(0);
  const showBackToTop = useSharedValue(false);
  const {scrollY, expand} = useCollapsibleContext();

  useAnimatedReaction(
    () => scrollY?.value,
    (current, previous) => {
      if (typeof current === 'number' && typeof previous === 'number') {
        showBackToTop.value = current < previous && current > 180;
      }
    },
    [scrollY],
  );

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        reverseGeocode(latitude, longitude, setUser);
      },
      err => console.log(err),
      {
        enableHighAccuracy: false,
        timeout: 500,
      },
    );
  }, []);

  const backToTopStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showBackToTop.value ? 1 : 0, {duration: 500}),
      transform: [
        {
          translateY: withTiming(showBackToTop.value ? 0 : 10, {
            duration: 500,
          }),
        },
      ],
    };
  });

  return (
    <NoticeAnimation noticePosition={noticePosition}>
      <>
        <Visuals />

        <Animated.View style={[backToTopStyle, styles.backToTopButton]}>
          <TouchableOpacity
            onPress={() => {
              scrollY.value = 0;
              expand();
            }}
            style={styles.backToTopTouchable}>
            <Icon
              name="arrow-up-circle-outline"
              color="white"
              size={RFValue(8)}
            />
            <CustomText
              variant="h9"
              style={styles.backToTopText}
              fontFamily={Fonts.SemiBold}>
              Back to top
            </CustomText>
          </TouchableOpacity>
        </Animated.View>

        <CollapsibleContainer style={styles.panelContainer}>
          <CollapsibleHeaderContainer containerStyle={styles.transparent}>
            <AnimatedHeader showNotice={() => {}} />
          </CollapsibleHeaderContainer>

          <CollapsibleScrollView
            nestedScrollEnabled
            style={styles.panelContainer}
            showsVerticalScrollIndicator={false}>
            <Content />
          </CollapsibleScrollView>
        </CollapsibleContainer>
      </>
    </NoticeAnimation>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    flex: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  backToTopButton: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    height: '5%',
    backgroundColor: 'black',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 999,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToTopTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToTopText: {
    color: 'white',
    marginLeft: 4,
  },
});

// export default withLiveStatus(
//   withCart(withCollapsibleContext(ProductDashboard)),
// );
export default withCart(withCollapsibleContext(ProductDashboard));
