import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  AvatarGroup,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { priorityColor, getInitials } from "../../utils/taskUtils";

const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const { title, description, priority, deadline, assignedTo } = task;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Format deadline date
  const formattedDeadline = new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Handle menu open
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  // Handle edit click
  const handleEditClick = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    if (onEdit) onEdit();
  };

  // Handle delete click
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    if (onDelete) onDelete();
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        "&:hover": { boxShadow: 3 },
        position: "relative",
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Priority Indicator */}
        <Box
          sx={{
            width: 4,
            height: "100%",
            backgroundColor: priorityColor[priority] || "grey",
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        />

        {/* Card Content */}
        <Box sx={{ pl: 1 }}>
          {/* Header with title and actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <Typography variant="h6" component="div" noWrap>
              {title}
            </Typography>

            {(onEdit || onDelete) && (
              <Box>
                <IconButton
                  aria-label="more"
                  size="small"
                  onClick={handleMenuClick}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEdit && (
                    <MenuItem onClick={handleEditClick}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem onClick={handleDeleteClick}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            )}
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </Typography>

          {/* Footer with metadata */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Priority and Deadline */}
            <Box>
              <Chip
                label={priority}
                size="small"
                sx={{
                  backgroundColor: priorityColor[priority] + "33", // Add transparency
                  color: priorityColor[priority] + "DD",
                  mr: 1,
                }}
              />
              <Chip label={formattedDeadline} size="small" variant="outlined" />
            </Box>

            {/* Assigned Users */}
            {assignedTo && assignedTo.length > 0 && (
              <AvatarGroup
                max={3}
                sx={{ "& .MuiAvatar-root": { width: 24, height: 24 } }}
              >
                {assignedTo.map((user) => (
                  <Tooltip key={user.id} title={user.name}>
                    <Avatar sx={{ bgcolor: "orange" }}>
                      {getInitials(user.name)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
