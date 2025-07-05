import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';
import {updateSelectedAddressType} from './customerService';

// ✅ Create Order
export const createOrder = async (
  items: any[],
  totalPrice: number,
  deliveryLocation: {address: string; lat?: number; lng?: number},
  customerId: string,
  addressType: 'Primary' | 'Secondary',
) => {
  try {
    if (!BRANCH_ID || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid order data: Missing branch or items.');
    }

    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error('Invalid total price.');
    }

    const updatedItems = items.map((item: any) => {
      const productId = item.product?._id || item.product || item.id;
      return {
        product: productId,
        count: item.quantity,
        price: item.price,
      };
    });

    const payload = {
      items: updatedItems,
      branch: BRANCH_ID,
      totalPrice,
      deliveryLocation,
      deliveryAddress: deliveryLocation.address,
    };

    if (__DEV__) {
      console.log(
        '🟢 Sending Order Payload:',
        JSON.stringify(payload, null, 2),
      );
    }

    const response = await appAxios.post('/order', payload);

    if (response?.data) {
      if (customerId && addressType) {
        await updateSelectedAddressType(customerId, addressType);
      }
      return response.data;
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
