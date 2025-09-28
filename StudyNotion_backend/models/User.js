const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        required: true,
    },
    additionDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile',
        required: true,
    },
    Courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    image: {
        type: String,
        required: true,
    },
    coursesProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseProgress',
    }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;