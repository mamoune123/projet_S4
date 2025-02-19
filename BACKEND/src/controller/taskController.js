const pool = require("../db/db");
require("dotenv").config();

exports.createTask = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    deadline,
    user_id,
    project_id,
  } = req.body;

  try {
    // Check if the user is part of the project
    const projectUser = await pool.query(
      "SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2",
      [project_id, user_id]
    );

    if (projectUser.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "User is not part of the project" });
    }

    // Create the task
    const result = await pool.query(
      "INSERT INTO tasks (title, description, status, priority, deadline, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, status, priority, deadline, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get all tasks for a user
exports.getAllTasks = async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
      user_id,
    ]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, deadline } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, deadline = $5 WHERE id = $6 RETURNING *",
      [title, description, status, priority, deadline, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Add a comment to a task
exports.addCommentToTask = async (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [id, user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get all comments for a task
exports.getTaskComments = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM comments WHERE task_id = $1",
      [id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
