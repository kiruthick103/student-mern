import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, FileText, ClipboardList, Plus, Search,
  Edit2, Trash2, X, Check, AlertCircle, BarChart3
} from 'lucide-react';
import { teacherService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['students', 'subjects', 'assignments', 'materials', 'announcements', 'attendance', 'analytics', 'dashboard'].includes(tab)) {
      setActiveTab(tab === 'dashboard' ? 'students' : tab); // Map dashboard to students/default
    }
  }, [location.search]);

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
      } else if (activeTab === 'materials') {
        const response = await teacherService.getMaterials();
        setMaterials(response.data);
      } else if (activeTab === 'announcements') {
        const response = await teacherService.getAnnouncements();
        setAnnouncements(response.data);
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
      if (modalType === 'edit') {
        await teacherService.updateStudent(formData._id || formData.id, formData);
      } else {
        await teacherService.addStudent(formData);
      }
      setShowModal(false);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  const handleAction = async (type) => {
    try {
      if (type === 'subject') await teacherService.addSubject(formData);
      if (type === 'assignment') await teacherService.createAssignment(formData);
      if (type === 'announcement') await teacherService.postAnnouncement(formData);
      if (type === 'material') await teacherService.uploadMaterial(formData);
      if (type === 'marks') await teacherService.addMarks(formData);

      setShowModal(false);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error(`Error with ${type}:`, error);
      alert('Action failed. Check console for details.');
    }
  };

  const handleUpdateAttendance = async (studentId, status) => {
    try {
      await teacherService.updateAttendance({
        studentId,
        date: new Date().toISOString().split('T')[0],
        status,
        subject: subjects[0]?._id // Default to first subject if none selected
      });
      fetchData();
    } catch (error) {
      console.error('Error updating attendance:', error);
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

  const handleViewSubmissions = async (assignment) => {
    setViewingAssignment(assignment);
    setModalType('view_submissions');
    setShowModal(true);
    setLoadingSubmissions(true);
    try {
      const response = await teacherService.getAssignmentSubmissions(assignment._id);
      setSelectedSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
    setLoadingSubmissions(false);
  };

  const filteredStudents = students.filter(s =>
    s.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="card p-8 group transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-sm border border-slate-50">
          <Icon className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-8">
        <StatCard
          icon={Users}
          title="Total Students"
          value={analytics?.totalStudents || students.length || 0}
        />
        <StatCard
          icon={BookOpen}
          title="Subjects"
          value={analytics?.totalSubjects || subjects.length || 0}
        />
        <StatCard
          icon={FileText}
          title="Assignments"
          value={analytics?.totalAssignments || assignments.length || 0}
        />
        <StatCard
          icon={ClipboardList}
          title="Today's Attendance"
          value={analytics?.todayAttendance || 0}
        />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-4">
          <div className="flex border-b border-slate-50 overflow-x-auto no-scrollbar">
            {['students', 'subjects', 'assignments', 'materials', 'announcements', 'attendance', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); navigate(`/teacher?tab=${tab}`); }}
                className={`px-6 py-5 font-bold text-xs uppercase tracking-widest border-b-2 transition-all duration-200 ${activeTab === tab
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
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
                filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Year</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map(student => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-slate-900">
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
                                  onClick={() => { setFormData(student); setModalType('marks'); setShowModal(true); }}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded tooltip-trigger"
                                  title="Add Marks"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
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
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No students found.</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">All Subjects</h3>
                <button className="btn-primary flex items-center gap-2" onClick={() => { setModalType('subject'); setShowModal(true); setFormData({}); }}>
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>
              {subjects.length > 0 ? (
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
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No subjects added yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                <button className="btn-primary flex items-center gap-2" onClick={() => { setModalType('assignment'); setShowModal(true); setFormData({}); }}>
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
              {assignments.length > 0 ? (
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
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {assignment.status}
                          </span>
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                          >
                            View Submissions ({assignment.submissions?.length || 0})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No assignments created yet.</p>
                </div>
              )}
            </div>
          )}
          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Study Materials</h3>
                <button className="btn-primary flex items-center gap-2" onClick={() => { setModalType('material'); setShowModal(true); setFormData({}); }}>
                  <Plus className="w-4 h-4" />
                  Upload Material
                </button>
              </div>
              {materials.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {materials.map(material => (
                    <div key={material._id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">{material.description}</p>
                          <p className="text-xs text-primary-600 mt-2">{material.subject?.name} • {material.type}</p>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No study materials uploaded yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Announcements</h3>
                <button className="btn-primary flex items-center gap-2" onClick={() => { setModalType('announcement'); setShowModal(true); setFormData({}); }}>
                  <Plus className="w-4 h-4" />
                  New Announcement
                </button>
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div key={announcement._id} className="card p-4">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>By: {announcement.postedBy?.fullName}</span>
                        <span>Target: {announcement.targetAudience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No announcements posted yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Today's Attendance ({new Date().toLocaleDateString()})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map(student => {
                      const todayAttendance = student.attendance?.find(a => a.date === new Date().toISOString().split('T')[0]);
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{student.user?.fullName}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${todayAttendance?.status === 'present' ? 'text-green-600' : todayAttendance?.status === 'absent' ? 'text-red-600' : 'text-gray-500'}`}>
                              {todayAttendance?.status ? (todayAttendance.status === 'present' ? 'Present' : 'Absent') : 'Not Marked'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateAttendance(student.user?._id, 'present')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${todayAttendance?.status === 'present' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                              >
                                {todayAttendance?.status === 'present' ? <Check className="w-4 h-4" /> : 'Present'}
                              </button>
                              <button
                                onClick={() => handleUpdateAttendance(student.user?._id, 'absent')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${todayAttendance?.status === 'absent' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                              >
                                {todayAttendance?.status === 'absent' ? <Check className="w-4 h-4" /> : 'Absent'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Year Distribution</h3>
              {analytics?.classDistribution && (
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  {analytics.classDistribution.map(item => (
                    <div key={item._id} className="card p-4">
                      <p className="text-sm text-gray-600">Year {item._id}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  ))}
                </div>
              )}

              {analytics?.marksData && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
                  <div className="card p-6 h-[400px] flex items-center justify-center">
                    <Bar
                      data={{
                        labels: analytics.marksData.map(m => m.subjectName),
                        datasets: [{
                          label: 'Average Marks %',
                          data: analytics.marksData.map(m => m.avgMarks),
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.6)',
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(245, 158, 11, 0.6)',
                            'rgba(139, 92, 246, 0.6)',
                          ],
                          borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(59, 130, 246)',
                            'rgb(16, 185, 129)',
                            'rgb(245, 158, 11)',
                            'rgb(139, 92, 246)',
                          ],
                          borderWidth: 2,
                          borderRadius: 8
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: { beginAtZero: true, max: 100 }
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {analytics.marksData.map(mark => (
                      <div key={mark.subjectName} className="card p-4">
                        <span className="text-sm text-gray-600 block mb-1">{mark.subjectName}</span>
                        <span className={`text-xl font-bold ${mark.avgMarks >= 60 ? 'text-green-600' : 'text-red-600'}`}>
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

      {/* Modal System */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {modalType.replace('_', ' ')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {(modalType === 'student' || modalType === 'edit') && (
                <>
                  <input placeholder="Full Name" className="input" value={formData.fullName || formData.user?.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                  <input placeholder="Email Address" type="email" className="input" value={formData.email || formData.user?.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  {(modalType === 'student') && <input placeholder="Password (default: student123)" type="password" className="input" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />}
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Roll Number" className="input" value={formData.rollNumber || ''} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} />
                    <input placeholder="Year" className="input" value={formData.class || ''} onChange={(e) => setFormData({ ...formData, class: e.target.value })} />
                  </div>
                  <input placeholder="Section (e.g. A)" className="input" value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
                  <button onClick={handleAddStudent} className="w-full btn-primary py-3">
                    {modalType === 'edit' ? 'Update Student' : 'Add Student'}
                  </button>
                </>
              )}

              {modalType === 'marks' && (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Marks for {formData.user?.fullName}</p>
                  <select className="input" onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <input type="number" placeholder="Marks Obtained" className="input" onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })} />
                  <input type="number" placeholder="Total Marks" className="input" onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} />
                  <button onClick={() => handleAction('marks')} className="w-full btn-primary py-3">Save Marks</button>
                </>
              )}

              {modalType === 'subject' && (
                <>
                  <input placeholder="Subject Name" className="input" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <input placeholder="Subject Code (unqiue)" className="input" onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                  <input placeholder="Credits" type="number" className="input" onChange={(e) => setFormData({ ...formData, credits: e.target.value })} />
                  <textarea placeholder="Description" className="input h-24" onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                  <button onClick={() => handleAction('subject')} className="w-full btn-primary py-3">Save Subject</button>
                </>
              )}

              {modalType === 'assignment' && (
                <>
                  <input placeholder="Assignment Title" className="input" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  <select className="input" onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <input type="date" className="input" onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                  <textarea placeholder="Instructions" className="input h-24" onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                  <button onClick={() => handleAction('assignment')} className="w-full btn-primary py-3">Create</button>
                </>
              )}

              {modalType === 'announcement' && (
                <>
                  <input placeholder="Announcement Title" className="input" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  <select className="input" value={formData.targetAudience || 'all'} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}>
                    <option value="all">All Students</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                  </select>
                  <textarea placeholder="Content" className="input h-32" value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })}></textarea>
                  <button onClick={() => handleAction('announcement')} className="w-full btn-primary py-3">Post Announcement</button>
                </>
              )}

              {modalType === 'material' && (
                <>
                  <input placeholder="Material Title" className="input" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  <input placeholder="File/Link URL" className="input" onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                  <select className="input" onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <select className="input" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="PDF">PDF Document</option>
                    <option value="Video">Video Link</option>
                    <option value="Link">Other Link</option>
                  </select>
                  <button onClick={() => handleAction('material')} className="w-full btn-primary py-3">Upload</button>
                </>
              )}

              {modalType === 'view_submissions' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Submissions for: <span className="font-semibold">{viewingAssignment?.title}</span></p>
                  {loadingSubmissions ? (
                    <div className="text-center py-8">Loading submissions...</div>
                  ) : selectedSubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSubmissions.map((sub, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">{sub.student?.fullName || 'Unknown Student'}</span>
                            <span className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 italic border-l-2 border-gray-200 pl-3 my-2">"{sub.notes}"</p>
                          {sub.files && (
                            <a
                              href={sub.files}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-primary-600 flex items-center gap-1 hover:underline"
                            >
                              <FileText className="w-3 h-3" /> View Submitted File/Link
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No submissions yet for this assignment.</div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => setShowModal(false)} className="w-full mt-4 text-gray-500 font-medium hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
