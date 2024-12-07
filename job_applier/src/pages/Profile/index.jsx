import { useEffect, useState } from "react";
import { CustomLoader } from "../components/loader";
import { getProfileDetails } from "../../api/api";
import ResumeForm from "./presentation/Profile";
import { ResumeOptions } from "./presentation/CreateProfile";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null); // Persist profile data
  const [showForm, setShowForm] = useState(false); // Toggle between Form and Options

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfileDetails();
        console.log("Profile Data:", response.data); // Log data to console
        setProfileData(response.data);
        // Automatically navigate to form if profile data exists
        if (response.data?.resumeData) {
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
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
    <div className="flex-1 flex justify-center items-center pt-6 pr-6 pb-6">
      {showForm ? (
        <ResumeForm
          profileData={
            profileData && profileData.resumeData
              ? JSON.parse(profileData?.resumeData)
              : undefined
          }
          onGoToOptions={() => setShowForm(false)} // Navigate to ResumeOptions
        />
      ) : (
        <ResumeOptions
          onFillForm={() => {
            setShowForm(true);
          }}
          onProcessSuccess={(updatedProfileData) => {
            if (updatedProfileData && updatedProfileData.resumeData) {
              setProfileData(updatedProfileData._doc);
            }
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
