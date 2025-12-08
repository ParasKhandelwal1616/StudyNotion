import Profile from "../models/profile";
import User from "../models/User";

// update the profile 
exports.updateprofile = async(req, res) => {
    try {
        //get the data from body 
        const { gender, dateofBirth, about, conactNumber } = req.body;


        // get user id

        const UserId = req.user.id;


        //validation of data
        if (!gender || !dateofBirth || !about || !conactNumber || !UserId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // find profile 
        const userdetails = await User.findById(UserId);
        const profileId = userdetails.additionDetails;

        const profiledetails = await Profile.findById(profileId);



        // update profile 
        profiledetails.gender = gender;
        profiledetails.dateOfBirth = dateofBirth;
        profiledetails.contactNumber = conactNumber;
        profiledetails.about = about;


        await profiledetails.save();


        // return 
        return res.status(200).json({

            success: true,
            massage: "profile updated",
            profiledetails,
        })
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//delete the user and its profile 

exports.deleteProfile = async(req, res) => {
    try {
        //get user id
        const id = req.user.id;


        //find userdetails

        const userdetails = User.findById(id);

        if (!userdetails) {
            return res.status(400).json({
                success: false,
                message: "userdetails not found",

            })
        }
        //delete profile 
        await Profile.findByIdAndDelete(_id.userdetails.additionDetails);
        //delete user
        await User.findByIdAndDelete({ _id: id });
        //retuen
        return res.status(200).json({

            success: true,
            massage: "profile deleted",
        })

    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};