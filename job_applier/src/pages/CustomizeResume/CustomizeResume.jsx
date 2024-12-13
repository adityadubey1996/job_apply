import React, { useState } from "react";
import LeftComponent from "./LeftComponent";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a spinner component
import RightComponent from "./RightComponent";
import { CustomLoader } from "../components/loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createResume as createResumeApi } from "../../api/api";

const CustomizeResume = () => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState("input"); // input | loading | result
  const [jobDescription, setJobDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // Store the generated PDF file

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      alert("Please fill in fields before generating the resume.");
      return;
    }

    setCurrentView("loading"); // Show loading state
    try {
      // Call API to create the resume
      const response = await createResumeApi({
        jobDescription,
      });

      setPdfFile(response.data.pdfPath); // Assume the API returns a PDF path
      setCurrentView("result"); // Show result state
      toast({
        title: "Success",
        description: `${response.data.message}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error generating resume:", error);
      setCurrentView("input");
      toast({
        title: "Error",
        description: `${error.response?.data.error || "Something Went Wrong"}`,
        variant: "destructive",
      });
    }
  };

  const handleBackToEdit = () => {
    setCurrentView("input");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 max-w-4xl">
      {currentView === "input" && (
        <LeftComponent
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        >
          <Button onClick={handleGenerateResume} className="mt-4">
            Generate Resume
          </Button>
        </LeftComponent>
      )}

      {currentView === "loading" && (
        <div className="flex flex-col items-center">
          <Spinner className="w-8 h-8 mb-2" />
          <p>Processing...</p>
        </div>
      )}

      {currentView === "result" && (
        <RightComponent pdfFile={pdfFile} onBack={handleBackToEdit} />
      )}
    </div>
  );
};

export default CustomizeResume;
