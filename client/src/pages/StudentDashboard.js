import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ClipboardList, FileText, Calendar, TrendingUp,
  AlertTriangle, CheckCircle, Flame, Target
} from 'lucide-react';
import { studentService } from '../services/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState({ attendance: [], stats: {} });
  const [marks, setMarks] = useState({ marks: [], average: 0, weakSubjects: [] });
  const [assignments, setAssignments] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, attendanceRes, marksRes, assignmentsRes, studyPlanRes] = await Promise.all([
        studentService.getProfile(),
        studentService.getAttendance(),
        studentService.getMarks(),
        studentService.getAssignments(),
        studentService.getStudyPlan()
      ]);

      setProfile(profileRes.data);
      setAttendance(attendanceRes.data);
      setMarks(marksRes.data);
      setAssignments(assignmentsRes.data);
      setStudyPlan(studyPlanRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back, {profile?.user?.fullName || 'Student'}!
            </h2>
            <p className="text-gray-600 mt-1">
              Class {profile?.class || '10'}-{profile?.section || 'A'} | Roll No: {profile?.rollNumber || 'N/A'}
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weak Subjects Alert */}
        {marks.weakSubjects?.length > 0 && (
          <div className="card p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Subjects Needing Attention</h3>
            </div>
            <div className="space-y-3">
              {marks.weakSubjects.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subject.subject}</span>
                  <span className="text-sm text-red-600">
                    {(subject.marks.reduce((a, b) => a + b, 0) / subject.marks.length).toFixed(1)}% avg
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Study Tasks</h3>
          {studyPlan?.todayTasks?.length > 0 ? (
            <div className="space-y-3">
              {studyPlan.todayTasks.slice(0, 3).map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`w-5 h-5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">{task.duration} min • {task.scheduledTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks scheduled for today</p>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Assignments</h3>
          {assignments.filter(a => !a.mySubmission).slice(0, 3).map((assignment, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{assignment.title}</p>
                <p className="text-sm text-gray-600">{assignment.subject?.name}</p>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                new Date(assignment.dueDate) < new Date() 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {/* Weekly Progress */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Study Progress</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">{studyPlan?.weeklyProgress?.completedHours || 0} / {studyPlan?.weeklyProgress?.targetHours || 20} hours</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all"
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

      {/* Recent Marks */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Marks</h3>
        </div>
        <div className="p-6">
          {marks.marks?.slice(0, 5).map((mark, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{mark.subject?.name}</p>
                  <p className="text-sm text-gray-600">{mark.examType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{mark.marksObtained}/{mark.totalMarks}</p>
                <p className={`text-sm ${mark.grade.startsWith('A') || mark.grade.startsWith('B') ? 'text-green-600' : 'text-orange-600'}`}>
                  Grade {mark.grade}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
