import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, AppBar, Toolbar } from '@mui/material';
import TaskForm from './components/TaskForm';
import Task from './components/Task';
import CalendarView from './components/CalendarView';
import axios from 'axios';
import { List as ListIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';

function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
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
      const response = await axios.post(`${API_URL}/tasks`, task);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      await axios.put(`${API_URL}/tasks/${updatedTask.id}`, updatedTask);
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calendar ToDo List
          </Typography>
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
            All Tasks
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