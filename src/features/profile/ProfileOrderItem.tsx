import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import {formatISOToCustom} from '@utils/DateUtils';
import {useAuthStore} from '@state/authStore';
import axios from 'axios';
import {BASE_URL} from '@service/config';
import {tokenStorage} from '@state/storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Product {
  _id: string;
  name: string;
  price: number;
  sellingPrice?: number;
  image?: string;
}

interface OrderItem {
  _id: string;
  productId: Product;
  quantity: number;
  price?: number;
  reviewed?: boolean;
  reviewAt?: string;
  reviewId?: string;
  rating?: number;
  comment?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  status: string;
  orderId?: string;
}

const ProfileOrderItem = ({
  item,
  index,
  onOrderUpdated,
}: {
  item: Order;
  index: number;
  onOrderUpdated?: () => void;
}) => {
  const {token: storeToken} = useAuthStore();
  const token = storeToken || tokenStorage.getString('accessToken');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const activeItems = item.items.filter(
    i => i.status?.toLowerCase() !== 'cancelled',
  );

  const totalAmount = activeItems.reduce((total, i) => {
    const product = i.productId;
    const price = i.price ?? product?.sellingPrice ?? product?.price ?? 0;
    const qty = i.quantity ?? 0;
    return total + price * qty;
  }, 0);

  const grandTotal = totalAmount + (item.deliveryCharges || 0);

  // true if review is older than 24h
  const canEditReview = (reviewAt, hours = 24) => {
    if (!reviewAt) return false;
    const reviewTime = new Date(reviewAt).getTime();
    const now = Date.now();
    const diffHours = (now - reviewTime) / (1000 * 60 * 60);
    return diffHours >= hours; // ✅ edit allowed only after 24h
  };

  const formatOrderDate = (isoDate?: string) => {
    if (!isoDate) return 'Date not available';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return 'Invalid date';
    return formatISOToCustom(d.toISOString());
  };
  const totalItems = item.items.reduce((sum, i) => sum + i.quantity, 0);

  const orderDate = item.createdAt
    ? formatISOToCustom(item.createdAt)
    : 'Date not available';

  const handleCancelItem = async (orderId: string, itemId: string) => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to cancel items.');
      return;
    }

    Alert.alert('Cancel Item', 'Are you sure you want to cancel this item?', [
      {text: 'No'},
      {
        text: 'Yes',
        onPress: async () => {
          try {
            setLoading(true);
            console.log('🔑 Token being sent:', token);

            await axios.patch(
              `${BASE_URL}/order/${orderId}/item/${itemId}/status`,
              {status: 'Cancelled'},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            // ✅ Optimistic local update (only the cancelled item)
            item.items = item.items.map(i =>
              i._id === itemId ? {...i, status: 'Cancelled'} : i,
            );

            // ✅ Notify parent to reload from backend
            if (onOrderUpdated) {
              onOrderUpdated();
            }

            Alert.alert('Item cancelled successfully');
          } catch (err: any) {
            console.error(
              '❌ Cancel item error:',
              err.response?.data || err.message,
            );
            Alert.alert(
              'Error',
              err.response?.data?.message || 'Failed to cancel item',
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !token) return;

    // validation
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      Alert.alert('Invalid Rating', 'Please enter a rating between 1 and 5.');
      return;
    }

    try {
      if (editingReviewId) {
        // Update existing review
        await axios.patch(
          `${BASE_URL}/reviews/${editingReviewId}`,
          {rating: Number(rating), comment},
          {headers: {Authorization: `Bearer ${token}`}},
        );

        const updatedItems = item.items.map(i =>
          i.reviewId === editingReviewId
            ? {
                ...i,
                rating: Number(rating),
                comment,
                reviewAt: new Date().toISOString(),
              }
            : i,
        );
        item.items = updatedItems;

        Alert.alert('Review updated successfully');
      } else {
        // Create new review
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

        const reviewId = res.data?._id;
        const reviewAt = res.data?.createdAt;

        const updatedItems = item.items.map(i =>
          i.productId._id === selectedProduct._id
            ? {
                ...i,
                reviewed: true,
                reviewId,
                rating: Number(rating),
                comment,
                reviewAt,
              }
            : i,
        );
        item.items = updatedItems;

        Alert.alert('Review submitted successfully');
      }

      // Reset state
      setShowModal(false);
      setComment('');
      setRating('5');
      setEditingReviewId(null);
    } catch (err: any) {
      console.error('❌ Review error:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to submit review',
      );
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText fontFamily={Fonts.Medium} style={{fontSize: 14}}>
          Order #{item.orderId || item._id}
        </CustomText>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <CustomText style={styles.statusText}>
            {item.status.toUpperCase()}
          </CustomText>
        </View>
      </View>

      {/* Items */}
      {item.items.map((orderItem, idx) => {
        const product = orderItem.productId;
        const linePrice =
          orderItem.price ?? product?.sellingPrice ?? product?.price ?? 0;

        return (
          <View key={orderItem._id || idx} style={styles.itemRow}>
            {/* Product Image */}
            <View style={styles.imageWrapper}>
              {product?.image ? (
                <Image
                  source={{uri: product.image}}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noImg}>
                  <CustomText style={{fontSize: 12, color: '#999'}}>
                    No Image
                  </CustomText>
                </View>
              )}
            </View>

            {/* Product Details */}
            <View style={styles.details}>
              <CustomText numberOfLines={2} style={styles.itemName}>
                {product?.name || 'Unknown Product'}
              </CustomText>
              <CustomText style={styles.qtyText}>
                Qty: {orderItem.quantity}
              </CustomText>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {product?.price && product.price > linePrice && (
                  <CustomText style={styles.mrp}>
                    ₹{product.price.toFixed(2)}
                  </CustomText>
                )}
                <CustomText style={styles.sellingPrice}>
                  ₹{(linePrice * orderItem.quantity).toFixed(2)}
                </CustomText>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Show review button or Reviewed badge */}
              {['completed', 'delivered'].includes(item.status.toLowerCase()) &&
                (orderItem.reviewed ? (
                  <View
                    style={[
                      styles.reviewedBadge,
                      {flexDirection: 'column', alignItems: 'flex-start'},
                    ]}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon
                        name="check-circle"
                        size={16}
                        color="#4CAF50"
                        style={{marginRight: 6}}
                      />
                      <CustomText style={styles.reviewedText}>
                        Reviewed
                      </CustomText>
                    </View>

                    {/* Edit after 24h */}
                    {canEditReview(orderItem.reviewAt, 24) ? (
                      <TouchableOpacity
                        style={[styles.editBtn, {marginTop: 6}]}
                        onPress={() => {
                          setSelectedProduct(product);
                          setShowModal(true);
                          setRating(String(orderItem.rating || 5));
                          setComment(orderItem.comment || '');
                          setEditingReviewId(orderItem.reviewId || null);
                        }}>
                        <CustomText style={styles.editBtnText}>Edit</CustomText>
                      </TouchableOpacity>
                    ) : (
                      <CustomText
                        style={{fontSize: 12, color: '#888', marginTop: 6}}>
                        You can edit after 24h
                      </CustomText>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => {
                      setSelectedProduct(product);
                      setShowModal(true);
                    }}>
                    <CustomText style={styles.reviewBtnText}>
                      ⭐ Rate & Review
                    </CustomText>
                  </TouchableOpacity>
                ))}

              {orderItem.status?.toLowerCase() === 'cancelled' ? (
                <CustomText
                  style={{fontSize: 12, color: '#D32F2F', marginTop: 6}}>
                  Cancelled
                </CustomText>
              ) : (
                item.status?.toLowerCase() === 'pending' &&
                (orderItem.status?.toLowerCase() || 'pending') ===
                  'pending' && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelItem(item._id, orderItem._id)}>
                    <CustomText style={styles.cancelBtnText}>
                      Cancel Item
                    </CustomText>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <CustomText style={styles.footerText}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} •{' '}
            {formatOrderDate(item.createdAt)}
          </CustomText>

          {item.deliveryCharges ? (
            <CustomText style={[styles.footerText, {color: '#FF5722'}]}>
              Delivery Charges: ₹{item.deliveryCharges.toFixed(2)}
            </CustomText>
          ) : null}
        </View>

        <CustomText fontFamily={Fonts.SemiBold} style={styles.totalAmount}>
          ₹{grandTotal.toFixed(2)}
        </CustomText>
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return '#388E3C';
    case 'cancelled':
      return '#D32F2F';
    case 'processing':
      return '#F9A825';
    case 'pending':
      return '#9E9E9E';
    default:
      return '#1976D2';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {color: '#fff', fontWeight: '700', fontSize: 12},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: '#e0e0e0',
  },
  imageWrapper: {marginRight: 12},
  image: {width: 70, height: 70, borderRadius: 8},
  noImg: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {flex: 1},
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 6,
  },
  qtyText: {fontSize: 13, color: '#616161', marginBottom: 6},
  mrp: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
    fontSize: 12,
    marginRight: 8,
  },
  sellingPrice: {fontSize: 15, fontWeight: '600', color: '#212121'},
  actions: {alignItems: 'flex-end'},
  reviewBtn: {
    backgroundColor: '#2874F0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  reviewBtnText: {color: '#fff', fontSize: 13, fontWeight: '600'},
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  cancelBtnText: {color: '#F44336', fontSize: 13, fontWeight: '600'},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 0.8,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  footerText: {color: '#757575', fontSize: 13},
  totalAmount: {fontSize: 15, fontWeight: '700', color: '#212121'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#212121',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DFF6DD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  reviewedText: {
    color: '#388E3C',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  editBtn: {
    marginLeft: 8,
    backgroundColor: '#FFF3E0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFB74D',
    shadowColor: '#FFB74D',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  editBtnText: {
    color: '#FB8C00',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProfileOrderItem;
