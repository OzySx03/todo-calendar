const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(bodyParser.json());

// Root endpoint for basic check
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Ensure data directory exists
async function ensureDataFiles() {
  try {
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Initialize empty files if they don't exist
    if (!fs.existsSync(TASKS_FILE)) {
      await fs.writeFile(TASKS_FILE, '[]');
    }
    if (!fs.existsSync(USERS_FILE)) {
      await fs.writeFile(USERS_FILE, '[]');
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

// Read tasks from file
async function readTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

// Write tasks to file
async function writeTasks(tasks) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks:', error);
    throw error;
  }
}

// Read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Write users to file
async function writeUsers(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
    throw error;
  }
}

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

// Initialize data files
ensureDataFiles().catch(console.error);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received with body:', JSON.stringify(req.body));
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Registration failed: Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = await readUsers();
    console.log('Current users count:', users.length);

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
    await writeUsers(users);

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

    const users = await readUsers();

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

// Task Routes (now with authentication)
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await readTasks();
    // Only return tasks for the authenticated user
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    userTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(userTasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await readTasks();
    const newTask = {
      id: req.body.id || Date.now().toString(),
      userId: req.user.id,
      title: req.body.title,
      date: req.body.date,
      priority: req.body.priority || 'medium',
      completed: req.body.completed || false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const tasks = await readTasks();
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

    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const tasks = await readTasks();
    const filteredTasks = tasks.filter(task => 
      !(task.id === req.params.id && task.userId === req.user.id)
    );
    
    if (filteredTasks.length === tasks.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await writeTasks(filteredTasks);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  
  // Ensure data files exist after server starts
  ensureDataFiles().catch(console.error);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
}); 