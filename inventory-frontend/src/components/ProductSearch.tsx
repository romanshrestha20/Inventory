import React, { useState } from 'react';
import './ProductSearch.css';

type ProductSearchProps = {
  onSearch: (query: string) => void;
};

const ProductSearch = ({ onSearch }: ProductSearchProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="product-search-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="product-search-input"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="product-search-button">
        Search
      </button>
    </form>
  );
};

export default ProductSearch;
