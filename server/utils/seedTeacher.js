const User = require('../models/User');

const seedTeacher = async () => {
  try {
    const teacherEmail = 'kiruthick3238q@gmail.com';

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: teacherEmail });

    if (existingTeacher) {
      // Ensure existing account has correct role and password
      existingTeacher.role = 'teacher';
      existingTeacher.password = '12345';
      existingTeacher.isActive = true;
      await existingTeacher.save();

      console.log('Pre-configured teacher updated with enforced credentials');
      console.log('Email:', teacherEmail);
      console.log('Password: 12345');
      return;
    }

    // Create pre-configured teacher
    const teacher = new User({
      email: teacherEmail,
      password: '12345',
      fullName: 'Narendran M',
      role: 'teacher',
      phone: '',
      isActive: true
    });

    await teacher.save();
    console.log('Pre-configured teacher created successfully');
    console.log('Email:', teacherEmail);
    console.log('Password: 12345');
  } catch (error) {
    console.error('Error seeding teacher:', error);
  }
};

module.exports = seedTeacher;
