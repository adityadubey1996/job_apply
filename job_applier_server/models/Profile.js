const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeData: {
      type: String, // Stores stringified JSON
      required: false,
    },
    yamlPath: { type: String, required: false }, // Path to the raw YAML file
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
profileSchema.pre("save", function (next) {
  if (
    this.resumeData &&
    Buffer.byteLength(this.resumeData, "utf8") > 16 * 1024 * 1024
  ) {
    return next(
      new Error("resumeData exceeds the 16MB BSON document size limit.")
    );
  }
  next();
});

module.exports = mongoose.model("Profile", profileSchema);
