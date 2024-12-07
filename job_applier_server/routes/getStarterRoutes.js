// routes/getStartedRoutes.js
const express = require("express");
const router = express.Router();
const { handleGetStarted } = require("../controllers/testDataController");
const authenticate = require("../middleware/authenticate");

// POST /api/get-started
router.post("/get-started", authenticate, handleGetStarted);

module.exports = router;
