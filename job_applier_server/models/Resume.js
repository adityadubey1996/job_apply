const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    jobDescription: { type: String, required: true },
    aboutCompany: { type: String, required: false },
    yamlPath: { type: String, required: false }, // Original YAML path
    optimizedYamlPath: { type: String, required: false }, // Optimized YAML path
    pdfPath: { type: String, required: false }, // Generated PDF path
    groqResponse: { type: Object, required: false }, // GROQ API response
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
