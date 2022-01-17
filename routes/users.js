const express = require('express');
const router = express.Router();
const User = require('../models/user');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

// Render Register Page
router.get('/register', users.renderRegister);

// Register User
router.post('/register', catchAsync(users.register));

// Render Login Page
router.get('/login', users.renderLogin);

// Login User
router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  users.login
);

// Logout User
router.get('/logout', users.logout);

module.exports = router;
