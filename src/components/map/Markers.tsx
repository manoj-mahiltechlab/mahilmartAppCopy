// import React from 'react';
// import {Marker} from 'react-native-maps';

// const Markers = ({
//   deliveryLocation,
//   pickupLocation,
//   deliveryPersonLocation,
// }: any) => {
//   return (
//     <>
//       {deliveryLocation && (
//         <Marker
//           image={require('@assets/icons/my_pin.png')}
//           coordinate={deliveryLocation}
//           style={{height: 20, width: 20}}
//         />
//       )}
//       {pickupLocation && (
//         <Marker
//           image={require('@assets/icons/store.png')}
//           coordinate={pickupLocation}
//           style={{height: 20, width: 20}}
//         />
//       )}

//       {deliveryPersonLocation && (
//         <Marker
//           image={require('@assets/icons/delivery.png')}
//           coordinate={deliveryPersonLocation}
//           style={{
//             position: 'absolute',
//             zIndex: 99,
//             height: 20,
//             width: 20,
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default Markers;

import React from 'react';
import {Marker} from 'react-native-maps';

const isValidCoordinate = (loc: any) =>
  loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';

const Markers = ({
  deliveryLocation,
  pickupLocation,
  deliveryPersonLocation,
}: any) => {
  return (
    <>
      {isValidCoordinate(deliveryLocation) && (
        <Marker
          image={require('@assets/icons/my_pin.png')}
          coordinate={deliveryLocation}
          style={{height: 20, width: 20}}
        />
      )}
      {isValidCoordinate(pickupLocation) && (
        <Marker
          image={require('@assets/icons/store.png')}
          coordinate={pickupLocation}
          style={{height: 20, width: 20}}
        />
      )}

      {isValidCoordinate(deliveryPersonLocation) && (
        <Marker
          image={require('@assets/icons/delivery.png')}
          coordinate={deliveryPersonLocation}
          style={{
            position: 'absolute',
            zIndex: 99,
            height: 20,
            width: 20,
          }}
        />
      )}
    </>
  );
};

export default Markers;
