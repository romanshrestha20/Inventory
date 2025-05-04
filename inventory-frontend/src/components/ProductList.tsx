import React from 'react';
import useProducts from '../hooks/useProduct.ts';  // Import the custom hook
import './ProductList.css';  // Optional: Add styling for improved UX/UI

const ProductList = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  const renderProductList = () => {
    if (loading) {
      return <div className="spinner">Loading...</div>;  // Optional: Add a spinner/loading animation
    }
    if (error) {
      return <div className="error-message">{error}</div>;  // User-friendly error message
    }
    if (products.length === 0) {
      return <div className="empty-state">No products found.</div>;  // Friendly empty state message
    }
    return (
      <ul className="product-list">
        {products.map(({ id, name, quantity }) => (
          <li key={id} className="product-item">
            <h3>{name}</h3>
            <p>Quantity: {quantity}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="product-list-container">
      <h1>Product List</h1>
      <button className="fetch-button" onClick={fetchProducts}>Fetch Products</button>

      {renderProductList()}
    </div>
  );
};

export default ProductList;


