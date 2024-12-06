const { extractPdfContent } = require("./resumeScanner");

extractPdfContent(
  "/Users/adityadubey/job_apply/job_applier_server/services/uploads/1733325550676_Aditya_dubey_resume_IITMATRIX.pdf"
)
  .then((data) => console.log("Extracted data:", data))
  .catch((err) => console.error("Error:", err));
