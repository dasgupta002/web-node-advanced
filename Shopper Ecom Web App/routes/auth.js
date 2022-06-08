const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const User = require('../models/user');

const authController = require('../controllers/auth');

router.get('/login', authController.showLogin);

router.post('/login', authController.loggingUser);

router.get('/signup', authController.showSignup);

router.post(
    '/signup', 
    [ body('email', 'Invalid mailing address, try typing again!')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ mailingAddress: value })
                           .then((user) => {
                               if(user) {
                                   return Promise.reject('Mailing address already exists, try a fresh one!');
                               } 
                           });    
            }),   
      body('password', 'Invalid password format, password must be at least of six characters containing only alphabets and numbers!')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(), 
      body('confirm__password') 
            .trim()
            .custom((value, { req }) => {
                if(value !== req.body.password) {
                    throw new Error('Passwords do not match, try again!');
                } else {
                    return true;
                }
            })
    ],
    authController.registerUser
);

router.post('/logout', authController.logoutUser);

router.get('/reset-password', authController.showReset);

router.post('/reset-password', authController.resetPassword);

router.get('/save-password/:token', authController.saveChanges);

router.post(
    '/save-password',
    [ body('password', 'Invalid password format, password must be at least of six characters containing only alphabets and numbers!')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim()
    ], 
    authController.savePassword
);

module.exports = router;