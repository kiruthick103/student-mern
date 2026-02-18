import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, FileText, Calendar, TrendingUp,
  AlertTriangle, CheckCircle, Flame, Target, Bell
} from 'lucide-react';
import { studentService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState({ attendance: [], stats: {} });
  const [marks, setMarks] = useState({ marks: [], average: 0, weakSubjects: [] });
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({ notes: '', files: '' });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'subjects', 'attendance', 'marks', 'assignments'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, attendanceRes, marksRes, assignmentsRes, studyPlanRes, materialsRes, announcementsRes] = await Promise.all([
        studentService.getProfile(),
        studentService.getAttendance(),
        studentService.getMarks(),
        studentService.getAssignments(),
        studentService.getStudyPlan(),
        studentService.getMaterials(),
        studentService.getAnnouncements()
      ]);

      setProfile(profileRes.data);
      setAttendance(attendanceRes.data);
      setMarks(marksRes.data);
      setAssignments(assignmentsRes.data);
      setStudyPlan(studyPlanRes.data);
      setMaterials(materialsRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSubmitAssignment = async () => {
    try {
      await studentService.submitAssignment(selectedAssignment._id, submissionData);
      setShowSubmitModal(false);
      setSubmissionData({ notes: '', files: '' });
      fetchData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Submission failed');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card p-8 group transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-sm border border-slate-50">
          <Icon className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors duration-500" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Selector (Mobile/Alternative Nav) */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar mb-8">
        {['dashboard', 'subjects', 'attendance', 'marks', 'assignments'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); navigate(`/student?tab=${tab}`); }}
            className={`px-6 py-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-all duration-200
              ${activeTab === tab
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'dashboard' && (
        <>
          {/* Welcome Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back, {profile?.user?.fullName || 'Student'}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Year {profile?.class || '1'}-{profile?.section || 'A'} | Roll No: {profile?.rollNumber || 'N/A'}
                </p>
              </div>
              {studyPlan?.studyPlan?.streak?.currentStreak > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-orange-700">
                    {studyPlan.studyPlan.streak.currentStreak} day streak!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notification Banner */}
          {(announcements.length > 0 || (marks.marks && marks.marks.length > 0)) && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Latest Update</p>
                    <p className="font-bold text-sm tracking-tight">
                      {announcements.length > 0
                        ? `Announcement: ${announcements[0].title}`
                        : `New Mark added for ${marks.marks[0].subject?.name}: ${marks.marks[0].grade}`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student?tab=${announcements.length > 0 ? 'dashboard' : 'marks'}`)}
                  className="px-6 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              icon={TrendingUp}
              title="Average Marks"
              value={`${marks.average || 0}%`}
              subtitle={marks.average >= 60 ? 'Good performance!' : 'Needs improvement'}
              color={marks.average >= 60 ? 'bg-green-500' : 'bg-orange-500'}
            />
            <StatCard
              icon={ClipboardList}
              title="Attendance"
              value={`${attendance.stats?.percentage || 0}%`}
              subtitle={`${attendance.stats?.present || 0} days present`}
              color={attendance.stats?.percentage >= 75 ? 'bg-blue-500' : 'bg-red-500'}
            />
            <StatCard
              icon={FileText}
              title="Assignments"
              value={assignments.filter(a => !a.mySubmission).length}
              subtitle="Pending"
              color="bg-purple-500"
            />
            <StatCard
              icon={Calendar}
              title="Study Tasks"
              value={studyPlan?.todayTasks?.length || 0}
              subtitle="Scheduled today"
              color="bg-teal-500"
            />
          </div>

          {/* Performance Trend Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Trend</h3>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: marks.marks?.slice(0, 7).reverse().map(m => new Date(m.date || Date.now()).toLocaleDateString()) || [],
                  datasets: [{
                    label: 'Marks Obtained',
                    data: marks.marks?.slice(0, 7).reverse().map(m => (m.marksObtained / m.totalMarks) * 100) || [],
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Announcement Summary */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Latest Announcements</h3>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                    <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{announcement.content}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No announcements</p>}
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Weekly Study Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{studyPlan?.weeklyProgress?.completedHours || 0} / {studyPlan?.weeklyProgress?.targetHours || 20} hours</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-900 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-slate-900/10"
                    style={{ width: `${Math.min(((studyPlan?.weeklyProgress?.completedHours || 0) / (studyPlan?.weeklyProgress?.targetHours || 20)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Keep going! You're doing great!</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'subjects' && (
        <div className="grid md:grid-cols-3 gap-6">
          {materials.map((material, idx) => (
            <div key={idx} className="card p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900">{material.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{material.subject?.name}</p>
              <a href={material.url} target="_blank" rel="noreferrer" className="btn-secondary w-full py-2">View Materials</a>
            </div>
          ))}
          {materials.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">No subjects/materials available.</div>}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Attendance History</h3>
            <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Overall: {attendance.stats?.percentage || 0}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.attendance?.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{record.subject || 'General'}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.attendance?.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Subject Marks</h3>
          </div>
          <div className="p-6 space-y-4">
            {marks.marks?.map((mark, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-300">
                    <BookOpen className="w-6 h-6 text-slate-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{mark.subject?.name}</h4>
                    <p className="text-xs text-gray-500">{mark.examType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{mark.marksObtained} / {mark.totalMarks}</p>
                  <p className="text-xs font-bold text-primary-600">Grade: {mark.grade}</p>
                </div>
              </div>
            ))}
            {marks.marks?.length === 0 && <div className="text-center py-12 text-gray-500">No marks entries yet.</div>}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid md:grid-cols-2 gap-6">
          {assignments.map((assignment, idx) => (
            <div key={idx} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{assignment.title}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${assignment.mySubmission ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {assignment.mySubmission ? 'SUBMITTED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{assignment.subject?.name}</p>
                <p className="text-xs text-gray-400 mb-4">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                disabled={assignment.mySubmission}
                className={`w-full py-2 rounded-lg font-bold transition-colors ${assignment.mySubmission ? 'bg-gray-100 text-gray-400' : 'btn-primary'}`}
              >
                {assignment.mySubmission ? 'Submission Fixed' : 'Submit Now'}
              </button>
            </div>
          ))}
          {assignments.length === 0 && <div className="col-span-2 text-center py-12 text-gray-500">No assignments found.</div>}
        </div>
      )}

      {/* Assignment Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl modal-content">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Assignment</h3>
            <p className="text-gray-600 mb-6">{selectedAssignment.title} - {selectedAssignment.subject?.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Notes</label>
                <textarea
                  className="input h-32"
                  placeholder="Explain your work..."
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData({ ...submissionData, notes: e.target.value })}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL (GitHub/Drive)</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={submissionData.files}
                  onChange={(e) => setSubmissionData({ ...submissionData, files: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                className="btn-secondary flex-1 py-3"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1 py-3"
                onClick={handleSubmitAssignment}
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
