import axios from 'axios';
import {GOOGLE_MAP_API} from './config';
import {updateUserLocation} from './authService';

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  setUser: any,
) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API}`,
    );

    console.log('response.data : ', response.data);
    if (response.data.status === 'OK') {
      const PrimaryAddress = response.data.results[1].formatted_address;

      // console.log('PrimaryAddress ********** : ', PrimaryAddress);

      updateUserLocation(
        {
          liveLocation: {latitude, longitude},
          PrimaryAddress,
        },
        setUser,
      );
    } else {
      console.error('Geo Code Failed', response.data);
    }
  } catch (error) {
    console.error('Geo Code Failed', error);
  }
};
