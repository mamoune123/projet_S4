import React, { useState } from "react";
import TaskCard from "./TaskCard";
import { Box, Typography, Paper, Divider } from "@mui/material";
import TaskDetailsDialog from "./TaskDetailsDialog";

const KanbanBoard = ({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
}) => {
  const statuses = ["pending", "in_progress", "completed"];
  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Handle drag start
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  // Handle drop
  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    if (taskId && onStatusChange) {
      onStatusChange(parseInt(taskId), status);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Open task details
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  // Update task status from details dialog
  const handleTaskStatusUpdate = (taskId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          padding: 2,
          height: "calc(100vh - 250px)",
        }}
      >
        {statuses.map((status) => (
          <Paper
            key={status}
            sx={{
              flex: 1,
              minWidth: 280,
              borderRadius: 2,
              padding: 2,
              backgroundColor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
            }}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
          >
            {/* Column Header */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              {statusLabels[status]}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Task Cards */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                "& > *": { mb: 2 },
              }}
            >
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <Box
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => handleOpenDetails(task)}
                      onEdit={() => onEditTask && onEditTask(task)}
                      onDelete={() => onDeleteTask && onDeleteTask(task.id)}
                    />
                  </Box>
                ))}

              {tasks.filter((task) => task.status === status).length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 2 }}
                >
                  No tasks
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Task Details Dialog */}
      {selectedTask && (
        <TaskDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          task={selectedTask}
          onStatusChange={handleTaskStatusUpdate}
          onEdit={() => {
            setDetailsOpen(false);
            onEditTask && onEditTask(selectedTask);
          }}
        />
      )}
    </>
  );
};

export default KanbanBoard;
