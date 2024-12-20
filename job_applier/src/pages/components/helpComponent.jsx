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
import { postSuggestions } from "../../api/api";

export const HelpComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
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

  return (
    <>
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(true)} // Close sidebar
        >
          <CircleHelp className="h-5 w-5" />
          <span className="sr-only">help</span>
        </Button>
      </div>

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
};
