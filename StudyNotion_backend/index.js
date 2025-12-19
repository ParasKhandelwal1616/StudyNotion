const express = require('express');
const dbconnect = require('./config/database');

//route imports
const UserRoutes = require('./routes/User');
const PaymentRoutes = require('./routes/Payment');
const CourseRoutes = require('./routes/Courses');
const ProfileRoutes = require('./routes/Profile');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const { cloudinaryUploder } = require('./utils/imageUploder');

const fileUpload = require('express-fileupload');


// Connect to the database
dbconnect();

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;


// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Adjust the origin as needed
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));


cloudinaryUploder();
// Define routes

app.use('/api/v1/auth', UserRoutes);
app.use('/api/v1/payment', PaymentRoutes);
app.use('/api/v1/courses', CourseRoutes);
app.use('/api/v1/profile', ProfileRoutes);

app.get('/', (req, res) => {
    res.send('StudyNotion Backend is running');
});

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
});