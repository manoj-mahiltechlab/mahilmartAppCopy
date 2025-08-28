// import {FC, useEffect, useCallback} from 'react';
// import {StyleSheet, TouchableOpacity, View, Image} from 'react-native';
// import {Colors, Fonts} from '@utils/Constants';
// import {useAuthStore} from '@state/authStore';
// import {useNavigationState} from '@react-navigation/native';
// import {getOrderById} from '@service/orderService';
// import {SOCKET_URL} from '@service/config';
// import {io, Socket} from 'socket.io-client';
// import {hocStyles} from '@styles/GlobleStyles';
// import CustomText from '@components/ui/CustomText';
// import {navigate} from '@utils/NavigationUtils';

// const withLiveStatus = <P extends object>(
//   WrappedComponent: React.ComponentType<P>,
// ): FC<P> => {
//   const WithLiveStatusComponent: FC<P> = props => {
//     const {currentOrder, setCurrentOrder} = useAuthStore();
//     const routeName = useNavigationState(
//       state => state.routes[state.index]?.name,
//     );

//     const fetchOrderDetails = useCallback(async () => {
//       if (!currentOrder?._id) return;
//       try {
//         const data = await getOrderById(currentOrder._id);
//         setCurrentOrder(data);
//       } catch (err) {
//         console.error('Failed to fetch order details', err);
//       }
//     }, [currentOrder?._id, setCurrentOrder]);

//     useEffect(() => {
//       if (!currentOrder?._id) return;

//       const socketInstance: Socket = io(SOCKET_URL, {
//         transports: ['websocket'],
//         withCredentials: true,
//       });

//       socketInstance.emit('joinRoom', currentOrder._id);
//       socketInstance.on('liveTrackingUpdates', fetchOrderDetails);

//       return () => {
//         socketInstance.disconnect();
//       };
//     }, [currentOrder?._id, fetchOrderDetails]);

//     return (
//       <View style={styles.container}>
//         <WrappedComponent {...props} />
//         {currentOrder &&
//           currentOrder.status !== 'delivered' &&
//           routeName === 'ProductDashboard' && (
//             <View
//               style={[
//                 hocStyles.cartContainer,
//                 {flexDirection: 'row', alignItems: 'center'},
//               ]}>
//               <View style={styles.flexRow}>
//                 <View style={styles.img}>
//                   <Image
//                     source={require('@assets/icons/bucket.png')}
//                     style={{width: 20, height: 20}}
//                   />
//                 </View>

//                 <View style={{width: '68%'}}>
//                   <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
//                     Order is {currentOrder?.status}
//                   </CustomText>
//                   <CustomText variant="h9" fontFamily={Fonts.Medium}>
//                     {(Array.isArray(currentOrder?.items)
//                       ? currentOrder.items.length
//                       : 0) + ` items in current order `}
//                   </CustomText>
//                 </View>
//               </View>
//               <TouchableOpacity
//                 onPress={() => navigate('LiveTracking')}
//                 style={styles.btn}>
//                 <CustomText
//                   fontFamily={Fonts.Medium}
//                   variant="h7"
//                   style={{
//                     color: Colors.secondary,
//                   }}>
//                   View
//                 </CustomText>
//               </TouchableOpacity>
//             </View>
//           )}
//       </View>
//     );
//   };
//   return WithLiveStatusComponent;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   flexRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     borderRadius: 15,
//     marginBottom: 10,
//     paddingVertical: 10,
//     padding: 10,
//   },
//   img: {
//     backgroundColor: Colors.backgroundSecondary,
//     borderRadius: 100,
//     padding: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   btn: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderWidth: 0.9,
//     borderColor: Colors.secondary,
//     borderRadius: 5,
//   },
// });

// export default withLiveStatus;

import {FC, useEffect, useCallback, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Image, Alert} from 'react-native';
import {Colors, Fonts} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import {useNavigationState} from '@react-navigation/native';
import {getOrderById, getLatestOrder} from '@service/orderService';
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
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    const fetchOrderDetails = useCallback(
      async (orderId: string) => {
        try {
          const data = await getOrderById(orderId);

          if (!data || typeof data !== 'object' || !('_id' in data)) {
            setCurrentOrder(null);
            return;
          }

          if (['delivered', 'cancelled', 'failed'].includes(data.status)) {
            setCurrentOrder(null);
            return;
          }

          setCurrentOrder(data);
        } catch (err) {
          console.error('Failed to fetch order details', err);
          setCurrentOrder(null);
        }
      },
      [setCurrentOrder],
    );

    // 🔹 Always check latest active order on mount
    useEffect(() => {
      const init = async () => {
        const userId = useAuthStore.getState().customer?._id;
        if (!userId) return;

        // ✅ If we already have an order, refresh it
        if (currentOrder?._id) {
          await fetchOrderDetails(currentOrder._id);
        } else {
          // ✅ Otherwise, fetch latest active order
          const latest = await getLatestOrder(userId);
          if (latest) {
            setCurrentOrder(latest);
          } else {
            setCurrentOrder(null);
          }
        }
      };
      init();
    }, [currentOrder?._id, fetchOrderDetails, setCurrentOrder]);

    const handleViewOrder = useCallback(() => {
      if (!currentOrder?._id) {
        Alert.alert('Error', 'No active order to track');
        return;
      }
      navigate('LiveTracking', {orderId: currentOrder._id});
    }, [currentOrder?._id]);

    // 🔹 Setup socket
    useEffect(() => {
      if (!currentOrder?._id) return;

      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        withCredentials: true,
      });

      socket.emit('joinRoom', currentOrder._id);
      socket.on('liveTrackingUpdates', () =>
        fetchOrderDetails(currentOrder._id),
      );

      setSocketInstance(socket);
      return () => socket.disconnect();
    }, [currentOrder?._id, fetchOrderDetails]);

    useEffect(() => {
      return () => {
        socketInstance?.disconnect();
      };
    }, [socketInstance]);

    // 🔹 Hide banner if no active order or not on dashboard
    if (
      !currentOrder ||
      ['delivered', 'cancelled', 'failed'].includes(currentOrder.status) ||
      routeName !== 'ProductDashboard'
    ) {
      return <WrappedComponent {...props} />;
    }

    const itemCount = Array.isArray(currentOrder?.items)
      ? currentOrder.items.length
      : 0;

    return (
      <View style={styles.container}>
        <WrappedComponent {...props} />
        <View style={[hocStyles.cartContainer, styles.orderStatusContainer]}>
          <View style={styles.flexRow}>
            <View style={styles.img}>
              <Image
                source={require('@assets/icons/bucket.png')}
                style={styles.icon}
              />
            </View>
            <View style={styles.statusTextContainer}>
              <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                Order is {currentOrder?.status ?? 'pending'}
              </CustomText>
              <CustomText variant="h9" fontFamily={Fonts.Medium}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in current
                order
              </CustomText>
            </View>
          </View>
          <TouchableOpacity onPress={handleViewOrder} style={styles.viewButton}>
            <CustomText
              fontFamily={Fonts.Medium}
              variant="h7"
              style={styles.viewButtonText}>
              View
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return WithLiveStatusComponent;
};

const styles = StyleSheet.create({
  container: {flex: 1},
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  img: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {width: 20, height: 20},
  statusTextContainer: {width: '68%'},
  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.9,
    borderColor: Colors.secondary,
    borderRadius: 5,
  },
  viewButtonText: {color: Colors.secondary},
});

export default withLiveStatus;
