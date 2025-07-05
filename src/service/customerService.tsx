import {appAxios} from './apiInterceptors';

export const updateSelectedAddressType = async (
  customerId: string,
  addressType: 'Primary' | 'Secondary',
  address: string,
) => {
  try {
    const response = await appAxios.put('/customer/selected-address', {
      customerId,
      selectedAddressType: addressType,
      selectedAddress: address,
    });
    console.log('Updated address and type :', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Failed to update selected address type :',
      error.response?.data || error.message,
    );
    throw error;
  }
};
