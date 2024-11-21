const express = require("express");
const authRoutes = require("./authRoutes");
const resumeRoutes = require("./resumeRoutes");

const router = express.Router();

router.use("/", authRoutes); // Public routes
router.use("/", resumeRoutes); // Authenticated routes

module.exports = router;
