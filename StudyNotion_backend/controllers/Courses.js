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
            price,
            tag,
            category,
            status,
            instructions,
        } = req.body;

        // Validate required fields
        if (!courseName || !courseDescription || !whatYouwilllearn || !price || !tag || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // get thumbnail from req.files
        const thumbnail = req.files.thumbnailImage;


        // Check if instructor exists
        const userID = req.user.id;
        const instructorExists = await User.findById(userID, {
            accountType: "Instructor",
        });
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
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        });

        // update user with course
        await User.findByIdAndUpdate({ _id: instructorExists._id }, {
            $push: {
                courses: courseDetails._id
            }
        }, { new: true });

        // Add the new course to the Categories
        await Category.findByIdAndUpdate({ _id: category }, {
            $push: {
                courses: courseDetails._id,
            },
        }, { new: true });


        console.log("Course created successfully:", courseDetails);
        return res.status(201).json({ message: "Course created successfully", course: courseDetails });

    } catch (error) {
        console.error("Error in createCourse controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all courses
exports.getAllCourses = async(req, res) => {
    try {
        const courses = await Courses.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();
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
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()
            //validation for courseDetails
        if (!courseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
            },
        });
    } catch (error) {
        console.error("Error in getCourseDetails controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getFullCourseDetails = async(req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
                _id: courseId,
            })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount ? .completedVideos || [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async(req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Courses.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}

exports.editCourse = async(req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Courses.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (Object.hasOwnProperty.call(updates, key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        await course.save()

        const updatedCourse = await Courses.findOne({
                _id: courseId,
            })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

exports.deleteCourse = async(req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Courses.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Courses.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}