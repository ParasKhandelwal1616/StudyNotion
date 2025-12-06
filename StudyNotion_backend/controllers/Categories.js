import user from '../models/user.js';
import Courses from '../models/Courses';
import Category from '../models/categories.js';

// Create a new category
export const createCategories = async(req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name: name });
        if (existingCategory) {
            return res.status(409).json({ message: "Category with this name already exists" });
        }

        // Create category in db
        const categorydetails = await Category.create({
            name: name,
            description: description
        });

        console.log("Category created successfully:", categorydetails);
        return res.status(201).json({ message: "Category created successfully", category: categorydetails });
    } catch (error) {
        console.error("Error in createCategories controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all categories
export const getCategories = async(req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json({ categories: categories });
    } catch (error) => {
        console.error("Error in getCategories controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete a category by ID
export const deleteCategory = async(req, res) => {
    try {
        const { categoryId } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCategory controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
// Update a category by ID
export const updateCategory = async(req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name: name, description: description }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        console.error("Error in updateCategory controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};