// import React from 'react';
// import {StyleSheet, Image, Dimensions} from 'react-native';
// import {useCollapsibleContext} from '@r0b0t3d/react-native-collapsible';
// import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
// import LinearGradient from 'react-native-linear-gradient';
// import LottieView from 'lottie-react-native';
// import {darkWeatherColors} from '@utils/Constants';

// const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// const Visuals = () => {

//   return (
//     <Animated.View style={[styles.container, headerAnimatedStyle]}>
//       <LinearGradient colors={darkWeatherColors} style={styles.gradient} />
//       <Image
//         source={require('@assets/images/cloud.png')}
//         style={styles.cloud}
//       />
//       <LottieView
//         autoPlay={true}
//         loop={true}
//         enableMergePathsAndroidForKitKatAndAbove={true}
//         style={styles.lottie}
//         source={require('@assets/animations/raining.json')}
//       />
//     </Animated.View>
//   );
// };

// export default Visuals;

import {StyleSheet} from 'react-native';
import React from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import {useCollapsibleContext} from '@r0b0t3d/react-native-collapsible';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {darkWeatherColors} from '@utils/Constants';
import {Image} from 'react-native';
import LottieView from 'lottie-react-native';

const Visuals = () => {
  const {scrollY} = useCollapsibleContext();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 120], [1, 0]);
    return {opacity};
  });

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]}>
      <LinearGradient colors={darkWeatherColors} style={styles.gradient} />
      <Image
        source={require('@assets/images/cloud.png')}
        style={styles.cloud}
      />
      <LottieView
        autoPlay={true}
        loop={true}
        enableMergePathsAndroidForKitKatAndAbove={true}
        style={styles.lottie}
        source={require('@assets/animations/raining.json')}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  lottie: {
    width: '100%',
    height: 150,
    position: 'absolute',
    transform: [{scaleX: -1}],
  },
  gradient: {
    width: '100%',
    height: screenHeight * 0.4,
    position: 'absolute',
  },
  cloud: {
    width: screenWidth,
    resizeMode: 'stretch',
    height: 100,
  },
});

export default Visuals;
