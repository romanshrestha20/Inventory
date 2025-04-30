// src/types.ts

// Defining the structure of a Product
export interface Product {
    id: string;             // Unique product ID
    name: string;           // Product name
    description: string;    // Product description
    quantity: number;       // Available stock quantity
    category: string;       // Product category
}

// Defining the structure of the API response
export interface ApiResponse<T> {
    data: T;                // The actual data (e.g., product list or a single product)
    message: string;        // Message returned by the API (success/error message)
    status: string;         // HTTP status (e.g., "success", "error")
}
