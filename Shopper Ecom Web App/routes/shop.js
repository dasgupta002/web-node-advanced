const express = require('express');
const router = express.Router();

const productController = require('../controllers/shop');
const validateAuth = require('../middlewares/auth');

router.get('/', productController.listProducts);

router.get('/product-details/:itemId', productController.findItem);

router.get('/cart', validateAuth, productController.openCart);

router.post('/cart', validateAuth, productController.addtoCart);

router.post('/delete-cart', validateAuth, productController.emptyCart);

router.get('/checkout', validateAuth, productController.userCheckout);

router.get('/checkout/success', validateAuth, productController.placeOrder);

router.get('/checkout/cancel', validateAuth, productController.userCheckout);

router.get('/orders', validateAuth, productController.orderHistory);

router.get('/orders/:orderId', validateAuth, productController.orderInvoice);

module.exports = router;