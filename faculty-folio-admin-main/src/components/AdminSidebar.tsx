import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  BookOpen,
  FileText,
  GraduationCap,
  Users,
  Presentation,
  Plane,
  User,
  Settings,
  Download,
  LogOut,
  ChevronLeft,
  Building2,
  Mail,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Navigation items for different roles
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/", icon: Home },
  ];

  if (userRole === 'admin') {
    return [
      ...baseItems,
      { title: "Publications", url: "/publications", icon: BookOpen },
      { title: "Projects", url: "/projects", icon: FileText },
      { title: "FYPs", url: "/fyps", icon: GraduationCap },
      { title: "Theses", url: "/theses", icon: Users },
      { title: "Workshops", url: "/workshops", icon: Presentation },
      { title: "Travel Grants", url: "/travel-grants", icon: Plane },
      { title: "Faculty Management", url: "/faculty", icon: User },
      { title: "Contacts", url: "/contacts", icon: Mail },
      { title: "Master Data", url: "/master-data", icon: Settings },
      { title: "Reports & Exports", url: "/reports", icon: Download },
    ];
  } else if (userRole === 'faculty') {
    return [
      ...baseItems,
      { title: "My Projects", url: "/projects", icon: FileText },
      { title: "My FYPs", url: "/fyps", icon: GraduationCap },
      { title: "My Theses", url: "/theses", icon: Users },
      { title: "My Workshops", url: "/workshops", icon: Presentation },
      { title: "My Travel Grants", url: "/travel-grants", icon: Plane },
    ];
  }

  return baseItems;
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  // Get navigation items based on user role
  const navigationItems = getNavigationItems(user?.role || 'faculty');

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const active = isActive(path);
    return active
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-heading font-semibold text-lg text-sidebar-foreground">
                  ResearchPortal
                </h1>
                <p className="text-sm text-sidebar-foreground/70">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink
                      to={item.url}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${getNavClasses(
                        item.url
                      )}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        <div className="space-y-2">
          {user && !isCollapsed && (
            <div className="px-3 py-2 text-sm">
              <div className="font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sidebar-foreground/70 capitalize">
                {user.role}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="flex items-center space-x-3 text-sidebar-foreground hover:bg-sidebar-accent/50 justify-start h-11 w-full"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}