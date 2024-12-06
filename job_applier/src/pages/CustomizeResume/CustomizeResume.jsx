import React, { useState, useEffect } from "react";
import ResizableSplitPane from "./ResizeComponent";
import LeftComponent from "./LeftComponent";
import RightComponent from "./RightComponent";
import { useNavigate } from "react-router-dom";
import { CustomLoader } from "../components/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getProfileDetails } from "../../api/api";

const CustomizeResume = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProfileDataAvailable, setIsProfileDataAvailable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Open initially for testing

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfileDetails();
        console.log("Profile Data:", response.data); // Log data to console
        // Automatically navigate to form if profile data exists
        console.log(
          "if (!response.data?.resumeData) {",
          !response.data?.resumeData
        );
        console.log(
          "if (!response.data?.resumeData) {",
          response.data?.resumeData
        );

        if (!response.data?.resumeData) {
          setIsProfileDataAvailable(false);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
        setIsProfileDataAvailable(false);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <>
      <ResizableSplitPane
        leftComponent={
          <LeftComponent
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
          />
        }
        rightComponent={
          <RightComponent
            jobDescription={jobDescription}
            companyInfo={companyInfo}
          />
        }
        isDisabled={!isProfileDataAvailable}
      />

      {/* ShadCN Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Oops! No Profile Found</DialogTitle>
            <DialogDescription>
              Looks like the AI isn’t omniscient (yet). Help it out by creating
              and saving your profile first. Click below to get started!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Nah, Later
            </Button>
            <Button
              onClick={() => {
                navigate("/profile");
              }}
            >
              Fine, Take Me There
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomizeResume;
