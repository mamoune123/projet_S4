import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KanbanBoard from "../components/tasks/KanbanBoard";
import AuthContext from "../context/authContext";
import ProjectList from "../components/projects/ProjectList";
import ProjectForm from "../components/projects/ProjectForm";
import TaskForm from "../components/tasks/TaskForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openProjectForm, setOpenProjectForm] = useState(false);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!user && !localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      fetchProjects();
    }
  }, [user, navigate]);

  // Fetch projects for the logged-in user
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`http://localhost:5001/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);

      // Auto-select first project if available
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]);
        fetchTasks(response.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  // Fetch tasks for a specific project
  const fetchTasks = async (projectId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://localhost:5001/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchTasks(project.id);
  };

  // Handle project creation/update
  const handleProjectSubmit = async (projectData) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (editingProject) {
        // Update existing project
        await axios.put(
          `http://localhost:5001/projects/${editingProject.id}`,
          projectData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new project
        await axios.post("http://localhost:5001/projects", projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setOpenProjectForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  // Handle task creation/update
  const handleTaskSubmit = async (taskData) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (editingTask) {
        // Update existing task
        await axios.put(
          `http://localhost:5001/tasks/${editingTask.id}`,
          taskData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Create new task with the selected project
        await axios.post(
          "http://localhost:5001/tasks",
          {
            ...taskData,
            project_id: selectedProject.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setOpenTaskForm(false);
      setEditingTask(null);
      if (selectedProject) {
        fetchTasks(selectedProject.id);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // Handle task status change
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:5001/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local tasks array
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setOpenProjectForm(true);
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpenTaskForm(true);
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`http://localhost:5001/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Reset selected project if it was deleted
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(null);
          setTasks([]);
        }

        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`http://localhost:5001/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local tasks array
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ margin: 2 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {loading && !selectedProject ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Projects & Tasks" />
              {role === "admin" && <Tab label="User Management" />}
            </Tabs>

            {tabValue === 0 && (
              <Box sx={{ display: "flex", height: "calc(100vh - 200px)" }}>
                {/* Projects Sidebar */}
                <Box
                  sx={{ width: 300, borderRight: "1px solid #e0e0e0", p: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Projects</Typography>
                    {role === "admin" && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setEditingProject(null);
                          setOpenProjectForm(true);
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </Box>

                  <ProjectList
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={handleProjectSelect}
                    onEditProject={
                      role === "admin" ? handleEditProject : undefined
                    }
                    onDeleteProject={
                      role === "admin" ? handleDeleteProject : undefined
                    }
                  />
                </Box>

                {/* Tasks Kanban */}
                <Box sx={{ flex: 1, p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {selectedProject
                        ? `Tasks: ${selectedProject.name}`
                        : "Select a project"}
                    </Typography>

                    {selectedProject &&
                      (role === "admin" || role === "manager") && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setEditingTask(null);
                            setOpenTaskForm(true);
                          }}
                        >
                          Add Task
                        </Button>
                      )}
                  </Box>

                  {selectedProject ? (
                    loading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          my: 4,
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <KanbanBoard
                        tasks={tasks}
                        onStatusChange={handleTaskStatusChange}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    )
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 4, textAlign: "center" }}
                    >
                      {projects.length > 0
                        ? "Select a project to view tasks"
                        : "No projects available. Create one to get started."}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {tabValue === 1 && role === "admin" && (
              <Box>
                <Typography variant="h6">User Management</Typography>
                {/* User management component would go here */}
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  This section allows administrators to manage users, assign
                  roles, and control access.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Project Form Dialog */}
      <ProjectForm
        open={openProjectForm}
        onClose={() => {
          setOpenProjectForm(false);
          setEditingProject(null);
        }}
        onSubmit={handleProjectSubmit}
        project={editingProject}
      />

      {/* Task Form Dialog */}
      <TaskForm
        open={openTaskForm}
        onClose={() => {
          setOpenTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        projectId={selectedProject?.id}
      />
    </Container>
  );
};

export default Dashboard;
