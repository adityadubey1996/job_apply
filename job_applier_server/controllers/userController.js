const User = require("../models/User");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");

exports.getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const resumes = await Resume.find({ userId: user._id });

    res.json({ user, profile, resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
