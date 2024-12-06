import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadComponent } from "../../components/uploadField";
import { Loader } from "lucide-react";
import "./styles.css";

export const ResumeOptions = ({ onFillForm, onProcessSuccess }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 border rounded-lg bg-muted text-center">
      <p className="text-white text-lg">
        Get started with your resume by either uploading a sample or filling in
        the details manually.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <UploadComponent onProcessSuccess={onProcessSuccess} />

        <strong>OR</strong>
        <Button
          onClick={onFillForm}
          variant="outline"
          className="w-full md:w-auto"
        >
          Fill Details Manually
        </Button>
      </div>
    </div>
  );
};
