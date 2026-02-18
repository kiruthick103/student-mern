const User = require('../models/User');

const seedTeacher = async () => {
  try {
    const teacherEmail = 'kiruthick3238q@gmail.com';
    
    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: teacherEmail });
    
    if (existingTeacher) {
      console.log('Pre-configured teacher already exists');
      return;
    }

    // Create pre-configured teacher
    const teacher = new User({
      email: teacherEmail,
      password: '123456',
      fullName: 'Teacher Admin',
      role: 'teacher',
      phone: '',
      isActive: true
    });

    await teacher.save();
    console.log('Pre-configured teacher created successfully');
    console.log('Email:', teacherEmail);
    console.log('Password: 123456');
  } catch (error) {
    console.error('Error seeding teacher:', error);
  }
};

module.exports = seedTeacher;
