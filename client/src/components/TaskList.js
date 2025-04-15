import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondary, IconButton, Paper, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const getPriorityColor = (priority = 'medium') => {
  switch (priority.toLowerCase()) {
    case 'high':
      return {
        border: '#ef5350',
        background: 'rgba(239, 83, 80, 0.15)'
      };
    case 'medium':
      return {
        border: '#ffa726',
        background: 'rgba(255, 167, 38, 0.15)'
      };
    case 'low':
      return {
        border: '#66bb6a',
        background: 'rgba(102, 187, 106, 0.15)'
      };
    default:
      return {
        border: '#9e9e9e',
        background: 'rgba(158, 158, 158, 0.15)'
      };
  }
};

const TaskList = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      onTaskDeleted();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const updatedTask = { ...task, completed: !task.completed };
      await axios.put(`${API_URL}/api/tasks/${task.id}`, updatedTask, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (tasks.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" align="center">
          No tasks found
        </Typography>
      </Paper>
    );
  }

  return (
    <List>
      {tasks.map((task) => {
        const colors = getPriorityColor(task.priority);
        return (
          <ListItem
            key={task.id}
            sx={{
              mb: 1,
              bgcolor: colors.background,
              borderLeft: `6px solid ${colors.border}`,
              borderRadius: 1,
              '&:hover': {
                bgcolor: `${colors.background}`,
                opacity: 0.9,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}
            secondaryAction={
              <>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => handleToggleComplete(task)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleDelete(task.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: colors.border,
                    fontWeight: 'bold',
                  }}
                >
                  {task.title}
                </Typography>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: colors.border,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      display: 'block',
                      opacity: 0.8
                    }}
                  >
                    {task.description}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: colors.border,
                      fontWeight: 'medium'
                    }}
                  >
                    Due: {new Date(task.date).toLocaleDateString()} at {new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default TaskList; 