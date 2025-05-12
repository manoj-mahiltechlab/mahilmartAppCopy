export const handleFitToPath = (
  mapRef: any,
  deliveryLocation: any,
  pickUpLocation: any,
  hasPickedUp: any,
  hasAccepted: any,
  deliveryPersonLocation: any,
) => {
  if (mapRef && deliveryLocation && pickUpLocation) {
    mapRef.fitToCoordinates(
      [
        hasAccepted ? deliveryPersonLocation : deliveryLocation,
        hasPickedUp ? deliveryPersonLocation : pickUpLocation,
      ],
      {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      },
    );
  }
};
