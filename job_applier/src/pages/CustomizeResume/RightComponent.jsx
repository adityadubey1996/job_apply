import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a spinner component
import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Install `react-pdf` for PDF viewing
import { createResume as createResumeApi } from "../../api/api";
import { useToast } from "@/hooks/use-toast";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const RightComponent = ({ jobDescription, companyInfo }) => {
  const { toast } = useToast();

  const [state, setState] = useState("input"); // input | loading | success
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null); // Track number of pages in PDF
  const [error, setError] = useState(false);

  const pdfContainerRef = useRef(null);
  const parentRef = useRef(null);

  const validateInput = () => {
    return jobDescription.trim() !== "" && companyInfo.trim() !== "";
  };

  const createResume = async () => {
    const response = await createResumeApi({
      jobDescription,
      aboutCompany: companyInfo,
    });

    console.log("Response:", response);
    if (response.data) {
      setPdfFile(response.data.pdfPath);
      toast({
        title: "Success",
        description: `${response.data.message}`,
        variant: "success",
      });
    }
  };

  const handleCreateResume = async () => {
    try {
      if (validateInput()) {
        setState("loading");
        await createResume();
        setState("success");
      } else {
        alert("Please fill in both fields.");
      }
    } catch (error) {
      console.error("Error posting data:", error);

      toast({
        title: "Error",
        description: `${error.response?.data.error || "Something Went Wrong"}`,
        variant: "destructive",
      });
      setState("input");
      setPdfFile("");
    }
  };

  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = pdfFile;
    link.download = "Generated_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(false);
  };

  const handlePdfLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setError(true);
  };

  useEffect(() => {
    if (pdfContainerRef.current && parentRef.current) {
      const parentHeight = parentRef.current.clientHeight;
      pdfContainerRef.current.style.height = `${parentHeight - 150}px`; // Leave space for the button
    }
  }, [pdfFile, numPages]);

  return (
    <div
      ref={parentRef}
      className="p-4 h-full flex flex-col items-center justify-center"
    >
      {state === "input" && (
        <Button onClick={handleCreateResume} disabled={!validateInput()}>
          Create Resume
        </Button>
      )}

      {state === "loading" && (
        <div className="flex flex-col items-center">
          <Spinner className="w-8 h-8 mb-2" />
          <p>Processing...</p>
        </div>
      )}

      {state === "success" && (
        <>
          <div
            ref={pdfContainerRef}
            className="w-full max-w-lg overflow-auto border border-gray-200 rounded-lg flex-grow"
          >
            {pdfFile && !error ? (
              <Document
                file={pdfFile}
                onLoadSuccess={handlePdfLoadSuccess}
                onLoadError={handlePdfLoadError}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </Document>
            ) : error ? (
              <p className="text-red-500">
                Failed to load the PDF. Please try again.
              </p>
            ) : (
              <Spinner className="w-8 h-8" />
            )}
          </div>
          <Button className="mt-4" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </>
      )}
    </div>
  );
};

export default RightComponent;
