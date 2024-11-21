const express = require("express");
const {
  createProfile,
  editProfile,
  getProfile,
} = require("../controllers/profileController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Route to create a profile for the authenticated user
router.post("/", authenticate, createProfile);

// Route to edit a profile by its ID (only for authenticated users)
router.put("/:id", authenticate, editProfile);

// Route to get a profile for the authenticated user
router.get("/", authenticate, getProfile);
module.exports = router;
