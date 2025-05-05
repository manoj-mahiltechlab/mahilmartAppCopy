import {Platform} from 'react-native';

export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.0.135:3000/api'
    : 'http://192.168.0.135:3000/api';
export const SOCKET_URL =
  Platform.OS === 'android'
    ? 'http://192.168.0.135:3000'
    : 'http://192.168.0.135:3000';

// youtube API
//export const GOOGLE_MAP_API = 'AIzaSyBjrXmMEEqvBzC67eSNenjUXPe0eJn-Qak';

// MY API
// export const GOOGLE_MAP_API = 'AIzaSyDFnxfmhhIQbHzecar-BJuW2-aPoX29N0w';

// Generated my Manoj's ID 03/05/25
//export const GOOGLE_MAP_API = '3M2XwQbeA-LTaKwAmLwt_Ddw8sQ=';

export const GOOGLE_MAP_API = 'AIzaSyDWWgXk0R4O2um_lDSjw6xYfHwfHM2H1r0';

export const BRANCH_ID = '681854c3722ca802c3a1d592';

// USE YOUR NETWORK IP OR HOSTED URL

// export const BASE_URL = 'http://172.20.10.4:3000/api';
// export const SOCKET_URL = 'http://172.20.10.4:3000';
