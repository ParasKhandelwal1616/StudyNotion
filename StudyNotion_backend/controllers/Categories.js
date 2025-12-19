const Courses = require('../models/Courses.js');
const Category = require('../models/categories.js');

// Create a new category
exports.createCategory = async(req, res) => {
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
        console.error("Error in createCategory controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all categories
exports.showAllCategories = async(req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json({ categories: categories });
    } catch (error) {
        console.error("Error in getCategories controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
  
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
          },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
  
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
}