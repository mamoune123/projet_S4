import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import axios from "axios";

const priorities = ["low", "medium", "high"];
const statuses = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const TaskForm = ({ open, onClose, onSubmit, task, projectId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    assignedTo: [],
  });

  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available users when form opens
  useEffect(() => {
    if (open && projectId) {
      fetchUsers();
    }
  }, [open, projectId]);

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        // Convert string date to Date object if necessary
        const deadline =
          typeof task.deadline === "string"
            ? new Date(task.deadline)
            : task.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        setFormData({
          title: task.title || "",
          description: task.description || "",
          status: task.status || "pending",
          priority: task.priority || "medium",
          deadline,
          assignedTo: task.assignedTo || [],
        });
      } else {
        // Reset form for new task
        setFormData({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          assignedTo: [],
        });
      }
      setErrors({});
    }
  }, [open, task]);

  // Fetch users that can be assigned to the task
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      // You might need to adjust this endpoint based on your API
      const response = await axios.get(
        `http://localhost:5001/projects/${projectId}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle date change
  const handleDateChange = (newValue) => {
    setFormData({
      ...formData,
      deadline: newValue,
    });

    if (errors.deadline) {
      setErrors({
        ...errors,
        deadline: null,
      });
    }
  };

  // Handle assigned users change
  const handleAssignedUsersChange = (event, newValue) => {
    setFormData({
      ...formData,
      assignedTo: newValue,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Format the data for API
      const formattedData = {
        ...formData,
        deadline: formData.deadline.toISOString(),
        assigned_users: formData.assignedTo.map((user) => user.id),
      };

      onSubmit(formattedData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* 
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Deadline"
                value={formData.deadline}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!errors.deadline}
                    helperText={errors.deadline}
                    fullWidth
                  />
                )}
              />
            </LocalizationProvider> */}

            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => option.name}
              value={formData.assignedTo}
              onChange={handleAssignedUsersChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign To"
                  placeholder="Select users"
                />
              )}
              loading={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
