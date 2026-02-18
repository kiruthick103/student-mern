const localDB = require('../utils/localDB');

const studentController = {
  getMyProfile: async (req, res) => {
    try {
      const profile = localDB.findOne('studentProfiles', { user: req.user.id });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      const user = localDB.findById('users', req.user.id);
      const subjects = localDB.find('subjects', {}).filter(s => profile.subjects?.includes(s._id));
      res.json({ ...profile, user, subjects });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  getSubjects: async (req, res) => {
    res.json(localDB.find('subjects', {}));
  },

  getMyAttendance: async (req, res) => {
    const attendance = localDB.find('attendance', { student: req.user.id });
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    res.json({ attendance, stats: { percentage, present, total } });
  },

  getMyMarks: async (req, res) => {
    const marks = localDB.find('marks', { student: req.user.id });
    const subjects = localDB.find('subjects', {});
    res.json({
      marks: marks.map(m => ({ ...m, subject: subjects.find(s => s._id === m.subject) })),
      average: 78.5,
      weakSubjects: []
    });
  },

  getMyAssignments: async (req, res) => {
    const assignments = localDB.find('assignments', {}).filter(a =>
      a.status === 'published' || a.assignedTo?.includes(req.user.id)
    );
    const subjects = localDB.find('subjects', {});
    res.json(assignments.map(a => ({
      ...a,
      subject: subjects.find(s => s._id === a.subject),
      mySubmission: a.submissions?.find(s => s.student === req.user.id)
    })));
  },

  submitAssignment: async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = localDB.findById('assignments', assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    assignment.submissions = assignment.submissions || [];
    assignment.submissions.push({ student: req.user.id, ...req.body, submittedAt: new Date() });
    localDB.findByIdAndUpdate('assignments', assignmentId, { submissions: assignment.submissions });
    res.json({ message: 'Submitted' });
  },

  getStudyMaterials: async (req, res) => {
    const materials = localDB.find('studyMaterials', {});
    const subjects = localDB.find('subjects', {});
    res.json(materials.map(m => ({ ...m, subject: subjects.find(s => s._id === m.subject) })));
  },

  getAnnouncements: async (req, res) => {
    const anns = localDB.find('announcements', { isActive: true });
    const users = localDB.find('users', {});
    res.json(anns.map(a => ({ ...a, postedBy: users.find(u => u._id === a.postedBy) })));
  },

  getStudyPlan: async (req, res) => {
    let plan = localDB.findOne('studyPlans', { student: req.user.id });
    if (!plan) plan = localDB.insertOne('studyPlans', { student: req.user.id, tasks: [], streak: { currentStreak: 0 } });
    res.json({ studyPlan: plan, todayTasks: plan.tasks || [], weeklyProgress: { completedHours: 5, targetHours: 20 } });
  },

  addStudyTask: async (req, res) => {
    const plan = localDB.findOne('studyPlans', { student: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    plan.tasks = plan.tasks || [];
    const newTask = { _id: Date.now().toString(), ...req.body, completed: false };
    plan.tasks.push(newTask);
    localDB.findByIdAndUpdate('studyPlans', plan._id, { tasks: plan.tasks });
    res.status(201).json(newTask);
  },

  completeTask: async (req, res) => {
    const { taskId } = req.params;
    const plan = localDB.findOne('studyPlans', { student: req.user.id });
    const task = plan.tasks.find(t => t._id === taskId);
    if (task) task.completed = true;
    localDB.findByIdAndUpdate('studyPlans', plan._id, { tasks: plan.tasks });
    res.json({ message: 'Task completed' });
  },

  addWeakSubject: async (req, res) => {
    const plan = localDB.findOne('studyPlans', { student: req.user.id });
    plan.weakSubjects = plan.weakSubjects || [];
    plan.weakSubjects.push(req.body);
    localDB.findByIdAndUpdate('studyPlans', plan._id, { weakSubjects: plan.weakSubjects });
    res.json({ message: 'Added' });
  },

  getMyAnalytics: async (req, res) => {
    res.json({ gradeTrend: [], attendanceStats: { percentage: 85 }, studyStats: { streak: 0 } });
  }
};

module.exports = studentController;
