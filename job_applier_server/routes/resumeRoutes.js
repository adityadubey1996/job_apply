const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  generateYamlFile,
  generateOptimizedResume,
  getUserResumes,
  getSignedUrlForFile,
} = require("../controllers/resumeController");

const router = express.Router();

// Authenticated resume builder routes
router.post("/generate-yaml", authenticate, generateYamlFile);
router.post("/generate-resume", authenticate, generateOptimizedResume);
router.get("/user-resumes", authenticate, getUserResumes);
router.get("/signed-url/:filePath", authenticate, getSignedUrlForFile);
module.exports = router;
