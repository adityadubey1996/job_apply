// routes/getStartedRoutes.js
const express = require("express");
const router = express.Router();
const { postSuggestions } = require("../controllers/suggestionsController");
const authenticate = require("../middleware/authenticate");

// POST /api/get-started
router.post("/suggestions", authenticate, postSuggestions);

module.exports = router;
