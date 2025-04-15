import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, CalendarMonth as CalendarIcon, List as ListIcon } from '@mui/icons-material';
import axios from 'axios';
import Task from './components/Task';
import TaskForm from './components/TaskForm';
import CalendarView from './components/CalendarView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks from:', API_URL);
      const response = await axios.get(`${API_URL}/tasks`);
      console.log('Fetched tasks:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (task) => {
    try {
      console.log('Adding task:', task);
      console.log('API URL:', API_URL);
      const response = await axios.post(`${API_URL}/tasks`, task);
      console.log('Task added successfully:', response.data);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      console.log('Updating task:', updatedTask);
      await axios.put(`${API_URL}/tasks/${updatedTask.id}`, updatedTask);
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      console.log('Deleting task:', taskId);
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await axios.put(`${API_URL}/tasks/${taskId}`, {
        ...task,
        completed: !task.completed
      });
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpenForm(true);
  };

  const handleTaskClick = (date) => {
    setSelectedDate(date);
    setView('list');
  };

  const filteredTasks = selectedDate
    ? tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === selectedDate.toDateString();
      })
    : tasks;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calendar ToDo List
          </Typography>
          <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
            <Tab value="list" icon={<ListIcon />} label="List" />
            <Tab value="calendar" icon={<CalendarIcon />} label="Calendar" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ToDo Calendar
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={view} 
              onChange={(e, newValue) => setView(newValue)}
              aria-label="view tabs"
            >
              <Tab 
                icon={<ListIcon />} 
                label="List View" 
                value="list" 
              />
              <Tab 
                icon={<CalendarIcon />} 
                label="Calendar View" 
                value="calendar" 
              />
            </Tabs>
          </Box>

          <TaskForm
            open={openForm}
            handleClose={() => setOpenForm(false)}
            handleSubmit={handleAddTask}
            task={editingTask}
          />
          
          {view === 'list' ? (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedDate ? `Tasks for ${selectedDate.toLocaleDateString()}` : 'All Tasks'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingTask(null);
                    setOpenForm(true);
                  }}
                >
                  Add Task
                </Button>
              </Box>
              {filteredTasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                />
              ))}
            </Box>
          ) : (
            <CalendarView 
              tasks={tasks} 
              onTaskClick={handleTaskClick} 
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 