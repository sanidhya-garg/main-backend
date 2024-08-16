import UploadOnSupabase from "../utils/supabase.js";

const uploadImage = async (req, res, next) => {
    const imgfilePath = req.file?.path;

    if (!imgfilePath) {
        console.log('Image not found');
        // Optionally return a response if needed
        // return res.status(400).json({ error: 'Image not found' });
        req.imglink = null; // Set imglink to null if image file path is missing
        return next();
    }

    try {
        const imglink = await UploadOnSupabase(imgfilePath);

        if (!imglink) {
            console.log('Error occurred while uploading image');
            req.imglink = null; // Set imglink to null if upload fails
        } else {
            req.imglink = imglink; // Set the image link if upload succeeds
        }

    } catch (error) {
        console.error('Error during image upload:', error);
        req.imglink = null; // Set imglink to null in case of an error
    }

    // Proceed to the next middleware or route handler
    next();
};


const uploadResume = async (req, res, next) => {
     
    const resumefilePath = req.files?.resume[0]?.path;
    console.log(resumefilePath);
    

    if (!resumefilePath) {
        console.log('Resume not found');
        return res.status(400).json({ error: 'Resume not found' });
    }

    const resumelink = await UploadOnSupabase(resumefilePath);
    console.log("this is link",resumelink);
    



    if (!resumelink) {
        console.log('Error occurred while uploading resume');
        return res.status(500).json({ error: 'resume upload failed' });
    }

    // Add the image link to the req object
    req.resumelink = resumelink;

    // Proceed to the next middleware or route handler
    next();
};
export  {uploadImage,uploadResume}