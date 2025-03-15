import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import TaskDetailsDialog from "./TaskDetailsDialog";
import {
  priorityColor,
  statusConfig,
  getInitials,
} from "../../utils/taskUtils";
import { red, green, orange } from "@mui/material/colors";

const TaskCard = ({ task }) => {
  const [open, setOpen] = useState(false);

  const { title, status, priority, assignedTo } = task;

  return (
    <>
      {/* Simplified Task Card */}
      <Card
        onClick={() => setOpen(true)}
        sx={{
          maxWidth: 345,
          margin: 2,
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          {/* Task Title and Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Chip
              label={statusConfig[status].label}
              size="small"
              color={statusConfig[status].color}
              icon={statusConfig[status].icon}
            />
          </Box>

          {/* Task Priority */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Priority:
            </Typography>
            <Chip
              label={priority}
              size="small"
              sx={{
                backgroundColor: priorityColor[priority],
                color: "white",
              }}
            />
          </Box>

          {/* Assigned Users */}
          {assignedTo && assignedTo.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Assigned To:
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
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        task={task}
      />
    </>
  );
};

export default TaskCard;
