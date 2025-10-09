const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
//auth
exports.auth = async(req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


//isStudent 
exports.IsStudent = async(req, res, next) => {
        try {
            if (req.user.accountType !== "Student") {
                return res.status(403).json({ message: "Access denied, Students only" });
            }
            next();
        } catch (error) {
            console.error("Error in IsStudent middleware:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    // is Instructor 
exports.IsInstructor = async(req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(403).json({ message: "Access denied, Instructors only" });
        }
        next();
    } catch (error) {
        console.error("Error in IsInstructor middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


//is Admin
exports.IsAdmin = async(req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(403).json({ message: "Access denied, Admins only" });
        }
        next();
    } catch (error) {
        console.error("Error in IsAdmin middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};