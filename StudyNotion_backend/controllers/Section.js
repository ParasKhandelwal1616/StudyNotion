const Course = require("../models/Courses");
const Section = require("../models/section");
const SubSection = require("../models/subsection");

exports.createSection = async(req, res) => {
    try {
        const { courseId, sectionName } = req.body;

        if (!courseId || !sectionName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newSection = await Section.create({ sectionName });

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subsections",
            },
        })
        .exec();

        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data: updatedCourse,
        });
    } catch (error) {
        console.error("Error creating section:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body;
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: section,
        });
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        });
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }
//find sub sections and delete them
        await SubSection.deleteMany({ _id: { $in: section.subsections } });

        await Section.findByIdAndDelete(sectionId);

        //find the updated course and return it
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subsections",
                },
            })
            .exec();

        res.status(200).json({
            success: true,
            message: "Section deleted",
            data: course,
        });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};