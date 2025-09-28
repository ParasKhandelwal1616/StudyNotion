const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
    CoursesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    completedvideo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    }],

});

const CourseProgress = mongoose.model('CourseProgress', CourseProgressSchema);
module.exports = CourseProgress;