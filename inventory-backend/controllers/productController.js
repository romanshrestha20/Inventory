import Product, { validateProductData } from "../models/Product.js";
import mongoose from "mongoose";
import fs from "fs"; // Only if you were planning to use fs directly for non-file-upload tasks
import csv from "csv-parser";
import { Readable } from "stream";
import PDFDocument from "pdfkit";

import asyncHandler from "../utils/asyncHandler.js"; // Adjust path
import { NotFoundError, BadRequestError, UnprocessableEntityError } from "../utils/AppError.js"; // Adjust path

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  MULTI_STATUS: 207, // For CSV import with partial success
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
};

const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  SORT_BY: "createdAt",
  SORT_ORDER: "desc",
};

const CSV_IMPORT_CONFIG = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_MIMETYPE: "text/csv",
  BATCH_SIZE: 100, // For inserting products in batches
};

// Utility: Validate ObjectId (remains useful)
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Find product by ID - now throws errors instead of sending response
const findProductByIdOrThrow = async (id, errorMessage = "Product not found") => {
  if (!id || !isValidObjectId(id)) {
    throw new BadRequestError("Valid Product ID is required.");
  }
  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError(errorMessage);
  }
  return product;
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, quantity, category, description } = req.body;

  const { valid, message: validationMessage } = await validateProductData({
    name,
    quantity,
    category,
  });

  if (!valid) {
    throw new BadRequestError(validationMessage);
  }

  const existingProduct = await Product.findOne({ name, category });
  if (existingProduct) {
    throw new BadRequestError(
      `A product with name "${name}" already exists in the "${category}" category.`
    );
  }

  const newProduct = await Product.create({ name, quantity, category, description });

  res.status(HTTP_STATUS.CREATED).json({
    message: "Product created successfully",
    product: newProduct,
  });
});

// @route GET /api/products
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || PAGINATION_DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit, 10) || PAGINATION_DEFAULTS.LIMIT;
  const sortBy = req.query.sortBy || PAGINATION_DEFAULTS.SORT_BY;
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).lean(), // .lean() for performance if not modifying
    Product.countDocuments(),
  ]);

  res.status(HTTP_STATUS.OK).json({
    message: "Products retrieved successfully",
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    products,
  });
});

