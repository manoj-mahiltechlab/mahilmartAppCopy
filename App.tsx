import 'react-native-gesture-handler';
import React, {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Navigation from '@navigation/Navigation'; // This should handle all navigation, including tabs

const App = () => {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(
        'App state changed from',
        appState.current,
        'to',
        nextAppState,
      );
      appState.current = nextAppState;

      if (nextAppState === 'active') {
        console.log('✅ App resumed');
      } else if (nextAppState === 'background') {
        console.log('🔕 App moved to background');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Navigation />
    </GestureHandlerRootView>
  );
};

export default App;
