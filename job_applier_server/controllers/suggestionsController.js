const Suggestion = require("../models/Suggestions");

const postSuggestions = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Suggestion text is required." });
    }

    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newSuggestion = new Suggestion({ text, userId });
    await newSuggestion.save();

    res.status(201).json({ message: "Suggestion saved successfully." });
  } catch (error) {
    console.error("Error saving suggestion:", error);
    res.status(500).json({ error: "Failed to save suggestion." });
  }
};

module.exports = { postSuggestions };
