const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const ResumeGenerator = require("../resumeGenerator");
const cloudBucketService = require("../services/bucketService");
const { readYAML } = require("../services/readYaml");

const generateYaml = async (resumeData, profileId) => {
  // Convert the object into YAML format
  const yamlContent = yaml.dump(resumeData);

  // Define the directory and temporary file name for the YAML file
  const tempDir = path.join(__dirname, "../temp_yamls");
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
  const fileName = `resume_${timestamp}.yaml`;
  const tempFilePath = path.join(tempDir, fileName);

  // Ensure the temporary directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Write the YAML content to the temporary file
  fs.writeFileSync(tempFilePath, yamlContent, "utf8");

  // Upload the file to Google Cloud Storage
  return await cloudBucketService.createYamlFileForProfile(
    profileId,
    { path: tempFilePath, mimetype: "text/yaml", originalname: fileName },
    "yamlPath"
  );
};

const generateYamlFile = async (req, res) => {
  try {
    const { resumeData } = req.body;
    console.log(req.body);
    console.log("resumeData", resumeData);
    const { id: userId } = req.user; // Assuming `req.user` is populated by authentication middleware

    if (!resumeData || Object.keys(resumeData).length === 0) {
      return res.status(400).json({ error: "No resume data provided." });
    }

    // Check if a profile exists for the user
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log("Creating a new profile for user ID:", userId);

      // Create a new profile if it doesn't exist
      profile = new Profile({
        userId,
      });
      await profile.save();
    } else {
      console.log("Profile exists for user ID:", userId);
    }

    const { _id: profileId } = profile;
    console.log("profile", profile);
    console.log("profileId", profileId);

    // Update the Profile model with the YAML path and resume data
    profile.yamlPath = await generateYaml(resumeData, profileId);
    profile.resumeData = JSON.stringify(resumeData); // Store the resumeData as stringified JSON

    // Save or update the profile
    await profile.save();

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Respond with success
    res.status(200).json({
      message: "YAML file generated and uploaded successfully.",
      yamlPath,
    });
  } catch (error) {
    console.error("Error generating YAML file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const generateOptimizedResume = async (req, res) => {
  const { id: userId } = req.user; // Authenticated user

  const { jobDescription, aboutCompany } = req.body;

  try {
    // Fetch Profile
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "Profile  not found." });
    }
    if (!profile.resumeData) {
      return res.status(404).json({
        error:
          "Profile resume Date not found. Navigate to profile and create resume data",
      });
    }
    if (!profile.yamlPath) {
      const { _id: profileId } = profile;
      profile.yamlPath = await generateYaml(profile.resumeData, profileId);
    }
    console.log("profile", profile);
    const { _id: profileId } = profile;
    // Create Resume entry in DB
    const newResume = new Resume({
      userId,
      profileId,
      jobDescription,
      aboutCompany,
      yamlPath: profile.yamlPath, // Store initial YAML path
    });
    await newResume.save();

    // Generate optimized YAML and PDF
    const yamlData = await readYAML(
      await cloudBucketService.getFileUrlForProfileYaml(profileId, "yamlPath")
    );
    console.log("yamlDat", yamlData);

    const generator = new ResumeGenerator(
      yamlData, // Download YAML from bucket
      newResume._id.toString(),
      "generated_resumes", // outputFileName
      process.env.GROQ_API_ENDPOINT,
      process.env.GROQ_API_KEY
    );

    const optimizedYamlPath = await generator.optimizeResume(jobDescription);
    const pdfPath = await generator.generatePDF(optimizedYamlPath);

    // Update Resume entry with generated paths
    newResume.optimizedYamlPath = optimizedYamlPath;
    newResume.pdfPath = await cloudBucketService.createPdfFileForResume(
      newResume._id.toString(),
      pdfPath,
      "pdfPath"
    );
    await newResume.save();

    res.status(200).json({
      message: "Resume optimized and PDF generated successfully.",
      resume: newResume,
      pdfPath: await cloudBucketService.generateSignedUrlForFile(
        newResume.pdfPath
      ),
    });
  } catch (error) {
    console.error("Error generating optimized resume:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getUserResumes = async (req, res) => {
  try {
    const { id: userId } = req.user; // Get user ID from authenticated request

    // Fetch resumes for the authenticated user
    const resumes = await Resume.find({ userId });

    if (!resumes || resumes.length === 0) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user." });
    }

    res.status(200).json({ resumes });
  } catch (error) {
    console.error("Error fetching user resumes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSignedUrlForFile = async (req, res) => {
  try {
    const { filePath } = req.params; // Assuming filePath is passed as a URL parameter

    if (!filePath) {
      return res.status(400).json({ error: "File path is required." });
    }

    // Generate the signed URL
    const signedUrl = await cloudBucketService.generateSignedUrlForFile(
      filePath
    );

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error.message);
    res.status(500).json({ error: "Failed to generate signed URL." });
  }
};

module.exports = {
  generateYamlFile,
  generateOptimizedResume,
  getUserResumes,
  getSignedUrlForFile,
};
