import {appAxios} from './apiInterceptors';
import {BRANCH_ID} from './config';

export const createOrder = async (items: any, totalPrice: number) => {
  try {
    console.log('createOrder.items :', items);
    console.log('createOrder.totalPrice :', totalPrice);

    const response = await appAxios.post('/order', {
      items: items,
      branch: BRANCH_ID,
      totalPrice: totalPrice,
    });

    console.log('Order Response:', response);
    console.log('check', items, totalPrice, BRANCH_ID);

    return response.data;
  } catch (error) {
    console.error('Create Order Error : ', error);
    return null;
  }
};
export const getOrderById = async (id: string) => {
  try {
    const response = await appAxios.get(`/order/${id}`);
    return response.data;
  } catch (error) {
    console.log('Fetch Order Error', error);
    return null;
  }
};
