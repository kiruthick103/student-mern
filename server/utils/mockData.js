const mockData = {
    students: [
        {
            _id: 's1',
            rollNumber: 'R001',
            class: 'Year 1',
            section: 'A',
            user: { fullName: 'John Doe', email: 'john@example.com' }
        },
        {
            _id: 's2',
            rollNumber: 'R002',
            class: '10',
            section: 'B',
            user: { fullName: 'Jane Smith', email: 'jane@example.com' }
        }
    ],
    subjects: [
        { _id: 'sub1', name: 'Mathematics', code: 'MATH101', credits: 4 },
        { _id: 'sub2', name: 'Science', code: 'SCI101', credits: 3 },
        { _id: 'sub3', name: 'English', code: 'ENG101', credits: 3 }
    ],
    assignments: [
        {
            _id: 'a1',
            title: 'Algebra Quiz',
            subject: { name: 'Mathematics' },
            dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
            status: 'published'
        },
        {
            _id: 'a2',
            title: 'Biology Lab Report',
            subject: { name: 'Science' },
            dueDate: new Date(Date.now() + 86400000 * 5),
            status: 'published'
        }
    ],
    materials: [
        {
            _id: 'm1',
            title: 'Quadratic Equations Notes',
            description: 'Detailed explanation and examples',
            subject: { name: 'Mathematics' },
            type: 'PDF',
            url: '#'
        },
        {
            _id: 'm2',
            title: 'Periodic Table Guide',
            description: 'Full guide to the periodic table',
            subject: { name: 'Science' },
            type: 'Video',
            url: '#'
        }
    ],
    announcements: [
        {
            _id: 'an1',
            title: 'Exam Schedule Out',
            content: 'The final exam schedule has been posted on the notice board.',
            postedBy: { fullName: 'Prof. Kiruthick' },
            targetAudience: 'all'
        },
        {
            _id: 'an2',
            title: 'Winter Break',
            content: 'College will be closed from Dec 20 to Jan 5.',
            postedBy: { fullName: 'Admin' },
            targetAudience: 'all'
        }
    ],
    analytics: {
        totalStudents: 156,
        totalSubjects: 12,
        totalAssignments: 45,
        todayAttendance: 142,
        classDistribution: [
            { _id: 'Year 1', count: 45 },
            { _id: 'Year 2', count: 52 },
            { _id: 'Year 3', count: 59 }
        ],
        marksData: [
            { subjectName: 'Mathematics', avgMarks: 78.5 },
            { subjectName: 'Science', avgMarks: 82.1 },
            { subjectName: 'English', avgMarks: 74.0 }
        ]
    },
    profile: {
        user: { fullName: 'Kiruthick (Demo)', email: 'kiruthick3238q@gmail.com' },
        class: '10',
        section: 'A',
        rollNumber: 'R001'
    },
    attendance: {
        stats: { percentage: 85, present: 17, total: 20 },
        attendance: []
    },
    marks: {
        average: 78.2,
        marks: [
            { subject: { name: 'Mathematics' }, examType: 'Mid-term', marksObtained: 85, totalMarks: 100, grade: 'A' },
            { subject: { name: 'Science' }, examType: 'Mid-term', marksObtained: 72, totalMarks: 100, grade: 'B' }
        ],
        weakSubjects: [
            { subject: 'History', marks: [45, 52] }
        ]
    },
    studyPlan: {
        studyPlan: { streak: { currentStreak: 5 } },
        todayTasks: [
            { title: 'Revise Calculus', duration: 60, scheduledTime: '10:00 AM', completed: false },
            { title: 'History Essay', duration: 45, scheduledTime: '2:00 PM', completed: true }
        ],
        weeklyProgress: { completedHours: 12, targetHours: 20 }
    }
};

module.exports = mockData;
