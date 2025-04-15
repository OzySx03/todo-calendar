import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskForm = ({ open, handleClose, handleSubmit, task = null }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState(task?.date ? new Date(task.date) : new Date());
  const [priority, setPriority] = useState(task?.priority || 'medium');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit({
      title,
      description,
      date: date.toISOString(),
      priority,
      completed: task?.completed || false,
      ...(task && { id: task.id })
    });
    handleClose();
    setTitle('');
    setDate(new Date());
    setPriority('medium');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <form onSubmit={handleFormSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {task ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm; 