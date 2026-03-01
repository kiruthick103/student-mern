const bcrypt = require('bcryptjs');

// Mock user data for demo
const users = [
  {
    _id: 'teacher1',
    email: 'kiruthick3238q@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // '123456'
    role: 'teacher',
    fullName: 'Kiruthick (Teacher)',
    isActive: true
  },
  {
    _id: 'student1',
    email: 'student@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // '123456'
    role: 'student',
    fullName: 'John Doe (Student)',
    isActive: true
  }
];

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { email, password } = body;

      // Find user by email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      // Generate simple token (in production, use JWT)
      const token = Buffer.from(`${user._id}:${user.email}:${user.role}`).toString('base64');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            fullName: user.fullName
          }
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Server error' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
};
