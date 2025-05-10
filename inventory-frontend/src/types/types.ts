export interface Product {
    id: string;
    name: string;
    description: string;
  quantity: number;
    category: string;
  }
  
  export interface APIResponse<T> {
    message: string;
    status: string;
    success: boolean;
    data: T; // This will be used for any generic data
  }
  
  export interface ProductListResponse {
    products: Product[];
  }