// @route GET /api/products/search
export const searchProducts = asyncHandler(async (req, res, next) => {
  const { query, category } = req.query;
  const filter = {};
  const projection = {};
  const sortOptions = {};

  if (query?.trim()) {
    filter.$text = { $search: query.trim() };
    projection.score = { $meta: "textScore" };
    sortOptions.score = { $meta: "textScore" };
  }

  if (category?.trim()) {
    filter.category = category.trim();
  }
  
  // If no specific sort is set by text search, default sort (e.g., by name or createdAt)
  if (Object.keys(sortOptions).length === 0) {
    sortOptions.createdAt = -1; // Example default sort
  }

  const products = await Product.find(filter)
    .select(projection)
    .sort(sortOptions)
    .lean();

  if (!products.length) {
    throw new NotFoundError("No products found matching your criteria.");
  }

  res.status(HTTP_STATUS.OK).json({
    message: "Products retrieved successfully",
    products,
  });
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await findProductByIdOrThrow(req.params.id);
  res.status(HTTP_STATUS.OK).json({
    message: "Product retrieved successfully",
    product,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const product = await findProductByIdOrThrow(productId); // Ensures product exists

  const { name, quantity, category, description } = req.body;
  const updateData = {};

  // Prepare data for validation and update
  const dataToValidate = {
    name: name !== undefined ? name : product.name,
    quantity: quantity !== undefined ? quantity : product.quantity,
    category: category !== undefined ? category : product.category,
  };

  // Only validate if name, quantity or category is being effectively changed or provided
  if (name !== undefined || quantity !== undefined || category !== undefined) {
    const { valid, message: validationMessage } = await validateProductData(dataToValidate);
    if (!valid) {
      throw new BadRequestError(validationMessage);
    }
  }
  
  // Explicit quantity type check if provided
  if (quantity !== undefined && (typeof quantity !== "number" || quantity < 0)) {
      throw new BadRequestError("Quantity must be a non-negative number.");
  }

  // Build update object
  if (name !== undefined) updateData.name = name;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (category !== undefined) updateData.category = category;
  if (description !== undefined) updateData.description = description;

  // Check for duplicates only if name or category is being changed to new values
  if (Object.keys(updateData).length > 0 && (updateData.name || updateData.category)) {
    const checkName = updateData.name !== undefined ? updateData.name : product.name;
    const checkCategory = updateData.category !== undefined ? updateData.category : product.category;
    
    const duplicate = await Product.findOne({
      name: checkName,
      category: checkCategory,
      _id: { $ne: productId },
    });

    if (duplicate) {
      throw new BadRequestError(
        `Another product with name "${checkName}" in category "${checkCategory}" already exists.`
      );
    }
  }
  
  // If there's nothing to update, just return the product
  if (Object.keys(updateData).length === 0) {
    return res.status(HTTP_STATUS.OK).json({
        message: "No changes provided. Product remains unchanged.",
        product,
    });
  }

  // Mongoose's findByIdAndUpdate is good for atomic updates and returns the updated doc
  // Using { new: true } returns the modified document rather than the original.
  // runValidators: true can be added if you have schema-level validators you want to run.
  // However, our custom validateProductData might be more complex.
  // So, we stick to the fetched product and save.
  Object.assign(product, updateData);
  const updatedProduct = await product.save();

  res.status(HTTP_STATUS.OK).json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await findProductByIdOrThrow(req.params.id);
  await product.deleteOne(); // Or Product.findByIdAndDelete(req.params.id);
  res.status(HTTP_STATUS.OK).json({ message: "Product deleted successfully" });
});

// @desc    Delete multiple products
// @route   DELETE /api/products
export const deleteMultipleProducts = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError("Product IDs array is required.");
  }

  const invalidIds = ids.filter((id) => !isValidObjectId(id));
  if (invalidIds.length > 0) {
    throw new BadRequestError(`Invalid product IDs: ${invalidIds.join(", ")}.`);
  }

  const result = await Product.deleteMany({ _id: { $in: ids } });

  if (result.deletedCount === 0) {
    throw new NotFoundError("No products found with the provided IDs to delete.");
  }

  res.status(HTTP_STATUS.OK).json({
    message: `${result.deletedCount} products deleted successfully.`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Delete all products
// @route   DELETE /api/products/all (example, choose route carefully)
export const deleteAllProducts = asyncHandler(async (req, res, next) => {
  const result = await Product.deleteMany({});
  if (result.deletedCount === 0) {
    // This might not be an "error" per se, but an indication of state.
    return res.status(HTTP_STATUS.OK).json({ 
        message: "No products found to delete. The collection was already empty.",
        deletedCount: 0
    });
  }
  res.status(HTTP_STATUS.OK).json({
    message: `${result.deletedCount} products deleted successfully. All products removed.`,
    deletedCount: result.deletedCount,
  });
});


// @desc    Import products from CSV
// @route   POST /api/products/import
export const importProductsFromCSV = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new BadRequestError("CSV file is required.");
  }

  const { mimetype, size, buffer } = req.file;

  if (mimetype !== CSV_IMPORT_CONFIG.ALLOWED_MIMETYPE) {
    throw new BadRequestError("Invalid file type. Only CSV files are allowed.");
  }

  if (size > CSV_IMPORT_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new BadRequestError(
      `File size exceeds the limit of ${CSV_IMPORT_CONFIG.MAX_FILE_SIZE_MB}MB.`
    );
  }

  const successfullyImported = [];
  const importErrors = [];
  let rowNumber = 1; // CSV rows are typically 1-indexed, header is row 1

  const stream = Readable.from(buffer).pipe(csv({
    mapHeaders: ({ header }) => header.trim().toLowerCase(), // Convert headers to lowercase
    bom: true // Good to keep for handling potential BOM
}));
  // Batch processing
  let batch = [];
  const processBatch = async () => {
    if (batch.length > 0) {
      try {
        const inserted = await Product.insertMany(batch, { ordered: false }); // ordered: false allows valid ones to insert even if others fail
        successfullyImported.push(...inserted);
      } catch (error) {
        // Handle bulk write errors (e.g., duplicates if not caught earlier)
        // error.writeErrors contains details for each failed document
        if (error.writeErrors) {
          error.writeErrors.forEach(err => {
            importErrors.push({
              // Attempt to find original row number for better error reporting is complex here
              // For now, use the error message from MongoDB
              row: 'N/A (batch error)', 
              name: err.err.op?.name || 'Unknown', // Example of trying to get data from failed op
              message: err.err.errmsg || 'Batch insert error',
            });
          });
        } else {
            importErrors.push({ row: 'N/A (batch error)', name: 'Unknown', message: error.message || 'Batch insert error' });
        }
      }
      batch = []; // Reset batch
    }
  };

  for await (const row of stream) {
    rowNumber++;
    console.log(`Row ${rowNumber} (after mapHeaders) data from CSV parser:`, row); // Log again to see effect of mapHeaders
    // Destructure with lowercase keys (which should now match the keys in 'row')
    const { name, quantity, category, description } = row;

    if (!name || !category) { // Note: For row 5, category will be an empty string from CSV, which is falsy
        importErrors.push({
            row: rowNumber,
            name: name || "N/A",
            message: "Name and Category are required fields.",
        });
        continue;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        importErrors.push({
            row: rowNumber,
            name: name,
            message: "Quantity must be a non-negative number or is not a valid number.",
        });
        continue;
    }

    const { valid, message: validationMessage } = await validateProductData({
        name, // Already lowercase
        quantity: parsedQuantity,
        category, // Already lowercase
    });

    if (!valid) {
        importErrors.push({ row: rowNumber, name, message: validationMessage });
    } else {
        batch.push({
            name,
            quantity: parsedQuantity,
            category,
            description: description || "",
        });

        if (batch.length >= CSV_IMPORT_CONFIG.BATCH_SIZE) {
            await processBatch();
        }
    }
}

  await processBatch(); // Process any remaining items in the last batch

  const status = importErrors.length > 0 ? HTTP_STATUS.MULTI_STATUS : HTTP_STATUS.CREATED;

  res.status(status).json({
    message: `${successfullyImported.length} products processed. ${importErrors.length > 0 ? 'Some items failed.' : 'All items imported successfully.'}`,
    importedCount: successfullyImported.length,
    failedCount: importErrors.length,
    errors: importErrors,
    // products: successfullyImported // Optionally return imported products
  });
});


