const express = require("express");
const {
  register,
  login,
  getUser,
  logout,
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);
router.put("/logout", authMiddleware, logout);

module.exports = router;
