import Product, { validateProductData } from "../models/Product.js";
import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import { Readable } from "stream";
import PDFDocument from "pdfkit";

// Utility: Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Send 500 error
const handleServerError = (res, error, message = "Internal server error") => {
  console.error(`${message}:`, error);
  res.status(500).json({ message });
};

// Utility: Find product by ID with validation
const findProductById = async (res, id) => {
  if (!id || !isValidObjectId(id)) {
    res.status(400).json({ message: "Valid Product ID is required" });
    return null;
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return null;
  }

  return product;
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, quantity, category, description } = req.body;

    // Await validation since it might be async
    const { valid, message } = await validateProductData({
      name,
      quantity,
      category,
    });

    if (!valid) {
      return res.status(400).json({ message });
    }

    // Duplicate check is already handled inside validateProductData, so this is optional
    const existingProduct = await Product.findOne({ name, category });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product already exists in this category" });
    }

    const newProduct = new Product({ name, quantity, category, description });
    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Get all products (with search, filter, pagination, sort)
// @route   GET /api/products
// @query   ?search=&category=&page=1&limit=10&sortBy=name&sortOrder=asc
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    if (search) {
      // Prefer full-text search if indexed, else fallback to regex
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const productsQuery = Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortDirection });

    if (search) {
      productsQuery
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    }

    const [products, total] = await Promise.all([
      productsQuery,
      Product.countDocuments(query),
    ]);

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "Products retrieved successfully",
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    handleServerError(res, error, "Error retrieving products");
  }
};

// @desc    Get a product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await findProductById(res, req.params.id);
    if (!product) return;

    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await findProductById(res, req.params.id);
    if (!product) return;

    const { name, quantity, category, description } = req.body;
    const { valid, message } = await validateProductData({
      name,
      quantity,
      category,
    });

    if (!valid) return res.status(400).json({ message });
    if (quantity != null && (typeof quantity !== "number" || quantity < 0)) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    }

    const duplicate = await Product.findOne({
      name,
      category,
      _id: { $ne: product._id },
    });

    if (duplicate) {
      return res
        .status(400)
        .json({
          message: "Another product with this name and category already exists",
        });
    }

    product.name = name;
    product.quantity = quantity != null ? quantity : product.quantity;
    product.category = category;
    if (description !== undefined) product.description = description;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Delete multiple products
// @route   DELETE /api/products
// @desc    Delete multiple products
// @route   DELETE /api/products
export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Product IDs must be a non-empty array" });
    }
    const foundIds = await Product.find({ _id: { $in: ids } }).distinct("_id");
    const notFound = ids.filter(id => !foundIds.includes(id));
    

    const invalidIds = ids.filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: "Some provided IDs are invalid", invalidIds });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No products were deleted. Check if the IDs exist." });
    }

    res.status(200).json({
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await findProductById(res, req.params.id);
    if (!product) return;

    await Product.findByIdAndDelete(product._id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    handleServerError(res, error);
  }
};

// @desc    Import products from CSV
// @route   POST /api/products/import
export const importProductsFromCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const { mimetype, size, buffer } = req.file;

  if (mimetype !== "text/csv") {
    return res
      .status(400)
      .json({ error: "Invalid file type. Only CSV files are allowed." });
  }

  if (size > 5 * 1024 * 1024) {
    return res
      .status(400)
      .json({ error: "File size exceeds the limit of 5MB." });
  }

  const products = [];
  const errors = [];

  try {
    const stream = Readable.from(buffer);

    const rows = [];

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    for (const [index, row] of rows.entries()) {
      const { name, quantity, category, description } = row;

      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        errors.push({
          row: index + 2,
          name,
          message: "Quantity must be a non-negative number",
        });
        continue;
      }
      const { valid, message } = await validateProductData({
        name,
        quantity: parsedQuantity,
        category,
      });

      if (!valid) {
        errors.push({ row: index + 2, name, message }); // +2 because of header row and 0-based index
      } else {
        products.push({
            name,
            quantity: parsedQuantity,
            category,
            description
          });          
      }
    }

    // Insert only valid rows
    if (products.length > 0) {
      await Product.insertMany(products);
    }

    res.status(207).json({
      message: `${products.length} products imported successfully.`,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    handleServerError(res, error, "Error importing products");
  }
};



// @desc    Export all products as pdf
// @route   GET /api/products/export/pdf

export const exportProductsToPDF = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products.length) {
      return res.status(404).json({ message: "No products to export" });
    }


    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    let filename = `products_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);


    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Product List", { align: "center" });
    doc.moveDown();

    products.forEach((product, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${product.name} - ${product.category} - ${product.quantity} units`
        );
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    handleServerError(res, error, "Error exporting products to PDF");
  }
}