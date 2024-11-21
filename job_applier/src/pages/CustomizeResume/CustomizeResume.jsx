// pages/NoSelection.jsx
import React, { useState } from "react";
import ResizableSplitPane from "./ResizeComponent";
import LeftComponent from "./LeftComponent";
import RightComponent from "./RightComponent";
const CustomizeResume = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");

  return (
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
    />
  );
};

export default CustomizeResume;
