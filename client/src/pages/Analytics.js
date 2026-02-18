import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, BookOpen, 
  Calendar, Target, Award, Users
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const service = localStorage.getItem('user')?.role === 'teacher' 
        ? teacherService 
        : studentService;
      const response = await service.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const marksChartData = {
    labels: analytics?.marksData?.map(m => m.subjectName) || [],
    datasets: [
      {
        label: 'Average Marks',
        data: analytics?.marksData?.map(m => m.avgMarks) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Attendance %',
        data: analytics?.weeklyAttendance || [85, 92, 78, 95, 88, 0, 0],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const gradeDistributionData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        data: analytics?.gradeDistribution || [15, 25, 30, 20, 10],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isTeacher = localStorage.getItem('user')?.role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">
            {isTeacher ? 'Class performance insights' : 'Your academic performance'}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input w-40"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          icon={BarChart3} 
          title="Average Marks" 
          value={`${analytics?.averageMarks || 0}%`}
          change={analytics?.marksChange || 5}
          color="bg-blue-500"
        />
        <StatCard 
          icon={Calendar} 
          title="Attendance" 
          value={`${analytics?.attendanceRate || 0}%`}
          change={analytics?.attendanceChange || 2}
          color="bg-green-500"
        />
        <StatCard 
          icon={Target} 
          title="Assignments" 
          value={analytics?.assignmentsCompleted || 0}
          change={analytics?.assignmentsChange || 8}
          color="bg-purple-500"
        />
        <StatCard 
          icon={Award} 
          title="Rank" 
          value={`#${analytics?.rank || 'N/A'}`}
          change={analytics?.rankChange || -1}
          color="bg-orange-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Subject Performance</h3>
          </div>
          <div className="p-6">
            <Bar data={marksChartData} options={chartOptions} />
          </div>
        </div>

        {/* Weekly Attendance */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Weekly Attendance</h3>
          </div>
          <div className="p-6">
            <Line data={attendanceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Grade Distribution</h3>
          </div>
          <div className="p-6">
            <Doughnut data={gradeDistributionData} options={doughnutOptions} />
          </div>
        </div>

        {/* Top Performers (Teacher Only) */}
        {isTeacher && (
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Top Performers</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics?.topPerformers?.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                      <p className="text-sm text-gray-600">Class {student.class}-{student.section}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{student.average}%</p>
                      <p className="text-sm text-gray-500">Average</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Study Progress (Student Only) */}
        {!isTeacher && (
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Study Progress</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Study Hours This Week</span>
                    <span className="font-medium">{analytics?.studyHours || 0} / 20 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((analytics?.studyHours || 0) / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tasks Completed</span>
                    <span className="font-medium">{analytics?.tasksCompleted || 0} / {analytics?.totalTasks || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((analytics?.tasksCompleted || 0) / (analytics?.totalTasks || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Weak Subjects Improved</span>
                    <span className="font-medium">{analytics?.weakSubjectsImproved || 0} / {analytics?.totalWeakSubjects || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((analytics?.weakSubjectsImproved || 0) / (analytics?.totalWeakSubjects || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Performance Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {isTeacher ? 'Class Performance Details' : 'Subject-wise Performance'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  {isTeacher ? 'Student' : 'Subject'}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Average</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Assignments</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics?.performanceDetails?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {isTeacher ? item.name?.charAt(0) : item.subject?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {isTeacher ? item.name : item.subject}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      item.average >= 60 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {item.average}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.attendance}%</td>
                  <td className="py-3 px-4 text-gray-600">{item.assignments}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      item.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                      item.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
