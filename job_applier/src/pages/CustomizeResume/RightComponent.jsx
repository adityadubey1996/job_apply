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
      className="p-4 h-full flex flex-col items-center justify-between"
    >
      <div
        ref={pdfContainerRef}
        className="w-full max-w-lg overflow-auto border border-gray-200 rounded-lg flex-grow"
      >
        <Document
          file={
            "https://ffe2e394b244ba54e8e6e18d6c6d60902416efa6733b101c7ed23f3-apidata.googleusercontent.com/download/storage/v1/b/user_bucket_job_applier/o/resumes%2F673b36cab47f4ce9fc5fb6b1%2F673b36cab47f4ce9fc5fb6b1_2024_11_18T12_45_02_855Z.pdf?jk=AXvcXDvT39DD4WfCzjMHDiljaaxTruYPA6_PgQSr_ixODIw69HTkRjvbSGEXbVo7tUXmPbQimEWdZqno1RpVXmmQBFZ05E5AYGARhKsSI14vlQRJu87LkENyAgd0VfC4WAchMLyu-MLi5For9pLF0D9mck8D6FgHkuZzj2-fjto6blaa0SeH8bBPgslepJmG6YxTqilAsxvK0iFkFM70VA_fu2FXONTkklq96Sf9EJGzuL6ME8r0_oaG0BOjD1ecz2sNC72soMiTjwOG4BMX3p0XIXjstnmW03HaTLV2C6c2jxsxBiSYVj8-jVFo1zRcGx_JEWfbleyQ47hVQuHlZ3k3dPLad-jTUqZ4yeLwFIxXOzYyfNIzivA2qjJWLtbHKUCu0_VF7qE4QuKnjYWlcim1sQ3dLyo-kuDipi9D0_LABLKAxiAaiG0NQLC_gp-5wHBOLteKJ31WLyUEUYA6duUiEKYjXEa7He9G9dtC9XQ6qWPPmdNuvPpi_RaMywmKeYMnBuHYNcfbQk3W8sBSZNrPqrjX1-TtKW1nPFJQqQQ_eo95rGGks61sorEEBWoKQ-FC63W8hi8u0jk2sL2Je1oPozGZU2z34HtDmZPtqOXh2WgzlI_WNxBrBFrRXgpl1bOCKPe_ttIJaIA5y8gvmyNYnOpjpa_xHi7j7aRp7rXtW76-V2AygRX_ZDB6W0ztRGoHpPX7cjVuIhxPorZmLu4wZcXY8VlSRt4R5-fTfQyEWylHTt_UTEjHA7U8ayWpliGwsu2MArDu60eXhK9aiUC_0LlNHNQx-cXLAb0EGnM2t94oSSIk8A3cRp9LyHYfYILxoHBvmYEBX1p7BUSiBuR2nytnDzmTh7IEzT6xyoKcZe7rpBgh5YXM7MjsMse6T7qKWPL8AIhOAJrhqy9zxl6h95JDsHKQdlvnQJxQV8fs3RBT3hLlDiElrcGl_2WbED2l4xPOtUlvt9-lZqQOqiW9Pa9IOy16pA-6ZRGzh5MShzhjV-vxmjtAR9VZ9WY5oMe8wTRPwSlwkQNjkWZNZpOzYAJIVsxuprGZy3lJP_9pslaKqltsj9jte5v5nSP-JM0fj8dKllhjC_kbCTB46lncU1knHunoT1e4uWv5VSSBkpgWkLg_3Kq9eohQ_CR-2iX6CHa2eeUA3ldNYVkgJstTOyAnMXKIB4STmP_xonheO8nyMECCqvTAtSiBBBnaQb6xWp80-iXpDreRdJ5DkNrlWkq9kmdY&isca=1"
          }
          onLoadSuccess={handlePdfLoadSuccess}
          onLoadError={handlePdfLoadError}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
      {/* {state === "input" && (
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
          </div> */}
      <Button className="mt-4" onClick={handleDownloadPdf}>
        Download PDF
      </Button>
      {/* </> */}
      {/* )} */}
    </div>
  );
};

export default RightComponent;
