import {View, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import {formatISOToCustom} from '@utils/DateUtils';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
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
  status: 'confirmed' | 'completed' | 'cancelled' | 'processing';
}

const ProfileOrderItem = ({item, index}: {item: Order; index: number}) => {
  // Calculate total items count
  const totalItems = item.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={[styles.container, {borderTopWidth: index === 0 ? 0.7 : 0}]}>
      <View style={styles.header}>
        <CustomText variant="h7" fontFamily={Fonts.Medium}>
          Order #{item._id.slice(-6).toUpperCase()}
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
        {item.items.map((i, idx) => (
          <View key={`${item._id}-${idx}`} style={styles.itemRow}>
            <CustomText variant="h8" numberOfLines={2} style={styles.itemName}>
              {i.quantity}x {i.productId?.name || 'Unknown Product'}
            </CustomText>
            <CustomText variant="h8">
              ₹{((i.price || i.productId.price) * i.quantity).toFixed(2)}
            </CustomText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <CustomText variant="h9">
          {totalItems} item{totalItems !== 1 ? 's' : ''} •{' '}
          {formatISOToCustom(item.createdAt)}
        </CustomText>
        <View style={styles.totalContainer}>
          <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
            ₹{item.totalAmount.toFixed(2)}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
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
  statusText: {
    color: '#FFF',
  },
  itemsContainer: {
    maxHeight: 150, // Limit height with scroll
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    marginRight: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
});

export default ProfileOrderItem;
