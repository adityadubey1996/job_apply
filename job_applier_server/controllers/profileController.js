const profileModel = require("../models/Profile");

// Create a new profile for the authenticated user
const createProfile = async (req, res) => {
  try {
    const { id: userId } = req.user; // Assuming user is added by authentication middleware
    const profileData = req.body;

    // Create a new profile associated with the authenticated user
    const profile = new profileModel({ ...profileData, userId });
    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Failed to create profile." });
  }
};

// Edit an existing profile by its ID
const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;

    const updatedProfile = await profileModel.findByIdAndUpdate(
      id,
      profileData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

// Retrieve a profile by userId
const getProfile = async (req, res) => {
  try {
    const { id: userId } = req.user; // Get userId from authentication middleware
    const profile = await profileModel.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
};

module.exports = { createProfile, editProfile, getProfile };
