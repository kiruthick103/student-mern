import { useNavigate } from "react-router-dom";
import { Shield, GraduationCap, BookOpen, Users, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const adminFeatures = [
    { icon: Users, label: "Manage Students" },
    { icon: BookOpen, label: "Manage Courses" },
    { icon: Shield, label: "Manage Departments" },
    { icon: FileText, label: "Manage Exams & Marks" },
  ];

  const studentFeatures = [
    { icon: FileText, label: "View Marks" },
    { icon: BookOpen, label: "View Courses" },
    { icon: Users, label: "Student Profile" },
    { icon: GraduationCap, label: "Academic Progress" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            College Management System
          </h1>
          <p className="text-lg text-slate-600">
            Select your portal to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Column */}
          <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => navigate("/auth")}>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Admin Portal</CardTitle>
                  <CardDescription className="text-blue-100">
                    For administrators & teachers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {adminFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <feature.icon className="h-5 w-5 text-blue-500" />
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Enter as Admin
              </Button>
            </CardContent>
          </Card>

          {/* Student Column */}
          <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => navigate("/auth")}>
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Student Portal</CardTitle>
                  <CardDescription className="text-emerald-100">
                    For students & parents
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {studentFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <feature.icon className="h-5 w-5 text-emerald-500" />
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
                Enter as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          © 2024 College Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
