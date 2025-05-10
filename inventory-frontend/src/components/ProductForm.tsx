import React, { useEffect } from "react";
import { useProductForm } from "../hooks/useProductForm.ts";
import { useParams } from "react-router-dom";
import './ProductForm.css'; // Importing the CSS file

const ProductForm = () => {
  const { id } = useParams(); // for edit mode
  const {
    product,
    loading,
    error,
    handleInputChange,
    handleSubmit,
    loadProduct,
  } = useProductForm(id);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit}>
        <h1>{id ? "Edit Product" : "Create Product"}</h1>
        {error && <p className="error-message">{error}</p>}

        <label>
          Name:
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            min="0"
            value={product.quantity}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleInputChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
