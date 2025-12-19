// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")
const { auth, IsInstructor, IsStudent, IsAdmin } = require("../middlewares/auth")
router.post("/capturePayment", auth, IsStudent, capturePayment)
router.post("/verifyPayment", auth, IsStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, IsStudent, sendPaymentSuccessEmail);

module.exports = router