import {Platform} from 'react-native';
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

// 🔑 Normalize order object (safe version)
const normalizeOrder = (order: any) => {
  if (!order) {
    console.warn('normalizeOrder called with null/undefined order');
    return {
      status: 'unknown',
      customer: {},
    };
  }

  return {
    ...order,
    status: mapStatus(order?.status),
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
export const updateOrderStatus = async (
  orderId: string,
  status: string,
): Promise<any> => {
  try {
    const response = await appAxios.patch(`/order/${orderId}/status`, {
      status, // sending the status payload to backend
    });
    return response.data; // return updated order or success message
  } catch (error: any) {
    console.error('Update Order Status Error', {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status || 'Unknown',
    });
    throw error; // throw again so the caller can handle error
  }
};

// ✅ Get Order By ID
export const getOrderById = async (id: string) => {
  try {
    const response = await appAxios.get(`/order/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Get Order By ID Error:', {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status || 'Unknown',
    });
    throw error;
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
  if (userId) uri += `&deliveryPartnerId=${userId}`;

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
    const response = await appAxios.patch(`/order/${id}/status`, {
      deliveryPersonLocation: location,
      status,
    });
    return response.data;
  } catch (error) {
    console.log('sendLiveOrderUpdates Error', error);
    return null;
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
