import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondary, IconButton, Paper, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const TaskList = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          sx={{
            mb: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover',
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
            primary={task.title}
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    display: 'block'
                  }}
                >
                  {task.description}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  Due: {new Date(task.date).toLocaleDateString()}
                </Typography>
              </>
            }
            sx={{
              '& .MuiListItemText-primary': {
                textDecoration: task.completed ? 'line-through' : 'none',
              }
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList; 