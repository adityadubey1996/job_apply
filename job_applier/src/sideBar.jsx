import * as React from "react";
import {
  Menu,
  X,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  User,
  FileText,
  History,
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

function SidebarComponent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { open, setOpen } = useSidebar(); // Get sidebar state and toggler
  const menuItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Customize Resume", href: "/customize-resume", icon: FileText },
    { label: "History", href: "/history", icon: History },
    // { label: "AI-setup", href: "/ai-setup", icon: Settings },
  ];

  return (
    <div className="w-1/5 max-w-xs">
      <Sidebar>
        <SidebarHeader className="border-b p-4 flex flex-row justify-between items-center">
          <h2 className="text-lg font-semibold">My App</h2>
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
                    ? "rounded-md  bg-white text-black"
                    : ""
                }
              >
                <SidebarMenuButton asChild>
                  <a href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

export default function AppSideBar() {
  return (
    <div className="w-fit max-w-xs">
      <SidebarProvider>
        {/* Sidebar Trigger for Mobile */}
        <SidebarTrigger
          // className="md:hidden"
          onClick={() => console.log("Trigger clicked!")}
        >
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>

        <SidebarComponent />
      </SidebarProvider>
    </div>
  );
}
