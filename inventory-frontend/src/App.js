import React from "react";
import "./App.css";
import ProductList from "./components/ProductList.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Inventory Management System</h1>
        <p>Manage your products efficiently</p>
      </header>

      <main>
        <section className="product-section">
          <h2>Product Inventory</h2>
          <p>List of products available in the inventory</p>
          <ProductList />
        </section>
      </main>

      <footer className="App-footer">
        <p>&copy; 2023 Inventory Management System</p>
        <p>All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
