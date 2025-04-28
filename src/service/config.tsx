import {Platform} from 'react-native';

export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.0.135:3000/api'
    : 'http://192.168.0.135:3000/api';
export const SOCKET_URL =
  Platform.OS === 'android'
    ? 'http://192.168.0.135:3000'
    : 'http://192.168.0.135:3000';

export const GOOGLE_MAP_API = 'AIzaSyBjrXmMEEqvBzC67eSNenjUXPe@e.Jn-Qak';
export const BRANCH_ID = '67ea68fc40d4e9bfd7413dec';

//export const GOOGLE_MAP_API = 'AIzaSyDFnxfmhhIQbHzecar-BJuW2-aPoX29N0w';

// USE YOUR NETWORK IP OR HOSTED URL

// export const BASE_URL = 'http://172.20.10.4:3000/api';
// export const SOCKET_URL = 'http://172.20.10.4:3000';
