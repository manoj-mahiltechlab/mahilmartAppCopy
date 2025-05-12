import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';

export const createOrder = async (items: any[], totalPrice: number) => {
  try {
    if (!BRANCH_ID || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid order data: Missing branch or items.');
    }

    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error('Invalid total price.');
    }
    const updatedItems = items.map((item: any, index: number) => {
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
    };

    if (__DEV__) {
      console.log(
        '🟢 Sending Order Payload:',
        JSON.stringify(payload, null, 2),
      );
    }

    console.log('payload : ****', payload);

    const response = await appAxios.post('/order', payload);

    if (response?.data) {
      console.log('✅ Order Response:', response.data);
      return response.data;
    } else {
      throw new Error('Unexpected response format.');
    }
  } catch (error: any) {
    const responseData = error?.response?.data;

    console.error('❌ Create Order Error:', {
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

export const getOrderById = async (Id: string) => {
  try {
    const response = await appAxios.get(`/order/${Id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Order By ID Error:', {
      message: error?.response?.data?.message || error.message,
      status: error?.response?.status || 'Unknown',
    });

    throw error;
  }
};
export const fetchCustomerOrders = async (userId: string) => {
  try {
    const response = await appAxios.get(`/order?customerId=${userId}`);
    return response.data;
  } catch (error) {
    console.log('Fetch Customer Order Error ', error);
    return null;
  }
};

// export const fetchOrders = async (
//   status: string,
//   userId: string,
//   branchId: string,
// ) => {
//   let uri =
//     status === 'available'
//       ? `/order?status=${status}&branchId=${branchId}`
//       : `/order?branchId=${branchId}&deliveryPartnerId=${userId}&status=delivered`;
//   try {
//     const response = await appAxios.get(uri);
//     return response.data;
//   } catch (error) {
//     console.log('Fetch Delivery Order Error', error);
//     return null;
//   }
// };

export const fetchOrders = async (
  status: string,
  userId: string,
  branchId: string,
) => {
  let uri = `/order?branchId=${branchId}`;

  if (status) {
    uri += `&status=${status}`;
  }

  if (userId) {
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
