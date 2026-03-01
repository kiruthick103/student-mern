import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Building2,
  LogOut,
  FileText,
} from "lucide-react";
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "student", "parent"] },
  { title: "Students", url: "/students", icon: Users, roles: ["admin", "teacher"] },
  { title: "Departments", url: "/departments", icon: Building2, roles: ["admin"] },
  { title: "Courses", url: "/courses", icon: GraduationCap, roles: ["admin"] },
  { title: "Subjects", url: "/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
  { title: "Exams", url: "/exams", icon: ClipboardList, roles: ["admin", "teacher"] },
  { title: "Marks", url: "/marks", icon: FileText, roles: ["admin", "teacher", "student", "parent"] },
];

export function AppSidebar() {
  const { profile, primaryRole, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNav = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const initials = profile?.fullName
    ? profile.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold text-sidebar-foreground">
              College Manager
            </span>
            <span className="text-xs capitalize text-muted-foreground">
              {primaryRole ?? "User"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {profile?.fullName || "User"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {profile?.email}
            </span>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/auth");
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
