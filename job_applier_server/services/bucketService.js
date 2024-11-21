const { Storage } = require("@google-cloud/storage");
const Profile = require("../models/Profile"); // Assuming you have a Profile model
const Resume = require("../models/Resume");
const path = require("path");

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Set your bucket name in .env

const generateSignedUrl = async (fileName) => {
  console.log("generating signed Url for fileName", fileName);
  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // URL valid for 15 minutes
  };
  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl(options);
  return url;
};

const uploadFile = async (file, destination) => {
  await storage.bucket(bucketName).upload(file.path, {
    destination,
    metadata: {
      contentType: file.mimetype,
    },
  });
  return destination;
};

const deleteFile = async (filePath) => {
  const fileName = filePath.replace(`gs://${bucketName}/`, "");
  await storage.bucket(bucketName).file(fileName).delete();
};

const cloudBucketService = {
  updateBucketCors: async (bucketName) => {
    try {
      const corsConfiguration = [
        {
          origin: ["http://localhost:5173"], // Replace with your allowed origins
          method: ["GET", "HEAD", "OPTIONS"], // HTTP methods to allow
          responseHeader: ["Content-Type"], // Allowed headers in the response
          maxAgeSeconds: 3600, // Cache preflight requests for 1 hour
        },
      ];

      // Set the CORS configuration for the bucket
      await storage.bucket(bucketName).setCorsConfiguration(corsConfiguration);

      console.log(`CORS settings updated for bucket: ${bucketName}`);
    } catch (error) {
      console.error("Error updating CORS settings:", error.message);
    }
  },

  generateSignedUrlForFile: async (fileName) => {
    try {
      return await generateSignedUrl(fileName);
    } catch (error) {
      console.error("Error getting file URL:", error.message);
      throw error;
    }
  },

  getFileUrlForProfileYaml: async (profileId, fileField) => {
    try {
      const profile = await Profile.findById(profileId);
      if (!profile || !profile[fileField]) {
        throw new Error("File not found in profile.");
      }
      const url = await generateSignedUrl(profile[fileField]);
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error.message);
      throw error;
    }
  },

  createYamlFileForProfile: async (profileId, file, fileField) => {
    try {
      const destination = `profiles/${profileId}/${file.originalname}`;

      const profile = await Profile.findById(profileId);
      if (!profile) {
        throw new Error("Profile not found.");
      }
      const filePath = await uploadFile(file, destination);

      profile[fileField] = filePath;
      await profile.save();

      return filePath;
    } catch (error) {
      console.error("Error uploading file:", error.message);
      throw error;
    }
  },

  createPdfFileForResume: async (resumeId, filePath, fileField) => {
    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        throw new Error("Resume not found.");
      }

      const destination = `resumes/${resumeId}/${path.basename(filePath)}`;

      console.log(
        `Uploading file from path: ${filePath} to destination: ${destination}`
      );

      // Upload the file to cloud storage
      const uploadedFilePath = await uploadFile(
        { path: filePath, mimetype: "application/pdf" },
        destination
      );

      // Update the Resume model with the cloud storage path
      resume[fileField] = uploadedFilePath;
      await resume.save();

      console.log(
        "File uploaded and saved to resume successfully:",
        uploadedFilePath
      );

      return uploadedFilePath;
    } catch (error) {
      console.error("Error uploading and saving file:", error.message);
      throw error;
    }
  },

  deleteFile: async (profileId, fileField) => {
    try {
      const profile = await Profile.findById(profileId);
      if (!profile || !profile[fileField]) {
        throw new Error("File not found in profile.");
      }

      const filePath = profile[fileField];
      await deleteFile(filePath);

      profile[fileField] = null;
      await profile.save();
    } catch (error) {
      console.error("Error deleting file:", error.message);
      throw error;
    }
  },

  updateFile: async (profileId, newFile, fileField) => {
    try {
      const profile = await Profile.findById(profileId);
      if (!profile) {
        throw new Error("Profile not found.");
      }

      // Delete the old file if it exists
      if (profile[fileField]) {
        await deleteFile(profile[fileField]);
      }

      const destination = `profiles/${profileId}/${newFile.originalname}`;
      const filePath = await uploadFile(newFile, destination);

      profile[fileField] = filePath;
      await profile.save();

      return filePath;
    } catch (error) {
      console.error("Error updating file:", error.message);
      throw error;
    }
  },
};

module.exports = cloudBucketService;
