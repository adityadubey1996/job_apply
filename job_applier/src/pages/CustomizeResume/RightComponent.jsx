import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"; // Assuming you have a spinner component
import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Install `react-pdf` for PDF viewing
import { createResume as createResumeApi } from "../../api/api";
import { useToast } from "@/hooks/use-toast";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const RightComponent = ({ pdfFile, onBack }) => {
  const { toast } = useToast();

  const [state, setState] = useState("input"); // input | loading | success
  const [numPages, setNumPages] = useState(null); // Track number of pages in PDF
  const [error, setError] = useState(false);

  const pdfContainerRef = useRef(null);
  const parentRef = useRef(null);

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
    <div className="flex flex-col items-center justify-center h-full">
      {pdfFile ? (
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
      ) : (
        <p className="text-red-500">Failed to load the resume.</p>
      )}
      <Button className="mt-4" variant="secondary" onClick={onBack}>
        Back to Edit
      </Button>
    </div>
  );
};

export default RightComponent;
