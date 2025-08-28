import {Alert, Platform} from 'react-native';
import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';
import {updateSelectedAddressType} from './customerService';

const mapStatus = (status: string): string => {
  if (!status) return 'pending';

  switch (status.toLowerCase()) {
    case 'pending':
    case 'available':
      return 'pending';

    case 'processing':
    case 'assigned':
    case 'confirmed':
      return 'confirmed';

    case 'out_for_delivery':
    case 'shipped':
      return 'out_for_delivery';

    case 'delivered':
      return 'delivered';

    case 'cancelled':
      return 'cancelled';

    default:
      return 'pending';
  }
};

// 🔑 Map backend status -> frontend-friendly status
const statusMap: Record<string, string> = {
  pending: 'pending',
  processing: 'confirmed', // 👈 backend 'processing' will show as 'confirmed'
  assigned: 'assigned',
  packed: 'packed',
  shipped: 'shipped',
  out_for_delivery: 'out for delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

// 🔄 Frontend → Backend mapping (if updating status from app)
const reverseStatusMap: Record<string, string> = {
  confirmed: 'Processing',
  pending: 'Pending',
  assigned: 'Assigned',
  packed: 'Packed',
  shipped: 'Shipped',
  'out for delivery': 'Out_for_delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Normalize order object for frontend
export const normalizeOrder = (order: any) => {
  const backendStatus = order?.status?.toLowerCase?.();
  const status = statusMap[backendStatus] || backendStatus || 'pending';

  return {
    ...order,
    status,
    customer: order?.customer || {}, // fallback to avoid crashes
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
    const response = await appAxios.put(`/orders/${orderId}/status`, {
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
    // console.error('Get Order Error:', error?.response?.data || error.message);
    Alert.alert('Order Error', errorMessage);
    return {status: 'error', message: 'Order not found'}; // better fallback
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
  if (status) uri += `&status=${status}`;

  // Only add deliveryPartnerId if status != "pending"
  if (status !== 'pending' && userId) {
    uri += `&deliveryPartnerId=${userId}`;
  }

  try {
    const response = await appAxios.get(uri);
    return response.data;
  } catch (error) {
    console.log('Fetch Delivery Order Error', error);
    return null;
  }
};

// ✅ Send Live Order Updates (Delivery Location + Status)
export const sendLiveOrderUpdates = async (
  id: string,
  location: any,
  status: string,
) => {
  try {
    const mappedStatus = statusMap[status] || status; // ← map it here

    const response = await appAxios.patch(`/order/${id}/status`, {
      deliveryPersonLocation: location,
      status: mappedStatus, // send backend-compatible status
    });

    console.log('Live update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'sendLiveOrderUpdates Error',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// ✅ Confirm Order (e.g. at handover)
export const confirmOrder = async (id: string, location: any) => {
  try {
    const response = await appAxios.post(`/order/${id}/confirm`, {
      deliveryPersonLocation: location,
    });
    return response.data;
  } catch (error) {
    console.log('confirmOrder Error', error);
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
    console.error('Accept Order Error:', {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status || 'Unknown',
    });
    throw error;
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
