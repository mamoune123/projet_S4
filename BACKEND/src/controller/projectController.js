  const pool = require("../db/db");
  const jwt = require("jsonwebtoken");
  require("dotenv").config();

  exports.createProject = async (req, res) => {
    const { name, description } = req.body;
  
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      const created_by = decoded.id; // L'ID de l'utilisateur
      const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)
      console.log("User id de user : ",created_by);
      console.log("user role ici :",userRole);
      // Vérifier si l'utilisateur est un manager
      if (userRole !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can create projects" });
      }
  
      // Créer le projet
      const projectResult = await pool.query(
        "INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
        [name, description, created_by]
      );

      const project = projectResult.rows[0];

      await pool.query(
        "INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, $3)",
        [project.id, created_by, "manager"]
      );
      
  
      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  
  // Get all projects (accessible to all users)
  exports.getAllProjects = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM projects");
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  };
  
  // Get a single project by ID (accessible to all users)
  exports.getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).send("Project not found");
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  };
  
  // Update a project (only managers can update projects)
  exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
  
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)
  
      // Vérifier si l'utilisateur est un manager
      if (userRole !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can update projects" });
      }
  
      // Mettre à jour le projet
      const result = await pool.query(
        "UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *",
        [name, description, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send("Project not found");
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  
  // Delete a project (only managers can delete projects)
  exports.deleteProject = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)
  
      // Vérifier si l'utilisateur est un manager
      if (userRole !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can delete projects" });
      }
  
      // Supprimer le projet
      const result = await pool.query(
        "DELETE FROM projects WHERE id = $1 RETURNING *",
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send("Project not found");
      }
  
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  
  // Get tasks by project (accessible to all users)
  exports.getTasksByProject = async (req, res) => {
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      console.log("ucalledME!");
  
      // Décoder le token pour obtenir l'ID de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // L'ID de l'utilisateur
  
      // Récupérer les projets auxquels l'utilisateur est associé
      const projectsResult = await pool.query(
        `SELECT projects.*
         FROM projects
         JOIN project_users ON projects.id = project_users.project_id
         WHERE project_users.user_id = $1`,
        [userId]
      );
  
      if (projectsResult.rows.length === 0) {
        return res.status(404).json({ message: "No projects found for this user" });
      }
  
      // Pour chaque projet, récupérer les tâches assignées à l'utilisateur
      const projectsWithTasks = await Promise.all(
        projectsResult.rows.map(async (project) => {
          const tasksResult = await pool.query(
            `SELECT tasks.*
             FROM tasks
             JOIN task_users ON tasks.id = task_users.task_id
             WHERE tasks.project_id = $1 AND task_users.user_id = $2`,
            [project.id, userId]
          );
  
          return {
            ...project,
            tasks: tasksResult.rows,
          };
        })
      );
  
      res.status(200).json(projectsWithTasks);
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  
  // Get projects by user (accessible to all users)
  exports.getProjectsByUser = async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT projects.*
         FROM projects
         JOIN project_users ON projects.id = project_users.project_id
         WHERE project_users.user_id = $1`,
        [user_id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  };
  
  // Add a user to a project (only managers or admins can add users)
  exports.addUserToProject = async (req, res) => {
    const { project_id } = req.params;
    const { user_id, role } = req.body;
  
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)
  
      // Vérifier si l'utilisateur est un manager ou un admin
      if (userRole !== "manager" && userRole !== "admin") {
        return res
          .status(403)
          .json({ message: "Only managers or admins can add users to projects" });
      }
  
      // Vérifier si l'utilisateur est déjà dans le projet
      const existingUser = await pool.query(
        "SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2",
        [project_id, user_id]
      );
  
      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "User is already part of the project" });
      }
  
      // Ajouter l'utilisateur au projet
      const result = await pool.query(
        "INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
        [project_id, user_id, role || "member"]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  
  // Remove a user from a project (only managers or admins can remove users)
  exports.removeUserFromProject = async (req, res) => {
    const { project_id, user_id } = req.params;
  
    try {
      // Récupérer le token du header Authorization
      const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)
  
      // Vérifier si l'utilisateur est un manager ou un admin
      if (userRole !== "manager" && userRole !== "admin") {
        return res
          .status(403)
          .json({ message: "Only managers or admins can remove users from projects" });
      }
  
      // Supprimer l'utilisateur du projet
      const result = await pool.query(
        "DELETE FROM project_users WHERE project_id = $1 AND user_id = $2 RETURNING *",
        [project_id, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found in project" });
      }
  
      res.status(200).json({ message: "User removed from project" });
    } catch (err) {
      console.error(err);
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).send("Server error");
    }
  };
  