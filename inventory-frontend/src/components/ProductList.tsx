import React, { useEffect } from "react";
import useProducts from "../hooks/useProducts.ts";
import SearchForm from "./SearchForm.tsx";
import { Product } from "../types/types";
import "./ProductList.css";

const ProductList = () => {
  const {
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
  } = useProducts();


  const allCategories = Array.from(
    new Set(
      products?.length > 0 ? products.map(p => (p.category?.toString().trim() || "Uncategorized")) : []
    )
  );
  
  
  


  useEffect(() => {
    console.log("Fetched products:", products); // Log to ensure products are fetched
  }, [products]);

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category?.trim() || "Uncategorized";
  
    if (!acc[category]) {
      acc[category] = [];
    }
  
    acc[category].push({ ...product, category }); // Ensure category stays consistent
    return acc;
  }, {} as { [key: string]: Product[] });
  

  // If no products, show an empty state message
  if (loading) return <p className="loading-spinner">Loading...</p>;
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>
          No products found. Please add some products to your inventory.
       </p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <h1 className="product-list-title">Product List</h1>
      <p className="product-list-description">Manage your product inventory below.</p>


      {error && <p className="error-message">Error: {error}</p>}

      <SearchForm onSearch={enhancedSearch} categories={allCategories} />

      <div className="product-list">
        {/* Loop through each category */}
        {Object.keys(groupedProducts).map((category) => (
  <div key={category} className="category-section">
    <h2 className="category-title">{category}</h2>

    <table className="product-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {groupedProducts[category].map((product: Product) => {
          const isUpdating = updatingId === product.id;

          return (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(product.id)}
                    disabled={isUpdating || product.quantity === 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={product.quantity}
                    onChange={(e) =>
                      handleInputChange(product.id, e.target.value)
                    }
                    disabled={isUpdating}
                    className="quantity-input"
                    placeholder="Enter quantity"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(product.id)}
                    disabled={isUpdating}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
))}

      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={fetchProducts} className="quantity-btn">
          {loading ? "Refreshing..." : "Refresh Products"}
        </button>
      </div>
    </div>
  );
};

export default ProductList;
