import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileText, ClipboardList, Plus, Search,
  Edit2, Trash2, X, Check, AlertCircle, BarChart3
} from 'lucide-react';
import { teacherService } from '../services/api';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const response = await teacherService.getStudents();
        setStudents(response.data);
      } else if (activeTab === 'subjects') {
        const response = await teacherService.getSubjects();
        setSubjects(response.data);
      } else if (activeTab === 'assignments') {
        const response = await teacherService.getAssignments();
        setAssignments(response.data);
      } else if (activeTab === 'analytics') {
        const response = await teacherService.getAnalytics();
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleAddStudent = async () => {
    try {
      await teacherService.addStudent(formData);
      setShowModal(false);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await teacherService.deleteStudent(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Students" 
          value={analytics?.totalStudents || students.length || 0}
          color="bg-blue-500"
        />
        <StatCard 
          icon={BookOpen} 
          title="Subjects" 
          value={analytics?.totalSubjects || subjects.length || 0}
          color="bg-green-500"
        />
        <StatCard 
          icon={FileText} 
          title="Assignments" 
          value={analytics?.totalAssignments || assignments.length || 0}
          color="bg-purple-500"
        />
        <StatCard 
          icon={ClipboardList} 
          title="Today's Attendance" 
          value={analytics?.todayAttendance || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['students', 'subjects', 'assignments', 'attendance', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <button
                  onClick={() => { setModalType('student'); setShowModal(true); }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map(student => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {student.user?.fullName?.charAt(0) || '?'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {student.user?.fullName || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{student.rollNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{student.class}-{student.section}</td>
                          <td className="py-3 px-4 text-gray-600">{student.user?.email}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setFormData(student); setModalType('edit'); setShowModal(true); }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(student._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">All Subjects</h3>
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <div key={subject._id} className="card p-4 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">Code: {subject.code}</p>
                        <p className="text-sm text-gray-600">Credits: {subject.credits}</p>
                      </div>
                      <BookOpen className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment._id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                        <p className="text-sm text-gray-600">
                          Subject: {assignment.subject?.name} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Attendance management interface coming soon</p>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Class Distribution</h3>
              {analytics?.classDistribution && (
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {analytics.classDistribution.map(item => (
                    <div key={item._id} className="card p-4">
                      <p className="text-sm text-gray-600">Class {item._id}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  ))}
                </div>
              )}
              
              {analytics?.marksData && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
                  <div className="card p-4">
                    {analytics.marksData.map(mark => (
                      <div key={mark.subjectName} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium">{mark.subjectName}</span>
                        <span className={`font-semibold ${mark.avgMarks >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                          {mark.avgMarks.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && modalType === 'student' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                placeholder="Full Name"
                className="input"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
              <input
                placeholder="Email"
                type="email"
                className="input"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input
                placeholder="Roll Number"
                className="input"
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Class"
                  className="input"
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                />
                <input
                  placeholder="Section"
                  className="input"
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddStudent} className="btn-primary flex-1">Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
