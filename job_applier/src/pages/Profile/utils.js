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

export const countries = ["India", "USA", "UK", "Canada", "Australia"];
export const phonePrefixes = ["+1", "+91", "+44", "+61"];
export const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
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

  // Other Skills
  { label: "GraphQL", value: "graphql" },
  { label: "REST APIs", value: "restapis" },
  { label: "WebSockets", value: "websockets" },
  { label: "CI/CD Pipelines", value: "cicd" },
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
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Psychology",
  "Biology",
  "Physics",
  "Mathematics",
  "Law",
  "Economics",
  "Medicine",
  // Add other options as needed
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
