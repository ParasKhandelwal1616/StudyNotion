const mongoose = require('mongoose');
const Courses = require('./Courses');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    Courses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
        required: true
    }

});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;