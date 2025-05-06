import express from "express";
import {
    createProduct,
    getProducts,
    searchProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    importProductsFromCSV,
    exportProductsToPDF

} from "../controllers/productController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// @route   POST /api/products
router.post("/", createProduct);

// @route   GET /api/products
router.get("/", getProducts);

router.get("/products/search", searchProducts);

// @route   GET /api/products/:id
router.get("/:id", getProductById);

// @route   PUT /api/products/:id
router.put("/:id", updateProduct);

// @route   DELETE /api/products/:id
router.delete("/:id", deleteProduct);

// @route   DELETE /api/products
router.delete("/", deleteMultipleProducts);

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const filetypes = /csv/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
    },
});

// @route   POST /api/products/import
router.post("/import", upload.single("file"), importProductsFromCSV);


// @route   GET /api/products/export/pdf
router.get("/export/pdf", exportProductsToPDF);



export default router;
