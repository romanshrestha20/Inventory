// productRoutes.js

import express from "express";
import {
    createProduct,
    getProducts,
    searchProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    deleteAllProducts,
    importProductsFromCSV,
    exportProductsToPDF
} from "../controllers/productController.js"; // Assuming this path is correct
import multer from "multer";

const router = express.Router();

// Multer setup for CSV import
const storage = multer.memoryStorage(); // Stores file in memory
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      // Pass the error to Express's error handler
      // The asyncHandler in your controller will catch this if multer is used there
      // Or, if used directly in router, Express error handler will take it.
      cb(new Error("Only .csv format allowed!"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Routes for the base path: /api/products
router.route('/')
    .post(createProduct)    // POST /api/products
    .get(getProducts)       // GET /api/products
    .delete(deleteMultipleProducts); // DELETE /api/products (for multiple)

// Search route - Place more specific routes before dynamic ones like /:id
// The path will be /api/products/search
router.get("/search", searchProducts);

// Import CSV - The path will be /api/products/import
router.post('/import', upload.single('file'), importProductsFromCSV);

// Export PDF - The path will be /api/products/export/pdf
router.get('/export/pdf', exportProductsToPDF);

// Delete all products - The path will be /api/products/all
router.delete('/all', deleteAllProducts);

// Routes for a specific product by ID: /api/products/:id
router.route('/:id')
    .get(getProductById)    // GET /api/products/:id
    .put(updateProduct)     // PUT /api/products/:id
    .delete(deleteProduct);  // DELETE /api/products/:id

export default router;