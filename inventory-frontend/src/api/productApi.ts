import axios, { AxiosError } from 'axios';
import { Product, APIResponse } from '../types/types';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Global error interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      console.error('API Error: No response received', error.request);
      return Promise.reject({
        message: 'No response received from server',
        status: 'error',
        success: false,
      });
    }

    console.error('API Error:', error.message);
    return Promise.reject({
      message: error.message,
      status: 'error',
      success: false,
    });
  }
);

// ========== API FUNCTIONS ==========

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data.products;
};

export const getProductById = async (id: string): Promise<APIResponse<Product>> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Product): Promise<APIResponse<Product>> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: string, product: Product): Promise<APIResponse<Product>> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<APIResponse<Product>> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
