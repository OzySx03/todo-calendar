import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const getPriorityColor = (priority = 'medium') => {
  switch (priority.toLowerCase()) {
    case 'high':
      return {
        border: '#ef5350',
        background: '#ffebee'
      };
    case 'medium':
      return {
        border: '#ffa726',
        background: '#fff3e0'
      };
    case 'low':
      return {
        border: '#66bb6a',
        background: '#e8f5e9'
      };
    default:
      return {
        border: '#9e9e9e',
        background: '#f5f5f5'
      };
  }
};

const Task = ({ task, onUpdate, onDelete }) => {
  const priority = task.priority || 'medium';
  const completed = task.completed || false;
  const colors = getPriorityColor(priority);

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: `6px solid ${colors.border}`,
        backgroundColor: colors.background,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h6" component="div">
                {task.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Due: {format(new Date(task.date), 'PPp')}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={priority.toUpperCase()} 
                  size="small"
                  sx={{ 
                    backgroundColor: colors.border,
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: colors.border
                    }
                  }}
                />
                <Chip 
                  label={completed ? 'COMPLETED' : 'PENDING'} 
                  size="small"
                  sx={{ 
                    backgroundColor: completed ? '#4caf50' : '#ff9800',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: completed ? '#43a047' : '#fb8c00'
                    }
                  }}
                />
              </Box>
              {task.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton 
              onClick={() => onUpdate({ ...task, completed: !completed })}
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