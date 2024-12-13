const fs = require("fs/promises");
const path = require("path");
const yaml = require("yaml");
const axios = require("axios");
const { exec } = require("child_process");

class ResumeGenerator {
  constructor(
    yamlData,
    outputFilename = "Custom_Resume",
    outputFolder = "generated_resumes",
    apiEndpoint,
    apiKey
  ) {
    if (!yamlData) {
      throw new Error("YAML file path is required.");
    }
    if (!apiKey) {
      throw new Error("API key is required.");
    }

    this.data = yamlData;
    this.outputFilename = outputFilename;
    this.outputFolder = outputFolder;
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  formatDate = (dateString, format = "MM-YYYY") => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    switch (format) {
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM-YYYY":
        return `${month}-${year}`;
      case "YYYY":
        return `${year}`;
      default:
        return `${day}-${month}-${year}`; // Default to DD-MM-YYYY
    }
  };

  async createLaTeXContent(aiGeneratedYamlFilePath, dateFormat = "MM-YYYY") {
    try {
      console.log(
        `Reading AI-Generated YAML file from path: ${aiGeneratedYamlFilePath}`
      );
      const fileContent = await fs.readFile(aiGeneratedYamlFilePath, "utf8");
      const data = yaml.parse(fileContent);

      let latexContent = `
  \\documentclass[11pt,a4paper,sans,colorlinks=true,linkcolor=blue,pdfpagelabels=false]{moderncv}
  \\moderncvstyle{banking}
  \\moderncvcolor{blue}
  \\usepackage[scale=0.8]{geometry}
  \\usepackage[utf8]{inputenc}
  
  \\name{${data.personal_information?.name || ""}}{${
        data.personal_information?.surname || ""
      }}
  \\title{Experienced Professional in Software Engineering}
  \\address{${data.personal_information?.address || ""}}{${
        data.personal_information?.city || ""
      }}{${data.personal_information?.country || ""}}
  \\phone[mobile]{${data.personal_information?.phonePrefix || ""}${
        data.personal_information?.phoneNumber || ""
      }}
  \\email{${data.personal_information?.email || ""}}
  \\social[linkedin]{${data.personal_information?.linkedin || ""}}
  \\social[github]{${data.personal_information?.github || ""}}
  
  \\begin{document}
  \\makecvtitle
  `;

      // Professional Summary
      if (data.professional_summary?.summary) {
        latexContent += `
  \\section{Professional Summary}
  ${data.professional_summary.summary}
  `;
      }

      // Skills
      if (data.skills?.length) {
        latexContent += `
  \\section{Skills}
  \\cvitem{}{\\begin{itemize}
  `;
        data.skills.forEach((skill) => {
          latexContent += `\\item ${skill}\n`;
        });
        latexContent += `\\end{itemize}}
  `;
      }

      // Education
      if (data.education_details?.length) {
        latexContent += `
  \\section{Education}
  `;
        data.education_details.forEach((edu) => {
          latexContent += `\\cventry{${this.formatDate(
            edu.graduation_year,
            "YYYY"
          )}}{${edu.degree || ""}}{${edu.university || ""}}{${
            edu.field_of_study || ""
          }}{}{}\n`;
        });
      }

      // Experience
      if (data.experience_details?.length) {
        latexContent += `
  \\section{Experience}
  `;
        data.experience_details.forEach((job) => {
          const [startDate, endDate] =
            job.employment_period?.split(" - ") || [];
          latexContent += `\\cventry{${this.formatDate(
            startDate,
            dateFormat
          )} -- ${this.formatDate(endDate, dateFormat)}}{${
            job.position || ""
          }}{${job.company || ""}}{${job.location || ""}}{}{\n\\begin{itemize}
  `;
          job.key_responsibilities?.forEach((resp) => {
            latexContent += `\\item ${resp}\n`;
          });
          latexContent += `\\end{itemize}}\n`;
        });
      }

      // Projects
      if (data.projects?.length) {
        latexContent += `
  \\section{Projects}
  `;
        data.projects.forEach((project) => {
          latexContent += `\\cvitem{${project.name || ""}}{${
            project.description || ""
          }}\n`;
          if (project.link) {
            latexContent += `\\cvitem{}{\\href{${project.link}}{Project Link}}\n`;
          }
        });
      }

      // Certifications
      if (data.certifications?.length) {
        latexContent += `
  \\section{Certifications}
  `;
        data.certifications.forEach((cert) => {
          latexContent += `\\cvitem{${cert.name || ""}}{${
            cert.organization || ""
          }${cert.year ? ` (${cert.year})` : ""}}\n`;
        });
      }

      // Achievements
      if (data.achievements?.length) {
        latexContent += `
  \\section{Achievements}
  `;
        data.achievements.forEach((achieve) => {
          latexContent += `\\cvitem{${achieve.name || ""}}{${
            achieve.description || ""
          }}\n`;
        });
      }

      // Languages
      if (data.languages?.length) {
        latexContent += `
  \\section{Languages}
  \\cvitem{}{\\begin{itemize}
  `;
        data.languages.forEach((lang) => {
          latexContent += `\\item ${lang.language || ""}: ${
            lang.proficiency || "Not Specified"
          }\n`;
        });
        latexContent += `\\end{itemize}}
  `;
      }

      latexContent += `
  \\end{document}
  `;
      return latexContent;
    } catch (error) {
      console.error("Error creating LaTeX content:", error);
      throw new Error("Failed to create LaTeX content.");
    }
  }

