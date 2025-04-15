import React, { useState } from 'react';
import { TextField, Button, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskForm = ({ onSubmit, initialTask = null }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [date, setDate] = useState(initialTask?.date ? new Date(initialTask.date) : new Date());
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      date: date.toISOString(),
      priority,
      completed: initialTask?.completed || false,
      id: initialTask?.id || Date.now()
    });
    setTitle('');
    setDate(new Date());
    setPriority('medium');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        fullWidth
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label="Due Date"
          value={date}
          onChange={setDate}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        {initialTask ? 'Update Task' : 'Add Task'}
      </Button>
    </Box>
  );
};

export default TaskForm; 