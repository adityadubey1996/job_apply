// models/GetStarted.js
const mongoose = require("mongoose");

const getStartedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("GetStarted", getStartedSchema);
