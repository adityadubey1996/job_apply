"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, Trash2 } from "lucide-react";
import { CustomLoader } from "./components/loader";
import { getResumeListForUser, downloadResume } from "../api/api";

// Dummy data for demonstration
// const resumeHistory = [
//   { id: 1, createdAt: "2023-05-15T10:30:00Z", name: "Resume_1.pdf" },
//   { id: 2, createdAt: "2023-06-02T14:45:00Z", name: "Resume_2.pdf" },
//   { id: 3, createdAt: "2023-06-20T09:15:00Z", name: "Resume_3.pdf" },
//   { id: 4, createdAt: "2023-07-10T16:20:00Z", name: "Resume_4.pdf" },
//   { id: 5, createdAt: "2023-07-25T11:00:00Z", name: "Resume_5.pdf" },
// ];

export default function ResumeHistory() {
  const [loadingStates, setLoadingStates] = useState({});
  const [resumeHistory, setResumeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeList = async () => {
      try {
        setLoading(true);
        const response = await getResumeListForUser();
        setResumeHistory(response.data.resumes);
        // setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeList();
  }, []);

  const handleDownload = async (filePath, id) => {
    setLoadingStates((prev) => ({ ...prev, [`download-${id}`]: true }));
    try {
      const { signedUrl } = await downloadResume(filePath);

      // Trigger file download
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = filePath.split("/").pop(); // Use the file name from the path
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`download-${id}`]: false }));
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full">
      <ScrollArea className="h-full w-full rounded-md border p-4">
        {resumeHistory.map((resume) => (
          <Card key={resume.id} className="mb-4">
            <CardHeader>
              <CardTitle>{`Resume - ${resume._id.slice(-4)}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created on: {new Date(resume.createdAt).toLocaleString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resume.pdfPath, resume._id)}
                disabled={loadingStates[`download-${resume.id}`]}
              >
                {loadingStates[`download-${resume.id}`] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </Button>
              {/* <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction(resume.id, "delete")}
                disabled={loadingStates[`delete-${resume.id}`]}
              >
                {loadingStates[`delete-${resume.id}`] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
