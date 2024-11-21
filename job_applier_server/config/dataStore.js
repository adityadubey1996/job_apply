// utils/datastore.js
const { Datastore } = require("@google-cloud/datastore");
const path = require("path");

// Path to your service account JSON file
const serviceAccountPath = path.join(
  __dirname,
  process.env.SERVICE_ACCOUNT_PATH || "../path-to-your-service-account-key.json"
);

// Initialize Datastore with options for development and production
const datastore = new Datastore({
  projectId: process.env.GCP_PROJECT_ID || "your-gcp-project-id",
  keyFilename: serviceAccountPath,
  namespace:
    process.env.NODE_ENV === "production" ? "production" : "development",
});

module.exports = datastore;
