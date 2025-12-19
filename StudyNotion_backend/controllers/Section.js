const Course = require("../models/Courses");
const Section = require("../models/section");
const SubSection = require("../models/subsection");

exports.createSection = async(req, res) => {
    try {
        // data fetch from req.body
        const { courseId, sectionName } = req.body;
        // validation
        if (!courseId || !sectionName) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // create section
        const newSection = await Section.create({ sectionName });
        // update course with section
        const updatedCourse = await Course.findByIdAndUpdate(
                courseId, { $push: { courseContent: newSection._id } }, { new: true }
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

exports.updateSection = async(req, res) => {
    try {
        const { sectionName, sectionId } = req.body;
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        const section = await Section.findByIdAndUpdate(
            sectionId, { sectionName }, { new: true }
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

exports.deleteSection = async(req, res) => {
    try {
        const { sectionId, courseId } = req.body;
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        })
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not Found",
            })
        }

        //delete sub section
        await SubSection.deleteMany({ _id: { $in: section.subSection } });

        await Section.findByIdAndDelete(sectionId);

        //find the updated course and return it
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
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