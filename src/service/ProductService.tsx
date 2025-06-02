import axios from 'axios';
import {BASE_URL} from './config';

export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    console.log('Error Categories', error);
    return [];
  }
};
export const getProductsByCategoryId = async (id: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.log('Error Categories', error);
    return [];
  }
};
export const getAllSubcategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/subcategories`);
    const data = response.data;

    // Transform data to expected format
    return data.map((sub: any) => ({
      id: sub._id || sub.id,
      name: sub.name,
      image: {
        uri: sub.imageUrl || (sub.image && sub.image.uri) || '', // adjust based on your backend
      },
    }));
  } catch (error) {
    console.log('Error fetching subcategories:', error);
    return [];
  }
};

export const getSubcategoriesByCategoryId = async (categoryId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/categories/${categoryId}/subcategories`,
    );
    return response.data;
  } catch (error) {
    console.log('Error fetching subcategories by category:', error);
    return [];
  }
};
