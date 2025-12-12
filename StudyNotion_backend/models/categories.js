const mongoose = require('mongoose');
const Courses = require('./Courses');

const categorySchema = new mongoose.Schema({
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
        //array of course IDs associated with this category
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        default: []
    }

});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;