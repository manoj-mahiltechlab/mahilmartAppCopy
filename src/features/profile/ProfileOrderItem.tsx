import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import {formatISOToCustom} from '@utils/DateUtils';
import {useAuthStore} from '@state/authStore';
import axios from 'axios';
import {BASE_URL} from '@service/config';
import {tokenStorage} from '@state/storage'; // ✅ ensure direct token fetch

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  sellingPrice?: number;
}

interface OrderItem {
  _id: string;
  productId: Product;
  quantity: number;
  price?: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  status: string; // ✅ loosened to string (backend might send "Delivered")
}

const ProfileOrderItem = ({item, index}: {item: Order; index: number}) => {
  const {token: storeToken} = useAuthStore();
  const token = storeToken || tokenStorage.getString('accessToken');
  const [orders, setOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const orderTotal = item.items.reduce((sum, i) => {
    const price = Number(
      i?.productId?.discountPrice ??
        i?.discountPrice ??
        i?.price ??
        i?.productId?.price ??
        0,
    );
    return sum + price * (i?.quantity ?? 1);
  }, 0);

  const updateOrder = (orderId: string, updatedItems: OrderItem[]) => {
    setOrders(prev =>
      prev.map(o => (o._id === orderId ? {...o, items: updatedItems} : o)),
    );
  };

  // Calculate total items count
  const totalItems = item.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    console.log('🔑 Token being sent:', token);

    if (!token) {
      Alert.alert('Error', 'No valid token found. Please log in again.');
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/reviews`,
        {
          productId: selectedProduct._id,
          rating: Number(rating),
          comment,
          orderId: item._id,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Review submitted successfully');

      // 🔥 update the reviewed product locally
      const updatedItems = item.items.map(orderItem =>
        orderItem.productId._id === selectedProduct._id
          ? {
              ...orderItem,
              reviewed: true, //  update boolean instead of adding review object
            }
          : orderItem,
      );

      item.items = updatedItems;
      // overwrite items so UI re-renders

      setShowModal(false);
      setComment('');
      setRating('5');
    } catch (err: any) {
      console.error(
        '❌ Error submitting review:',
        err.response?.data || err.message,
      );
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to submit review',
      );
    }
  };

  return (
    <View style={[styles.container, {borderTopWidth: index === 0 ? 0.7 : 0}]}>
      <View style={styles.header}>
        <CustomText variant="h7" fontFamily={Fonts.Medium}>
          Order #{item.orderId || item._id}
        </CustomText>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <CustomText variant="h9" style={styles.statusText}>
            {item.status.toUpperCase()}
          </CustomText>
        </View>
      </View>

      <ScrollView
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}>
        {item.items.map((i, idx) => {
          const quantity = Number(i?.quantity ?? 0);

          const linePrice = Number(
            i?.productId?.discountPrice ??
              i?.discountPrice ??
              i?.price ??
              i?.productId?.price ??
              0,
          );
          return (
            <View key={`${item._id}-${idx}`} style={styles.itemRow}>
              <CustomText
                variant="h8"
                numberOfLines={2}
                style={styles.itemName}>
                {quantity}x {i.productId?.name || 'Unknown Product'}
              </CustomText>

              <View style={styles.priceContainer}>
                {/* MRP - show first, only if higher */}
                {i?.productId?.price && i?.productId?.price > linePrice && (
                  <CustomText style={styles.mrp}>
                    ₹{(i.productId.price * quantity).toFixed(2)}
                  </CustomText>
                )}

                {/* Selling / final price */}
                <CustomText style={styles.sellingPrice}>
                  ₹{(linePrice * quantity).toFixed(2)}
                </CustomText>
              </View>

              {/* Review buttons */}
              {(item.status.toLowerCase() === 'completed' ||
                item.status.toLowerCase() === 'delivered') &&
                !i.reviewed && (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => {
                      setSelectedProduct(i.productId);
                      setShowModal(true);
                    }}>
                    <CustomText style={styles.reviewBtnText}>
                      ⭐ Rate & Review
                    </CustomText>
                  </TouchableOpacity>
                )}

              {(item.status.toLowerCase() === 'completed' ||
                item.status.toLowerCase() === 'delivered') &&
                i.reviewed && (
                  <CustomText style={{color: '#4CAF50', marginLeft: 20}}>
                    ⭐ Reviewed
                  </CustomText>
                )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <CustomText variant="h9">
          {totalItems} item{totalItems !== 1 ? 's' : ''} •{' '}
          {formatISOToCustom(item.createdAt)}
        </CustomText>
        <View style={styles.totalContainer}>
          <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
            ₹{orderTotal.toFixed(2)}
          </CustomText>
        </View>
      </View>

      {/* Review Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText variant="h7" style={{marginBottom: 10}}>
              Review {selectedProduct?.name}
            </CustomText>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Rating (1-5)"
              value={rating}
              onChangeText={setRating}
            />
            <TextInput
              style={[styles.input, {height: 80}]}
              placeholder="Write your comment..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <Button title="Submit Review" onPress={handleSubmitReview} />
            <Button title="Cancel" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    case 'processing':
      return '#FFC107';
    default:
      return '#2196F3';
  }
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.7,
    borderColor: '#e0e0e0',
    padding: 15,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {color: '#FFF'},
  itemsContainer: {maxHeight: 550, marginBottom: 10},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemName: {flex: 1, marginRight: 10},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  totalContainer: {alignItems: 'flex-end'},

  // review UI
  reviewBtn: {
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#2874F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  reviewBtnText: {
    color: '#2874F0',
    fontSize: 13,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellingPrice: {
    color: '#2E7D32', // green
    fontWeight: 'bold',
  },
  mrp: {
    color: '#9e9e9e', // grey
    textDecorationLine: 'line-through',
    fontSize: 12,
  },
});

export default ProfileOrderItem;
