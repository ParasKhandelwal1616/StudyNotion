import ratingandreviewService from "../models/RatingandReview.js";
const course = require("../models/Courses.js");
const user = require("../models/User.js");


// create reating 
exports.createrating = async(req, res) => {
    try {
        const { rating, review } = req.body;
        const userID = req.user.id;
        const { courseId } = req.body;
        // validation of user is enrolled or not
        const courseDetails = await course.findById(courseId);
        const userid = userID;
        if (!courseDetails.enrolledStudents.includes(userid)) {
            return res.status(400).json({
                success: false,
                message: "user is not enrolled in this course"
            })
        }
        // check the user is already reviewd the course
        const alreadyReviewd = await ratingandreviewService.findOne({
            course: courseId,
            user: userID,
        });
        if (alreadyReviewd) {
            return res.status(400).json({
                success: false,
                message: "user has already reviewd this course"
            })
        }
        // create rating and review
        const newRatingAndReview = await ratingandreviewService.create({
            rating,
            review,
            user: userID,
            course: courseId,
        });
        // update course with rating and review
        await course.findByIdAndUpdate({ _id: courseId }, { $push: { ratingAndReview: newRatingAndReview._id } }, { new: true });
        return res.status(201).json({
            success: true,
            message: "rating and review created successfully",
            ratingandreview: newRatingAndReview,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message,
        })
    }
};

//get all reating and review for a course
exports.getAllRatingAndReview = async(req, res) => {
    try {
        const { courseId } = req.params;
        const allRatingAndReview = await ratingandreviewService.find({ course: courseId }).populate("user", "firstName lastName email image");
        return res.status(200).json({
            success: true,
            message: "all rating and review fetched successfully",
            ratingandreview: allRatingAndReview,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message,
        })
    }
};



//get average reating for a course
exports.getAverageRating = async(req, res) => {
    try {
        const { courseId } = req.params;
        const result = await ratingandreviewService.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            {
                $group: {
                    _id: "$course",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                message: "no ratings found for this course",
                averageRating: 0,
                totalReviews: 0,
            });
        }
        return res.status(200).json({
            success: true,
            message: "average rating fetched successfully",
            averageRating: result[0].averageRating,
            totalReviews: result[0].totalReviews,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message,
        });
    }
};