export const initialFormValue = {
  personalInfo: {
    fullName: "",
    dateOfBirth: new Date(),
    country: "India",
    city: "",
    address: "",
    phonePrefix: "+91",
    phoneNumber: "",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
  },
  educationDetails: [
    {
      degree: "",
      university: "",
      gpa: "",
      graduationYear: new Date(),
      fieldOfStudy: "",
      //   courses: [{ name: "", grade: "" }],
    },
  ],
  experienceDetails: [
    {
      position: "",
      company: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      industry: "",
      responsibilities: [""],
      skillsAcquired: [],
    },
  ],
  projects: [{ name: "", description: "", link: "" }],
  achievements: [{ title: "", description: "" }],
  certifications: [{ name: "", organization: "", year: null }],
  languages: [{ language: "", proficiency: "" }],
  interests: [],
  availability: { noticePeriod: "" },
  salaryExpectations: { min: 0, max: 0 },
  selfIdentification: {
    gender: "",
    pronouns: "",
    veteranStatus: "",
    disabilityStatus: "",
    ethnicity: "",
  },
  legalAuthorization: {
    euWorkAuthorization: false,
    usWorkAuthorization: false,
    requiresUsVisa: false,
    requiresEuVisa: false,
    legallyAllowedEu: false,
    legallyAllowedUs: false,
    requiresEuSponsorship: false,
    requiresUsSponsorship: false,
  },
  workPreferences: {
    remoteWork: false,
    inPersonWork: false,
    openToRelocation: false,
    willingToCompleteAssessments: false,
    willingToUndergoTests: false,
    willingToUndergoChecks: false,
  },
};

export const transformToCamelCase = (input) => {
  const transformFullName = (name, surname) =>
    `${name || ""} ${surname || ""}`.trim();

  return {
    personalInfo: {
      fullName: transformFullName(
        input.personal_information?.name,
        input.personal_information?.surname
      ),
      dateOfBirth: input.personal_information?.date_of_birth
        ? new Date(input.personal_information.date_of_birth)
        : null,
      country: input.personal_information?.country || "",
      city: input.personal_information?.city || "",
      address: input.personal_information?.address || "",
      phonePrefix: input.personal_information?.phonePrefix || "",
      phoneNumber: input.personal_information?.phoneNumber || "",
      email: input.personal_information?.email || "",
      githubUrl: input.personal_information?.github || "",
      linkedinUrl: input.personal_information?.linkedin || "",
    },
    educationDetails:
      input.education_details?.map((edu) => ({
        degree: edu.degree || "",
        university: edu.university || "",
        gpa: edu.gpa || "",
        graduationYear: edu.graduation_year
          ? new Date(edu.graduation_year)
          : null,
        fieldOfStudy: edu.field_of_study || "",
      })) || [],
    experienceDetails:
      input.experience_details?.map((exp) => ({
        position: exp.position || "",
        company: exp.company || "",
        startDate: exp.startDate ? new Date(exp.startDate) : null,
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        location: exp.location || "",
        industry: exp.industry || "",
        responsibilities: exp.key_responsibilities || [],
        skillsAcquired: exp.skills_acquired || [],
      })) || [],
    projects:
      input.projects?.map((project) => ({
        name: project.name || "",
        description: project.description || "",
        link: project.link || "",
      })) || [],
    achievements:
      input.achievements?.map((achievement) => ({
        title: achievement.name || "",
        description: achievement.description || "",
      })) || [],
    certifications:
      input.certifications?.map((cert) => ({
        name: cert.name || "",
        organization: cert.organization || "",
        year: cert.year || null,
      })) || [],
    languages:
      input.languages?.map((lang) => ({
        language: lang.language || "",
        proficiency: lang.proficiency || "",
      })) || [],
    interests: input.interests || [],
    availability: { noticePeriod: input.availability?.noticePeriod || "" },
    salaryExpectations: {
      min: input.salary_expectations?.min || 0,
      max: input.salary_expectations?.max || 0,
    },
    selfIdentification: {
      gender: input.self_identification?.gender || "",
      pronouns: input.self_identification?.pronouns || "",
      veteranStatus: input.self_identification?.veteranStatus || "",
      disabilityStatus: input.self_identification?.disabilityStatus || "",
      ethnicity: input.self_identification?.ethnicity || "",
    },
    legalAuthorization: {
      euWorkAuthorization:
        input.legal_authorization?.euWorkAuthorization || false,
      usWorkAuthorization:
        input.legal_authorization?.usWorkAuthorization || false,
      requiresUsVisa: input.legal_authorization?.requiresUsVisa || false,
      requiresEuVisa: input.legal_authorization?.requiresEuVisa || false,
      legallyAllowedEu: input.legal_authorization?.legallyAllowedEu || false,
      legallyAllowedUs: input.legal_authorization?.legallyAllowedUs || false,
      requiresEuSponsorship:
        input.legal_authorization?.requiresEuSponsorship || false,
      requiresUsSponsorship:
        input.legal_authorization?.requiresUsSponsorship || false,
    },
    workPreferences: {
      remoteWork: input.work_preferences?.remoteWork || false,
      inPersonWork: input.work_preferences?.inPersonWork || false,
      openToRelocation: input.work_preferences?.openToRelocation || false,
      willingToCompleteAssessments:
        input.work_preferences?.willingToCompleteAssessments || false,
      willingToUndergoTests:
        input.work_preferences?.willingToUndergoTests || false,
      willingToUndergoChecks:
        input.work_preferences?.willingToUndergoChecks || false,
    },
  };
};

