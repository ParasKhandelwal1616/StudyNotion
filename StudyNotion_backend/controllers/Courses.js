import User from "../models/User";
import Courses from "../models/Courses.js";
import Tag from "../models/tags.js";
import { cloudinaryUploder } from "../utils/imageUploder.js";

// Create a new course
exports.createCourse = async(req, res) => {
    try {
        const {
            courseName,
            courseDescription,
            whatYouwilllearn,
            courseContent,
            coursePrice,
            tag
        } = req.body;

        // Validate required fields
        if (!courseName || !courseDescription || !whatYouwilllearn || !courseContent || !coursePrice || !tag) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // get thumbnail from req.files
        const thumbnail = req.files.thumbnailImage;


        // Check if instractor exists
        const userID = req.user.id;
        const instructorExists = await User.findById(userID);
        if (!instructorExists) {
            return res.status(404).json({ message: "Instructor not found" });
        }

        // Create course in db
        const courseDetails = await Courses.create({
            courseName: courseName,
            courseDescription: courseDescription,
            instractor: instractor,
            whatYouwilllearn: whatYouwilllearn,
            courseContent: courseContent,
            coursePrice: coursePrice,
            thumbnail: thumbnail,
            tag: tag
        });

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