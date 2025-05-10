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


export const getProducts = async (params: { search?: string } = {}): Promise<Product[]> => {
  const response = await api.get('/products', { params });
  return response.data.products.map((product: any) => ({
    id: product._id, // Map backend _id to frontend id
    name: product.name,
    category: product.category,
    description: product.description,
    quantity: product.quantity,
  }));
};

export const getProductById = async (id: string): Promise<APIResponse<Product>> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Product): Promise<APIResponse<Product>> => {
  const response = await api.post('/products', product);
  return response.data;
};

// Update product quantity 
export const updateProduct = async (id: string, product: Partial<Product>): Promise<APIResponse<Product>> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};


export const deleteProduct = async (id: string): Promise<APIResponse<Product>> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const deleteProducts = async (ids: string[]): Promise<APIResponse<Product[]>> => {
  const response = await api.delete('/products', { data: { ids } });
  return response.data;
}

// delete all products
export const deleteAllProducts = async (): Promise<APIResponse<Product[]>> => {
  const response = await api.delete('/products/all');
  return response.data;
}
// search products
export const searchProducts = async (search: string): Promise<Product[]> => { 
  const response = await api.get('/products/search', { params: { search } });
  return response.data.products.map((product: any) => ({
    id: product._id, // Map backend _id to frontend id
    name: product.name,
    description: product.description,
    quantity: product.quantity,
  }));
}
// get product by name