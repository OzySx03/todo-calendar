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

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
    await fs.writeFile(DATA_FILE, '[]');
  }
}

// Read tasks from file
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write tasks to file
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Initialize data directory
ensureDataDirectory();

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    // Sort tasks by date
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    const newTask = {
      id: Date.now().toString(),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
});

// Function to find an available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close();
      resolve(port);
    });
  });
}

// Start server on an available port
findAvailablePort(5000)
  .then(port => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Could not start server:', err);
  }); 