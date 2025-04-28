import {FC, ReactNode} from 'react';
import {StyleSheet, ViewStyle, View, SafeAreaView} from 'react-native';

interface CustomSafeAreaViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

const CustomSafeAreaView: FC<CustomSafeAreaViewProps> = ({children, style}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
});

export default CustomSafeAreaView;

// import {FC, ReactNode} from 'react';
// import {
//   StyleSheet,
//   StyleProp,
//   ViewStyle,
//   SafeAreaView,
//   View,
//   Platform,
//   StatusBar,
// } from 'react-native';

// interface CustomSafeAreaViewProps {
//   children: ReactNode;
//   style?: StyleProp<ViewStyle>;
//   statusBarStyle?: 'default' | 'dark-content' | 'light-content';
//   statusBarBackgroundColor?: string;
// }

// const CustomSafeAreaView: FC<CustomSafeAreaViewProps> = ({
//   children,
//   style,
//   statusBarStyle = 'dark-content',
//   statusBarBackgroundColor = 'transparent',
// }) => {
//   return (
//     <View
//       style={[
//         styles.container,
//         style,
//         Platform.OS === 'android'
//           ? {paddingTop: StatusBar.currentHeight ?? 0}
//           : {},
//       ]}>
//       <StatusBar
//         barStyle={statusBarStyle}
//         backgroundColor={statusBarBackgroundColor}
//         translucent
//       />
//       <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   safeArea: {
//     flex: 1,
//   },
// });

// export default CustomSafeAreaView;
