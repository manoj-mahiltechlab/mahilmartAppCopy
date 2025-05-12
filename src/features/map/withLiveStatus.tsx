import {FC, useEffect, useCallback} from 'react';
import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
import {Colors, Fonts} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import {useNavigationState} from '@react-navigation/native';
import {getOrderById} from '@service/orderService';
import {SOCKET_URL} from '@service/config';
import {io, Socket} from 'socket.io-client';
import {hocStyles} from '@styles/GlobleStyles';
import CustomText from '@components/ui/CustomText';
import {navigate} from '@utils/NavigationUtils';

const withLiveStatus = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): FC<P> => {
  const WithLiveStatusComponent: FC<P> = props => {
    const {currentOrder, setCurrentOrder} = useAuthStore();
    const routeName = useNavigationState(
      state => state.routes[state.index]?.name,
    );

    const fetchOrderDetails = useCallback(async () => {
      if (!currentOrder?._id) return;
      try {
        const data = await getOrderById(currentOrder._id);
        setCurrentOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details', err);
      }
    }, [currentOrder?._id, setCurrentOrder]);

    useEffect(() => {
      if (!currentOrder?._id) return;

      const socketInstance: Socket = io(SOCKET_URL, {
        transports: ['websocket'],
        withCredentials: true,
      });

      socketInstance.emit('joinRoom', currentOrder._id);
      socketInstance.on('liveTrackingUpdates', fetchOrderDetails);

      return () => {
        socketInstance.disconnect();
      };
    }, [currentOrder?._id, fetchOrderDetails]);

    return (
      <View style={styles.container}>
        <WrappedComponent {...props} />
        {currentOrder &&
          currentOrder.status !== 'delivered' &&
          routeName === 'ProductDashboard' && (
            <View
              style={[
                hocStyles.cartContainer,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              <View style={styles.flexRow}>
                <View style={styles.img}>
                  <Image
                    source={require('@assets/icons/bucket.png')}
                    style={{width: 20, height: 20}}
                  />
                </View>

                <View style={{width: '68%'}}>
                  <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                    Order is {currentOrder?.status}
                  </CustomText>
                  <CustomText variant="h9" fontFamily={Fonts.Medium}>
                    {currentOrder?.items.length} +{` items in current order `}
                  </CustomText>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigate('LiveTracking')}
                style={styles.btn}>
                <CustomText
                  fontFamily={Fonts.Medium}
                  variant="h8"
                  style={{
                    color: Colors.secondary,
                  }}>
                  View
                </CustomText>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  };
  return WithLiveStatusComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    marginBottom: 15,
    paddingVertical: 10,
    padding: 10,
  },
  img: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 0.7,
    borderColor: Colors.secondary,
    borderRadius: 5,
  },
});

export default withLiveStatus;