// @desc    Export all products as PDF
// @route   GET /api/products/export/pdf
export const exportProductsToPDF = asyncHandler(async (req, res, next) => {
  const products = await Product.find().lean(); // .lean() for performance

  if (!products.length) {
    throw new NotFoundError("No products available to export.");
  }

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const filename = `products_export_${Date.now()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`); // Ensure filename is quoted

  doc.pipe(res);

  doc.fontSize(18).text("Product List", { align: "center" });
  doc.moveDown(2); // More space after title

  // Table Headers (optional, but good for readability)
  const tableTop = doc.y;
  const itemX = 50;
  const categoryX = 200;
  const quantityX = 350;
  const descriptionX = 450; // If you want to add description

  doc.fontSize(10).text("Name", itemX, tableTop, { bold: true });
  doc.text("Category", categoryX, tableTop, { bold: true });
  doc.text("Quantity", quantityX, tableTop, { bold: true, align: 'right' });
  // doc.text("Description", descriptionX, tableTop, { bold: true });
  doc.moveDown();
  
  const drawLine = (y) => doc.moveTo(itemX - 10, y).lineTo(doc.page.width - itemX + 10, y).stroke();
  drawLine(doc.y); // Line after headers
  doc.moveDown(0.5);


  products.forEach((product) => {
    const y = doc.y;
    doc.fontSize(10).text(product.name, itemX, y, { width: categoryX - itemX - 10, align: 'left' });
    doc.text(product.category, categoryX, y, { width: quantityX - categoryX - 10, align: 'left' });
    doc.text(product.quantity.toString(), quantityX, y, { width: (doc.page.width - itemX - quantityX), align: 'right'});
    // doc.text(product.description || '-', descriptionX, y, { width: doc.page.width - descriptionX - 30 });
    doc.moveDown(1.5); // Space between rows
    if (doc.y > doc.page.height - 50) { // crude pagination
        doc.addPage();
        doc.fontSize(10).text("Name", itemX, 50, { bold: true });
        doc.text("Category", categoryX, 50, { bold: true });
        doc.text("Quantity", quantityX, 50, { bold: true, align: 'right' });
        doc.moveDown();
        drawLine(doc.y);
        doc.moveDown(0.5);
    }
  });

  doc.end();
});