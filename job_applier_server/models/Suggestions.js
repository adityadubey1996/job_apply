const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { collection: "suggestions" }
);

module.exports = mongoose.model("Suggestion", SuggestionSchema);
