const pool = require("../db/db");

// Create a new project
exports.createProject = async (req, res) => {
  const { name, description, created_by } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name, description, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Project not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
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
    res.status(500).send("Server error");
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
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
    res.status(500).send("Server error");
  }
};

exports.getTasksByProject = async (req, res) => {
  const { project_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT tasks.*
           FROM tasks
           JOIN project_users ON tasks.user_id = project_users.user_id
           WHERE project_users.project_id = $1`,
      [project_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
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

exports.addUserToProject = async (req, res) => {
  const { project_id } = req.params;
  const { user_id, role } = req.body;

  try {
    // Check if the user adding is an admin (you can implement this logic)
    // For now, we assume the user has permission to add others.

    // Check if the user is already part of the project
    const existingUser = await pool.query(
      "SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2",
      [project_id, user_id]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already part of the project" });
    }

    // Add the user to the project
    const result = await pool.query(
      "INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
      [project_id, user_id, role || "member"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.removeUserFromProject = async (req, res) => {
  const { project_id, user_id } = req.params;

  try {
    // Check if the user removing is an admin (you can implement this logic)
    // For now, we assume the user has permission to remove others.

    // Remove the user from the project
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
    res.status(500).send("Server error");
  }
};
