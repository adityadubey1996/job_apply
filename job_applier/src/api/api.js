import axiosInstance from "./axiosIntance";

// Define APIs

export const fetchResumes = async () => {
  const response = await axiosInstance.get("/api/resume");
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosInstance.post("/api/auth/login", credentials);
  const { token } = response.data;
  localStorage.setItem("token", token); // Save token to local storage
  return response.data;
};

export const signup = async (userDetails) => {
  const response = await axiosInstance.post("/api/auth/register", userDetails);
  return response.data;
};

export const logout = () => {
  try {
    localStorage.removeItem("token"); // Clear token from storage
  } catch (error) {
    throw new Error("An error occurred during logout.");
  }
};

export const postResumeData = async (resumeData) => {
  const response = await axiosInstance.post("/api/resume/generate-yaml", {
    resumeData: resumeData,
  });
  return response.data;
};

export const createResume = async ({ jobDescription, aboutCompany }) => {
  const response = await axiosInstance.post("/api/resume/generate-resume", {
    jobDescription,
    aboutCompany,
  });
  return response;
};

export const getProfileDetails = async () => {
  const response = await axiosInstance.get("/api/profile", {});
  return response;
};

export const getResumeListForUser = async () => {
  const response = await axiosInstance.get("/api/resume/user-resumes", {});
  return response;
};

export const downloadResume = async (filePath) => {
  const response = await axiosInstance.get(
    `/api/resume/signed-url/${encodeURIComponent(filePath)}`,
    {}
  );

  return response.data;
};
