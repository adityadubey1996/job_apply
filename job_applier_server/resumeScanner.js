const { spawn } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ProfileModel = require("./models/Profile"); // Replace with your DB model
const User = require("./models/User");

/**
 * Extract JSON-like content from a string using a regex
 * @param {string} input - The input string containing JSON-like content
 * @returns {string|null} - Extracted content or null if no match is found
 */
function extractJsonFromText(input) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  const regex = /\{[\s\S]*\}/;
  const match = input.match(regex);
  return match ? match[0] : null; // Return the matched content or null if no match
}

const predefinedOptions = {
  countries: ["India", "USA", "UK", "Canada", "Australia"],
  phonePrefixes: ["+1", "+91", "+44", "+61"],
  industries: ["Technology", "Finance", "Healthcare", "Education", "Other"],
  skills: [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "csharp",
    "ruby",
    "php",
    "react",
    "nodejs",
    "aws",
    "docker",
    "kubernetes",
  ],
  languages: ["English", "Spanish", "French", "German", "Chinese"],
  proficiencies: ["Beginner", "Intermediate", "Professional", "Fluent"],
  interests: [
    "Software Development",
    "AI",
    "Machine Learning",
    "Data Science",
    "Web Development",
  ],
};

const prompt = (ocrData) => {
  if (!ocrData) {
    throw Error("OCR data is required");
  }
  return {
    instructions: `
      You are a specialized language model trained to parse and transform OCR data into structured JSON. Your task is to process the given OCR text and map it to the specified schema. Follow these rules strictly:
      1. Return only the JSON object. Do not include explanations, formatting comments, or additional text.
      2. Ensure all fields conform exactly to the schema types provided.
      3. For missing data, use 'null' or default values as appropriate.
      4. Parse dates in ISO 8601 format or use 'null' if the date is unavailable.
      5. Arrays (e.g., responsibilities, skillsAcquired) must be arrays even if only one item is available.
      6. Validate fields like 'country', 'phonePrefix', 'industry', 'skills', 'languages', and 'proficiency' against predefined options. If a value is invalid, replace it with 'null'.
      7. Extract all possible relevant information while maintaining accuracy.
    `,
    schema: {
      personal_information: {
        name: "string",
        surname: "string",
        date_of_birth: "Date or null",
        country: `string (must match one of: ${predefinedOptions.countries.join(
          ", "
        )})`,
        city: "string",
        address: "string",
        phonePrefix: `string (must match one of: ${predefinedOptions.phonePrefixes.join(
          ", "
        )})`,
        phoneNumber: "string",
        email: "string",
        github: "string",
        linkedin: "string",
      },
      education_details: [
        {
          degree: "string",
          university: "string",
          gpa: "string or null",
          graduation_year: "Date or null",
          field_of_study: "string",
        },
      ],
      experience_details: [
        {
          position: "string",
          company: "string",
          startDate: "Date",
          endDate: "Date or null",
          location: "string",
          industry: `string (must match one of: ${predefinedOptions.industries.join(
            ", "
          )})`,
          key_responsibilities: ["string"],
          skills_acquired: [
            `string (must match one of: ${predefinedOptions.skills.join(
              ", "
            )})`,
          ],
        },
      ],
      projects: [
        {
          name: "string",
          description: "string",
          link: "string",
        },
      ],
      achievements: [
        {
          name: "string",
          description: "string",
        },
      ],
      certifications: [
        {
          name: "string",
          organization: "string",
          year: "number or null",
        },
      ],
      languages: [
        {
          language: `string (must match one of: ${predefinedOptions.languages.join(
            ", "
          )})`,
          proficiency: `string (must match one of: ${predefinedOptions.proficiencies.join(
            ", "
          )})`,
        },
      ],
      interests: [
        `string (must match one of: ${predefinedOptions.interests.join(", ")})`,
      ],
      availability: {
        notice_period: "string",
      },
      salary_expectations: {
        min: "number",
        max: "number",
      },
      self_identification: {
        gender: "string",
        pronouns: "string",
        veteran_status: "string",
        disability_status: "string",
        ethnicity: "string",
      },
      legal_authorization: {
        eu_work_authorization: "boolean",
        us_work_authorization: "boolean",
        requires_us_visa: "boolean",
        requires_eu_visa: "boolean",
        legally_allowed_eu: "boolean",
        legally_allowed_us: "boolean",
        requires_eu_sponsorship: "boolean",
        requires_us_sponsorship: "boolean",
      },
      work_preferences: {
        remote_work: "boolean",
        in_person_work: "boolean",
        open_to_relocation: "boolean",
        willing_to_complete_assessments: "boolean",
        willing_to_undergo_tests: "boolean",
        willing_to_undergo_checks: "boolean",
      },
    },
    data: ocrData,
    requirements: [
      "Ensure all fields match the schema exactly.",
      "Use null or default values for missing information.",
      "Extract as much relevant information as possible from the given OCR data.",
      "Fields like 'startDate' and 'endDate' should be in ISO 8601 format or null if unavailable.",
      "Responsibilities and skillsAcquired should be arrays, even if there is only one item.",
      "Validate 'country', 'phonePrefix', 'industry', 'skills', 'languages', and 'proficiency' against predefined options. Replace invalid entries with 'null'.",
      "Return valid JSON output that conforms strictly to the schema. no extra text, no metadat is required, as the result will be JSON.parse, it should not throw error",
    ],
  };
};

