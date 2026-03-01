import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, BookOpen, Building2, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const { user, profile, primaryRole, hasRole } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (hasRole("teacher") || hasRole("admin")) {
          const response = await api.get("/teacher/analytics");
          setStats(response.data);
        }
      } catch (error) {
        console.error("Fetch stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hasRole]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.fullName || "User"}`}
        description={`Welcome to your ${primaryRole ?? ""} dashboard`}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          {(hasRole("admin") || hasRole("teacher")) && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Students" value={stats.totalStudents ?? 0} icon={Users} />
              {hasRole("admin") && (
                <>
                  <StatCard title="Departments" value={stats.totalDepartments ?? 0} icon={Building2} />
                  <StatCard title="Courses" value={stats.totalCourses ?? 0} icon={GraduationCap} />
                </>
              )}
              <StatCard title="Subjects" value={stats.totalSubjects ?? 0} icon={BookOpen} />
              <StatCard title="Assignments" value={stats.totalAssignments ?? 0} icon={ClipboardList} />
            </div>
          )}

          {hasRole("student") && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">My Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your marks and performance from the Marks section in the sidebar.
                </p>
              </CardContent>
            </Card>
          )}

          {hasRole("parent") && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Child's Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your child's academic performance from the Marks section.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
