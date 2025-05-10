// hooks/useProductForm.ts
import { useState } from "react";
import { createProduct, updateProduct, getProductById } from "../api/productApi.ts";
import { Product } from "../types/types";

const initialFormState: Product = {
  id: "",
  name: "",
  description: "",
  quantity: 0,
  category: "",
};

export const useProductForm = (productId?: string) => {
  const [product, setProduct] = useState<Product>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (productId) {
        await updateProduct(productId, product);
      } else {
        await createProduct(product);
      }
      setProduct(initialFormState); // Reset form after submit
    } catch (err: any) {
      setError(err.message || "Failed to submit product");
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await getProductById(productId);
      if (res.success && res.data) {
        setProduct(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  return {
    product,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    loadProduct,
  };
};
