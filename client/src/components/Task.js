import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#ef5350'; // red
    case 'medium':
      return '#ffa726'; // orange
    case 'low':
      return '#66bb6a'; // green
    default:
      return '#9e9e9e'; // grey
  }
};

const Task = ({ task, onUpdate, onDelete }) => {
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: `6px solid ${getPriorityColor(task.priority)}`,
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Due: {format(new Date(task.date), 'PPp')}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={task.priority.toUpperCase()} 
                size="small"
                sx={{ 
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Chip 
                label={task.completed ? 'COMPLETED' : 'PENDING'} 
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: task.completed ? '#4caf50' : '#ff9800',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
          <Box>
            <IconButton 
              onClick={() => onUpdate({ ...task, completed: !task.completed })}
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => onDelete(task.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Task; 