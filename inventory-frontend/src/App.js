import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ProductList from "./components/ProductList.tsx";
import ProductForm from "./components/ProductForm.tsx";
import Home from "./components/Home.tsx"; // You might want to create this

function App() {
  return (

      <div className="App">
        <header className="App-header">
          <h1>Inventory Management System</h1>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
              <li>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
              </li>
              <li>
                <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>View Products</Link>
              </li>
              <li>
                <Link to="/add-product" style={{ color: 'white', textDecoration: 'none' }}>Add Product</Link>
              </li>
            </ul>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<ProductForm />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        <footer className="App-footer">
          <p>&copy; 2023 Inventory Management System</p>
          <p>All rights reserved</p>
        </footer>
      </div>

  );
}

export default App;