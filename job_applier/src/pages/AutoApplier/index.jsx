import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Clock, Target, TrendingUp } from "lucide-react";
import { postGetStartedData } from "../../api/api";

export default function LinkedInEasyApplyDashboard() {
  const { toast } = useToast();
  const postDataForGetStarted = async () => {
    try {
      await postGetStartedData();
    } catch (e) {
      console.error("error while posting get Started data", e);
    }
  };
  return (
    <div className="flex-1 flex justify-center items-center pt-6 pr-6 pb-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            LinkedIn Easy Apply Automation
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Effortlessly apply to jobs while saving time and maximizing
            opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Introduction Section */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              What is LinkedIn Easy Apply Automation?
            </h2>
            <p className="text-muted-foreground">
              This tool automates job applications on LinkedIn, focusing on Easy
              Apply jobs. Connect your LinkedIn profile, choose job preferences,
              and let the system handle the rest!
            </p>
          </section>

          {/* Steps to Get Started */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Steps to Get Started</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <span className="font-medium">Connect Profile:</span> Link your
                LinkedIn account securely to get started.
              </li>
              <li>
                <span className="font-medium">Set Preferences:</span> Select
                industries, job titles, and locations of interest.
              </li>
              <li>
                <span className="font-medium">Customize Applications:</span> Use
                your tailored resume and personalized cover letters for every
                job.
              </li>
            </ol>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              onClick={async () => {
                await postDataForGetStarted();
                toast({
                  title: "Thanks for Your Interest!",
                  description:
                    "You're part of the journey! We're counting you in as we gear up for launch. Stay tuned!",
                  variant: "info",
                });
              }}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {/* <Button variant="outline" size="lg">
              Learn More
            </Button> */}
          </div>

          {/* Statistics & Benefits */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Clock className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold">Save Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Save up to 90% of your time on repetitive applications.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Target className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold">Target Precision</h3>
                  <p className="text-sm text-muted-foreground">
                    Target only jobs that match your criteria.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold">Increase Chances</h3>
                  <p className="text-sm text-muted-foreground">
                    Increase chances with optimized resumes and keywords.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            Your data is secure and only used for applying to jobs with your
            consent.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
