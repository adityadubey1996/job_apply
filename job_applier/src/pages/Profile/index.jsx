import { useEffect, useState } from "react";
import { CustomLoader } from "../components/loader";
import { getProfileDetails } from "../../api/api";
import ResumeForm from "./components/Profile";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfileDetails();
        console.log("Profile Data:", response.data); // Log the data to the console
        setProfileData(response.data);
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
      {profileData && profileData.resumeData ? (
        <ResumeForm profileData={JSON.parse(profileData.resumeData)} />
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;
