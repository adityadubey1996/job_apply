import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import AppSidebar from "./sideBar";
import Profile from "./pages/Profile";
import CustomizeResume from "./pages/CustomizeResume/CustomizeResume";
import History from "./pages/History";
import AISetup from "./pages/AISetup";
import { LoginForm } from "./pages/Auth/login";
import { RegisterForm } from "./pages/Auth/register";
import { Toaster } from "@/components/ui/toaster";
import { setNavigate } from "./services/navigationService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import LandingPage from "./pages/landingPage";
// Wrapper to conditionally include sidebar
const AppWrapper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    setNavigate(navigate); // Set the navigation function globally
  }, [navigate]);

  const location = useLocation();
  const excludeSidebarRoutes = ["/", "/login", "/register"]; // Routes without sidebar

  const shouldShowSidebar = !excludeSidebarRoutes.includes(location.pathname);

  return (
    <div className={`${shouldShowSidebar ? "flex min-h-screen w-screen" : ""}`}>
      {shouldShowSidebar && <AppSidebar />}
      <div
        className={`${
          shouldShowSidebar
            ? "flex-1 flex justify-center items-center"
            : "w-screen px-4" // Add padding for non-sidebar pages
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customize-resume" element={<CustomizeResume />} />
          <Route path="/history" element={<History />} />
          <Route path="/ai-setup" element={<AISetup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <Toaster />
    <AppWrapper />
  </Router>
);

export default App;
