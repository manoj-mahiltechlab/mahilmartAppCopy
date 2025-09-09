import {Alert, Platform} from 'react-native';
import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';
import {updateSelectedAddressType} from './customerService';

const mapStatus = (status: string): string => {
  if (!status) return 'pending';

  switch (status) {
    case 'Pending':
      return 'pending';

    case 'Processing':
      return 'processing';

    case 'Confirmed':
      return 'confirmed';

    case 'Packed':
      return 'packed';

    case 'Picked_Up':
      return 'picked_up';

    case 'OutForDelivery':
      return 'out_for_delivery';

    case 'Delivered':
      return 'delivered';

    case 'Cancelled':
      return 'cancelled';

    default:
      return status.toLowerCase(); // fallback
  }
};

// // ✅ Consistent frontend ↔ backend mapping
// export const statusMap: Record<string, string> = {
//   Pending: 'pending',
//   Processing: 'processing',
//   Confirmed: 'confirmed',
//   Packed: 'available', // frontend sees packed as available
//   Picked_Up: 'picked_up',
//   OutForDelivery: 'out_for_delivery',
//   Delivered: 'delivered',
//   Cancelled: 'cancelled',
// };

// inside orderService.ts normalizeOrder()
export const statusMap: Record<string, string> = {
  Pending: 'pending',
  Processing: 'processing',
  Confirmed: 'confirmed',
  Packed: 'available', // frontend sees packed as available
  Picked_Up: 'picked_up',
  OutForDelivery: 'out_for_delivery',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

// Reverse mapping (frontend → backend)
export const reverseStatusMap: Record<string, string> = Object.fromEntries(
  Object.entries(statusMap).map(([backend, frontend]) => [frontend, backend]),
);

// normalize backend → frontend
export const normalizeOrder = (order: any) => {
  if (!order) return null;

  const backendStatus = order.status;
  return {
    _id: order._id,
    orderId: order.orderId || 'N/A',
    items: Array.isArray(order.items) ? order.items : [],
    totalAmount: order.totalAmount ?? 0,
    deliveryCharges: order.deliveryCharges ?? 0,
    status:
      statusMap[backendStatus] || backendStatus?.toLowerCase() || 'pending',
    deliveryPartner: order.deliveryPartner || null,
    deliveryLocation: order.deliveryLocation || {
      address: 'No address',
      lat: 0,
      lng: 0,
    },
    customer: order.customer || {name: 'Unknown Customer', phone: 'N/A'},
    createdAt: order.createdAt || new Date().toISOString(),
  };
};

// ✅ Create Order
export const createOrder = async (
  items: any[],
  totalPrice: number,
  deliveryLocation: {address: string; lat?: number; lng?: number},
  customerId: string,
  addressType: 'Primary' | 'Secondary',
) => {
  try {
    // ✅ Validate essentials
    if (!BRANCH_ID) {
      throw new Error('Branch ID is missing.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }
    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error('Invalid total price.');
    }
    if (!deliveryLocation?.address) {
      throw new Error('Delivery address is required.');
    }

    // ✅ Convert cart items to backend format
    const updatedItems = items.map((item: any) => {
      const productId =
        item.productId || item.product?._id || item.product || item.id;

      if (!productId) {
        throw new Error(
          `Missing productId for cart item: ${JSON.stringify(item)}`,
        );
      }

      return {
        productId,
        quantity: item.count ?? item.quantity ?? 1,
      };
    });

    // ✅ Payload matching backend expectation
    const payload = {
      items: updatedItems,
      branch: BRANCH_ID,
      totalPrice,
      deliveryAddress: deliveryLocation.address,
      deliveryLocation: {
        lat: deliveryLocation.lat ?? 0,
        lng: deliveryLocation.lng ?? 0,
        address: deliveryLocation.address,
      },
      paymentStatus: 'Pending',
      platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
    };

    if (__DEV__) {
      console.log(
        '🟢 Sending Order Payload:',
        JSON.stringify(payload, null, 2),
      );
    }

    const response = await appAxios.post('/order', payload);

    console.log('Order creation response:', response.data);

    if (response?.data) {
      if (customerId && addressType) {
        await updateSelectedAddressType(customerId, addressType);
      }
      return response.data;
    }

    throw new Error('Unexpected response format from backend.');
  } catch (error: any) {
    const responseData = error?.response?.data;

    console.error('Create Order Error:', {
      message: responseData?.message || error.message,
      errorDetails: responseData?.error || null,
      status: error?.response?.status || 'Unknown',
      fullResponse: responseData || null,
    });

    return {
      success: false,
      message:
        responseData?.message || 'An error occurred while creating the order.',
      errorDetails: responseData?.error || error.message,
    };
  }
};

// ✅ Update Order Status (e.g. after payment success)
export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const backendStatus = reverseStatusMap[newStatus] || newStatus;
    const response = await appAxios.patch(`/order/${orderId}/status`, {
      status: backendStatus,
    });
    return normalizeOrder(response.data);
  } catch (error: any) {
    console.error(
      'Update Order Error:',
      error?.response?.data || error.message,
    );
    throw error;
  }
};

