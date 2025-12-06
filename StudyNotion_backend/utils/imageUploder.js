// Require the Cloudinary library
const cloudinary = require('cloudinary').v2;

// uplode image to cloudinary
exports.cloudinaryUploder = async(file, folder, height, quality) => {
    const opetions = { folder };
    if (height) opetions.height = height;
    if (quality) opetions.quality = quality;

    opetions.resource_type = 'auto';
    return await cloudinary.uploader.upload(file, tempfilepath, opetions);
};