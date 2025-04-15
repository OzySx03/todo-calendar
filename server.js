const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory and file exist
async function ensureDataFile() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
  
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]');
  }
}

// Read tasks from file
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

// Write tasks to file
async function writeTasks(tasks) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks:', error);
    throw error;
  }
}

// Initialize data file
ensureDataFile().catch(console.error);

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    // Sort tasks by date
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    const newTask = {
      id: req.body.id || Date.now().toString(),
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

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(task => task.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    tasks[index] = { ...tasks[index], ...req.body };
    await writeTasks(tasks);
    res.json(tasks[index]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const filteredTasks = tasks.filter(task => task.id !== req.params.id);
    await writeTasks(filteredTasks);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 