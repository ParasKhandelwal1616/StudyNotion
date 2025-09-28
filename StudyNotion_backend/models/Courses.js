const mongoose = require('mongoose');

const CoursesSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true
    },
    instractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    whatYouwilllearn: [{
        type: String,
        required: true,
        trim: true
    }],
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    }],
    ratingsAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReview'
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    coursePrice: {
        type: Number,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    tag: [{
        type: String,
        required: true,
        trim: true
    }],
});

const Courses = mongoose.model('Course', CoursesSchema);
module.exports = Courses;