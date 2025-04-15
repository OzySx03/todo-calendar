import React from 'react';
import { Card, CardContent, Typography, Checkbox, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const Task = ({ task, onDelete, onToggle, onEdit }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card sx={{ mb: 2, backgroundColor: task.completed ? '#f5f5f5' : 'white' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              color="primary"
            />
            <Box>
              <Typography
                variant="h6"
                style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
              >
                {task.title}
              </Typography>
              <Typography color="textSecondary">
                Due: {formatDate(task.date)}
              </Typography>
              {task.description && (
                <Typography variant="body2" color="textSecondary">
                  {task.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => onEdit(task)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(task.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Task; 