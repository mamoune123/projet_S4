const express = require("express");
const taskController = require("../controller/taskController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getAllTasks);
router.get("/:id", authMiddleware, taskController.getTaskById);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

router.post("/:id/comments", authMiddleware, taskController.addCommentToTask);

router.get("/:id/comments", authMiddleware, taskController.getTaskComments);

module.exports = router;
