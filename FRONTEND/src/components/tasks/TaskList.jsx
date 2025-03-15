import React from "react";
import TaskCard from "./TaskCard";
import { Grid2 as Grid } from "@mui/material";

const tasks = [
  {
    id: 1,
    title: "Design Homepage",
    description: "Create a responsive design for the homepage.",
    status: "in_progress",
    priority: "high",
    deadline: "2023-12-15T23:59:59",
  },
  {
    id: 2,
    title: "Fix Login Bug",
    description: "Resolve the issue with the login form validation.",
    status: "pending",
    priority: "medium",
    deadline: "2023-11-30T23:59:59",
  },
  {
    id: 3,
    title: "Write API Documentation",
    description: "Document the new API endpoints for developers.",
    status: "completed",
    priority: "low",
    deadline: "2023-11-25T23:59:59",
  },
];

const TaskList = () => {
  return (
    <Grid container spacing={2}>
      {tasks.map((task) => (
        <Grid item key={task.id} xs={12} sm={6} md={4}>
          <TaskCard task={task} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskList;
