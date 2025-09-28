const mongoose = require('mongoose');
const User = require('./User');

const ratingsAndReviewsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true
    },
});

const RatingAndReview = mongoose.model('RatingAndReview', ratingsAndReviewsSchema);
module.exports = RatingAndReview;