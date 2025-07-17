import axios from 'axios';
import {BASE_URL} from './config';

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
      console.warn('Unexpected response format:', response.data);
      return [];
    }

    return response.data.map((product: any) => ({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice || null,
      quantity: product.quantity,
      image: {
        uri: product.image || '',
      },
      description: product.description || '',
      subImages: product.subImages || [],
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error fetching products by subcategory:',
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error(
        'Unexpected error fetching products by subcategory:',
        error,
      );
    }
    return [];
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
      return []; // Safe fallback
    }

    return data.map((sub: any) => ({
      id: sub._id || sub.id,
      name: sub.name,
      category: sub.category,
      image: {
        uri: sub.image || '',
      },
    }));
  } catch (error) {
    console.error('❌ Error fetching subcategories by category:', error);
    return [];
  }
};
