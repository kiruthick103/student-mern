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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SMS</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 mb-8 uppercase tracking-widest leading-none">
            Digital Campus Excellence
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.05]">
            Manage your <br />
            <span className="text-slate-400">academic life.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            The minimal, high-performance portal for modern faculty and ambitious students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base px-10 py-4 shadow-xl shadow-slate-900/10"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-base px-10 py-4"
            >
              Explore Solutions
            </button>
          </div>
        </div>
      </section>

      {/* Portal Selection Grid */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div
              onClick={() => navigate('/login')}
              className="group cursor-pointer bg-white p-12 rounded-[40px] border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Faculty Portal</h3>
              <p className="text-slate-500 leading-relaxed mb-8 font-medium">
                Streamline student records, attendance tracking, and grading with zero friction.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                Enter Portal <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <div
              onClick={() => navigate('/login')}
              className="group cursor-pointer bg-white p-12 rounded-[40px] border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <GraduationCap className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Student Hub</h3>
              <p className="text-slate-500 leading-relaxed mb-8 font-medium">
                Access your grades, track daily attendance, and plan your study success.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                Enter Hub <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-8 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="group">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <GraduationCap className="w-6 h-6 text-slate-900" />
            <span className="font-bold">SMS</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            © 2026 Student Management System. Built for academics.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