/**
 * Process PDF, extract content, send to GROQ API, and save profile JSON.
 * @param {string} filePath - Path to the uploaded PDF file.
 */
const processAndSaveProfile = async (filePath, userId) => {
  try {
    // Step 1: Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    if (!userId) {
      throw new Error("userId not found");
    }

    // Step 2: Call Python script to extract content
    const extractedData = await extractPdfContent(filePath);

    console.log("extractedData", extractedData);
    // Step 3: Send extracted data to GROQ API
    const groqResponse = await sendToGroqApi(extractedData);

    // Step 4: Save the response JSON into the database
    const savedProfile = await saveProfileToDatabase(groqResponse, userId);

    console.log("Profile saved successfully:", savedProfile);
    return savedProfile;
  } catch (error) {
    console.error("Error processing profile:", error.message);
    throw error;
  }
};

/**
 * Extract PDF content using Python script.
 * @param {string} filePath - Path to the uploaded PDF file.
 * @returns {Promise<Object>} Extracted content as JSON.
 */
const extractPdfContent = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "extract_pdf.py"); // Python script path
    const process = spawn("python", [pythonScript, filePath]);

    let result = "";
    let error = "";

    process.stdout.on("data", (data) => {
      result = result + data.toString();
    });

    process.stderr.on("data", (data) => {
      // console.error(`Python script log: ${data.toString()}`);
      error += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          console.log("result", result);
          resolve(result);
        } catch (parseError) {
          console.log("parseError", parseError);
          reject(
            new Error(
              `Failed to parse Python script output Error: 
           
              `
            )
          );
        }
      } else {
        reject(new Error(`Python script failed with error: ${error.trim()}`));
      }
    });
  });
};

/**
 * Send extracted data to GROQ API.
 * @param {Object} extractedData - Data extracted from the PDF.
 * @returns {Promise<Object>} Response from the GROQ API.
 */
const sendToGroqApi = async (extractedData) => {
  try {
    const groqUrl = process.env.GROQ_API_ENDPOINT; // GROQ API URL from environment variables
    const apiKey = process.env.GROQ_API_KEY; // GROQ API key for authorization
    const promptText = prompt(extractedData);
    const payload = {
      messages: [{ role: "user", content: JSON.stringify(promptText) }],
      model: "llama3-70b-8192",
    };

    const response = await axios.post(groqUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Extracting the structured content
    const structuredContent = response.data.choices[0]?.message?.content;

    if (structuredContent) {
      // Attempt to parse the structured JSON if it's in string format
      let parsedData;
      try {
        console.log("structuredContent", structuredContent);
        console.log(
          "extractJsonFromText",
          extractJsonFromText(structuredContent)
        );
        parsedData = JSON.parse(extractJsonFromText(structuredContent));
        console.log("Parsed Data:", parsedData);

        return parsedData; // Return the parsed JSON for further use
      } catch (error) {
        console.error("Error parsing structured content as JSON:", error);
        throw Error("Error while processing resume Data");
        return null; // Return as-is if parsing fails
      }
    } else {
      console.error("No structured content found in the response.");
      throw Error("Error while processing resume Data");
      return null;
    }
  } catch (error) {
    console.error("Error sending data to GROQ API:", error);
    throw error;
  }
};

/**
 * Save processed data to the database.
 * @param {Object} profileData - JSON data returned by GROQ API.
 * @returns {Promise<Object>} Saved profile document.
 */
const saveProfileToDatabase = async (profileData, userId) => {
  try {
    // Ensure the User model is imported and properly queried
    const user = await User.findOne({ _id: userId });
    console.log("user", user);
    if (!user) {
      throw new Error(
        "User not found before saving the OCR result in the database"
      );
    }

    // Ensure the ProfileModel is properly imported and queried
    let userProfile = await ProfileModel.findOne({ userId });
    if (!userProfile) {
      // If no profile exists, create a new one
      const profile = new ProfileModel({
        resumeData: JSON.stringify(profileData), // Save profileData as JSON string
        userId,
      });
      const savedProfile = await profile.save();
      console.log("Profile created and saved successfully:", savedProfile._id);

      return {
        ...profile,
        resumeData: JSON.parse(profile.resumeData),
      };
    }

    // Update the existing profile
    userProfile.resumeData = JSON.stringify(profileData); // Update the profile data
    const updatedProfile = await userProfile.save();
    console.log("Profile updated successfully:", updatedProfile._id);
    return {
      ...userProfile,
      resumeData: JSON.parse(userProfile.resumeData),
    };
  } catch (error) {
    console.error("Error saving profile to database:", error.message || error);
    throw error;
  }
};

module.exports = {
  saveProfileToDatabase,
  processAndSaveProfile,
  extractPdfContent,
};
