const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const JWT_SECRET = 'your-secret-key';
const PORT = process.env.PORT || 8080;

// In-memory storage
let tasks = [];
let users = [];

// Basic middleware
app.use(cors({
  origin: ['https://ozysx03.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Todo Calendar Server' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.some(user => user.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword
    };

    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, username });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Task Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    userId: req.user.id,
    title: req.body.title,
    date: req.body.date,
    priority: req.body.priority || 'medium',
    completed: req.body.completed || false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskIndex = tasks.findIndex(task => 
    task.id === req.params.id && task.userId === req.user.id
  );
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[taskIndex] = { 
    ...tasks[taskIndex], 
    ...req.body,
    userId: req.user.id
  };

  res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const initialLength = tasks.length;
  tasks = tasks.filter(task => 
    !(task.id === req.params.id && task.userId === req.user.id)
  );
  
  if (tasks.length === initialLength) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json({ message: 'Task deleted' });
});

// Create HTTP server and start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
}); 