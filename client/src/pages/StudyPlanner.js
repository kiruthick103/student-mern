import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, CheckCircle, Flame, Target, Clock,
  BookOpen, AlertTriangle, X
} from 'lucide-react';
import { studentService } from '../services/api';

const StudyPlanner = () => {
  const [studyPlan, setStudyPlan] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    duration: 60,
    scheduledDate: '',
    scheduledTime: '09:00',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [planRes, subjectsRes] = await Promise.all([
        studentService.getStudyPlan(),
        studentService.getSubjects()
      ]);
      setStudyPlan(planRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleAddTask = async () => {
    try {
      await studentService.addStudyTask(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        subject: '',
        priority: 'medium',
        duration: 60,
        scheduledDate: '',
        scheduledTime: '09:00',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await studentService.completeTask(taskId);
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Get days for calendar
  const getDaysInMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const today = new Date().getDate();
  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Planner</h2>
          <p className="text-gray-600">Plan your studies and track your progress</p>
        </div>
        {studyPlan?.studyPlan?.streak?.currentStreak > 0 && (
          <div className="flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-xl">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{studyPlan.studyPlan.streak.currentStreak}</p>
              <p className="text-sm text-orange-600">Day Streak!</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg
                  ${day === today ? 'bg-primary-500 text-white font-semibold' : ''}
                  ${day && day !== today ? 'hover:bg-gray-100 text-gray-700' : ''}
                  ${!day ? 'invisible' : ''}
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weekly Stats */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
              <span className="text-sm text-gray-600">
                {studyPlan?.weeklyProgress?.completedHours || 0} / {studyPlan?.weeklyProgress?.targetHours || 20} hrs
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((studyPlan?.weeklyProgress?.completedHours || 0) / (studyPlan?.weeklyProgress?.targetHours || 20)) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>Target: {studyPlan?.weeklyProgress?.targetHours || 20} hours/week</span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            <div className="p-6">
              {studyPlan?.todayTasks?.length > 0 ? (
                <div className="space-y-3">
                  {studyPlan.todayTasks.map((task, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => !task.completed && handleCompleteTask(task._id)}
                        className={`flex-shrink-0 ${task.completed ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <CheckCircle className={`w-6 h-6 ${
                          task.completed ? 'text-green-500' : 'text-gray-300 hover:text-primary-500'
                        }`} />
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.scheduledTime}
                          </span>
                          {task.subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {task.subject?.name || 'General'}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks scheduled for today</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Add your first task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
            </div>
            <div className="p-6">
              {studyPlan?.upcomingTasks?.length > 0 ? (
                <div className="space-y-3">
                  {studyPlan.upcomingTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(task.scheduledDate).toLocaleDateString()} at {task.scheduledTime}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* Weak Subjects */}
          {studyPlan?.studyPlan?.weakSubjects?.length > 0 && (
            <div className="card border-l-4 border-red-500">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">Weak Subjects - Focus Area</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {studyPlan.studyPlan.weakSubjects.map((item, idx) => (
                    <div key={idx} className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.subject?.name}</span>
                        <span className="text-xs px-2 py-1 bg-red-200 text-red-700 rounded">
                          {item.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
                      {item.improvementPlan && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Plan:</span> {item.improvementPlan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Study Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                placeholder="Task title"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <select
                className="input"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              >
                <option value="">Select Subject (Optional)</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  className="input"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                />
                <input
                  type="time"
                  className="input"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
              </div>
              <input
                type="date"
                className="input"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
              />
              <textarea
                placeholder="Notes (optional)"
                className="input h-20 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddTask} className="btn-primary flex-1">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
