import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: String,

        quantity: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);


const Product = mongoose.model("Product", productSchema);

export const validateProductData = async ({ name, quantity, category }) => {
    if (!name || name.trim() === "") {
        return { valid: false, message: "Name is required" };
    }

    if (!category || category.trim() === "") {
        return { valid: false, message: "Category is required" };
    }

    // Validate quantity: it must be a valid number and non-negative
    if (quantity === undefined || isNaN(quantity) || parseInt(quantity) < 0) {
        return { valid: false, message: "Quantity must be a non-negative number" };
    }

    // Check if a product with the same name and category already exists
    const existingProduct = await Product.findOne({
        name: name.trim(),
        category: category.trim()
    });

    if (existingProduct) {
        return {
            valid: false,
            message: `Product with name "${name}" already exists in the "${category}" category.`
        };
    }

    return { valid: true, message: "" };
};


// Create indexes for better search/filter performance
productSchema.index({ name: "text" });          // For text search
productSchema.index({ category: 1 });           // For fast category filtering
productSchema.index({ 
    description: "text",
});           // For fast quantity filtering

export default mongoose.model("Product", productSchema);
