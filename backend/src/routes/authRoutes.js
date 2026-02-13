const express = require('express');
const router = express.Router();
const { register, login, getProfile, getUsers, updateUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Admin routes
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, admin, updateUser);

module.exports = router;
