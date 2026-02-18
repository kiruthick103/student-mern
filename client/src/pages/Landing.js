import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, FileText, BarChart3, Bell, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: 'Student Management', desc: 'Add, edit, and manage student records' },
    { icon: BookOpen, title: 'Subject Tracking', desc: 'Organize courses and curriculum' },
    { icon: FileText, title: 'Assignments', desc: 'Create and track assignments' },
    { icon: BarChart3, title: 'Analytics', desc: 'Performance insights and reports' },
    { icon: Bell, title: 'Announcements', desc: 'Real-time notifications' },
    { icon: Shield, title: 'Secure Access', desc: 'Role-based authentication' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-6">
              <GraduationCap className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Student Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A comprehensive platform for teachers and students to manage academics, 
              track progress, and stay organized.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Portal Selection */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          Select Your Portal
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Portal */}
          <div 
            onClick={() => navigate('/login')}
            className="card card-hover p-8 cursor-pointer border-2 border-transparent hover:border-primary-200"
          >
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher Portal</h3>
            <p className="text-gray-600 mb-6">
              Manage students, track attendance, assign marks, and view analytics.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Student Management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Attendance Tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Grade Management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Analytics Dashboard
              </li>
            </ul>
          </div>

          {/* Student Portal */}
          <div 
            onClick={() => navigate('/login')}
            className="card card-hover p-8 cursor-pointer border-2 border-transparent hover:border-secondary-200"
          >
            <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Portal</h3>
            <p className="text-gray-600 mb-6">
              View marks, track attendance, access materials, and plan your studies.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                View Grades & Attendance
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                Study Planner
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                Weak Subject Detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                Progress Tracking
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="card p-6">
                <feature.icon className="w-8 h-8 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Student Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
