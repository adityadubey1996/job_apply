const express = require("express");
const authRoutes = require("./authRoutes");
const resumeRoutes = require("./resumeRoutes");
const handleGetStarted = require("./getStarterRoutes");
const suggestionRoutes = require("./suggestionRoutes");

const router = express.Router();

router.use("/", authRoutes); // Public routes
router.use("/", resumeRoutes); // Authenticated routes
router.use("/", handleGetStarted);
router.use("/", suggestionRoutes);

module.exports = router;
