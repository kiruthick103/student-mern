import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, FileText, Bell, 
  BarChart3, LogOut, GraduationCap, Calendar, Settings,
  ClipboardList, Megaphone, FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherNav = [
    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher', icon: Users, label: 'Students' },
    { path: '/teacher', icon: BookOpen, label: 'Subjects' },
    { path: '/teacher', icon: ClipboardList, label: 'Attendance' },
    { path: '/teacher', icon: FileText, label: 'Assignments' },
    { path: '/teacher', icon: Megaphone, label: 'Announcements' },
    { path: '/teacher', icon: FolderOpen, label: 'Materials' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const studentNav = [
    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: Users, label: 'My Profile' },
    { path: '/student', icon: BookOpen, label: 'My Subjects' },
    { path: '/student', icon: ClipboardList, label: 'Attendance' },
    { path: '/student', icon: FileText, label: 'My Marks' },
    { path: '/student', icon: Calendar, label: 'Assignments' },
    { path: '/study-planner', icon: Calendar, label: 'Study Planner' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const navItems = user?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">SMS</h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`sidebar-link w-full ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
