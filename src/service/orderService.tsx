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
