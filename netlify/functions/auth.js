// Mock user data for demo - passwords are plain text for simplicity in serverless
const users = [
  {
    _id: 'teacher1',
    email: 'kiruthick3238q@gmail.com',
    password: '123456', // Plain text for demo
    role: 'teacher',
    fullName: 'Kiruthick (Teacher)',
    isActive: true
  },
  {
    _id: 'student1',
    email: 'student@example.com',
    password: '123456', // Plain text for demo
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

      console.log(`Login attempt for email: ${email}`);

      // Find user by email
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.log('User not found');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      // Simple password comparison (plain text for demo)
      const isValidPassword = user.password === password;
      
      if (!isValidPassword) {
        console.log('Invalid password');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      console.log('Login successful');

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
      console.error('Login error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Server error', error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
};
