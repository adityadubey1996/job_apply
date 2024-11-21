const datastore = require("./dataStore");

const initializeDatastore = async () => {
  try {
    // Ensure basic entities exist (optional)
    const userKey = datastore.key(["User", "example-user"]);
    const profileKey = datastore.key(["Profile", "example-profile"]);
    const resumeKey = datastore.key(["Resume", "example-resume"]);

    const sampleEntities = [
      {
        key: userKey,
        data: {
          email: "user@example.com",
          passwordHash: "hashed-password",
          createdAt: new Date(),
          updatedAt: new Date(),
          isSocialLogin: false,
          socialProvider: "",
          tokenVersion: 1,
        },
      },
      {
        key: profileKey,
        data: {
          userId: userKey,
          name: "John",
          surname: "Doe",
          phoneNumber: "1234567890",
          address: "123 Main St",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        key: resumeKey,
        data: {
          userId: userKey,
          profileId: profileKey,
          jobDescription: "Sample job description",
          aboutCompany: "Sample company details",
          initialYamlPath: "/path/to/initial.yaml",
          groqResponse: {},
          optimizedYamlPath: "/path/to/optimized.yaml",
          pdfPath: "/path/to/generated.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    // Insert sample entities (if they don't already exist)
    await datastore.upsert(sampleEntities);
    console.log("Datastore initialized with sample entities.");
  } catch (error) {
    console.error("Error during Datastore initialization:", error);
  }
};

module.exports = {
  initializeDatastore,
};
