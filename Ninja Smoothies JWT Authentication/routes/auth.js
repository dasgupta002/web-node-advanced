const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.get('/signup', authController.showSignUpFlow);
router.post('/signup', authController.signupUser);
router.get('/login', authController.showLogInFlow);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

module.exports = router