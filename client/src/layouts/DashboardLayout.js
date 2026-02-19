import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, FileText, Bell,
  BarChart3, LogOut, GraduationCap, Calendar, Settings,
  ClipboardList, Megaphone, FolderOpen, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teacherService, studentService } from '../services/api';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const service = user.role === 'teacher' ? teacherService : studentService;
      const response = await service.getAnnouncements();
      setNotifications(response.data.slice(0, 5)); // Show latest 5
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const teacherNav = [
    { path: '/teacher?tab=dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teacher?tab=students', icon: Users, label: 'Students' },
    { path: '/teacher?tab=subjects', icon: BookOpen, label: 'Subjects' },
    { path: '/teacher?tab=attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/teacher?tab=assignments', icon: FileText, label: 'Assignments' },
    { path: '/teacher?tab=announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/teacher?tab=materials', icon: FolderOpen, label: 'Materials' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const studentNav = [
    { path: '/student?tab=dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: Users, label: 'My Profile' },
    { path: '/student?tab=subjects', icon: BookOpen, label: 'My Subjects' },
    { path: '/student?tab=attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/student?tab=marks', icon: FileText, label: 'My Marks' },
    { path: '/student?tab=assignments', icon: Calendar, label: 'Assignments' },
    { path: '/study-planner', icon: Calendar, label: 'Study Planner' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const navItems = user?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-shrink-0 flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">SMS</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mt-1">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-link w-full ${location.pathname + location.search === item.path ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.role === 'teacher' ? 'Faculty Portal' : 'Student Hub'}
              </h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">Management</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-emerald-50/50 hover:text-emerald-600'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-100 z-50 overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-emerald-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto">
                      {loading ? (
                        <div className="p-12 text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-emerald-50">
                          {notifications.map((notif, idx) => (
                            <div key={idx} className="p-6 hover:bg-emerald-50/50 cursor-pointer transition-colors" onClick={() => {
                              setShowNotifications(false);
                              navigate(user.role === 'teacher' ? '/teacher?tab=announcements' : '/student?tab=dashboard');
                            }}>
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                  <Megaphone className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{notif.content}</p>
                                  <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-wider">
                                    {new Date(notif.createdAt || Date.now()).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-slate-300">
                          <Bell className="w-12 h-12 mx-auto mb-4 opacity-10" />
                          <p className="text-sm font-medium">No new alerts found</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-emerald-50/30 border-t border-emerald-50 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(user.role === 'teacher' ? '/teacher?tab=announcements' : '/student?tab=dashboard');
                        }}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        See All Updates
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-100"></div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user?.fullName}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border-2 border-white ring-1 ring-emerald-100">
                  <span className="text-sm font-bold text-emerald-600">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          {children}
        </div>
      </main>
    </div>
  );
};
export default DashboardLayout;
