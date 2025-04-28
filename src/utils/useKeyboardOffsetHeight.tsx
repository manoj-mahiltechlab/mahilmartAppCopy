// import {useEffect, useState} from 'react';
// import {Keyboard} from 'react-native';

// export default function useKeyboardOffsetHeight() {
//   const [keyboardOffsetHeight, setKeyboardOffsetHeight] = useState(0);

//   useEffect(() => {
//     const keyboardWillAndroidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       e => {
//         setKeyboardOffsetHeight(e.endCoordinates.height);
//       },
//     );

//     const keyboardWillAndroidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       e => {
//         setKeyboardOffsetHeight(0);
//       },
//     );

//     const keyboardWillShowListener = Keyboard.addListener(
//       'keyboardWillShow',
//       e => {
//         setKeyboardOffsetHeight(e.endCoordinates.height);
//       },
//     );

//     const keyboardWillHideListener = Keyboard.addListener(
//       'keyboardWillHide',
//       e => {
//         setKeyboardOffsetHeight(e.endCoordinates.height);
//       },
//     );

//     return () => {
//       keyboardWillAndroidHideListener.remove();
//       keyboardWillAndroidShowListener.remove();
//       keyboardWillHideListener.remove();
//       keyboardWillShowListener.remove();
//     };
//   }, []);

//   return keyboardOffsetHeight;
// }
import {useEffect, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

export default function useKeyboardOffsetHeight() {
  const [keyboardOffsetHeight, setKeyboardOffsetHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, e => {
      setTimeout(() => {
        setKeyboardOffsetHeight(e.endCoordinates.height);
      }, 50); // helps avoid layout race
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setTimeout(() => {
        setKeyboardOffsetHeight(0);
      }, 50);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  return keyboardOffsetHeight;
}
