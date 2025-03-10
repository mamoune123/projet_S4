import React, { useState } from "react";
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
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import { red, green, orange } from "@mui/material/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  priorityColor,
  statusConfig,
  getInitials,
} from "../../utils/taskUtils";

const TaskDetailsDialog = ({ open, onClose, task }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const { title, description, status, priority, deadline, assignedTo } = task;

  // Format deadline date
  const formattedDeadline = new Date(deadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Handle adding a comment
  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([...comments, { id: comments.length + 1, text: comment }]);
      setComment("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Task Description */}
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Task Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {statusConfig[status].label}
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
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet.
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 24, height: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User Name
                  </Typography>
                  <Typography variant="body1">{comment.text}</Typography>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;
