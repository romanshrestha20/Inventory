import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/types.ts';
import {
  getProducts,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  
 } from '../api/productApi.ts';

const useProducts = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      if (fetchedProducts.length === 0) {
        setError("No products found. Please try a different search.");
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);




  const updateQuantity = async (id: string, quantity: number) => {
    setUpdatingId(id);
    try {
      await updateProduct(id, { quantity });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity } : p))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update product quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleIncrement = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) updateQuantity(id, product.quantity + 1);
  };

  const handleDecrement = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product && product.quantity > 0) {
      updateQuantity(id, product.quantity - 1);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setError(null);
      updateQuantity(id, quantity);
    } else {
      setError("Invalid quantity");
    }
    
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await deleteAllProducts();
      setProducts([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete all products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts({ search });
      setProducts(fetchedProducts);
      if (fetchedProducts.length === 0) {
        setError("No products found. Please try a different search.");
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };
  const enhancedSearch = (term: string, category?: string, sortBy?: string) => {
    handleSearch(term); // call backend or filter locally
  
    // Optional: local filter + sort if not handled by backend
    setProducts((prev) => {
      let filtered = [...prev];
  
      if (category) {
        filtered = filtered.filter((p) => (p.category?.trim() || "Uncategorized") === category);
      }
  
      if (sortBy === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
      if (sortBy === "name-desc") filtered.sort((a, b) => b.name.localeCompare(a.name));
      if (sortBy === "quantity-asc") filtered.sort((a, b) => a.quantity - b.quantity);
      if (sortBy === "quantity-desc") filtered.sort((a, b) => b.quantity - a.quantity);
  
      return filtered;
    });
  };
  
  return { 
    products,
    loading,
    error,
    fetchProducts,
    handleIncrement,
    handleDecrement,
    handleInputChange,
    handleDelete,
    handleDeleteAll,
    handleSearch,
    enhancedSearch,
    updatingId,
    setUpdatingId,
    setProducts,
    setLoading,
    setError,
    updateQuantity,
    handleUpdate: updateQuantity,

  };
};



export default useProducts;
