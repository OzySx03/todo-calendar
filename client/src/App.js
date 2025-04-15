import React, { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { ViewList, CalendarMonth, Logout as LogoutIcon } from '@mui/icons-material';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import Auth from './components/Auth';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setTasks([]);
  };

  const handleTaskClick = (date) => {
    setSelectedDate(date);
    setView('list');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Container>
        <Auth onLogin={handleLogin} />
      </Container>
    );
  }

  const filteredTasks = selectedDate
    ? tasks.filter(task => {
        const taskDate = new Date(task.date);
        return (
          taskDate.getFullYear() === selectedDate.getFullYear() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getDate() === selectedDate.getDate()
        );
      })
    : tasks;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo Calendar - Welcome, {user.username}!
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Tabs
          value={view}
          onChange={(e, newValue) => setView(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<ViewList />} 
            label="LIST VIEW" 
            value="list" 
          />
          <Tab 
            icon={<CalendarMonth />} 
            label="CALENDAR VIEW" 
            value="calendar" 
          />
        </Tabs>

        <TaskForm onTaskAdded={fetchTasks} />

        {view === 'list' ? (
          <TaskList 
            tasks={filteredTasks} 
            onTaskUpdated={fetchTasks}
            onTaskDeleted={fetchTasks}
          />
        ) : (
          <CalendarView 
            tasks={tasks} 
            onTaskClick={handleTaskClick}
          />
        )}
      </Container>
    </Box>
  );
}

export default App; 