import React from "react";
import TaskCard from "./TaskCard";
import { Box, Typography } from "@mui/material";

const statuses = ["Pending", "In Progress", "Completed"];

const KanbanBoard = ({ tasks }) => {
  tasks = [
    {
      id: 1,
      title: "Design Homepage",
      description: "Create a responsive design for the homepage.",
      status: "pending",
      priority: "high",
      deadline: "2023-12-15T23:59:59",
      assignedTo: [
        { id: 1, name: "John Doe" },
        {
          id: 2,
          name: "Jane Smith",
        },
      ],
    },
    {
      id: 2,
      title: "Fix Login Bug",
      description: "Resolve the issue with the login form validation.",
      status: "completed",
      priority: "medium",
      deadline: "2023-11-30T23:59:59",
      assignedTo: [],
    },
  ];

  return (
    <Box sx={{ display: "flex", gap: 2, overflowX: "auto", padding: 2 }}>
      {statuses.map((status) => (
        <Box
          key={status}
          sx={{
            flex: 1,
            minWidth: 300,
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            padding: 2,
          }}
        >
          {/* Column Header */}
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            {status}
          </Typography>

          {/* Task Cards */}
          {tasks
            .filter((task) => task.status === status.toLowerCase())
            .map((task) => (
              <Box key={task.id} sx={{ marginBottom: 2 }}>
                <TaskCard task={task} />
              </Box>
            ))}
        </Box>
      ))}
    </Box>
  );
};

export default KanbanBoard;