export const transformToSnakeCase = (input) => {
  const transformFullName = (fullName) => {
    const parts = fullName.trim().split(" ");
    return {
      name: parts[0] || "",
      surname: parts[1] || "",
    };
  };

  return {
    personal_information: {
      ...transformFullName(input.personalInfo.fullName),
      date_of_birth: input.personalInfo.dateOfBirth,
      country: input.personalInfo.country,
      city: input.personalInfo.city,
      address: input.personalInfo.address,
      phonePrefix: input.personalInfo.phonePrefix,
      phoneNumber: input.personalInfo.phoneNumber,
      email: input.personalInfo.email,
      github: input.personalInfo.githubUrl,
      linkedin: input.personalInfo.linkedinUrl,
    },
    education_details: input.educationDetails.map((edu) => ({
      degree: edu.degree,
      university: edu.university,
      gpa: edu.gpa,
      graduation_year: edu.graduationYear,
      field_of_study: edu.fieldOfStudy,
    })),
    experience_details: input.experienceDetails.map((exp) => ({
      position: exp.position,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      location: exp.location,
      industry: exp.industry,
      key_responsibilities: exp.responsibilities,
      skills_acquired: exp.skillsAcquired,
    })),
    projects: input.projects.map((project) => ({
      name: project.name,
      description: project.description,
      link: project.link,
    })),
    achievements: input.achievements.map((achievement) => ({
      name: achievement.title, // Note the mapping from `title` to `name`
      description: achievement.description,
    })),
    certifications: input.certifications.map((certification) => ({
      name: certification.name,
      organization: certification.organization,
      year: certification.year,
    })),
    languages: input.languages.map((lang) => ({
      language: lang.language,
      proficiency: lang.proficiency,
    })),
    interests: input.interests, // No transformation needed
  };
};

export const hasErrors = (errors) => {
  // Base case: if the input is null, undefined, or an empty object/array
  if (
    !errors ||
    (Array.isArray(errors) && errors.length === 0) ||
    (typeof errors === "object" && Object.keys(errors).length === 0)
  ) {
    return false;
  }

  // If the input is an array, recursively check each element
  if (Array.isArray(errors)) {
    return errors.some((item) => hasErrors(item));
  }

  // If the input is an object, check if any key has a non-empty value
  if (typeof errors === "object") {
    return Object.values(errors).some((value) => {
      // Recursively check nested objects or arrays
      if (typeof value === "object") {
        return hasErrors(value);
      }
      // Check for non-empty strings or valid data
      return value !== null && value !== undefined && value !== "";
    });
  }

  // If none of the above, return false (handles unexpected types)
  return false;
};

export const countries = [
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
];

export const phonePrefixes = [
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
];
export const industries = [
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
];
export const skills = [
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
  { label: "Clinical Trials Management", value: "clinical_trials_management" },
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
];
export const languages = ["English", "Spanish", "French", "German", "Chinese"];
export const proficiencies = [
  "Beginner",
  "Intermediate",
  "Professional",
  "Fluent",
];
export const interests = [
  "Software Development",
  "AI",
  "Machine Learning",
  "Data Science",
  "Web Development",
];
export const genders = ["Male", "Female", "Non-Binary", "Prefer not to say"];
export const veteranStatuses = ["Yes", "No", "Prefer not to say"];

