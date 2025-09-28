const mongoose = require('mongoose');

const subsectionSchema = new mongoose.Schema({
    title: {
        type: String,

    },
    timeDuration: {
        type: String,

    },
    description: {
        type: String,

    },
    videosUrl: {
        type: String,
    }
});

const Subsection = mongoose.model('Subsection', subsectionSchema);
module.exports = Subsection;