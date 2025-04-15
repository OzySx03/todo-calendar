const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 8080;

// In-memory storage
let tasks = [];
let users = [];

// Enable CORS for all routes
app.use(cors());

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

app.use(bodyParser.json());

// Root endpoint for basic check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    memory: process.memoryUsage().heapUsed / 1024 / 1024
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received with body:', JSON.stringify(req.body));
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Registration failed: Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    if (users.some(user => user.username === username)) {
      console.log('Registration failed: Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });

    console.log('User registered successfully:', { username: newUser.username });
    res.status(201).json({ token, username });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    console.log('User logged in successfully:', { username: user.username });
    res.json({ token, username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Task Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  try {
    // Only return tasks for the authenticated user
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    userTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(userTasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const newTask = {
      id: Date.now().toString(),
      userId: req.user.id,
      title: req.body.title,
      date: req.body.date,
      priority: req.body.priority || 'medium',
      completed: req.body.completed || false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const taskIndex = tasks.findIndex(task => 
      task.id === req.params.id && task.userId === req.user.id
    );
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks[taskIndex] = { 
      ...tasks[taskIndex], 
      ...req.body,
      userId: req.user.id  // Ensure userId cannot be changed
    };

    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => 
      !(task.id === req.params.id && task.userId === req.user.id)
    );
    
    if (tasks.length === initialLength) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server with error handling
const host = '0.0.0.0';
const server = app.listen(PORT, host, () => {
  console.log('=================================');
  console.log(`Server is running at http://${host}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Memory usage: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
  console.log('JWT Secret length:', JWT_SECRET.length);
  console.log('=================================');
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Add a keep-alive configuration
server.keepAliveTimeout = 65000; // Ensure keep-alive timeout is higher than load balancer
server.headersTimeout = 66000; // Ensure headers timeout is slightly higher than keep-alive

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  // Force close server after timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Give the server a chance to send any pending responses before exiting
  server.close(() => {
    console.log('Server closed due to uncaught exception');
    process.exit(1);
  });
  // If server.close() takes too long, force exit
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Do not exit the process, but log the error
}); 