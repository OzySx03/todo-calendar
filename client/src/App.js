import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, AppBar, Toolbar, Button } from '@mui/material';
import TaskForm from './components/TaskForm';
import Task from './components/Task';
import CalendarView from './components/CalendarView';
import Auth from './components/Auth';
import axios from 'axios';
import { List as ListIcon, CalendarMonth as CalendarIcon, Logout as LogoutIcon } from '@mui/icons-material';

function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleAddTask = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/tasks/${updatedTask.id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUsername(data.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setTasks([]);
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

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calendar ToDo List
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Welcome, {username}!
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ToDo Calendar
        </Typography>
        
        <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
          <Tabs 
            value={view} 
            onChange={(e, newValue) => setView(newValue)}
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<ListIcon />} 
              label="LIST VIEW" 
              value="list"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              icon={<CalendarIcon />} 
              label="CALENDAR VIEW" 
              value="calendar"
              sx={{ fontWeight: 'bold' }}
            />
          </Tabs>
        </Box>

        <TaskForm onSubmit={handleAddTask} />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {selectedDate 
              ? `Tasks for ${selectedDate.toLocaleDateString()}`
              : 'All Tasks'
            }
          </Typography>
          {view === 'list' ? (
            <Box>
              {filteredTasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
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
    </Box>
  );
}

export default App; 