import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // required for nested routing
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "./ui/button";
import { ChevronDown, LogOut } from "lucide-react";

import { menuSections, downloadItems } from "./layoutConfig"; // (optional: if you extracted your menu)

export default function DashboardLayout() {
  const { loading, user, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [sidebarWidth, setSidebarWidth] = useState(
    () => parseInt(localStorage.getItem("sidebar-width") || "280", 10)
  );

  useEffect(() => {
    localStorage.setItem("sidebar-width", sidebarWidth.toString());
  }, [sidebarWidth]);

  // show loading skeleton if auth is checking
  if (loading) {
    return null; // or your skeleton
  }

  // if there's no authenticated user, redirect to login
  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <div className="flex h-screen">
        {/* Sidebar markup */}
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="h-16 flex items-center px-4">
            <Button onClick={toggleSidebar}>Menu</Button>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuSections.map((section) => (
                <div key={section.section}>
                  <p className="sidebar-section-title">{section.section}</p>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => {
                          window.location.hash = `#${item.path}`;
                        }}
                      >
                        <item.icon /> {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={logout}>
                  <LogOut /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN CONTENT AREA */}
        <SidebarInset>
          <div className="flex-1 overflow-auto p-4">
            {/* **Routed content shows up here via Outlet** */}
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}