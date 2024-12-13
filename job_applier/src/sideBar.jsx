import React, { useState, useEffect } from "react";

import {
  Menu,
  X,
  LogOut,
  User,
  FileText,
  History,
  Briefcase,
  CircleHelp,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { postSuggestions } from "./api/api";

function SidebarComponent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { open, setOpen } = useSidebar(); // Get sidebar state and toggler
  const [suggestion, setSuggestion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Open initially for testing

  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      alert("Please enter a suggestion.");
      return;
    }

    try {
      await postSuggestions(suggestion);
      alert("Thank you for your suggestion!");
    } catch (error) {
      console.error("Failed to submit suggestion:", error);
      alert("Failed to submit your suggestion. Please try again later.");
    } finally {
      setSuggestion("");
      setIsModalOpen(false);
    }
  };

  const menuItems = [
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      tooltip: "Manage your personal and professional details",
    },
    {
      label: "Customize Resume",
      href: "/customize-resume",
      icon: FileText,
      tooltip: "Tailor your resume for job applications",
    },
    {
      label: "History",
      href: "/history",
      icon: History,
      tooltip: "View your past job applications",
    },
    {
      label: "LinkedIn Easy Apply",
      href: "/linkedin-easy-apply",
      icon: Briefcase,
      tooltip:
        "Automatically apply to jobs on LinkedIn using your tailored profile",
    },
  ];

  return (
    <>
      <TooltipProvider>
        <div className="w-1/5 max-w-xs">
          <Sidebar>
            <SidebarHeader className="border-b p-4 flex flex-row justify-between items-center">
              <h2 className="text-lg font-semibold">Tailor CV</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)} // Close sidebar
              >
                <CircleHelp className="h-5 w-5" />
                <span className="sr-only">help</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)} // Close sidebar
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.label}
                    className={
                      pathname === item.href
                        ? "rounded-md bg-white text-black"
                        : ""
                    }
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.href}
                            className="flex items-center gap-2"
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white px-3 py-2 rounded shadow-lg">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <a
                          href="#"
                          onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                          }}
                          className="flex items-center gap-2"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </a>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white px-3 py-2 rounded shadow-lg">
                      Logout from your account
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </div>
      </TooltipProvider>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We Value Your Feedback</DialogTitle>
            <DialogDescription>
              Got ideas to make our application better? Share your suggestions
              or feedback below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your suggestion here..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="mt-4"
          />
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AppSideBar() {
  return (
    <div className="absolute md:relative w-fit max-w-xs">
      <SidebarProvider>
        {/* Sidebar Trigger for Mobile */}
        <SidebarTrigger onClick={() => console.log("Trigger clicked!")}>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>

        <SidebarComponent />
      </SidebarProvider>
    </div>
  );
}
