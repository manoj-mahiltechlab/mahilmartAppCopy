import React from 'react';
import MapView, {Polyline} from 'react-native-maps';
import {customMapStyle} from '@utils/CustomMap';
import Markers from './Markers';
import {getPoints} from '@utils/getPoints';
import {Colors} from '@utils/Constants';
import {GOOGLE_MAP_API} from '@service/config';
import MapViewDirections from 'react-native-maps-directions';

interface MapViewComponentProps {
  mapRef: any;
  setMapRef: (ref: any) => void;
  camera?: any;
  deliveryLocation?: any;
  pickUpLocation?: any;
  deliveryPersonLocation?: any;
  hasPickedUp?: boolean;
  hasAccepted?: boolean;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  mapRef,
  hasAccepted,
  setMapRef,
  camera,
  deliveryLocation,
  pickUpLocation,
  deliveryPersonLocation,
  hasPickedUp,
}) => {
  return (
    <MapView
      ref={setMapRef}
      style={{flex: 1}}
      provider="google"
      camera={camera}
      customMapStyle={customMapStyle}
      showsUserLocation={true}
      userLocationCalloutEnabled={true}
      userLocationPriority="high"
      showsTraffic={false}
      pitchEnabled={false}
      followsUserLocation={true}
      showsCompass={true}
      showsBuildings={false}
      showsIndoors={false}
      showsScale={false}
      showsIndoorLevelPicker={false}>
      {deliveryPersonLocation &&
        (hasPickedUp || hasAccepted) &&
        deliveryLocation &&
        pickUpLocation && (
          <MapViewDirections
            origin={deliveryPersonLocation}
            destination={hasAccepted ? pickUpLocation : deliveryLocation}
            precision="high"
            apikey={GOOGLE_MAP_API}
            strokeColor="#2871F2"
            strokeWidth={5}
            onError={err => console.log('[Directions Caught Error]:', err)}
          />
        )}

      <Markers
        deliveryPersonLocation={deliveryPersonLocation}
        deliveryLocation={deliveryLocation}
        pickUpLocation={pickUpLocation}
      />

      {!hasPickedUp && deliveryLocation && pickUpLocation && (
        <Polyline
          coordinates={getPoints([pickUpLocation, deliveryLocation])}
          strokeColor={Colors.text}
          strokeWidth={2}
          geodesic={true}
          lineDashPattern={[12, 10]}
        />
      )}
    </MapView>
  );
};

export default MapViewComponent;
