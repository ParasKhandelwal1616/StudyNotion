const User = require("../models/User.js");
const Courses = require("../models/Courses.js");
const Category = require("../models/categories.js");
const { cloudinaryUploder } = require("../utils/imageUploder.js");

// Create a new course
exports.createCourse = async(req, res) => {
    try {
        const {
            courseName,
            courseDescription,
            whatYouwilllearn,
            courseContent,
            coursePrice,
            category
        } = req.body;

        // Validate required fields
        if (!courseName || !courseDescription || !whatYouwilllearn || !courseContent || !coursePrice || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // get thumbnail from req.files
        const thumbnail = req.files.thumbnailImage;


        // Check if instructor exists
        const userID = req.user.id;
        const instructorExists = await User.findById(userID);
        if (!instructorExists) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        // category validation 
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({ message: "Category not found" });
        }

        // upload thumbnail to cloudinary
        const thumbnailImage = await cloudinaryUploder(thumbnail, "StudyNotion/Courses/thumbnail");

        // Create course in db
        const courseDetails = await Courses.create({
            courseName: courseName,
            courseDescription: courseDescription,
            instructor: instructorExists._id,
            whatYouwilllearn: whatYouwilllearn,
            courseContent: courseContent,
            coursePrice: coursePrice,
            thumbnail: thumbnailImage.secure_url,
            category: category
        });

        // update user with course
        await User.findByIdAndUpdate({ _id: instructorExists._id }, { $push: { createdCourses: courseDetails._id } }, { new: true });

        console.log("Course created successfully:", courseDetails);
        return res.status(201).json({ message: "Course created successfully", course: courseDetails });

    } catch (error) {
        console.error("Error in createCourse controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all courses
exports.getCourses = async(req, res) => {
    try {
        const courses = await Courses.find({});
        return res.status(200).json({ courses: courses });
    } catch (error) {
        console.error("Error in getCourses controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// get coomplete data of course with all details
exports.getCourseDetails = async(req, res) => {
    try {
        const { courseId } = req.body;
        const courseDetails = await Courses.findById(courseId)
            .populate({
                path: "category",
                select: "categoryName"
            })
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
                select: "firstName lastName email"
            })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subsections",
                    select: "title content"
                },
                select: "title content"
            })
            .populate({
                path: "ratingsAndReviews",
                select: "rating reviewBy"
            })
            .populate({
                path: "enrolledStudents",
                select: "firstName lastName email"
            });
        //validation for courseDetails
        if (!courseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json({ courseDetails: courseDetails });
    } catch (error) {
        console.error("Error in getCourseDetails controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};