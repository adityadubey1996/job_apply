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
  countries: [
    "India",
    "USA",
    "UK",
    "Canada",
    "Australia",
    // European Countries
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Switzerland",
    "Norway",
    "Denmark",
    "Poland",
    "Austria",
    "Belgium",
    "Finland",
    "Portugal",
    "Ireland",
    "Czech Republic",
    "Hungary",
    "Greece",
    "Slovakia",
    "Romania",
    "Bulgaria",
    "Croatia",
    "Estonia",
    "Lithuania",
    "Latvia",
    // Asian Countries
    "Japan",
    "South Korea",
    "Vietnam",
    "Thailand",
    "Malaysia",
    "Singapore",
    "Indonesia",
    "Philippines",
    "Bangladesh",
    "Pakistan",
    "Sri Lanka",
    "Nepal",
    "Myanmar",
    // Middle Eastern Countries
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Turkey",
    "Israel",
    // Other Notable Countries
    "Mexico",
    "Brazil",
    "Argentina",
    "South Africa",
    "New Zealand",
  ],

  phonePrefixes: [
    "+1", // USA, Canada
    "+91", // India
    "+44", // UK
    "+61", // Australia
    "+49", // Germany
    "+33", // France
    "+39", // Italy
    "+34", // Spain
    "+31", // Netherlands
    "+46", // Sweden
    "+41", // Switzerland
    "+47", // Norway
    "+45", // Denmark
    "+48", // Poland
    "+43", // Austria
    "+32", // Belgium
    "+358", // Finland
    "+351", // Portugal
    "+353", // Ireland
    "+420", // Czech Republic
    "+36", // Hungary
    "+30", // Greece
    "+421", // Slovakia
    "+40", // Romania
    "+359", // Bulgaria
    "+385", // Croatia
    "+372", // Estonia
    "+370", // Lithuania
    "+371", // Latvia
    "+81", // Japan
    "+82", // South Korea
    "+84", // Vietnam
    "+66", // Thailand
    "+60", // Malaysia
    "+65", // Singapore
    "+62", // Indonesia
    "+63", // Philippines
    "+880", // Bangladesh
    "+92", // Pakistan
    "+94", // Sri Lanka
    "+977", // Nepal
    "+95", // Myanmar
    "+971", // United Arab Emirates
    "+966", // Saudi Arabia
    "+974", // Qatar
    "+965", // Kuwait
    "+968", // Oman
    "+90", // Turkey
    "+972", // Israel
    "+52", // Mexico
    "+55", // Brazil
    "+54", // Argentina
    "+27", // South Africa
    "+64", // New Zealand
  ],
  industries: [
    // Technology
    "Technology",
    "Information Technology and Services",
    "Software Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Cloud Computing",
    "Telecommunications",
    "E-commerce",
    "Hardware and Networking",

    // Finance
    "Finance",
    "Banking",
    "Investment Banking",
    "Insurance",
    "Accounting",
    "Wealth Management",
    "Venture Capital and Private Equity",
    "Fintech",

    // Healthcare
    "Healthcare",
    "Pharmaceuticals",
    "Medical Devices",
    "Biotechnology",
    "Hospitals and Health Care",
    "Telehealth",
    "Health and Wellness",
    "Public Health",

    // Education
    "Education",
    "Higher Education",
    "E-learning",
    "K-12 Education",
    "Vocational Training",
    "Educational Technology (EdTech)",
    "Corporate Training",

    // Manufacturing and Engineering
    "Manufacturing",
    "Automotive",
    "Aerospace",
    "Electrical and Electronics",
    "Industrial Automation",
    "Civil Engineering",
    "Chemical Manufacturing",
    "Robotics",

    // Retail and Consumer Goods
    "Retail",
    "E-commerce",
    "Consumer Goods",
    "Fashion and Apparel",
    "Luxury Goods and Jewelry",
    "Food and Beverage",
    "Supermarkets and Grocery Stores",

    // Energy and Environment
    "Energy",
    "Renewable Energy",
    "Oil and Gas",
    "Utilities",
    "Environmental Services",
    "Sustainable Development",
    "Waste Management",

    // Media and Communication
    "Media",
    "Entertainment",
    "Publishing",
    "Broadcasting",
    "Public Relations",
    "Advertising",
    "Digital Media",

    // Law and Legal Services
    "Legal Services",
    "Corporate Law",
    "Compliance",
    "Intellectual Property",
    "Mergers and Acquisitions",
    "Dispute Resolution",

    // Logistics and Supply Chain
    "Logistics",
    "Supply Chain Management",
    "Transportation",
    "Warehousing",
    "Freight and Logistics",
    "Shipping",

    // Government and Public Sector
    "Government",
    "Public Administration",
    "Defense and Space",
    "Nonprofit Organization Management",
    "International Affairs",

    // Agriculture and Food Production
    "Agriculture",
    "Farming",
    "Food Production",
    "Horticulture",
    "Forestry",
    "Aquaculture",

    // Miscellaneous
    "Hospitality",
    "Tourism",
    "Real Estate",
    "Sports",
    "Culinary Arts",
    "Event Management",
    "Arts and Crafts",
    "Other",
  ],
  skills: [
    // Programming Languages
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "c++" },
    { label: "C#", value: "csharp" },
    { label: "Ruby", value: "ruby" },
    { label: "PHP", value: "php" },
    { label: "Go", value: "go" },
    { label: "Rust", value: "rust" },

    // Frontend Technologies
    { label: "React", value: "react" },
    { label: "Vue.js", value: "vuejs" },
    { label: "Angular", value: "angular" },
    { label: "Next.js", value: "nextjs" },
    { label: "Tailwind CSS", value: "tailwindcss" },
    { label: "Sass", value: "sass" },

    // Backend Technologies
    { label: "Node.js", value: "nodejs" },
    { label: "Express.js", value: "expressjs" },
    { label: "Django", value: "django" },
    { label: "Flask", value: "flask" },
    { label: "Spring Boot", value: "springboot" },
    { label: "ASP.NET", value: "aspnet" },

    // Databases
    { label: "SQL", value: "sql" },
    { label: "PostgreSQL", value: "postgresql" },
    { label: "MongoDB", value: "mongodb" },
    { label: "MySQL", value: "mysql" },
    { label: "SQLite", value: "sqlite" },
    { label: "Redis", value: "redis" },

    // DevOps & Tools
    { label: "Git", value: "git" },
    { label: "Docker", value: "docker" },
    { label: "Kubernetes", value: "kubernetes" },
    { label: "AWS", value: "aws" },
    { label: "Azure", value: "azure" },
    { label: "Google Cloud", value: "gcloud" },
    { label: "Terraform", value: "terraform" },
    { label: "Jenkins", value: "jenkins" },

    // Testing Frameworks
    { label: "Jest", value: "jest" },
    { label: "Mocha", value: "mocha" },
    { label: "Cypress", value: "cypress" },
    { label: "Selenium", value: "selenium" },

    // Data Science & Machine Learning
    { label: "TensorFlow", value: "tensorflow" },
    { label: "PyTorch", value: "pytorch" },
    { label: "Pandas", value: "pandas" },
    { label: "NumPy", value: "numpy" },
    { label: "Matplotlib", value: "matplotlib" },
    { label: "scikit-learn", value: "scikit-learn" },

    // Mobile Development
    { label: "React Native", value: "reactnative" },
    { label: "Flutter", value: "flutter" },
    { label: "Swift", value: "swift" },
    { label: "Kotlin", value: "kotlin" },

    // Healthcare & Pharmaceuticals
    { label: "Patient Counseling", value: "patient_counseling" },
    { label: "Drug Interactions", value: "drug_interactions" },
    { label: "Prescription Management", value: "prescription_management" },
    { label: "FDA Compliance", value: "fda_compliance" },
    { label: "Pharmacy Software", value: "pharmacy_software" },

    // Operations & Management
    { label: "Process Improvement", value: "process_improvement" },
    { label: "Lean Six Sigma", value: "lean_six_sigma" },
    { label: "Cost Optimization", value: "cost_optimization" },
    { label: "ERP Systems", value: "erp_systems" },
    { label: "Team Leadership", value: "team_leadership" },
    { label: "Strategic Planning", value: "strategic_planning" },
    { label: "Supply Chain Management", value: "supply_chain_management" },
    { label: "Inventory Management", value: "inventory_management" },
    { label: "Change Management", value: "change_management" },
    { label: "Project Management", value: "project_management" },

    // Law & Legal Services
    { label: "Contract Drafting", value: "contract_drafting" },
    { label: "Legal Research", value: "legal_research" },
    { label: "Litigation", value: "litigation" },
    { label: "Compliance Management", value: "compliance_management" },
    { label: "Regulatory Compliance", value: "regulatory_compliance" },
    { label: "Corporate Law", value: "corporate_law" },
    { label: "Intellectual Property", value: "intellectual_property" },
    { label: "Dispute Resolution", value: "dispute_resolution" },
    { label: "Labor Law", value: "labor_law" },
    { label: "Legal Writing", value: "legal_writing" },

    // Other Skills
    { label: "GraphQL", value: "graphql" },
    { label: "REST APIs", value: "restapis" },
    { label: "WebSockets", value: "websockets" },
    { label: "CI/CD Pipelines", value: "cicd" },

    // Programming Languages (additional)
    { label: "Perl", value: "perl" },
    { label: "Scala", value: "scala" },
    { label: "Shell Scripting", value: "shell_scripting" },

    // Frontend Technologies (additional)
    { label: "Bootstrap", value: "bootstrap" },
    { label: "Ember.js", value: "emberjs" },
    { label: "Svelte", value: "svelte" },

    // Backend Technologies (additional)
    { label: "Ruby on Rails", value: "rubyonrails" },
    { label: "Laravel", value: "laravel" },
    { label: "Phoenix Framework", value: "phoenix_framework" },

    // Databases (additional)
    { label: "Cassandra", value: "cassandra" },
    { label: "MariaDB", value: "mariadb" },
    { label: "Neo4j", value: "neo4j" },

    // DevOps & Tools (additional)
    { label: "Ansible", value: "ansible" },
    { label: "Puppet", value: "puppet" },
    { label: "Vagrant", value: "vagrant" },
    { label: "Nagios", value: "nagios" },
    { label: "Prometheus", value: "prometheus" },
    { label: "Grafana", value: "grafana" },

    // Testing Frameworks (additional)
    { label: "TestNG", value: "testng" },
    { label: "Appium", value: "appium" },
    { label: "JUnit", value: "junit" },

    // Data Science & Machine Learning (additional)
    { label: "Hadoop", value: "hadoop" },
    { label: "Spark", value: "spark" },
    { label: "R Programming", value: "r_programming" },
    { label: "D3.js", value: "d3js" },

    // Mobile Development (additional)
    { label: "Objective-C", value: "objective_c" },
    { label: "Ionic", value: "ionic" },
    { label: "Xamarin", value: "xamarin" },

    // Healthcare & Pharmaceuticals (additional)
    {
      label: "Clinical Trials Management",
      value: "clinical_trials_management",
    },
    { label: "Pharmacovigilance", value: "pharmacovigilance" },
    { label: "Healthcare Analytics", value: "healthcare_analytics" },

    // Operations & Management (additional)
    {
      label: "Business Process Improvement",
      value: "business_process_improvement",
    },
    { label: "Risk Management", value: "risk_management" },
    { label: "Logistics Management", value: "logistics_management" },
    { label: "Vendor Management", value: "vendor_management" },
    { label: "Performance Metrics", value: "performance_metrics" },

    // Law & Legal Services (additional)
    { label: "E-Discovery", value: "e_discovery" },
    { label: "Mergers and Acquisitions", value: "mergers_acquisitions" },
    { label: "Contract Negotiation", value: "contract_negotiation" },
    { label: "Due Diligence", value: "due_diligence" },
    { label: "Case Management", value: "case_management" },

    // Marketing & Sales
    { label: "Search Engine Optimization (SEO)", value: "seo" },
    { label: "Pay-Per-Click (PPC) Advertising", value: "ppc" },
    { label: "Content Marketing", value: "content_marketing" },
    { label: "Social Media Marketing", value: "social_media_marketing" },
    { label: "Email Marketing", value: "email_marketing" },
    { label: "Market Research", value: "market_research" },
    { label: "CRM Management", value: "crm_management" },

    // Finance & Accounting
    { label: "Financial Modeling", value: "financial_modeling" },
    { label: "Budget Management", value: "budget_management" },
    { label: "Taxation", value: "taxation" },
    { label: "Auditing", value: "auditing" },
    { label: "Investment Analysis", value: "investment_analysis" },

    // Design & Creative
    { label: "Adobe Photoshop", value: "adobe_photoshop" },
    { label: "Adobe Illustrator", value: "adobe_illustrator" },
    { label: "Figma", value: "figma" },
    { label: "Sketch", value: "sketch" },
    { label: "UI/UX Design", value: "ui_ux_design" },
    { label: "Video Editing", value: "video_editing" },

    // Soft Skills
    { label: "Team Collaboration", value: "team_collaboration" },
    { label: "Conflict Resolution", value: "conflict_resolution" },
    { label: "Critical Thinking", value: "critical_thinking" },
    { label: "Time Management", value: "time_management" },
    { label: "Leadership", value: "leadership" },
    { label: "Emotional Intelligence", value: "emotional_intelligence" },

    // Other Technical Skills
    { label: "Blockchain Development", value: "blockchain_development" },
    { label: "IoT (Internet of Things)", value: "iot" },
    { label: "Robotic Process Automation (RPA)", value: "rpa" },
    { label: "AR/VR Development", value: "ar_vr_development" },
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
