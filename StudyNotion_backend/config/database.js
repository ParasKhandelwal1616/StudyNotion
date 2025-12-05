const mongoose = require('mongoose');
require('dotenv').config();

const dbconnect = async() => {
    try {
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
    }
}

module.exports = dbconnect;