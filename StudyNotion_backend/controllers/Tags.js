import user from '../models/user.js';
import Courses from '../models/Courses';
import Tag from '../models/tags.js';

// Create a new tag
export const createTags = async(req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        // Check if tag with the same name already exists
        const existingTag = await Tag.findOne({ name: name });
        if (existingTag) {
            return res.status(409).json({ message: "Tag with this name already exists" });
        }

        // Create tag in db
        const tagdetails = await Tag.create({
            name: name,
            description: description
        });

        console.log("Tag created successfully:", tagdetails);
        return res.status(201).json({ message: "Tag created successfully", tag: tagdetails });
    } catch (error) {
        console.error("Error in createTags controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all tags
export const getTags = async(req, res) => {
    try {
        const tags = await Tag.find({});
        return res.status(200).json({ tags: tags });
    } catch (error) {
        console.error("Error in getTags controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete a tag by ID
export const deleteTag = async(req, res) => {
    try {
        const { tagId } = req.params;
        const deletedTag = await Tag.findByIdAndDelete(tagId);
        if (!deletedTag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        return res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
        console.error("Error in deleteTag controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
// Update a tag by ID
export const updateTag = async(req, res) => {
    try {
        const { tagId } = req.params;
        const { name, description } = req.body;

        const updatedTag = await Tag.findByIdAndUpdate(tagId, { name: name, description: description }, { new: true });
        if (!updatedTag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        return res.status(200).json({ message: "Tag updated successfully", tag: updatedTag });
    } catch (error) {
        console.error("Error in updateTag controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};