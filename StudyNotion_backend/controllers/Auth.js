//send otp
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();



exports.sendOTP = async(req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(400).json({ message: "User already exists" });
        }

        //generateOTP function
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });
        console.log(otp);

        //check unique otp or not
        let existingOTP = await OTP.findOne({ otp: otp });

        while (existingOTP) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
            });
            console.log(otp);
            existingOTP = await OTP.findOne({ otp: otp });
        }
        const payload = { email, otp };

        // create a new OTP entry
        const otpBody = await OTP.create(payload);
        console.log(otpBody);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in sendOTP:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// signup

exports.signup = async(req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, contactNumber, otp, accountType } = req.body;
        //validation on fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp || !accountType) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //2 password match password and conform password
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        //find most resent otp
        const recentOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
        if (!recentOTP) {
            return res.status(400).json({ message: "OTP not found. Please request a new one." });
        }
        //compare otp
        if (recentOTP.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in profile
        const userProfile = await Profile.create({
            gender: null,
            dob: null,
            about: null,
            contactNumber: contactNumber,
        });

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: userProfile._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName}+${lastName}`,
        });

        return res.status(201).json({ message: "User registered successfully", user });

    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//login

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        //validation on fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        // unhash password and check the password
        if (await bcrypt.compare(password, user.password) === false) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        //generate token
        const payload = {
            id: user._id,
            email: user.email,
            accountType: user.accountType
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        user.token = token;
        user.password = undefined;

        //create cookie and send token in cookie
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.cookie("token", token, options).status(200).json({ message: "Login successful", user, token });

    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Internal Server in login Error" });
    }
};

//change password

exports.changePassword = async(req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }
        //update password in db
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};