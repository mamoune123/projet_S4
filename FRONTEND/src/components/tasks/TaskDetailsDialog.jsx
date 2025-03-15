import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Typography,
  Box,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import EditIcon from "@mui/icons-material/Edit";
import { red, green, orange } from "@mui/material/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AuthContext from "../../context/authContext";
import axios from "axios";
import {
  priorityColor,
  statusConfig,
  getInitials,
} from "../../utils/taskUtils";

const TaskDetailsDialog = ({ open, onClose, task, onStatusChange, onEdit }) => {
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { id, title, description, status, priority, deadline, assignedTo } =
    task || {};

  // Initialize selected status when task changes
  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
    }
  }, [task]);

  // Fetch comments when dialog opens
  useEffect(() => {
    if (open && task) {
      fetchComments();
    }
  }, [open, task]);

  // Format deadline date
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No deadline";

  // Fetch comments from the API
  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://localhost:5001/tasks/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.post(
          `http://localhost:5001/tasks/${id}/comments`,
          { content: comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComment("");
        fetchComments(); // Refresh comments after adding
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {onEdit && (
          <IconButton onClick={onEdit} size="small">
            <EditIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        {/* Task Description */}
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Task Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {statusConfig[selectedStatus]?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Priority:</strong> {priority}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Deadline:</strong> {formattedDeadline}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Assigned Users */}
        {assignedTo && assignedTo.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Assigned To:</strong>
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {assignedTo.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: orange[500], // Customize the background color
                      fontSize: "0.75rem", // Adjust font size for initials
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Comments Section */}
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet.
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {comment.user.name}
                  </Typography>
                  <Typography variant="body1">{comment.content}</Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Add Comment Input */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<CommentIcon />}
            onClick={handleAddComment}
          >
            Add
          </Button>
        </Box>

        {/* Change Task Status */}
        {onStatusChange && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                label="Status"
              >
                {Object.keys(statusConfig).map((statusKey) => (
                  <MenuItem key={statusKey} value={statusKey}>
                    <Chip
                      label={statusConfig[statusKey].label}
                      color={statusConfig[statusKey].color}
                      icon={
                        statusKey === "completed" ? (
                          <CheckCircleIcon />
                        ) : statusKey === "pending" ? (
                          <PendingActionsIcon />
                        ) : (
                          <ScheduleIcon />
                        )
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;