// ✅ Get Order By ID
export const getOrderById = async (orderId: string) => {
  try {
    const response = await appAxios.get(`/order/${orderId}`);
    return normalizeOrder(response.data);
  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error.message || 'Order not found';
    Alert.alert('Order Error', msg);
    return {status: 'error', message: msg}; // better fallback
  }
};

// ✅ Fetch Customer Orders
export const fetchCustomerOrders = async (userId: string) => {
  try {
    const response = await appAxios.get(`/order?customerId=${userId}`);

    console.log('API response:', response.data); // ✅ Add this
    return Array.isArray(response.data)
      ? response.data
      : response.data.orders || [];
  } catch (error) {
    console.log('Fetch Customer Order Error', error);
    return [];
  }
};

// ✅ Fetch Orders for Delivery Partner or Branch
export const fetchOrders = async (
  status: string,
  userId: string,
  branchId: string,
) => {
  let uri = `/order?branchId=${branchId}`;
  if (status) uri += `&status=${reverseStatusMap[status] || status}`;

  if (
    status &&
    ['accepted', 'delivered'].includes(status.toLowerCase()) &&
    userId
  ) {
    uri += `&deliveryPartnerId=${userId}`;
  }

  const response = await appAxios.get(uri);
  return Array.isArray(response.data)
    ? response.data.map(normalizeOrder)
    : response.data.orders.map(normalizeOrder);
};

// ✅ Send Live Order Updates (Delivery Location + Status)
// orderService.tsx

export const sendLiveOrderUpdates = async (
  id: string,
  location: any,
  status: string,
) => {
  try {
    if (!id) return;

    // ✅ use reverseStatusMap to always send backend format
    const backendStatus = reverseStatusMap[status] || status;

    const payload = {
      deliveryPersonLocation: location,
      status: backendStatus,
    };

    console.log('📦 Sending live order update:', {id, payload});

    const response = await appAxios.patch(`/order/${id}/status`, payload);
    return response.data;
  } catch (error: any) {
    console.error(
      'sendLiveOrderUpdates Error',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ✅ Confirm/Packing Order (for branch/admin only)
export const packOrder = async (id: string) => {
  try {
    const response = await appAxios.post(`/order/${id}/confirm`);
    return response.data;
  } catch (error) {
    console.log('packOrder Error', error);
    return null;
  }
};

// ✅ Accept Order
export const acceptOrder = async (orderId: string, userId: string) => {
  try {
    const response = await appAxios.post(`/order/${orderId}/accept`, {
      deliveryPartnerId: userId,
    });
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error.message;
    const status = error?.response?.status || 'Unknown';

    console.error('Accept Order Error:', {message, status});

    // Throw a structured error to handle gracefully in the UI
    throw {message, status};
  }
};

// ✅ Fetch latest active order for a customer
export const getLatestOrder = async (userId: string) => {
  try {
    const response = await appAxios.get(`/order?customerId=${userId}`);

    let orders = Array.isArray(response.data)
      ? response.data
      : response.data.orders || [];

    if (!orders.length) return null;

    // ✅ Sort by createdAt (latest first)
    orders = orders.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // ✅ Pick the newest order that is not completed/cancelled/failed
    const activeOrder = orders.find(
      (o: any) =>
        !['delivered', 'cancelled', 'failed'].includes(
          o.status?.toLowerCase?.(),
        ),
    );

    return activeOrder ? normalizeOrder(activeOrder) : null;
  } catch (error) {
    console.error('Get Latest Order Error:', error);
    return null;
  }
};
