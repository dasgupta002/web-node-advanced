const express = require('express');
const router = express.Router();
const { check } = require('express-validator/check');

const adminController = require('../controllers/admin');
const validateAuth = require('../middlewares/auth');

router.get('/add-product', validateAuth, adminController.addLayout);

router.post(
    '/add-product', 
    [ check('title', 'Invalid title format, title must be at least of four characters containing only alphabets!')
            .isString()   
            .isLength({ min: 4 })
            .trim(),
      check('description', 'Description must be at least of ten characters and at a max of fifty characters!')
            .isLength({ min: 10, max: 500 })
            .trim(),
      check('price', 'Price tag must contain decimal values only!')
            .isFloat()
    ],
    validateAuth, 
    adminController.submitItem
);

router.get('/edit-product/:itemId', validateAuth, adminController.editLayout);

router.post(
    '/edit-product', 
    [ check('title', 'Invalid title format, title must be at least of four characters containing only alphabets!')
            .isString()   
            .isLength({ min: 4 })
            .trim(),
      check('description', 'Description must be at least of ten characters and at a max of fifty characters!')
            .isLength({ min: 10, max: 50 })
            .trim(),
      check('price', 'Price tag must contain decimal values only!')
            .isFloat()
    ],
    validateAuth, 
    adminController.submitChanges
);

router.post('/delete-product', validateAuth, adminController.deleteItem);

router.get('/all-products', validateAuth, adminController.adminItems);

module.exports = router;