  async generatePDF(aiGeneratedYamlFilePath) {
    try {
      if (!aiGeneratedYamlFilePath) {
        throw new Error("AI-Generated YAML file path is required.");
      }
      console.log("aiGeneratedYamlFilePath", aiGeneratedYamlFilePath);

      const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
      const texFilename = path.join(
        this.outputFolder,
        `${this.outputFilename}_${timestamp}.tex`
      );
      const pdfFilename = path.join(
        this.outputFolder,
        `${this.outputFilename}_${timestamp}.pdf`
      );

      console.log("Generating LaTeX content for PDF...");
      const latexContent = await this.createLaTeXContent(
        aiGeneratedYamlFilePath
      );

      await fs.mkdir(this.outputFolder, { recursive: true });
      await fs.writeFile(texFilename, latexContent, "utf8");

      console.log("Compiling LaTeX file to PDF...");
      const execPromise = (cmd) =>
        new Promise((resolve, reject) => {
          exec(cmd, async (error, stdout, stderr) => {
            if (error) {
              reject(error);
            }
            resolve(stdout);
          });
        });
      try {
        await execPromise(
          `pdflatex -interaction=nonstopmode -output-directory=${this.outputFolder} ${texFilename}`
        );
      } catch (e) {
        console.error("error from execPromise", e);
      } finally {
        const pdfExists = await fs
          .access(pdfFilename)
          .then(() => true)
          .catch(() => false);

        if (pdfExists) {
          console.warn("PDF generated with warnings:", pdfFilename);

          return pdfFilename;
        } else {
          throw new Error("PDF generation failed, file does not exist.");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF.");
    }
  }

  async sendGROQRequest(jobDescription) {
    try {
      const prompt = this.createPrompt(jobDescription);
      console.log("prmpt", prompt);
      const payload = {
        messages: [{ role: "user", content: JSON.stringify(prompt) }],
        model: "llama3-70b-8192",
      };

      console.log("Sending request to GROQ API...");
      const response = await axios.post(this.apiEndpoint, payload, {
        headers: this.headers,
      });

      if (response.status === 200) {
        return response.data.choices[0].message.content;
      } else {
        console.error("GROQ API Error:", response.status, response.data);
        throw new Error("GROQ API request failed.");
      }
    } catch (error) {
      console.error("Error during GROQ API request:", error);
      throw new Error("Failed to interact with GROQ API.");
    }
  }

  createPrompt(jobDescription) {
    const extractedData = this.data;
    console.log("extractedData", extractedData);
    return {
      context: [
        {
          task: "Resume Optimization",
          objective:
            "Reorganize and optimize the provided resume data to align with the job description.",
        },
        {
          instruction:
            "You must not create any fake or invented information. Only use the details available in `extractedData`. Carefully review the `jobDescription` and highlight skills, experiences, projects, and achievements that are directly relevant or transferable to the described role. If certain fields (such as highly technical skills) are not relevant to the `jobDescription`, either omit them or keep them minimal. If no relevant information is available for a given section, leave that section empty or use truthful minimal placeholders (like empty arrays) rather than introducing irrelevant or fabricated data.",
        },
      ],
      sections: [
        {
          section: "personal_information",
          details:
            "Provide 'name', 'surname', 'date_of_birth', 'country', 'city', 'address', 'phone_prefix', 'phone', 'email', 'github', and 'linkedin'. Use only data from `extractedData`. If any field is unavailable, leave it as an empty string.",
        },
        {
          section: "professional_summary",
          details:
            "Provide a concise, ATS-optimized summary that emphasizes skills, experience, or transferable competencies directly related to the job description. Avoid irrelevant technical details. Do not fabricate new information. If no directly relevant experience is available, highlight transferable soft skills (such as organization, communication, attention to detail) that appear in `extractedData`.",
        },
        {
          section: "skills",
          details:
            "List only relevant skills that align with the job description. If the role is non-technical and `extractedData` is mostly technical, select only skills that can be transferable (e.g., 'organizational skills', 'documentation', 'research', 'client communication', etc.). If no relevant skills are found, return an empty array.",
        },
        {
          section: "experience_details",
          details: [
            "For each relevant role, include 'position', 'company', 'employment_period', 'location', and 'industry'.",
            "Emphasize responsibilities and achievements that align with the job description. For example, highlight administrative tasks, communication duties, organizational responsibilities, or any form of documentation or research that can be relevant.",
            "If no experience is directly related, select only transferable duties from the roles. Omit purely technical responsibilities that do not fit the job description.",
            "Provide 'key_responsibilities' as bullet points, focusing on duties that could be useful in the target role.",
            "Under 'skills_acquired', list only those skills gained that are relevant. If none are relevant, leave this array minimal or empty.",
          ],
        },
        {
          section: "education_details",
          details:
            "Include 'degree', 'university', 'gpa', 'graduation_year', and 'field_of_study' as provided. List 'courses' as key-value pairs, but only include courses if they are relevant or transferable to the job description. If no courses are relevant, omit them or leave the object empty.",
        },
        {
          section: "certifications",
          details:
            "List only certifications found in `extractedData` that are relevant to the job description. If no relevant certifications are available, return an empty array.",
        },
        {
          section: "projects",
          details: [
            "List projects as objects with 'name', 'description', and 'link'.",
            "Highlight only projects that demonstrate relevant or transferable skills (such as organization, documentation, or communication). If no projects are relevant, return an empty array.",
            "Omit purely technical projects if they do not support the job description.",
          ],
        },
        {
          section: "achievements",
          details: [
            "Provide achievements as objects with 'name' and 'description'.",
            "Only include achievements that are relevant or can be seen as transferable to the new role.",
            "If there are no relevant achievements, return an empty array.",
          ],
        },
        {
          section: "languages",
          details:
            "List languages as objects with 'language' and 'proficiency'. Include only what is found in `extractedData`. If none are provided, return an empty array.",
        },
        {
          section: "ATS_Score_Check",
          details:
            "Provide a 'score' (a numeric value) reflecting how well the resume aligns with the job description. Under 'improvement_suggestions', provide guidance on how to better align the existing data. If data is limited, suggest focusing on transferable skills or highlighting any administrative or organizational tasks found. Do not fabricate improvements; only suggest ways to better use existing data.",
        },
      ],
      job_description: jobDescription,
      user_resume: extractedData,
      response_format:
        'Please respond only with the following strict JSON structure, without any extra explanation or formatting:\n\n{\n  "personal_information": {...},\n  "professional_summary": {"summary": "..."},\n  "skills": [...],\n  "experience_details": [{...}],\n  "education_details": [{...}],\n  "certifications": [...],\n  "projects": [{...}],\n  "achievements": [{...}],\n  "languages": [{...}],\n  "ATS_Score_Check": {"score": ..., "improvement_suggestions": [...]} \n}',
    };

    //   return {
    //     context: [

    //       {
    //         task: "Resume Optimization",
    //         objective:
    //           "Reorganize and optimize the provided resume data to align with the job description.",
    //       },
    //       {
    //         instruction:
    //           "Do not create fake information. Only use data from the 'extractedData' and reorganize it to increase the ATS score." +
    //           "The `jobDescription` describes the target role. Review it carefully." +
    //           "Highlight and emphasize only those skills, experiences, projects, and achievements from `extractedData` that are directly relevant or transferable to the described role." +
    //           "If certain information (e.g., technical skills) is irrelevant to the `jobDescription`, omit it or keep it minimal." +
    //           "Use only the information provided in `extractedData`." +
    //  "Do not invent, alter, or add new information that isn't present in `extractedData`" +

    //           "If no directly related content exists for a section, present only what is available and truly relevant. If nothing relevant exists, leave that section empty or with a minimal truthful placeholder (e.g., empty arrays or empty strings)."
    //       },
    //     ],
    //     sections: [
    //       {
    //         section: "personal_information",
    //         details:
    //           "Provide details including 'name', 'surname', 'date_of_birth', 'country', 'city', 'address', " +
    //           "'phone_prefix', 'phone', 'email', 'github', and 'linkedin'. " +
    //           "Ensure each field is filled accurately and professionally.",
    //       },
    //       {
    //         section: "professional_summary",
    //         details:
    //           "Provide a 'summary' field with a concise and ATS-optimized professional summary, " +
    //           "emphasizing relevant skills, experience, and specific achievements that align with the job description." +
    //           "Craft a concise summary emphasizing relevant skills and achievements from 'extractedData' that align with the 'jobDescription'. Avoid generic statements and prioritize job-specific keywords.",
    //       },
    //       {
    //         section: "skills",
    //         details:
    //           "List relevant skills as individual items in an array, using ATS-friendly terminology. " +
    //           "Ensure each skill directly relates to the job description." +
    //           "Extract relevant skills from 'extractedData' that directly match the 'jobDescription'. List them as ATS-friendly terms.",
    //       },
    //       {
    //         section: "experience_details",
    //         details: [
    //           "For each role, include 'position', 'company', 'employment_period', 'location', and 'industry' fields. ",
    //           "Reorganize experience data to emphasize roles, achievements, and skills relevant to the 'jobDescription'. Use action verbs and quantify achievements wherever possible.",
    //           "Provide an array of 'key_responsibilities' with bullet-point achievements and responsibilities that are ATS-optimized, using quantified achievements where possible.",
    //           "Add an array of 'skills_acquired' relevant to each role, with each skill listed individually.",
    //         ],
    //       },
    //       {
    //         section: "education_details",
    //         details:
    //           "Include 'degree', 'university', 'gpa', 'graduation_year', and 'field_of_study' fields. " +
    //           "Provide an array of 'courses' with each course listed as a key-value pair, where the key is the course name and the value is the grade." +
    //           "Ensure education details are complete and professional. Include only relevant courses that align with the 'jobDescription'.",
    //       },
    //       {
    //         section: "certifications",
    //         details:
    //           "Provide each certification as a string in an array, retaining original names and issuing organizations." +
    //           "Highlight certifications that are relevant to the 'jobDescription'. Exclude unrelated certifications.",
    //       },
    //       {
    //         section: "projects",
    //         details: [
    //           "List projects as objects with 'name', 'description', and 'link' fields. ",
    //           "Ensure each project highlights relevant technologies and outcomes.",
    //           "Reorganize project details to focus on technologies, outcomes, and relevance to the 'jobDescription'.",
    //         ],
    //       },
    //       {
    //         section: "achievements",
    //         details: [
    //           "Provide achievements as objects with 'name' and 'description' fields. ",
    //           "List achievements related to the 'jobDescription', emphasizing measurable outcomes and relevance.",
    //         ],
    //       },
    //       {
    //         section: "languages",
    //         details:
    //           ("List languages as objects, each containing 'language' and 'proficiency' fields. ",
    //           "Use terminology like 'Professional', 'Fluent', or 'Native' to indicate proficiency."),
    //       },
    //       {
    //         section: "ATS_Score_Check",
    //         details:
    //           "At the end, include an 'ATS_Score_Check' field with 'score' and 'improvement_suggestions'. " +
    //           "Provide an overall ATS score as a numeric value, and suggest further improvements for keyword density, action verbs, and quantifiable achievements.",
    //       },
    //     ],
    //     job_description: jobDescription,
    //     response_format:
    //       "Please respond only with the following strict JSON structure, without any extra explanation or formatting:\n\n" +
    //       "{\n" +
    //       '  "personal_information": {...},\n' +
    //       '  "professional_summary": {"summary": "..."},\n' +
    //       '  "skills": [...],\n' +
    //       '  "experience_details": [{...}],\n' +
    //       '  "education_details": [{...}],\n' +
    //       '  "certifications": [...],\n' +
    //       '  "projects": [{...}],\n' +
    //       '  "achievements": [{...}],\n' +
    //       '  "languages": [{...}],\n' +
    //       '  "ATS_Score_Check": {"score": ..., "improvement_suggestions": [...]} \n' +
    //       "}",
    //     user_resume: extractedData,
    //   };
  }

  extractRelevantContent() {
    return {
      personal_information: this.data.personalInfo || {},
      education_details: this.data.educationDetails || [],
      experience_details: this.data.experienceDetails || [],
      projects: this.data.projects || [],
      achievements: this.data.achievements || [],
      certifications: this.data.certifications || [],
      languages: this.data.languages || [],
    };
  }

  async optimizeResume(jobDescription) {
    try {
      console.log("Starting resume optimization...");
      const responseContent = await this.sendGROQRequest(jobDescription);
      console.log("responseContent", responseContent);
      if (responseContent) {
        const formattedData = this.extractContent(responseContent);
        if (formattedData) {
          console.log("Saving optimized YAML...");
          return await this.saveToYAML(formattedData);
        } else {
          throw new Error("Failed to extract content from GROQ response.");
        }
      } else {
        throw new Error("GROQ response content is empty.");
      }
    } catch (error) {
      console.error("Error optimizing resume:", error);
      throw error;
    }
  }

  extractContent(responseContent) {
    try {
      const start = responseContent.indexOf("{");
      const end = responseContent.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("Invalid JSON content in GROQ response.");
      }

      const jsonContent = responseContent.slice(start, end + 1);
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Error decoding JSON:", error);
      throw new Error("Failed to parse JSON content from GROQ response.");
    }
  }

  async saveToYAML(data, filename = "optimized_resume.yaml") {
    try {
      console.log("data from saveToYAML", data);

      const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");
      const outputFolder = path.resolve(this.outputFolder);

      const fullFilename = path.join(
        outputFolder,
        `${filename.split(".")[0]}_${timestamp}.yaml`
      );

      await fs.mkdir(outputFolder, { recursive: true }); // Ensure folder exists
      await fs.writeFile(fullFilename, yaml.stringify(data), "utf8");

      console.log("YAML file saved:", fullFilename);
      return fullFilename;
    } catch (error) {
      console.error("Error saving YAML file:", error);
      throw new Error("Failed to save YAML file.");
    }
  }
}

module.exports = ResumeGenerator;
// Usage
// const generator = new ResumeGenerator(
//   "./test_resume_content.yml",
//   "Custom_Resume",
//   "generated_resumes",
//   "https://api.groq.com/openai/v1/chat/completions",
//   "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"
// );
// generator.optimizeResume("Your job description here");
// generator.generatePDF();
