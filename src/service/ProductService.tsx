import axios from 'axios';
import {BASE_URL} from './config';
import {Alert} from 'react-native';

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    console.log('response getAllCategories : : ', response);
    return response.data;
  } catch (error) {
    console.log('Error Categories', error);
    return [];
  }
};
export const getProductsByCategory = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`);
    console.log('response getProductsByCategoryId : : ', response);
    return response.data;
  } catch (error) {
    console.log('Error fetching products:', error);
    return [];
  }
};

export const getAllSubcategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/subcategories`);
    console.log('response getAllSubcategories : :', response);
    const data = response.data;

    const mappedData = data.map((sub: any) => ({
      id: sub._id || sub.id,
      name: sub.name,
      category: sub.category,
      image: {
        uri: sub.image || '',
      },
    }));

    console.log('Mapped subcategories with category:', mappedData);

    return mappedData;
  } catch (error) {
    console.log('Error fetching all subcategories:', error);
    return [];
  }
};
export const getProductsBySubcategoryId = async (subcategoryId: string) => {
  try {
    const url = `${BASE_URL}/products/subcategory/${subcategoryId}`;
    const response = await axios.get(url);

    if (!Array.isArray(response.data)) {
      console.warn(
        '❌ Subcategory not found or invalid format:',
        response.data,
      );
      return {success: false, products: []};
    }
    console.log('products in subcategory related:: ', response.data);

    return {
      success: true,
      products: response.data.map((product: any) => ({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice || null,
        stocks: product.stocks,
        image: {
          uri: product.image || '',
        },
        description: product.description || '',
        subImages: product.subImages || [],
        units: product.units || [],
      })),
    };
  } catch (error) {
    return {success: false, products: []};
  }
};

export const getSubcategoriesByCategoryId = async (categoryId: string) => {
  try {
    const url = `${BASE_URL}/subcategories/category/${categoryId}`;
    console.log('📡 Fetching subcategories from:', url);

    const response = await axios.get(url);
    const data = response.data;

    if (!Array.isArray(data)) {
      console.warn('⚠️ Unexpected subcategory response:', data);
      return [];
    }

    return data.map((sub: any) => ({
      id: sub._id || sub.id,
      name: sub.name,
      category: sub.category,
      image: {
        uri: sub.image || '',
      },
    }));
  } catch (error: any) {
    Alert.alert(
      'Server Problem',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [{text: 'OK'}],
    );

    return [];
  }
};