export const fieldOfStudyOptions = [
  // Technology and Engineering
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Robotics",
  "Data Science",
  "Artificial Intelligence",
  "Information Technology",
  "Cybersecurity",
  "Network Engineering",

  // Business and Management
  "Business Administration",
  "Finance",
  "Marketing",
  "Accounting",
  "Human Resources Management",
  "Entrepreneurship",
  "Supply Chain Management",
  "Operations Management",
  "Project Management",
  "International Business",
  "Economics",

  // Social Sciences and Humanities
  "Psychology",
  "Sociology",
  "Political Science",
  "Anthropology",
  "History",
  "Philosophy",
  "Cultural Studies",
  "Linguistics",
  "International Relations",
  "Public Administration",

  // Natural Sciences
  "Biology",
  "Physics",
  "Chemistry",
  "Environmental Science",
  "Geology",
  "Astronomy",
  "Oceanography",
  "Zoology",
  "Botany",
  "Biotechnology",
  "Ecology",

  // Mathematics and Statistics
  "Mathematics",
  "Statistics",
  "Applied Mathematics",
  "Actuarial Science",

  // Healthcare and Medicine
  "Medicine",
  "Pharmacy",
  "Nursing",
  "Public Health",
  "Veterinary Medicine",
  "Physiotherapy",
  "Nutrition and Dietetics",
  "Healthcare Management",
  "Dentistry",
  "Optometry",

  // Arts and Design
  "Fine Arts",
  "Graphic Design",
  "Interior Design",
  "Industrial Design",
  "Fashion Design",
  "Performing Arts",
  "Film Studies",
  "Music",
  "Architecture",

  // Law and Legal Studies
  "Law",
  "Criminology",
  "Forensic Science",
  "Legal Studies",
  "International Law",

  // Education
  "Education",
  "Curriculum and Instruction",
  "Educational Technology",
  "Special Education",
  "Educational Leadership",

  // Environmental and Agricultural Studies
  "Environmental Engineering",
  "Agriculture",
  "Horticulture",
  "Forestry",
  "Fisheries Science",
  "Sustainable Development",
  "Wildlife Conservation",

  // Media and Communication
  "Journalism",
  "Mass Communication",
  "Public Relations",
  "Digital Media",
  "Advertising",

  // Miscellaneous
  "Liberal Arts",
  "Sports Science",
  "Hospitality Management",
  "Tourism and Travel Management",
  "Event Management",
  "Culinary Arts",
];

// const resumeData = {
//   personal_information: {
//     name: "John",
//     surname: "Doe",
//     date_of_birth: "1990-01-01",
//     country: "USA",
//     city: "New York",
//     address: "123 Main St",
//     phonePrefix: "+1",
//     phoneNumber: "1234567890",
//     email: "john.doe@example.com",
//     github: "https://github.com/johndoe",
//     linkedin: "https://www.linkedin.com/in/johndoe/",
//   },
//   education_details: [
//     {
//       degree: "Bachelor of Science in Computer Science",
//       university: "University of California",
//       gpa: "3.8/4.0",
//       graduation_year: "2012",
//       field_of_study: "Computer Science",
//     },
//   ],
//   experienceDetails: [
//     {
//       position: "Software Engineer",
//       company: "Tech Solutions Inc.",
//       startDate: "2018-01-01",
//       endDate: "2022-01-01",
//       location: "New York, NY",
//       industry: "Technology",
//       key_responsibilities: [
//         "Developed web applications",
//         "Mentored team members",
//       ],
//       skills_acquired: ["React", "Node.js", "MongoDB"],
//     },
//   ],
//   projects: [
//     {
//       name: "E-commerce Platform",
//       description: "A full-stack e-commerce solution",
//       link: "https://github.com/johndoe/ecommerce-platform",
//     },
//   ],
//   achievements: [
//     {
//       name: "Best Developer Award",
//       description: "Awarded for outstanding contributions to the team",
//     },
//   ],
//   certifications: [
//     {
//       name: "AWS Certified Developer",
//       organization: "AWS",
//       year: "2020",
//     },
//   ],
//   languages: [
//     {
//       language: "English",
//       proficiency: "Native",
//     },
//   ],
//   interests: ["Programming", "AI", "Traveling"],
// };
