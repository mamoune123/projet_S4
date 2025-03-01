const pool = require("../db/db");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./mailController");

require("dotenv").config();

exports.createTask = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    deadline,
    project_id,
    assigned_to, // Un tableau d'IDs des utilisateurs assignés
  } = req.body;

  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const assigned_by = decoded.id; // L'ID de l'utilisateur qui assigne la tâche
    const userRole = decoded.role; // Le rôle de l'utilisateur

    // Vérifier si l'utilisateur est un manager
    if (userRole !== "manager") {
      return res.status(403).json({ message: "Only managers can create tasks" });
    }

    // Vérifier si l'utilisateur qui assigne la tâche fait partie du projet
    const projectUser = await pool.query(
      "SELECT * FROM project_users WHERE project_id = $1 AND user_id = $2",
      [project_id, assigned_by]
    );

    if (projectUser.rows.length === 0) {
      return res.status(403).json({ message: "User is not part of the project" });
    }

    // Créer la tâche
    const taskResult = await pool.query(
      "INSERT INTO tasks (title, description, status, priority, deadline, project_id, assigned_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, status, priority, deadline, project_id, assigned_by]
    );

    const task = taskResult.rows[0];

    // Assigner la tâche aux utilisateurs
    if (assigned_to && assigned_to.length > 0) {
      for (const user_id of assigned_to) {
        await pool.query(
          "INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)",
          [task.id, user_id]
        );

        // Récupérer les informations de l'utilisateur assigné
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
        const userEmail = userResult.rows[0].email;
        const userName = userResult.rows[0].username;

        // Récupérer les informations du projet
        const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [project_id]);
        const projectName = projectResult.rows[0].name;

        // Envoyer un email à l'utilisateur assigné
        const subject = `Nouvelle tâche assignée dans le projet ${projectName}`;
        const text = `Bonjour ${userName},\n\nVous avez été assigné à la tâche "${title}" dans le projet "${projectName}".\n\nDescription : ${description}\n\nCordialement,`;
        const html = `<p>Bonjour ${userName},</p><p>Vous avez été assigné à la tâche <strong>"${title}"</strong> dans le projet <strong>"${projectName}"</strong>.</p><p>Description : ${description}</p><p>Cordialement,</p>`;

        await sendEmail(userEmail, subject, text, html);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).send("Server error");
  }
};

// Get all tasks for a user
exports.getAllTasks = async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT t.* FROM tasks t JOIN task_users tu ON t.id = tu.task_id WHERE tu.user_id = $1",
      [user_id]
    );
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
    // Récupérer la tâche
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).send("Task not found");
    }

    // Récupérer les utilisateurs assignés
    const assignedUsersResult = await pool.query(
      "SELECT u.id, u.username FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = $1",
      [id]
    );

    const task = taskResult.rows[0];
    task.assigned_to = assignedUsersResult.rows; // Ajouter les utilisateurs assignés à la réponse

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, deadline, assigned_to } = req.body;

  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Décoder le token pour obtenir l'ID et le rôle de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // L'ID de l'utilisateur
    const userRole = decoded.role; // Le rôle de l'utilisateur (manager ou user)

    // Récupérer la tâche pour vérifier si l'utilisateur est autorisé à la modifier
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).send("Task not found");
    }

    const task = taskResult.rows[0];

    const isAssignedUser = await pool.query(
      "SELECT * FROM task_users WHERE task_id = $1 AND user_id = $2",
      [id, userId]
    );

    // Vérifier si l'utilisateur est un manager ou l'utilisateur assigné à la tâche
    if (userRole !== "manager" && task.assigned_by !== userId && isAssignedUser.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this task" });
    }

    // Mettre à jour la tâche en fonction du rôle
    let updateQuery;
    let updateValues;

    if (userRole === "manager") {
      // Le manager peut modifier toutes les informations
      updateQuery =
        "UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, deadline = $5 WHERE id = $6 RETURNING *";
      updateValues = [title, description, status, priority, deadline, id];
    } else {
      // L'utilisateur normal ne peut modifier que le statut
      updateQuery = "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *";
      updateValues = [status, id];
    }

    // Exécuter la requête de mise à jour
    const updatedTaskResult = await pool.query(updateQuery, updateValues);

    // Mettre à jour les utilisateurs assignés (uniquement pour les managers)
    if (userRole === "manager" && assigned_to) {
      // Supprimer les anciennes assignations
      await pool.query("DELETE FROM task_users WHERE task_id = $1", [id]);

      // Ajouter les nouvelles assignations
      for (const user_id of assigned_to) {
        await pool.query(
          "INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)",
          [id, user_id]
        );

        // Récupérer les informations de l'utilisateur assigné
        const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
        const userEmail = userResult.rows[0].email;
        const userName = userResult.rows[0].username;

        // Récupérer les informations du projet
        const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [task.project_id]);
        const projectName = projectResult.rows[0].name;

        // Envoyer un email à l'utilisateur assigné
        const subject = `Mise à jour de la tâche dans le projet ${projectName}`;
        const text = `Bonjour ${userName},\n\nVous avez été assigné à la tâche "${title}" dans le projet "${projectName}".\n\nDescription : ${description}\n\nCordialement,`;
        const html = `<p>Bonjour ${userName},</p><p>Vous avez été assigné à la tâche <strong>"${title}"</strong> dans le projet <strong>"${projectName}"</strong>.</p><p>Description : ${description}</p><p>Cordialement,</p>`;

        await sendEmail(userEmail, subject, text, html);
      }
    }

    res.status(200).json(updatedTaskResult.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
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
  const { id } = req.params; // ID de la tâche
  const { content } = req.body; // Contenu du commentaire

  try {
    // Récupérer le token du header Authorization
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Décoder le token pour obtenir l'ID de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // L'ID de l'utilisateur qui commente

    // Ajouter le commentaire à la tâche
    const result = await pool.query(
      "INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [id, userId, content]
    );

    const comment = result.rows[0];

    // Récupérer les informations de l'utilisateur qui a commenté
    const commenterResult = await pool.query("SELECT username FROM users WHERE id = $1", [userId]);
    const commenterUsername = commenterResult.rows[0].username;

    // Récupérer les utilisateurs assignés à la tâche
    const assignedUsersResult = await pool.query(
      "SELECT u.email, u.username FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = $1",
      [id]
    );

    // Récupérer les informations de la tâche
    const taskResult = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    const task = taskResult.rows[0];

    // Envoyer un email à chaque utilisateur assigné
    for (const user of assignedUsersResult.rows) {
      const subject = `Nouveau commentaire sur la tâche "${task.title}"`;
      const text = `Bonjour ${user.username},\n\n${commenterUsername} a ajouté un commentaire sur la tâche "${task.title}":\n\n${content}\n\nCordialement,`;
      const html = `<p>Bonjour ${user.username},</p><p><strong>${commenterUsername}</strong> a ajouté un commentaire sur la tâche <strong>"${task.title}"</strong> :</p><p>${content}</p><p>Cordialement,</p>`;

      await sendEmail(user.email, subject, text, html);
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getAssignedUsers = async (req, res) => {
  const { task_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT u.id, u.username FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = $1",
      [task_id]
    );
    res.status(200).json(result.rows);
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
