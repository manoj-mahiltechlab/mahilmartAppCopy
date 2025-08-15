import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';
import {updateSelectedAddressType} from './customerService';

// ✅ Create Order
export const createOrder = async (
  items: any[],
  totalPrice: number,
  deliveryLocation: {
    address: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  },
  customerId: string,
  addressType: 'Primary' | 'Secondary',
) => {
  try {
    console.log('Final order items:', items);

    if (!BRANCH_ID || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid order data: Missing branch or items.');
    }
    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error('Invalid total price.');
    }

    // DEBUG: Log raw items before mapping
    if (__DEV__) {
      console.log(
        'Raw order items before processing:',
        JSON.stringify(items, null, 2),
      );
    }

    const updatedItems = items.map((item: any, index: number) => {
      const productId =
        item.productId || item.product?._id || item.product || item.id || null;

      if (!productId) {
        console.error(`❌ Missing productId for item at index ${index}`, item);
        throw new Error(`Missing productId for item at index ${index}`);
      }

      const quantity = item.count ?? item.quantity ?? 1;
      const price = item.price ?? item.product?.price ?? null;

      if (!quantity || quantity <= 0) {
        console.warn(
          `⚠️ Invalid quantity for item at index ${index}, setting to 1`,
          item,
        );
      }

      // ✅ Warn if price missing
      if (price === null) {
        console.warn(`⚠ Missing price for product ${productId}`);
      }

      return {
        productId,
        quantity: quantity > 0 ? quantity : 1,
        price, // ✅ include in payload
      };
    });

    // DEBUG: Log processed items before sending
    if (__DEV__) {
      console.log(
        'Processed order items:',
        JSON.stringify(updatedItems, null, 2),
      );
    }

    const payload = {
      items: updatedItems,
      branch: BRANCH_ID,
      totalPrice,
      deliveryAddress: deliveryLocation.address,
      deliveryLocation: {
        lat: deliveryLocation.latitude ?? deliveryLocation.lat ?? 0,
        lng: deliveryLocation.longitude ?? deliveryLocation.lng ?? 0,
        address: deliveryLocation.address,
      },
    };

    if (__DEV__) {
      console.log(
        '🟢 Sending Order Payload:',
        JSON.stringify(payload, null, 2),
      );
    }

    const response = await appAxios.post('/order', payload);

    if (response?.data?.order) {
      if (customerId && addressType) {
        await updateSelectedAddressType(customerId, addressType);
      }
      return response.data.order;
    } else {
      throw new Error('Unexpected response format.');
    }
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
  console.log(`Updating order ${orderId} to status ${status}`);

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

export const fetchOrders = async (status, branchId, deliveryPartnerId) => {
  try {
    let uri = `/order?branch=${branchId}`;
    if (status) uri += `&status=${status}`;

    // Available orders = Pending & unassigned
    if (status === 'Pending' && !deliveryPartnerId) {
      uri += `&deliveryPartner=null`;
    } else if (deliveryPartnerId) {
      uri += `&deliveryPartner=${deliveryPartnerId}`;
    }

    const response = await appAxios.get(uri);
    console.log('Fetched Orders:', response.data);
    return response.data;
  } catch (error) {
    console.log(
      'Fetch Delivery Order Error:',
      error.response?.data || error.message,
    );
    return [];
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
