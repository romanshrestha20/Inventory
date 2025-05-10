import React, { useState } from "react";
import "./SearchForm.css";

interface SearchFormProps {
  onSearch: (search: string, category?: string, sortBy?: string) => void;
  categories?: string[]; // Optional: list of categories to filter
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, categories = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim(), selectedCategory, sortBy);
  };

    return (
      
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <label htmlFor="category-select" className="visually-hidden">Category</label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="search-select"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <label htmlFor="sort-select" className="visually-hidden">Sort By</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="search-select"
      >
        className="search-select"
    
        <option value="">Sort By</option>
        <option value="name-asc">Name ↑</option>
        <option value="name-desc">Name ↓</option>
        <option value="quantity-asc">Quantity ↑</option>
        <option value="quantity-desc">Quantity ↓</option>
      </select>

      <button type="submit" className="search-button">Search</button>
    </form>
  );
};

export default SearchForm;
