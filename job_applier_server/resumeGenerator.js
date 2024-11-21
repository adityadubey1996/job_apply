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

  async createLaTeXContent(aiGeneratedYamlFilePath) {
    try {
      console.log(
        `Reading AI-Generated YAML file from path: ${aiGeneratedYamlFilePath}`
      );
      const fileContent = await fs.readFile(aiGeneratedYamlFilePath, "utf8");
      console.log(
        "yaml.parse(fileContent) of aiGeneratedYamlFilePath",
        yaml.parse(fileContent)
      );
      const data = yaml.parse(fileContent);
      let latexContent = `
\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[colorlinks=true, linkcolor=blue, pdfpagelabels=false]{hyperref}
\\usepackage[scale=0.8]{geometry}
\\usepackage[utf8]{inputenc}

\\name{${data.personal_information.name || ""}}{${
        data.personal_information.surname || ""
      }}
\\title{Experienced Professional in Software Engineering}
\\address{${data.personal_information.address || ""}}{${
        data.personal_information.city || ""
      }}{${data.personal_information.country || ""}}
\\phone[mobile]{${data.personal_information.phone_prefix || ""}${
        data.personal_information.phone || ""
      }}
\\email{${data.personal_information.email || ""}}
\\social[linkedin]{${data.personal_information.linkedin || ""}}
\\social[github]{${data.personal_information.github || ""}}

\\begin{document}
\\makecvtitle

\\section{Professional Summary}
${data.professional_summary?.summary || "Summary not provided."}

\\section{Skills}
\\cvitem{}{\\begin{itemize}`;
      data.skills.forEach((skill) => {
        latexContent += `\\item ${skill}\n`;
      });
      latexContent += `\\end{itemize}}

\\section{Education}`;
      data.education_details.forEach((edu) => {
        latexContent += `\\cventry{${edu.graduation_year || ""}}{${
          edu.degree || ""
        }}{${edu.university || ""}}{${edu.field_of_study || ""}}{}{}\n`;
      });

      latexContent += `\\section{Experience}`;
      data.experience_details.forEach((job) => {
        latexContent += `\\cventry{${job.employment_period || ""}}{${
          job.position || ""
        }}{${job.company || ""}}{${job.location || ""}}{}{\n\\begin{itemize}`;
        job.key_responsibilities.forEach((resp) => {
          latexContent += `\\item ${resp}\n`;
        });
        latexContent += `\\end{itemize}}\n`;
      });

      latexContent += `\\section{Projects}`;
      data.projects.forEach((project) => {
        latexContent += `\\cvitem{${project.name || ""}}{\\href{${
          project.link || ""
        }}{${project.description || ""}}}\n`;
      });

      latexContent += `\\section{Certifications}`;
      data.certifications.forEach((cert) => {
        latexContent += `\\cvitem{}{${cert}}\n`;
      });

      latexContent += `\\section{Achievements}`;
      data.achievements.forEach((achieve) => {
        latexContent += `\\cvitem{${achieve.name || ""}}{${
          achieve.description || ""
        }}\n`;
      });

      latexContent += `\\section{Languages}
\\cvitem{}{\\begin{itemize}`;
      data.languages.forEach((lang) => {
        latexContent += `\\item ${lang.language || ""}: ${
          lang.proficiency || ""
        }\n`;
      });
      latexContent += `\\end{itemize}}

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
        { task: "Resume Optimization", objective: "Optimize the resume..." },
        { instruction: "Respond with JSON structure..." },
      ],
      sections: [
        {
          section: "personal_information",
          details:
            "Provide details including 'name', 'surname', 'date_of_birth', 'country', 'city', 'address', " +
            "'phone_prefix', 'phone', 'email', 'github', and 'linkedin'. " +
            "Ensure each field is filled accurately and professionally.",
        },
        {
          section: "professional_summary",
          details:
            "Provide a 'summary' field with a concise and ATS-optimized professional summary, " +
            "emphasizing relevant skills, experience, and specific achievements that align with the job description.",
        },
        {
          section: "skills",
          details:
            "List relevant skills as individual items in an array, using ATS-friendly terminology. " +
            "Ensure each skill directly relates to the job description.",
        },
        {
          section: "experience_details",
          details: [
            "For each role, include 'position', 'company', 'employment_period', 'location', and 'industry' fields. ",
            "Provide an array of 'key_responsibilities' with bullet-point achievements and responsibilities that are ATS-optimized, using quantified achievements where possible.",
            "Add an array of 'skills_acquired' relevant to each role, with each skill listed individually.",
          ],
        },
        {
          section: "education_details",
          details:
            "Include 'degree', 'university', 'gpa', 'graduation_year', and 'field_of_study' fields. " +
            "Provide an array of 'courses' with each course listed as a key-value pair, where the key is the course name and the value is the grade.",
        },
        {
          section: "certifications",
          details:
            "Provide each certification as a string in an array, retaining original names and issuing organizations.",
        },
        {
          section: "projects",
          details: [
            "List projects as objects with 'name', 'description', and 'link' fields. ",
            "Ensure each project highlights relevant technologies and outcomes.",
          ],
        },
        {
          section: "achievements",
          details: [
            "Provide achievements as objects with 'name' and 'description' fields. ",
            "Highlight achievements relevant to the job description.",
          ],
        },
        {
          section: "languages",
          details:
            ("List languages as objects, each containing 'language' and 'proficiency' fields. ",
            "Use terminology like 'Professional', 'Fluent', or 'Native' to indicate proficiency."),
        },
        {
          section: "ATS_Score_Check",
          details:
            "At the end, include an 'ATS_Score_Check' field with 'score' and 'improvement_suggestions'. " +
            "Provide an overall ATS score as a numeric value, and suggest further improvements for keyword density, action verbs, and quantifiable achievements.",
        },
      ],
      job_description: jobDescription,
      response_format:
        "Please respond only with the following strict JSON structure, without any extra explanation or formatting:\n\n" +
        "{\n" +
        '  "personal_information": {...},\n' +
        '  "professional_summary": {"summary": "..."},\n' +
        '  "skills": [...],\n' +
        '  "experience_details": [{...}],\n' +
        '  "education_details": [{...}],\n' +
        '  "certifications": [...],\n' +
        '  "projects": [{...}],\n' +
        '  "achievements": [{...}],\n' +
        '  "languages": [{...}],\n' +
        '  "ATS_Score_Check": {"score": ..., "improvement_suggestions": [...]} \n' +
        "}",
      user_resume: extractedData,
    };
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

      if (responseContent) {
        const formattedData = this.extractContent(responseContent);
        if (formattedData) {
          console.log("Saving optimized YAML...", formattedData);
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
