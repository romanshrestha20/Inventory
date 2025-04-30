
import axios from "axios";
import { ApiResponse, Product } from "../types";


// Set up an Axios instance with the backend API URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api', 
});
  

// Function to create a new product
export const createProduct = async (product: Product): Promise<ApiResponse<Product>> => {
    try {
        const response = await API.post<ApiResponse<Product>>('/products', product);
        return response.data;
    } catch (error) {
        throw new Error(`Error creating product: ${error}`);
    }
}




// Function to fetch all products
export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
    try {
        const response = await API.get<ApiResponse<Product[]>>('/products');
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching products: ${error}`);
    }
}


// Function to fetch a single product by ID
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {

    try {
        const response = await API.get<ApiResponse<Product>>(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching product with ID ${id}: ${error}`);
    }
}
    

// Function to update a product by ID
export const updateProduct = async (id: string, product: Product): Promise<ApiResponse<Product>> => {
    try {
        const response = await API.put<ApiResponse<Product>>(`/products/${id}`, product);
        return response.data;
    } catch (error) {
        throw new Error(`Error updating product with ID ${id}: ${error}`);
    }
}
// Function to delete a product by ID
export const deleteProduct = async (id: string): Promise<ApiResponse<Product>> => {
    try {
        const response = await API.delete<ApiResponse<Product>>(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error deleting product with ID ${id}: ${error}`);
    }
}

// function to delete multiple products by IDs
export const deleteMultipleProducts = async (ids: string[]): Promise<ApiResponse<Product[]>> => {
    try {
        const response = await API.delete<ApiResponse<Product[]>>('/products', { data: { ids } });
        return response.data;
    } catch (error) {
        throw new Error(`Error deleting products with IDs ${ids.join(', ')}: ${error}`);
    }
}
