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
  const [serverPort, setServerPort] = useState(5000);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:${serverPort}/api/tasks`);
      console.log('Fetched tasks:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      console.log('Submitting task:', taskData);
      if (taskData.id) {
        await axios.put(`http://localhost:${serverPort}/api/tasks/${taskData.id}`, taskData);
      } else {
        await axios.post(`http://localhost:${serverPort}/api/tasks`, taskData);
      }
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:${serverPort}/api/tasks/${taskId}`);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await axios.put(`http://localhost:${serverPort}/api/tasks/${taskId}`, {
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

  const filteredTasks = view === 'list' && selectedDate
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
        {view === 'calendar' ? (
          <CalendarView tasks={tasks} onTaskClick={handleTaskClick} />
        ) : (
          <>
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
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
              />
            ))}
          </>
        )}
        <TaskForm
          open={openForm}
          handleClose={() => setOpenForm(false)}
          handleSubmit={handleAddTask}
          task={editingTask}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App; 