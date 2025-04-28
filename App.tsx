// import React from 'react';
// import Navigation from '@navigation/Navigation';

// const App = () => {
//   return <Navigation />;
// };
// export default App;

// import 'react-native-gesture-handler';
// import React from 'react';
// import {GestureHandlerRootView} from 'react-native-gesture-handler';
// import Navigation from '@navigation/Navigation';

// const App = () => {
//   return (
//     <GestureHandlerRootView style={{flex: 1}}>
//       <Navigation />
//     </GestureHandlerRootView>
//   );
// };

// export default App;

import 'react-native-gesture-handler';
import React, {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Navigation from '@navigation/Navigation'; // Your navigation component

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
        // Example: Reconnect sockets, refresh data, or perform any necessary tasks
      } else if (nextAppState === 'background') {
        console.log('🔕 App moved to background');
        // Example: Pause ongoing tasks, close sockets, etc.
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
