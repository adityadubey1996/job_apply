import React, { useEffect, useState } from "react";
import { Plus, Check, Info, Minus } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a spinner component
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LabelWrapper from "./label";
import MultiSelect from "./MultiSelect";
import axios from "axios";

import {
  fieldOfStudyOptions,
  veteranStatuses,
  genders,
  interests,
  proficiencies,
  languages,
  initialFormValue,
  transformToSnakeCase,
  countries,
  phonePrefixes,
  industries,
  skills,
  transformToCamelCase,
} from "../utils";
import { postResumeData as postResumeApi } from "../../../api/api";
import { useToast } from "@/hooks/use-toast";

export default function ResumeForm({ profileData }) {
  const { toast } = useToast();
  const { register, control, getValues, setValue } = useForm({});
  const [isLoading, setLoading] = useState(false);

  const [formValues, setFormValues] = profileData
    ? useState(transformToCamelCase(profileData))
    : useState(initialFormValue);
  console.log("formValues", formValues);
  const [experienceErrors, setExperienceErrors] = useState(
    initialFormValue.experienceDetails.map(() => ({})) // Initialize empty error objects for each entry
  );
  const [personalInfoErrors, setPersonalInfoErrors] = useState({});
  const [educationErrors, setEducationErrors] = useState([]);
  const [projectErrors, setProjectErrors] = useState([]);
  const [achievementErrors, setAchievementErrors] = useState([]);
  const [certificationErrors, setCertificationErrors] = useState([]);
  const [languageErrors, setLanguageErrors] = useState([]);
  const [interestsError, setInterestsError] = useState("");
  const [errors, setErrors] = useState({});

  const postResumeData = async (resumeData) => {
    try {
      setLoading(true);
      const result = await postResumeApi(resumeData);
      console.log("resule", result);

      if (result) {
        toast({
          title: "Resume Submitted",
          description: "Your resume has been successfully submitted.",
          variant: "success",
        });
        console.log("Resume submission successful:", result);
      } else {
        toast({
          title: "Submission Failed",
          description: "We encountered an issue while submitting your resume.",
          variant: "destructive",
        });
        console.error("Failed to submit resume.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      console.error("Error in resume submission:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle value changes for experience fields
  const handleExperienceChange = (index, field, value) => {
    let formValues = {};
    setFormValues((prevValues) => {
      const updatedExperience = [...prevValues.experienceDetails];
      // Handle regular field updates
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };
      formValues = { ...prevValues, experienceDetails: updatedExperience };
      return { ...prevValues, experienceDetails: updatedExperience };
    });

    // Validate the updated entry
    validateExperienceFields(index, formValues);
  };

  // Add responsibility
  const appendResponsibility = (index, newResponsibility) => {
    setFormValues((prevValues) => {
      const updatedExperience = [...prevValues.experienceDetails];
      updatedExperience[index].responsibilities = [
        ...updatedExperience[index].responsibilities,
        newResponsibility,
      ];
      return { ...prevValues, experienceDetails: updatedExperience };
    });

    validateExperienceFields(index);
  };

  // Remove responsibility
  const removeResponsibility = (index, respIndex) => {
    let currentValue = {};
    setFormValues((prevValues) => {
      const updatedExperience = [...prevValues.experienceDetails];
      updatedExperience[index].responsibilities = updatedExperience[
        index
      ].responsibilities.filter((_, i) => i !== respIndex);
      currentValue = { ...prevValues, experienceDetails: updatedExperience };
      return { ...prevValues, experienceDetails: updatedExperience };
    });

    validateExperienceFields(index, currentValue);
  };

  // Add new experience entry
  const appendExperience = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      experienceDetails: [
        ...prevValues.experienceDetails,
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
    }));
  };

  // Remove experience entry
  const removeExperience = (index) => {
    setFormValues((prevValues) => {
      const updatedExperience = [...prevValues.experienceDetails];
      updatedExperience.splice(index, 1);
      return { ...prevValues, experienceDetails: updatedExperience };
    });
  };

  // Validate individual experience entry
  const validateExperienceFields = (index, currentValue) => {
    const newErrors = [...experienceErrors];
    const experience = currentValue
      ? currentValue.experienceDetails[index]
      : formValues.experienceDetails[index];

    newErrors[index] = {}; // Initialize or reset errors for this entry
    let isValid = true;

    if (!experience.position || experience.position.trim() === "") {
      newErrors[index].position = "Position is required";
      isValid = false;
    }
    if (!experience.company || experience.company.trim() === "") {
      newErrors[index].company = "Company is required";
      isValid = false;
    }
    if (!experience.startDate) {
      newErrors[index].startDate = "Start date is required";
      isValid = false;
    }
    if (!experience.endDate) {
      newErrors[index].endDate = "End date is required";
      isValid = false;
    }
    if (experience.startDate && experience.endDate) {
      const startDate = new Date(experience.startDate);
      const endDate = new Date(experience.endDate);
      if (startDate > endDate) {
        newErrors[index].startDate = "Start date must be before the end date";
        newErrors[index].endDate = "End date must be after the start date";
        isValid = false;
      }
    }
    if (!experience.location || experience.location.trim() === "") {
      newErrors[index].location = "Location is required";
      isValid = false;
    }
    if (!experience.industry || experience.industry.trim() === "") {
      newErrors[index].industry = "Industry is required";
      isValid = false;
    }
    if (
      experience.responsibilities.length === 0 ||
      experience.responsibilities.some((resp) => !resp.trim())
    ) {
      newErrors[index].responsibilities =
        "At least one responsibility is required";
      isValid = false;
    }
    if (!experience.skillsAcquired || experience.skillsAcquired.length === 0) {
      newErrors[index].skillsAcquired = "At least one skill is required";
      isValid = false;
    }

    setExperienceErrors(newErrors);
    return isValid;
  };

  // Validate all experience entries
  const validateAllExperienceFields = () => {
    let isValid = true;
    formValues.experienceDetails.forEach((_, index) => {
      if (!validateExperienceFields(index)) isValid = false;
    });
    return isValid;
  };

  const handleEducationChange = (index, field, value) => {
    setFormValues((prevValues) => {
      const updatedEducation = [...prevValues.educationDetails];

      // Ensure the current education item is a cloned object
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };

      return { ...prevValues, educationDetails: updatedEducation };
    });

    validateEducationField(index, field, value);
  };

  const validateEducationField = (index, field, value) => {
    let error = "";

    if (field === "degree" && (!value || value.trim() === "")) {
      error = "Degree is required";
    } else if (field === "university" && (!value || value.trim() === "")) {
      error = "University is required";
    } else if (field === "gpa") {
      if (value === "" || isNaN(value) || value < 0 || value > 4) {
        error = "GPA must be a number between 0 and 4";
      }
    } else if (field === "graduationYear" && !value) {
      error = "Graduation Year is required";
    } else if (field === "fieldOfStudy" && (!value || value.trim() === "")) {
      error = "Field of Study is required";
    }

    setEducationErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors[index] = {
        ...updatedErrors[index],
        [field]: error, // Set or clear the error for the specific field
      };
      return updatedErrors;
    });
  };
  // Validation function for personalInfo fields
  const validatePersonalInfoFields = () => {
    const newErrors = {};
    let isValid = true;

    // Validation rules for personalInfo
    if (
      !formValues.personalInfo.fullName ||
      formValues.personalInfo.fullName.trim() === ""
    ) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    }

    if (
      !formValues.personalInfo.city ||
      formValues.personalInfo.city.trim() === ""
    ) {
      newErrors.city = "City is required";
      isValid = false;
    }

    if (
      !formValues.personalInfo.address ||
      formValues.personalInfo.address.trim() === ""
    ) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (
      !formValues.personalInfo.phoneNumber ||
      formValues.personalInfo.phoneNumber.trim() === ""
    ) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formValues.personalInfo.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
      isValid = false;
    }

    if (
      !formValues.personalInfo.country ||
      formValues.personalInfo.country.trim() === ""
    ) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    if (
      !formValues.personalInfo.phonePrefix ||
      formValues.personalInfo.phonePrefix.trim() === ""
    ) {
      newErrors.phonePrefix = "Phone Prefix is required";
      isValid = false;
    }

    if (
      !formValues.personalInfo.email ||
      formValues.personalInfo.email.trim() === ""
    ) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.personalInfo.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!formValues.personalInfo.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
      isValid = false;
    } else {
      const selectedDate = new Date(formValues.personalInfo.dateOfBirth);
      const minDate = new Date("1900-01-01");
      const maxDate = new Date();

      if (selectedDate < minDate || selectedDate > maxDate) {
        newErrors.dateOfBirth = "Date of Birth must be between 1900 and today";
        isValid = false;
      }
    }

    if (
      formValues.personalInfo.githubUrl &&
      !/^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+$/.test(
        formValues.personalInfo.githubUrl
      )
    ) {
      newErrors.githubUrl = "Invalid GitHub URL";
      isValid = false;
    }

    if (
      formValues.personalInfo.linkedinUrl &&
      !/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/.test(
        formValues.personalInfo.linkedinUrl
      )
    ) {
      newErrors.linkedinUrl = "Invalid LinkedIn URL";
      isValid = false;
    }

    setPersonalInfoErrors(newErrors); // Set the errors for personalInfo
    return isValid;
  };

  // Validation function for education fields
  const validateEducationFields = () => {
    const newErrors = formValues.educationDetails.map((education) => ({}));
    let isValid = true;

    formValues.educationDetails.forEach((education, index) => {
      if (!education.degree || education.degree.trim() === "") {
        newErrors[index].degree = "Degree is required";
        isValid = false;
      }
      if (!education.university || education.university.trim() === "") {
        newErrors[index].university = "University is required";
        isValid = false;
      }
      if (
        education.gpa === "" ||
        isNaN(education.gpa) ||
        education.gpa < 0 ||
        education.gpa > 4
      ) {
        newErrors[index].gpa = "GPA must be a number between 0 and 4";
        isValid = false;
      }
      if (!education.graduationYear) {
        newErrors[index].graduationYear = "Graduation Year is required";
        isValid = false;
      }
      if (!education.fieldOfStudy || education.fieldOfStudy.trim() === "") {
        newErrors[index].fieldOfStudy = "Field of Study is required";
        isValid = false;
      }
    });

    setEducationErrors(newErrors); // Set the errors for all entries
    return isValid;
  };

  const validatePersonalInfoField = (fieldPath, value) => {
    let error = "";

    const validationRules = {
      fullName: {
        required: "Full Name is required",
        pattern: null,
      },
      city: {
        required: "City is required",
        pattern: null,
      },
      address: {
        required: "Address is required",
        pattern: null,
      },
      phoneNumber: {
        required: "Phone number is required",
        pattern: /^\d{10}$/,
        errorMsg: "Invalid phone number",
      },
      country: {
        required: "Country is required",
        errorMsg: "Invalid Country",
      },
      phonePrefix: {
        required: "Phone Prefix is required",
        errorMsg: "Invalid phone prefix",
      },
      email: {
        required: "Email is required",
        pattern: /\S+@\S+\.\S+/,
        errorMsg: "Invalid email address",
      },
      dateOfBirth: {
        required: "Date of Birth is required",
        validate: (date) => {
          const selectedDate = new Date(date);
          const minDate = new Date("1900-01-01");
          const maxDate = new Date();

          if (!date) return "Date of Birth is required";
          if (selectedDate < minDate || selectedDate > maxDate) {
            return "Date of Birth must be between 1900 and today";
          }
          return null; // No error
        },
      },
      githubUrl: {
        pattern: /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+$/,
        errorMsg: "Invalid GitHub URL",
      },
      linkedinUrl: {
        pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
        errorMsg: "Invalid LinkedIn URL",
      },
    };

    const rule = validationRules[fieldPath];

    if (rule) {
      if (rule.validate) {
        error = rule.validate(value) || ""; // Run custom validation
      } else if (rule.pattern && !rule.pattern.test(value)) {
        error = rule.errorMsg || "Invalid format";
      } else if (rule.required && (!value || !value.trim())) {
        error = rule.required;
      }
    }

    setPersonalInfoErrors((prevErrors) => ({
      ...prevErrors,
      [fieldPath]: error,
    }));

    return error;
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      personalInfo: {
        ...prevValues.personalInfo,
        [field]: value,
      },
    }));

    validatePersonalInfoField(field, value); // Validate the specific field
  };
  const validateForm = () => {
    let isValid = true;

    // Validate Personal Info
    if (!validatePersonalInfoFields()) {
      isValid = false;
    }

    // Validate Education Details
    if (!validateEducationFields()) {
      isValid = false;
    }

    // Validate Experience Details
    if (!validateAllExperienceFields()) {
      isValid = false;
    }

    // Validate Projects
    if (!validateAllProjectFields()) {
      isValid = false;
    }

    // Validate Achievements
    if (!validateAllAchievementFields()) {
      isValid = false;
    }

    // Validate Certifications
    if (!validateAllCertificationFields()) {
      isValid = false;
    }

    // Validate Languages
    formValues.languages.forEach((_, index) => {
      if (!validateLanguageFields(index)) {
        isValid = false;
      }
    });

    // Validate Interests
    if (!validateInterests(formValues.interests)) {
      isValid = false;
    }

    return isValid;
  };

  console.log("personalInfoErrors", personalInfoErrors);
  console.log("educationErrors", educationErrors);
  console.log("experienceErrors", experienceErrors);
  console.log("projectErrors", projectErrors);
  console.log("achievementErrors", achievementErrors);

  console.log("interestsError", interestsError);
  console.log("certificationErrors", certificationErrors);
  console.log("languageErrors", languageErrors);
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("testing", event);

    const isValid = validateForm(); // Validate all fields
    if (isValid) {
      // Process form submission
      console.log("Form submitted:", formValues);
      const obj = transformToSnakeCase(formValues);
      console.log("obj", obj);
      await postResumeData(obj);
    } else {
      console.log("Form has errors:", errors);
    }
  };
  // Add and remove education functions
  const addEducation = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      educationDetails: [
        ...prevValues.educationDetails,
        {
          degree: "",
          university: "",
          gpa: "",
          graduationYear: new Date(),
          fieldOfStudy: "",
          //   courses: [{ name: "", grade: "" }],
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      educationDetails: prevValues.educationDetails.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Validate individual project entry
  const validateProjectFields = (index, currentValue) => {
    const newErrors = [...projectErrors];
    const project = currentValue
      ? currentValue.projects[index]
      : formValues.projects[index];
    newErrors[index] = {}; // Initialize or reset errors for this entry
    let isValid = true;

    if (!project.name || project.name.trim() === "") {
      newErrors[index].name = "Project Name is required";
      isValid = false;
    }
    if (!project.description || project.description.trim() === "") {
      newErrors[index].description = "Description is required";
      isValid = false;
    }
    if (project.link && !/^(https?:\/\/[^\s]+)$/.test(project.link)) {
      newErrors[index].link = "Invalid URL format";
      isValid = false;
    }

    setProjectErrors(newErrors);
    return isValid;
  };

  // Validate all projects
  const validateAllProjectFields = () => {
    let isValid = true;
    formValues.projects.forEach((_, index) => {
      if (!validateProjectFields(index)) isValid = false;
    });
    return isValid;
  };

  // Handle value changes for projects
  const handleProjectChange = (index, field, value) => {
    let formValue = {};
    setFormValues((prevValues) => {
      const updatedProjects = [...prevValues.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value,
      };
      formValue = { ...prevValues, projects: updatedProjects };
      return { ...prevValues, projects: updatedProjects };
    });

    // Validate the updated entry
    validateProjectFields(index, formValue);
  };

  // Add a new project
  const appendProject = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      projects: [
        ...prevValues.projects,
        { name: "", description: "", link: "" },
      ],
    }));

    setProjectErrors((prevErrors) => [...prevErrors, {}]);
  };

  // Remove a project
  const removeProject = (index) => {
    setFormValues((prevValues) => {
      const updatedProjects = [...prevValues.projects];
      updatedProjects.splice(index, 1);
      return { ...prevValues, projects: updatedProjects };
    });

    setProjectErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors.splice(index, 1);
      return updatedErrors;
    });
  };

  // Validate individual achievement entry
  const validateAchievementFields = (index, currentValue) => {
    const newErrors = [...achievementErrors];
    const achievement = currentValue
      ? currentValue.achievements[index]
      : formValues.achievements[index];

    newErrors[index] = {}; // Initialize or reset errors for this entry
    let isValid = true;

    if (
      (achievement.title && !achievement.description) ||
      (!achievement.title && achievement.description)
    ) {
      newErrors[index].description =
        "Both Title and Description are required if one is provided.";
      newErrors[index].title =
        "Both Title and Description are required if one is provided.";
      isValid = false;
    }

    setAchievementErrors(newErrors);
    return isValid;
  };

  // Validate all achievements
  const validateAllAchievementFields = () => {
    let isValid = true;
    formValues.achievements.forEach((_, index) => {
      if (!validateAchievementFields(index)) isValid = false;
    });
    return isValid;
  };

  // Handle value changes for achievements
  const handleAchievementChange = (index, field, value) => {
    let currentValue = {};
    setFormValues((prevValues) => {
      const updatedAchievements = [...prevValues.achievements];
      updatedAchievements[index] = {
        ...updatedAchievements[index],
        [field]: value,
      };
      currentValue = { ...prevValues, achievements: updatedAchievements };
      return { ...prevValues, achievements: updatedAchievements };
    });

    // Validate the updated entry
    validateAchievementFields(index, currentValue);
  };

  // Add a new achievement
  const appendAchievement = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      achievements: [
        ...prevValues.achievements,
        { title: "", description: "" },
      ],
    }));

    setAchievementErrors((prevErrors) => [...prevErrors, {}]);
  };

  // Remove an achievement
  const removeAchievement = (index) => {
    setFormValues((prevValues) => {
      const updatedAchievements = [...prevValues.achievements];
      updatedAchievements.splice(index, 1);
      return { ...prevValues, achievements: updatedAchievements };
    });

    setAchievementErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors.splice(index, 1);
      return updatedErrors;
    });
  };

  // Validate individual certification entry
  const validateCertificationFields = (index, currentValues) => {
    const newErrors = [...certificationErrors];
    const certification = currentValues
      ? currentValues.certifications[index]
      : formValues.certifications[index];
    newErrors[index] = {}; // Initialize or reset errors for this entry
    let isValid = true;
    console.log("certification", certification);
    if (
      (certification.name &&
        (!certification.organization || !certification.year)) ||
      (certification.organization &&
        (!certification.name || !certification.year)) ||
      (certification.year &&
        (!certification.name || !certification.organization))
    ) {
      newErrors[index].name = "All fields are required if one is provided.";
      newErrors[index].organization =
        "All fields are required if one is provided.";
      newErrors[index].year = "All fields are required if one is provided.";
      isValid = false;
    }

    setCertificationErrors(newErrors);
    return isValid;
  };

  // Validate all certifications
  const validateAllCertificationFields = () => {
    let isValid = true;
    formValues.certifications.forEach((_, index) => {
      if (!validateCertificationFields(index)) isValid = false;
    });
    return isValid;
  };

  // Handle value changes for certifications
  const handleCertificationChange = (index, field, value) => {
    let currentValues = {};
    setFormValues((prevValues) => {
      const updatedCertifications = [...prevValues.certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: value,
      };
      currentValues = { ...prevValues, certifications: updatedCertifications };
      return { ...prevValues, certifications: updatedCertifications };
    });

    // Validate the updated entry
    validateCertificationFields(index, currentValues);
  };

  // Add a new certification
  const appendCertification = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      certifications: [
        ...prevValues.certifications,
        { name: "", organization: "", year: "" },
      ],
    }));

    setCertificationErrors((prevErrors) => [...prevErrors, {}]);
  };

  // Remove a certification
  const removeCertification = (index) => {
    setFormValues((prevValues) => {
      const updatedCertifications = [...prevValues.certifications];
      updatedCertifications.splice(index, 1);
      return { ...prevValues, certifications: updatedCertifications };
    });

    setCertificationErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors.splice(index, 1);
      return updatedErrors;
    });
  };

  const handleLanguageChange = (index, field, value) => {
    let currentValue = {};
    setFormValues((prevValues) => {
      const updatedLanguages = [...prevValues.languages];
      updatedLanguages[index] = {
        ...updatedLanguages[index],
        [field]: value,
      };
      currentValue = { ...prevValues, languages: updatedLanguages };
      return { ...prevValues, languages: updatedLanguages };
    });

    validateLanguageFields(index, currentValue);
  };

  const validateLanguageFields = (index, currentValue) => {
    const newErrors = [...languageErrors];
    const language = currentValue
      ? currentValue.languages[index]
      : formValues.languages[index];

    newErrors[index] = {};
    let isValid = true;

    if (
      (language.language && !language.proficiency) ||
      (!language.language && language.proficiency)
    ) {
      newErrors[index].language =
        "Both fields are required if one is provided.";
      newErrors[index].proficiency =
        "Both fields are required if one is provided.";
      isValid = false;
    }

    setLanguageErrors(newErrors);
    return isValid;
  };

  const appendLanguage = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      languages: [...prevValues.languages, { language: "", proficiency: "" }],
    }));
    setLanguageErrors((prevErrors) => [...prevErrors, {}]);
  };

  const removeLanguage = (index) => {
    setFormValues((prevValues) => {
      const updatedLanguages = [...prevValues.languages];
      updatedLanguages.splice(index, 1);
      return { ...prevValues, languages: updatedLanguages };
    });

    setLanguageErrors((prevErrors) => {
      const updatedErrors = [...prevErrors];
      updatedErrors.splice(index, 1);
      return updatedErrors;
    });
  };
  const handleInterestChange = (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      interests: value,
    }));
    validateInterests(value);
  };

  const validateInterests = (value) => {
    if (value.length === 0) {
      setInterestsError("At least one interest must be selected.");
      return false;
    }
    setInterestsError("");
    return true;
  };

  const renderTooltip = (content) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 ml-2" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <Spinner className="w-8 h-8 mb-2" />
        <p>Processing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-evenly w-full h-full max-w-screen-md max-h-screen-md h-full rounded-md overflow-auto p-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="personal-info">
          <AccordionTrigger>Personal Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <LabelWrapper
                    htmlFor={"fullName"}
                    tooltipText={"Enter your full name"}
                    label={"Full Name"}
                  />

                  <Input
                    id="fullName"
                    value={formValues.personalInfo.fullName}
                    onChange={(e) =>
                      handlePersonalInfoChange("fullName", e.target.value)
                    }
                  />
                  {personalInfoErrors.fullName && (
                    <p className="text-red-500 text-sm">
                      {personalInfoErrors.fullName}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <LabelWrapper
                      htmlFor={"dateOfBirth"}
                      tooltipText={"Date of Birth"}
                      label={"Select your date of birth"}
                    />
                  </div>
                  <Controller
                    name="personalInfo.dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            onClick={() => {
                              handlePersonalInfoChange(
                                "dateOfBirth",
                                formValues.personalInfo.dateOfBirth
                              );
                            }}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formValues.personalInfo.dateOfBirth &&
                                "text-muted-foreground"
                            )}
                          >
                            {formValues.personalInfo.dateOfBirth ? (
                              format(formValues.personalInfo.dateOfBirth, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formValues.personalInfo.dateOfBirth}
                            onSelect={(date) =>
                              handlePersonalInfoChange("dateOfBirth", date)
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {personalInfoErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm">
                      {personalInfoErrors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <LabelWrapper
                    htmlFor={"country"}
                    tooltipText={"Select your country"}
                    label={"Country"}
                  />
                  <Select
                    onValueChange={(value) =>
                      handlePersonalInfoChange("country", value)
                    }
                    value={formValues.personalInfo.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {personalInfoErrors.country && (
                    <p className="text-red-500 text-sm">
                      {personalInfoErrors.country}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <LabelWrapper
                    htmlFor={"city"}
                    tooltipText={"Enter your city"}
                    label={"City"}
                  />
                  <Input
                    id="city"
                    value={formValues.personalInfo.city}
                    onChange={(e) =>
                      handlePersonalInfoChange("city", e.target.value)
                    }
                  />
                </div>
                {personalInfoErrors.city && (
                  <p className="text-red-500 text-sm">
                    {personalInfoErrors.city}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <LabelWrapper
                  htmlFor={"address"}
                  tooltipText={"Enter your full address"}
                  label={"Address"}
                />

                <Textarea
                  id="address"
                  onChange={(e) =>
                    handlePersonalInfoChange("address", e.target.value)
                  }
                  value={formValues.personalInfo.address}
                />
                {personalInfoErrors.address && (
                  <p className="text-red-500 text-sm">
                    {personalInfoErrors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <LabelWrapper
                    htmlFor="phonePrefix"
                    tooltipText="Select your country code"
                    label="Phone Prefix"
                  />
                  <Select
                    onValueChange={(value) =>
                      handlePersonalInfoChange("phonePrefix", value)
                    }
                    value={formValues.personalInfo.phonePrefix}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      {phonePrefixes.map((prefix) => (
                        <SelectItem key={prefix} value={prefix}>
                          {prefix}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {personalInfoErrors.phonePrefix && (
                    <p className="text-red-500 text-sm">
                      {personalInfoErrors.phonePrefix}
                    </p>
                  )}
                </div>
                <div className="col-span-2 space-y-3">
                  <LabelWrapper
                    htmlFor="phoneNumber"
                    tooltipText="Enter your phone number"
                    label="Phone Number"
                  />
                  <Input
                    id="phoneNumber"
                    value={formValues.personalInfo.phoneNumber}
                    onChange={(e) =>
                      handlePersonalInfoChange("phoneNumber", e.target.value)
                    }
                  />
                  {personalInfoErrors.phoneNumber && (
                    <p className="text-red-500 text-sm">
                      {personalInfoErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <LabelWrapper
                  htmlFor="email"
                  tooltipText="Enter your email address"
                  label="Email"
                />
                <Input
                  id="email"
                  type="email"
                  value={formValues.personalInfo.email}
                  onChange={(e) =>
                    handlePersonalInfoChange("email", e.target.value)
                  }
                />
                {personalInfoErrors.email && (
                  <p className="text-red-500 text-sm">
                    {personalInfoErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <LabelWrapper
                  htmlFor="githubUrl"
                  tooltipText="Enter your GitHub profile URL"
                  label="GitHub URL"
                />
                <Input
                  id="githubUrl"
                  type="url"
                  value={formValues.personalInfo.githubUrl}
                  onChange={(e) =>
                    handlePersonalInfoChange("githubUrl", e.target.value)
                  }
                />
                {personalInfoErrors.githubUrl && (
                  <p className="text-red-500 text-sm">
                    {personalInfoErrors.githubUrl}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <LabelWrapper
                  htmlFor="linkedinUrl"
                  tooltipText="Enter your LinkedIn profile URL"
                  label="LinkedIn URL"
                />
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formValues.personalInfo.linkedinUrl}
                  onChange={(e) =>
                    handlePersonalInfoChange("linkedinUrl", e.target.value)
                  }
                />
                {personalInfoErrors.linkedinUrl && (
                  <p className="text-red-500 text-sm">
                    {personalInfoErrors.linkedinUrl}
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="education">
          <AccordionTrigger>Education Details</AccordionTrigger>
          <AccordionContent>
            {formValues.educationDetails.map((education, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`degree-${index}`}
                      tooltipText="Enter your degree title"
                      label="Degree"
                    />
                    <Input
                      id={`degree-${index}`}
                      value={education.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                    />
                    {educationErrors[index]?.degree && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].degree}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`university-${index}`}
                      tooltipText="Enter your university name"
                      label="University"
                    />
                    <Input
                      id={`university-${index}`}
                      value={education.university}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "university",
                          e.target.value
                        )
                      }
                    />
                    {educationErrors[index]?.university && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].university}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <LabelWrapper
                        htmlFor={`gpa-${index}`}
                        tooltipText="Enter your GPA"
                        label="GPA"
                      />
                      <Input
                        id={`gpa-${index}`}
                        type="number"
                        step="0.01"
                        value={education.gpa}
                        onChange={(e) =>
                          handleEducationChange(index, "gpa", e.target.value)
                        }
                      />
                      {educationErrors[index]?.gpa && (
                        <p className="text-red-500 text-sm">
                          {educationErrors[index].gpa}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <LabelWrapper
                        htmlFor={`graduationYear-${index}`}
                        tooltipText="Select your graduation year"
                        label="Graduation Year"
                      />

                      <Select
                        onValueChange={(value) =>
                          handleEducationChange(
                            index,
                            "graduationYear",
                            new Date(value, 0, 1)
                          )
                        }
                        value={
                          education.graduationYear?.getFullYear()?.toString() ||
                          ""
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select year"
                            value={education.graduationYear
                              ?.getFullYear()
                              ?.toString()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: new Date().getFullYear() - 1899 },
                            (_, i) => {
                              const year = 1900 + i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>
                      {educationErrors[index]?.graduationYear && (
                        <p className="text-red-500 text-sm">
                          {educationErrors[index].graduationYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`fieldOfStudy-${index}`}
                      tooltipText="Enter your field of study"
                      label="Field of Study"
                    />
                    <Select
                      onValueChange={(value) =>
                        handleEducationChange(index, "fieldOfStudy", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field of study" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOfStudyOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {educationErrors[index]?.fieldOfStudy && (
                      <p className="text-red-500 text-sm">
                        {educationErrors[index].fieldOfStudy}
                      </p>
                    )}
                  </div>

                  {formValues.educationDetails.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeEducation(index)}
                    >
                      <Minus className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" onClick={addEducation}>
              <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="experience">
          <AccordionTrigger>Experience Details</AccordionTrigger>
          <AccordionContent>
            {formValues.experienceDetails.map((experience, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`position-${index}`}
                      tooltipText={"Enter your job position"}
                      label={"Position"}
                    />
                    <Input
                      id={`position-${index}`}
                      value={experience.position}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "position",
                          e.target.value
                        )
                      }
                    />
                    {experienceErrors[index]?.position && (
                      <p className="text-red-500 text-sm">
                        {experienceErrors[index].position}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`company-${index}`}
                      tooltipText={"Enter the company name"}
                      label={"Company"}
                    />
                    <Input
                      id={`company-${index}`}
                      value={experience.company}
                      onChange={(e) =>
                        handleExperienceChange(index, "company", e.target.value)
                      }
                    />
                    {experienceErrors[index]?.company && (
                      <p className="text-red-500 text-sm">
                        {experienceErrors[index].company}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <LabelWrapper
                        htmlFor={`startDate-${index}`}
                        tooltipText={"Select the start date of your employment"}
                        label={"Start Date"}
                      />
                      <Controller
                        name={`experienceDetails.${index}.startDate`}
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !experience.startDate &&
                                    "text-muted-foreground"
                                )}
                              >
                                {experience.startDate ? (
                                  format(experience.startDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={experience.startDate}
                                onSelect={(date) =>
                                  handleExperienceChange(
                                    index,
                                    "startDate",
                                    date
                                  )
                                }
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />

                      {experienceErrors[index]?.startDate && (
                        <p className="text-red-500 text-sm">
                          {experienceErrors[index].startDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <LabelWrapper
                        htmlFor={`endDate-${index}`}
                        tooltipText={"Select the end date of your employment"}
                        label={"End Date"}
                      />
                      <Controller
                        name={`experienceDetails.${index}.startDate`}
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !experience.endDate && "text-muted-foreground"
                                )}
                              >
                                {experience.endDate ? (
                                  format(experience.endDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={experience.endDate}
                                onSelect={(date) =>
                                  handleExperienceChange(index, "endDate", date)
                                }
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      {experienceErrors[index]?.endDate && (
                        <p className="text-red-500 text-sm">
                          {experienceErrors[index].endDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`location-${index}`}
                      tooltipText={"Enter the job location"}
                      label={"Location"}
                    />
                    <Input
                      id={`location-${index}`}
                      value={experience.location}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "location",
                          e.target.value
                        )
                      }
                    />
                    {experienceErrors[index]?.location && (
                      <p className="text-red-500 text-sm">
                        {experienceErrors[index].location}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`industry-${index}`}
                      tooltipText={"Select the industry"}
                      label={"Industry"}
                    />
                    <Select
                      onValueChange={(value) =>
                        handleExperienceChange(index, "industry", value)
                      }
                      value={experience.industry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {experienceErrors[index]?.industry && (
                      <p className="text-red-500 text-sm">
                        {experienceErrors[index].industry}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`responsibilities-${index}`}
                      tooltipText={"Enter your key responsibilities"}
                      label={"Key Responsibilities"}
                    />
                    {formValues.experienceDetails[index].responsibilities.map(
                      (responsibility, respIndex) => (
                        <div
                          key={respIndex}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={responsibility}
                            onChange={(e) => {
                              const updatedResponsibilities = [
                                ...formValues.experienceDetails[index]
                                  .responsibilities,
                              ];
                              updatedResponsibilities[respIndex] =
                                e.target.value;
                              handleExperienceChange(
                                index,
                                "responsibilities",
                                updatedResponsibilities
                              );
                            }}
                          />
                          {formValues.experienceDetails[index].responsibilities
                            .length > 1 && (
                            <Button
                              onClick={() =>
                                removeResponsibility(index, respIndex)
                              }
                              className="bg-red-500 text-white p-1 rounded"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      )
                    )}
                    <Button onClick={() => appendResponsibility(index, "")}>
                      Add Responsibility
                    </Button>
                    {experienceErrors[index]?.responsibilities && (
                      <p className="text-red-500 text-sm">
                        {experienceErrors[index].responsibilities}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`skillsAcquired-${index}`}
                      tooltipText={"Select the skills you acquired"}
                      label={"Skills Acquired"}
                    />

                    <MultiSelect
                      selected={
                        formValues.experienceDetails[index].skillsAcquired
                      }
                      onChange={(value) => {
                        console.log("from MultiSelectSkills value", value);

                        handleExperienceChange(index, "skillsAcquired", value);
                      }}
                      options={skills}
                    />
                  </div>
                  {formValues.experienceDetails.length > 1 && (
                    <Button
                      onClick={() => removeExperience(index)}
                      variant={"destructive"}
                    >
                      Remove Experience
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" onClick={appendExperience}>
              <Plus className="mr-2 h-4 w-4" /> Add Experience
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="projects">
          <AccordionTrigger>Projects</AccordionTrigger>
          <AccordionContent>
            {formValues.projects.map((project, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`projectName-${index}`}
                      tooltipText={"Enter the project name"}
                      label={"Project Name"}
                    />
                    <Input
                      id={`projectName-${index}`}
                      value={project.name}
                      onChange={(e) =>
                        handleProjectChange(index, "name", e.target.value)
                      }
                    />
                    {projectErrors[index]?.name && (
                      <p className="text-red-500 text-sm">
                        {projectErrors[index]?.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`projectDescription-${index}`}
                      tooltipText={"Describe your project"}
                      label={"Description"}
                    />
                    <Textarea
                      id={`projectDescription-${index}`}
                      value={project.description}
                      onChange={(e) =>
                        handleProjectChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                    {projectErrors[index]?.description && (
                      <p className="text-red-500 text-sm">
                        {projectErrors[index]?.description}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`projectLink-${index}`}
                      tooltipText={"Enter the project URL"}
                      label={"Project Link"}
                    />
                    <Input
                      id={`projectLink-${index}`}
                      type="url"
                      value={project.link}
                      onChange={(e) =>
                        handleProjectChange(index, "link", e.target.value)
                      }
                    />
                    {projectErrors[index]?.link && (
                      <p className="text-red-500 text-sm">
                        {projectErrors[index]?.link}
                      </p>
                    )}
                  </div>

                  {formValues.projects.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeProject(index)}
                    >
                      <Minus className="mr-2 h-4 w-4" /> Remove Project
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" onClick={appendProject}>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="achievements">
          <AccordionTrigger>Achievements</AccordionTrigger>
          <AccordionContent>
            {formValues.achievements.map((achievement, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`achievementTitle-${index}`}
                      tooltipText={"Enter the achievement title"}
                      label={"Achievement Title"}
                    />
                    <Input
                      id={`achievementTitle-${index}`}
                      value={achievement.title}
                      onChange={(e) =>
                        handleAchievementChange(index, "title", e.target.value)
                      }
                    />
                    {achievementErrors[index]?.title && (
                      <p className="text-red-500 text-sm">
                        {achievementErrors[index]?.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`achievementDescription-${index}`}
                      tooltipText={"Describe your achievement"}
                      label={"Description"}
                    />
                    <Textarea
                      id={`achievementDescription-${index}`}
                      value={achievement.description}
                      onChange={(e) =>
                        handleAchievementChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                    {achievementErrors[index]?.description && (
                      <p className="text-red-500 text-sm">
                        {achievementErrors[index]?.description}
                      </p>
                    )}
                  </div>
                </div>
                {formValues.achievements.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeAchievement(index)}
                  >
                    <Minus className="mr-2 h-4 w-4" /> Remove Achievement
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={appendAchievement}>
              <Plus className="mr-2 h-4 w-4" /> Add Achievement
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certifications">
          <AccordionTrigger>Certifications</AccordionTrigger>
          <AccordionContent>
            {formValues.certifications.map((certification, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`certificationName-${index}`}
                      tooltipText={"Enter the certification name"}
                      label={"Certification Name"}
                    />
                    <Input
                      id={`certificationName-${index}`}
                      value={certification.name}
                      onChange={(e) =>
                        handleCertificationChange(index, "name", e.target.value)
                      }
                    />
                    {certificationErrors[index]?.name && (
                      <p className="text-red-500 text-sm">
                        {certificationErrors[index]?.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`certificationOrganization-${index}`}
                      tooltipText={"Enter the issuing organization"}
                      label={"Issuing Organization"}
                    />
                    <Input
                      id={`certificationOrganization-${index}`}
                      value={certification.organization}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "organization",
                          e.target.value
                        )
                      }
                    />
                    {certificationErrors[index]?.organization && (
                      <p className="text-red-500 text-sm">
                        {certificationErrors[index]?.organization}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`certificationYear-${index}`}
                      tooltipText={"Select the year of certification"}
                      label={"Year"}
                    />
                    <Select
                      onValueChange={(value) =>
                        handleCertificationChange(index, "year", value)
                      }
                      value={certification.year || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: new Date().getFullYear() - 1899 },
                          (_, i) => {
                            const year = 1900 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                    {certificationErrors[index]?.year && (
                      <p className="text-red-500 text-sm">
                        {certificationErrors[index]?.year}
                      </p>
                    )}
                  </div>
                  {formValues.certifications.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeCertification(index)}
                    >
                      <Minus className="mr-2 h-4 w-4" /> Remove Certification
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" onClick={appendCertification}>
              <Plus className="mr-2 h-4 w-4" /> Add Certification
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="languages">
          <AccordionTrigger>Languages</AccordionTrigger>
          <AccordionContent>
            {formValues.languages.map((language, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`language-${index}`}
                      tooltipText={"Select the language"}
                      label={"Language"}
                    />
                    <Select
                      onValueChange={(value) =>
                        handleLanguageChange(index, "language", value)
                      }
                      value={language.language}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {languageErrors[index]?.language && (
                      <p className="text-red-500 text-sm">
                        {languageErrors[index].language}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <LabelWrapper
                      htmlFor={`proficiency-${index}`}
                      tooltipText={"Select your proficiency level"}
                      label={"Proficiency"}
                    />
                    <Select
                      onValueChange={(value) =>
                        handleLanguageChange(index, "proficiency", value)
                      }
                      value={language.proficiency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {proficiencies.map((proficiency) => (
                          <SelectItem key={proficiency} value={proficiency}>
                            {proficiency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {languageErrors[index]?.proficiency && (
                      <p className="text-red-500 text-sm">
                        {languageErrors[index].proficiency}
                      </p>
                    )}
                  </div>
                </div>
                {formValues.languages.length > 1 && (
                  <Button
                    variant="destructive"
                    className="mt-4"
                    onClick={() => removeLanguage(index)}
                  >
                    Delete Language
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={appendLanguage}>
              <Plus className="mr-2 h-4 w-4" /> Add Language
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="interests">
          <AccordionTrigger>Interests</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 m-4">
              <LabelWrapper
                htmlFor="interests"
                tooltipText={"Select your interests"}
                label={"Interests"}
              />
              <MultiSelect
                selected={formValues.interests}
                onChange={(value) => handleInterestChange(value)}
                options={interests.map((interest) => ({
                  label: interest,
                  value: interest,
                }))}
              />
              {interestsError && (
                <p className="text-red-500 text-sm">{interestsError}</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 m-4">
              <LabelWrapper
                htmlFor={`noticePeriod`}
                tooltipText={"Enter your notice period"}
                label={" Notice Period"}
              />

              <Input
                id="noticePeriod"
                {...register("availability.noticePeriod", { required: true })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="salary-expectations">
          <AccordionTrigger>Salary Expectations</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">
                  Minimum Salary (USD){" "}
                  {renderTooltip("Enter your minimum expected salary")}
                </Label>
                <Input
                  id="salaryMin"
                  type="number"
                  {...register("salaryExpectations.min", {
                    required: true,
                    min: 0,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">
                  Maximum Salary (USD){" "}
                  {renderTooltip("Enter your maximum expected salary")}
                </Label>
                <Input
                  id="salaryMax"
                  type="number"
                  {...register("salaryExpectations.max", {
                    required: true,
                    min: 0,
                  })}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="self-identification">
          <AccordionTrigger>Self Identification</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="gender">
                  Gender {renderTooltip("Select your gender")}
                </Label>
                <Select
                  onValueChange={(value) =>
                    register("selfIdentification.gender").onChange({
                      target: { value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pronouns">
                  Pronouns {renderTooltip("Enter your preferred pronouns")}
                </Label>
                <Input
                  id="pronouns"
                  {...register("selfIdentification.pronouns")}
                />
              </div>
              <div>
                <Label htmlFor="veteranStatus">
                  Veteran Status {renderTooltip("Select your veteran status")}
                </Label>
                <Select
                  onValueChange={(value) =>
                    register("selfIdentification.veteranStatus").onChange({
                      target: { value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select veteran status" />
                  </SelectTrigger>
                  <SelectContent>
                    {veteranStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="disabilityStatus">
                  Disability Status{" "}
                  {renderTooltip("Select your disability status")}
                </Label>
                <Select
                  onValueChange={(value) =>
                    register("selfIdentification.disabilityStatus").onChange({
                      target: { value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select disability status" />
                  </SelectTrigger>
                  <SelectContent>
                    {veteranStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ethnicity">
                  Ethnicity {renderTooltip("Enter your ethnicity")}
                </Label>
                <Input
                  id="ethnicity"
                  {...register("selfIdentification.ethnicity")}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legal-authorization">
          <AccordionTrigger>Legal Authorization</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="euWorkAuthorization"
                  {...register("legalAuthorization.euWorkAuthorization")}
                />
                <Label htmlFor="euWorkAuthorization">
                  EU Work Authorization{" "}
                  {renderTooltip("Check if you have EU work authorization")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="usWorkAuthorization"
                  {...register("legalAuthorization.usWorkAuthorization")}
                />
                <Label htmlFor="usWorkAuthorization">
                  US Work Authorization{" "}
                  {renderTooltip("Check if you have US work authorization")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresUsVisa"
                  {...register("legalAuthorization.requiresUsVisa")}
                />
                <Label htmlFor="requiresUsVisa">
                  Requires US Visa{" "}
                  {renderTooltip("Check if you require a US visa")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresEuVisa"
                  {...register("legalAuthorization.requiresEuVisa")}
                />
                <Label htmlFor="requiresEuVisa">
                  Requires EU Visa{" "}
                  {renderTooltip("Check if you require an EU visa")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legallyAllowedEu"
                  {...register("legalAuthorization.legallyAllowedEu")}
                />
                <Label htmlFor="legallyAllowedEu">
                  Legally Allowed to Work in EU{" "}
                  {renderTooltip(
                    "Check if you are legally allowed to work in the EU"
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legallyAllowedUs"
                  {...register("legalAuthorization.legallyAllowedUs")}
                />
                <Label htmlFor="legallyAllowedUs">
                  Legally Allowed to Work in US{" "}
                  {renderTooltip(
                    "Check if you are legally allowed to work in the US"
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresEuSponsorship"
                  {...register("legalAuthorization.requiresEuSponsorship")}
                />
                <Label htmlFor="requiresEuSponsorship">
                  Requires EU Sponsorship{" "}
                  {renderTooltip("Check if you require EU sponsorship")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresUsSponsorship"
                  {...register("legalAuthorization.requiresUsSponsorship")}
                />
                <Label htmlFor="requiresUsSponsorship">
                  Requires US Sponsorship{" "}
                  {renderTooltip("Check if you require US sponsorship")}
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="work-preferences">
          <AccordionTrigger>Work Preferences</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remoteWork"
                  {...register("workPreferences.remoteWork")}
                />
                <Label htmlFor="remoteWork">
                  Remote Work {renderTooltip("Check if you prefer remote work")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inPersonWork"
                  {...register("workPreferences.inPersonWork")}
                />
                <Label htmlFor="inPersonWork">
                  In-Person Work{" "}
                  {renderTooltip("Check if you prefer in-person work")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="openToRelocation"
                  {...register("workPreferences.openToRelocation")}
                />
                <Label htmlFor="openToRelocation">
                  Open to Relocation{" "}
                  {renderTooltip("Check if you are open to relocation")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToCompleteAssessments"
                  {...register("workPreferences.willingToCompleteAssessments")}
                />
                <Label htmlFor="willingToCompleteAssessments">
                  Willing to Complete Assessments{" "}
                  {renderTooltip(
                    "Check if you are willing to complete assessments"
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToUndergoTests"
                  {...register("workPreferences.willingToUndergoTests")}
                />
                <Label htmlFor="willingToUndergoTests">
                  Willing to Undergo Drug Tests{" "}
                  {renderTooltip(
                    "Check if you are willing to undergo drug tests"
                  )}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingToUndergoChecks"
                  {...register("workPreferences.willingToUndergoChecks")}
                />
                <Label htmlFor="willingToUndergoChecks">
                  Willing to Undergo Background Checks{" "}
                  {renderTooltip(
                    "Check if you are willing to undergo background checks"
                  )}
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>
      <div className="w-50 flex flex-row justify-center">
        <Button type="submit" onClick={(e) => handleSubmit(e)}>
          Submit Resume
        </Button>
      </div>
    </div>
  );
}
