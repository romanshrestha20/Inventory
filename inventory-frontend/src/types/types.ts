export interface Product {
    id: string;
    name: string;
    description: string;
    quantity: number;
  }
  
  export interface APIResponse<T> {
    message: string;
    status: string;
    success: boolean;
    data: T; // This will be used for any generic data
  }
  
  export interface ProductListResponse extends APIResponse<Product[]> {
    data: Product[]; // products will be in the data field of APIResponse
  }
  