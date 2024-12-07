// controllers/getStartedController.js
const GetStarted = require("../models/GetStarted");

const handleGetStarted = async (req, res) => {
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if the user already exists
    let userEntry = await GetStarted.findOne({ userId });

    if (userEntry) {
      // Increment the count
      userEntry.count += 1;
    } else {
      // Create a new entry
      userEntry = new GetStarted({ userId, count: 1 });
    }

    // Save to the database
    await userEntry.save();

    res.status(200).json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("Error in handleGetStarted:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { handleGetStarted };
