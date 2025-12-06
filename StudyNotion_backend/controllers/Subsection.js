const Section = require("../models/section");
const SubSection = require("../models/subsection");
const { uploadImageToCloudinary } = require("../utils/imageUploder.js");

exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body;
        const video = req.files.video;

        if (!sectionId || !title || !description || !video) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
        );

        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videosUrl: uploadDetails.secure_url,
        });

        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $push: { subsections: subSectionDetails._id } },
            { new: true }
        ).populate("subsections");

        return res.status(200).json({ success: true, data: updatedSection });
    } catch (error) {
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId, title, description } = req.body;
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        if (title !== undefined) {
            subSection.title = title;
        }

        if (description !== undefined) {
            subSection.description = description;
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            );
            subSection.videosUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subsections");

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSection,
        });
    } catch (error) {
        console.error("Error updating sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull: {
                    subsections: subSectionId,
                },
            }
        );
        const subSection = await SubSection.findByIdAndDelete(subSectionId);

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" });
        }

        const updatedSection = await Section.findById(sectionId).populate("subsections");

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        });
    } catch (error) {
        console.error("Error deleting sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};