const fs = require('fs');
const path = require('path');
const PDFdocument = require('pdfkit');

const stripe = require('stripe')('sk_test_51J3bIcSAwnDn9edXgZPYOIhvERtinkTFVxAcZhtZBbXiGMDlOtjhekdlDiNurNS9Jlwgid9Ga46zJXgBSCNHAOrs00SSPbw39s');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEM_COUNT = 4;

exports.listProducts = (req, res, next) => {
   const page = +req.query.page || 1;
   
   let total;
   
   Product.countDocuments()
          .then((count) => {
             total = count;
             return Product.find()
                           .skip((page - 1) * ITEM_COUNT)
                           .limit(ITEM_COUNT) 
          })
          .then((prods) => {
             let products = [];

             if(req.user) {
                products = prods.filter((prod) => prod.createdBy.toString() !== req.user._id.toString());
             } else {
                products = prods;
             }

             res.render('shop/list', { pageTitle: 'Shopper', path: '/', products: products, currentPage: page, hasNext: ITEM_COUNT * page < total, nextPage: page + 1, hasPrevious: page > 1, previousPage: page - 1, lastPage: Math.ceil(total / ITEM_COUNT) });
          })
          .catch((err) => {
             const error = new Error(err);
             error.httpStatusCode = 500;
             next(error);
          });
};

exports.findItem = (req, res, next) => {
   const productId = req.params.itemId;

   Product.findById(productId)
          .then((product) => {
             if(req.user && req.user._id.toString() === product.createdBy.toString()) {
                res.redirect('/');
             } else {
                res.render('shop/item', { pageTitle: 'Shopper - View Item', path: '/', product: product })
             }
          })
          .catch((err) => {
             const error = new Error(err);
             error.httpStatusCode = 500;
             next(error);
          });
};

exports.openCart = (req, res, next) => {
   let products = [];
   let total = 0;

   req.user.populate('cart.items.productID')
           .execPopulate()
           .then((user) => {
              products = user.cart.items;
              products.forEach((item) => total += item.quantity * item.productID.price);

              res.render('shop/cart', { pageTitle: 'Shopper - My Cart', path: '/cart', products: products, total: total });
           })
           .catch((err) => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              next(error);
           });
};

exports.addtoCart = (req, res, next) => {
   const productId = req.body.itemId;

   Product.findById(productId)
          .then((product) => req.user.addItem(product))
          .then((result) => res.redirect('/cart'))
          .catch((err) => {
             const error = new Error(err);
             error.httpStatusCode = 500;
             next(error);
          });
};

exports.emptyCart = (req, res, next) => {
   const productId = req.body.itemId;
   
   req.user.removeItem(productId)
           .then((result) => res.redirect('/cart'))
           .catch((err) => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              next(error);
           });
};

exports.userCheckout = (req, res, next) => {
   let products = [];
   let total = 0;

   req.user.populate('cart.items.productID')
           .execPopulate()
           .then((user) => {
              products = user.cart.items;
              products.forEach((item) => total += item.quantity * item.productID.price);

              return stripe.checkout.sessions.create({ 
                 payment_method_types: ['card'], 
                 line_items: products.map((item) => { 
                    return { name: item.productID.title, description: item.productID.description, amount: item.productID.price * 100, currency: 'usd', quantity: item.quantity };
                 }), 
                 success_url: req.protocol + '://' + req.get('host') + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
                 cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
              });
           })
           .then((session) => res.render('shop/checkout', { pageTitle: 'Shopper - Checkout', path: '/cart', sessionID: session.id, products: products, total: total }))
           .catch((err) => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              next(error);
           });
};

exports.placeOrder = (req, res, next) => {
   const checkoutID = req.query.session_id;
   
   stripe.checkout.sessions.retrieve(checkoutID)
                           .then((session) => {
                              if (session.customer) {
                                 req.user.populate('cart.items.productID')
                                         .execPopulate()
                                         .then((user) => {
                                            const products = user.cart.items.map((item) => {
                                               return { quantity: item.quantity, product: { ...item.productID._doc } };
                                            });
      
                                            const order = new Order({
                                               user: { email: req.user.mailingAddress, userID: req.user._id },
                                               products: products
                                            });
      
                                            return order.save();
                                         })
                                         .then((result) => req.user.clearCart())
                                         .then(() => res.redirect('/orders'))
                                         .catch((err) => {
                                            const error = new Error(err);
                                            error.httpStatusCode = 500;
                                            next(error);
                                         }); 
                              } else {
                                 res.redirect('/cart');
                              }
                           })
                           .catch((err) => {
                              const error = new Error(err);
                              error.httpStatusCode = 500;
                              next(error);
                           });
};

exports.orderHistory = (req, res) => {
   Order.find({ 'user.userID': req.user._id })
        .then((orders) => res.render('shop/orders', { pageTitle: 'Shopper - My Orders', path: '/orders', orders: orders }))
        .catch((err) => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           next(error);
        });
};

exports.orderInvoice = (req, res, next) => {
   const orderId = req.params.orderId;
   
   Order.findById(orderId)
        .then((order) => {
           if(!order) {
              next(new Error('No order found!'));
           } else if(order.user.userID.toString() !== req.user._id.toString()) {
              next(new Error('You cannot access that order!'));
           } else {
              const fileName = 'invoice-' + orderId + '.pdf';
              const filePath = path.join('invoices', fileName);
         
              const document = new PDFdocument();
              
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'inline; filename="' + fileName + '"');
              
              document.pipe(fs.createWriteStream(filePath));
              document.pipe(res);

              document.fontSize(25).text('Invoice');
              document.text('------------------------------');
              document.fontSize(14).text('Order reference for this purchase is ' + orderId + '.');
              document.text('Order summary:');

              let total = 0;
              order.products.forEach((item) => {
                 total += item.quantity * item.product.price;
                 document.text(item.product.title + ' x ' + item.quantity + ' - ' + item.product.price)
              });
              
              document.text('Order total is ' + total + '.');
              document.end(); 
           }
        }).catch((err) => {
           const error = new Error(err);
           error.httpStatusCode = 500;
           next(error);
        }); 
};