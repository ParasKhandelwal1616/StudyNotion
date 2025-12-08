const { default: mongoose } = require("mongoose");
const { instance } = require("..//config/razorpay");
const Course = require("..//models/Courses");
const User = require("..//models/User");
const mailsender = require("..//utils/mailsender");


//capture the payment

exports.paymentcapture = async(req, res) => {
    try {
        //get course id 
        const { courseId } = req.body

        // get userId 
        const userID = req.User.id
            //velidation full
        if (!userID || !courseId) {
            return res.status(400).json({
                success: false,
                message: "user or course not found"
            })
        } // get course details
        const courseDetails = await Course.findById(courseId)
            //check the user is pershased the course

        const userid = new mongoose.Types.ObjectId(userID)
        if (courseDetails.enrolledStudents.includes(userid)) {
            return res.status(400).json({
                success: false,
                message: "the user is alreay buy this course",

            })
        }
        //creat the object 
        const amount = courseDetails.coursePrice;
        const currency = "INR";

        const options = {
            amount = amount * 100,
            currency,
            recept: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userid,
            }
        }
        try {
            const paymentResponce = await instance.orders.create(options);
            console.log(paymentResponce);
            return res.status(200).json({

            })
        } catch (error) {
            console.error("Error deleting section:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};