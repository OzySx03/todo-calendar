import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton, Tooltip } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the first day of the month to calculate offset
  const firstDayOfMonth = monthStart.getDay();
  
  // Create array for empty cells before the first day
  const emptyCells = Array(firstDayOfMonth).fill(null);

  const getTasksForDay = (day) => {
    return tasks.filter(task => isSameDay(new Date(task.date), day));
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ffcdd2'; // Light red
      case 'medium':
        return '#fff9c4'; // Light yellow
      case 'low':
        return '#c8e6c9'; // Light green
      default:
        return '#f5f5f5'; // Default light gray
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'No Priority';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h5" sx={{ mx: 2 }}>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Priority Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#ffcdd2', mr: 1 }} />
          <Typography variant="caption">High Priority</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#fff9c4', mr: 1 }} />
          <Typography variant="caption">Medium Priority</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 20, height: 20, backgroundColor: '#c8e6c9', mr: 1 }} />
          <Typography variant="caption">Low Priority</Typography>
        </Box>
      </Box>

      <Grid container spacing={1}>
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs={12/7} key={day}>
            <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2">{day}</Typography>
            </Paper>
          </Grid>
        ))}
        
        {/* Empty cells for days before the first of the month */}
        {emptyCells.map((_, index) => (
          <Grid item xs={12/7} key={`empty-${index}`}>
            <Paper sx={{ height: 100, p: 1 }} />
          </Grid>
        ))}
        
        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dayTasks = getTasksForDay(day);
          return (
            <Grid item xs={12/7} key={day.toString()}>
              <Paper 
                sx={{ 
                  height: 100, 
                  p: 1,
                  backgroundColor: isSameDay(day, new Date()) ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => onTaskClick(day)}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {format(day, 'd')}
                </Typography>
                {dayTasks.map((task) => (
                  <Tooltip 
                    key={task.id} 
                    title={`${task.title} - ${getPriorityText(task.priority || 'none')}`}
                    placement="right"
                  >
                    <Box
                      sx={{
                        backgroundColor: getPriorityColor(task.priority),
                        p: 0.5,
                        mb: 0.5,
                        borderRadius: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        borderLeft: `3px solid ${task.completed ? '#4caf50' : '#ff9800'}`
                      }}
                    >
                      {task.title}
                    </Box>
                  </Tooltip>
                ))}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CalendarView; 