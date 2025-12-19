const mongoose = require("mongoose");
const RatingAndReview = require("../models/ratingandreview.js");
const Course = require("../models/Courses.js");
const User = require("../models/User.js");


// create rating 
exports.createRating = async(req, res) => {
    try {
        const { rating, review } = req.body;
        const userID = req.user.id;
        const { courseId } = req.body;
        // validation of user is enrolled or not
        const courseDetails = await Course.findById(courseId);

        if (!courseDetails.enrolledStudents.includes(userID)) {
            return res.status(400).json({
                success: false,
                message: "user is not enrolled in this course"
            })
        }
        // check the user is already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            course: courseId,
            user: userID,
        });
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "user has already reviewed this course"
            })
        }
        // create rating and review
        const newRatingAndReview = await RatingAndReview.create({
            rating,
            review,
            user: userID,
            course: courseId,
        });
        // update course with rating and review
        await Course.findByIdAndUpdate({ _id: courseId }, { $push: { ratingsAndReviews: newRatingAndReview._id } }, { new: true });
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

//get all rating and review for a course
exports.getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec()
        res.status(200).json({
            success: true,
            message: "all rating and review fetched successfully",
            data: allReviews,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message,
        })
    }
};



//get average rating for a course
exports.getAverageRating = async(req, res) => {
    try {
        const { courseId } = req.params;
        const result = await RatingAndReview.aggregate([
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