const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgrid({ auth : { api_key: process.env.SENDGRID_API_KEY } }));

exports.showLogin = (req, res, next) => {
    res.render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [], oldInput: { email: '', password: '' } });
};

exports.loggingUser = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;

   User.findOne({ mailingAddress: email })
       .then((user) => {
           if(user) {
               bcrypt.compare(password, user.password)
                     .then((result) => {
                         if(result) {
                             req.session.authState = true;
                             req.session.user = user;
                                    
                             req.session.save((error) => res.redirect('/'));
                         } else {
                             res.status(422).render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [ { param: 'password', msg: 'Incorrect password, try retyping again!' } ], oldInput: { email: email, password: password } });
                         }
                     })
                     .catch((error) => res.redirect('/auth/login'));    
           } else {
               res.status(422).render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [ { param: 'email', msg: 'Mailing address does not exist, try another go!' } ], oldInput: { email: email, password: password } });
           }
       })
       .catch((err) => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           next(error);
       });  
};

exports.showSignup = (req, res, next) => {
    res.render('auth/signup', { pageTitle: 'User - Signup', path: '/auth/signup', errors: [], oldInput: { email: '', password: '', confirmKey: '' } });
};

exports.registerUser = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;

   const errors = validationResult(req);

   if(!errors.isEmpty()) {
        res.status(422).render('auth/signup', { pageTitle: 'User - Signup', path: '/auth/signup', errors: errors.array(), oldInput: { email: email, password: password, confirmKey: req.body.confirm__password } });
   } else {
        bcrypt.hash(password, 12)
              .then((hashedKey) => {
                  const user = new User({ mailingAddress: email, password: hashedKey, cart: { items: [] } });
                  return user.save();
              })
              .then((result) => { 
                  res.redirect('/auth/login');
                  transporter.sendMail({ to: email, from: 'shopper66@rediffmail.com', subject: 'Signup succeeded!', text: 'You have successfully jumped into Shopper.io! Thanks for being a part of this community. Loads of love from our team!' });
              })
              .catch((err) => {
                  const error = new Error(err);
                  error.httpStatusCode = 500;
                  next(error);
              });
   }
};

exports.showReset = (req, res, next) => {
    res.render('auth/reset', { pageTitle: 'User - Reset Password', path: '/auth/login', errors: [], oldInput: { email: '' } });
};

exports.resetPassword = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            res.redirect('/auth/reset-password');
        } else {
            const token = buffer.toString('hex');
            
            User.findOne({ mailingAddress: req.body.email })
                .then((user) => {
                    if(user) {
                        user.resetKey = token;
                        user.keyExpires = Date.now() + 3600000;
                        
                        user.save()
                            .then((result) => {
                                res.redirect('/auth/login');
                                transporter.sendMail({ to: req.body.email, from: 'shopper66@rediffmail.com', subject: 'Password reset approved!', text: `You have requested to reset your password. Please click on the following link to reset your password, http://localhost:40/auth/save-password/${token}` });
                            });
                    } else {
                        res.render('auth/reset', { pageTitle: 'User - Reset Password', path: '/auth/login', errors: [ { param: 'email', msg: 'Mailing address does not exist, try another go!' } ], oldInput: { email: req.body.email } });
                    }
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    next(error);
                });
        }
    });
};

exports.saveChanges = (req, res, next) => {
    const resetKey = req.params.token;
    
    User.findOne({ resetKey: resetKey, keyExpires: { $gt: Date.now() } })
        .then((user) => {
            if(user) {
                res.render('auth/password', { pageTitle: 'User - Save Password', path: '/auth/login', errors: [], oldInput: { password: '' }, userID: user._id.toString(), token: resetKey });
            } else {
                res.render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [ { param: 'other', msg: 'Invalid token or else token has expired, try again!' } ], oldInput: { email: '', password: '' } });
            }
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.savePassword = (req, res, next) => {
    const userID = req.body.userID;
    const password = req.body.password;
    const resetKey = req.body.resetKey;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        User.findOne({ resetKey: resetKey, keyExpires: { $gt: Date.now() } })
            .then((user) => {
                if(user) {
                    res.render('auth/password', { pageTitle: 'User - Save Password', path: '/auth/login', errors: errors.array(), userID: user._id.toString(), token: resetKey });
                } else {
                    res.render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [ { param: 'other', msg: 'Invalid token or else token has expired, try again!' } ], oldInput: { email: '', password: '' } });
                }
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            });       
    } else {
        User.findOne({ _id: userID, resetKey: resetKey, keyExpires: { $gt: Date.now() } })
            .then((user) => {
                if(user) {
                    bcrypt.hash(password, 12)
                          .then((hashedKey) => {
                              user.password = hashedKey;
                              user.resetKey = undefined;
                              user.keyExpires = undefined;

                              return user.save();
                          })
                          .then((result) => res.redirect('/auth/login'));
                } else {
                    res.render('auth/login', { pageTitle: 'User - Login', path: '/auth/login', errors: [ { param: 'other', msg: 'Invalid token or else token has expired, try again!' } ], oldInput: { email: '', password: '' } });
                }    
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            });
    }
};

exports.logoutUser = (req, res, next) => {
   req.session.destroy((error) => {
       res.redirect('/');
   });
};
