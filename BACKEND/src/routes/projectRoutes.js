const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const authenticateUser = require("../middleware/authMiddleware");

// Create a new project
router.post("/", authenticateUser, projectController.createProject);

// Get all projects
router.get("/", authenticateUser, projectController.getAllProjects);

// Get a single project by ID
router.get("/:id", authenticateUser, projectController.getProjectById);

// Update a project
router.put("/:id", authenticateUser, projectController.updateProject);

// Delete a project
router.delete("/:id", authenticateUser, projectController.deleteProject);

router.get(
  "/my/tasks",
  authenticateUser,
  projectController.getTasksByProject
);
router.get(
  "/:user_id/projects",
  authenticateUser,
  projectController.getProjectsByUser
);

router.post(
  "/:project_id/users",
  authenticateUser,
  projectController.addUserToProject
);

router.delete(
  "/:project_id/users/:user_id",
  authenticateUser,
  projectController.removeUserFromProject
);

module.exports = router;
