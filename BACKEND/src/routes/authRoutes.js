const express = require('express');
const { register, login, getUser } = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user', authMiddleware, getUser);

module.exports = router;