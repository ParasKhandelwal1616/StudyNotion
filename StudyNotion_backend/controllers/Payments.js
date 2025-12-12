const { default: mongoose } = require("mongoose");
const { instance } = require("..//config/razorpay");
const Course = require("..//models/Courses");
const User = require("..//models/User");
const mailsender = require("..//utils/mailsender");
const { default: orders } = require("razorpay/dist/types/orders");


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
            amount: amount * 100,
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
                success: true,
                courseName: courseDetails.courseName,
                courseDescription: courseDetails.courseDescription,
                thumbnail: courseDetails.thumbnail,
                orderID: paymentResponce.id,
                currency: paymentResponce.currency,
                amount: paymentResponce.amount,
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

//veriphy signature of razorpay and Server
exports.verifySignature = async(req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        console.log("request is legit");
        const event = req.body.event;

        if (event === "payment.captured") {
            const paymentEntity = req.body.payload.payment.entity;
            const notes = paymentEntity.notes;
            const courseId = notes.courseId;
            const userId = notes.userid;

            try {
                const enrolledCourse = await Course.findByIdAndUpdate(
                    courseId, {
                        $push: { enrolledStudents: userId },
                    }, { new: true }
                );

                await User.findByIdAndUpdate(
                    userId, {
                        $push: { purchasedCourses: courseId },
                    }, { new: true }
                );

                const userDetails = await User.findById(userId);
                await mailsender(
                    userDetails.email,
                    "Course Purchased Successfully",
                    `You have successfully purchased the course: ${enrolledCourse.courseName}. Now you can access it from your dashboard.`
                );
            } catch (error) {
                console.error("Error updating records:", error);
            }
        }
        res.status(200).json({ status: "ok" });
    } else {
        console.log("request is not legit");
        res.status(403).json({ status: "forbidden" });
    }
};