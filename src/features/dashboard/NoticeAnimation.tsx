// import {View, StyleSheet, Animated} from 'react-native';
// import React, {FC} from 'react';
// import {NoticeHeight} from '@utils/Scaling';
// import Notice from '@components/dashboard/Notice';
// import {useAnimatedStyle, interpolate} from 'react-native-reanimated';

// const NOTICE_HEIGHT = -(NoticeHeight + 12);

// const NoticeAnimation: FC<{
//   noticePosition: any; // this is a sharedValue
//   children: React.ReactElement;
// }> = ({noticePosition, children}) => {
//   const noticeStyle = useAnimatedStyle(() => ({
//     transform: [{translateY: noticePosition.value}],
//   }));

//   const contentStyle = useAnimatedStyle(() => ({
//     paddingTop: interpolate(
//       noticePosition.value,
//       [NOTICE_HEIGHT, 0],
//       [0, NoticeHeight + 20],
//     ),
//   }));

//   return (
//     <View style={styles.container}>
//       <Animated.View
//         style={[
//           styles.noticeContainer,
//           {transform: [{translateY: noticePosition}]},
//         ]}>
//         <Notice />
//       </Animated.View>
//       <Animated.View
//         style={[
//           styles.contentContainer,
//           {
//             paddingTop: noticePosition.interpolate({
//               inputRange: [NOTICE_HEIGHT, 0],
//               outPutRange: [0, NoticeHeight + 20],
//             }),
//           },
//         ]}>
//         {children}
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   noticeContainer: {
//     width: '100%',
//     zIndex: 900,
//     position: 'absolute',
//   },
//   contentContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
// });

// export default NoticeAnimation;

import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import {NoticeHeight} from '@utils/Scaling';
import Notice from '@components/dashboard/Notice';
import Animated, {useAnimatedStyle, interpolate} from 'react-native-reanimated';

const NOTICE_HEIGHT = -(NoticeHeight + 12);

const NoticeAnimation: FC<{
  noticePosition: any; // SharedValue<number>
  children: React.ReactElement;
}> = ({noticePosition, children}) => {
  const noticeStyle = useAnimatedStyle(() => ({
    transform: [{translateY: noticePosition.value}],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      noticePosition.value,
      [NOTICE_HEIGHT, 0],
      [0, NoticeHeight + 20],
    ),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.noticeContainer, noticeStyle]}>
        <Notice />
      </Animated.View>
      <Animated.View style={[styles.contentContainer, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  noticeContainer: {
    width: '100%',
    zIndex: 900,
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default NoticeAnimation;
