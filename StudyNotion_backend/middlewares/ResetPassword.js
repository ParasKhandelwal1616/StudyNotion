const user = require("../models/User");
const mailSender = require("../utils/mailSender");


exports.resetPassword = async(req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await user.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        cosnt token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const url = `http://localhost:3000/resetpassword/${token}`;
    }
}