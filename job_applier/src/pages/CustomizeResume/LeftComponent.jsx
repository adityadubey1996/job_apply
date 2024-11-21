import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const LeftComponent = ({
  jobDescription,
  setJobDescription,
  companyInfo,
  setCompanyInfo,
}) => {
  return (
    <div className="flex flex-col justify-evenly p-4 h-full">
      {/* Job Description Section */}
      <div className="flex flex-col items-center">
        <Label htmlFor="job-description" className="mb-2 text-lg font-medium">
          Job Description
        </Label>
        <Textarea
          id="job-description"
          placeholder="Enter job description with proper formatting, bullet points, and key details..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full max-w-md min-h-[150px] resize-none border rounded-lg p-3 text-sm"
        />
      </div>

      {/* About Company Section */}
      <div className="flex flex-col items-center mt-6">
        <Label htmlFor="company-info" className="mb-2 text-lg font-medium">
          About Company
        </Label>
        <Textarea
          id="company-info"
          placeholder="Enter detailed information about the company, including its mission, vision, and key facts..."
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
          className="w-full max-w-md min-h-[150px] resize-none border rounded-lg p-3 text-sm"
        />
      </div>
    </div>
  );
};

export default LeftComponent;
