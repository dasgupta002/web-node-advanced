const fs = require('fs');
const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

exports.adminItems = (req, res, next) => {
   Product.find({ createdBy: req.user._id })
          .then((products) => res.render('admin/data', { pageTitle: 'Shopper - My Items', path: '/admin/all-products', products: products }))
          .catch((err) => {
             const error = new Error(err);
             error.httpStatusCode = 500;
             next(error);
          });
};

exports.addLayout = (req, res) => {
   res.render('admin/add', { pageTitle: 'Shopper - Add Item', path: '/admin/add-product', errors: [], oldInput: { title: '', description: '', price: '', image: '' } });
};

exports.submitItem = (req, res, next) => {
   const title = req.body.title;
   const description = req.body.description;
   const price = req.body.price;
   const image = req.file;

   if(!image) {
      res.status(422).render('admin/add', { pageTitle: 'Shopper - Add Item', path: '/admin/add-product', errors: [{ param: 'image', msg: 'Please upload a valid image of either png or jpeg format!' }], oldInput: { title: title, description: description, price: price } });
   } else {
      const errors = validationResult(req);

      if(!errors.isEmpty()) {
         res.render('admin/add', { pageTitle: 'Shopper - Add Item', path: '/admin/add-product', errors: errors.array(), oldInput: { title: title, description: description, price: price } });      
      } else {
         const imageURL = image.path; 

         const product = new Product({ createdBy: req.user, title: title, description: description, price: price, imageURL: imageURL });
         
         product.save()
                .then((result) => res.redirect('all-products'))
                .catch((err) => {
                   const error = new Error(err);
                   error.httpStatusCode = 500;
                   next(error);
                });
      }
   }
};

exports.editLayout = (req, res, next) => {
   const productId = req.params.itemId;
   
   Product.findById(productId)
          .then((product) =>  res.render('admin/edit', { pageTitle: 'Shopper - Edit Item', errors: [], product: product }))
          .catch((err) => {
             const error = new Error(error);
             error.httpStatusCode = 500;
             next(err);
          });
};

exports.submitChanges = (req, res, next) => {
   const productId = req.body.itemId;
   const title = req.body.title;
   const price = req.body.price;
   const description = req.body.description;
   const image = req.file;

   const errors = validationResult(req);

   if(!errors.isEmpty()) {
      res.render('admin/edit', { pageTitle: 'Shopper - Edit Item', errors: errors.array(), product: { _id: req.body.itemId, title: title, description: description, price: price } });    
   } else {
      Product.findById(productId)
             .then((product) => {
                if(product.userID.toString() !== req.user._id.toString()) {
                   res.redirect('/');
                } else {
                   product.title = title;
                   product.price = price;
                   product.description = description;
                   
                   if(image) {
                      fs.unlink(product.imageURL, (error) => {
                         if(error) {
                            next(error);
                         }
                      });
                      
                      product.imageURL = image.path;
                   }

                   product.save()
                          .then(result => res.redirect('all-products'));
                }
             })
             .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
             });
   }
};

exports.deleteItem = (req, res, next) => {
   const productId = req.body.itemId;

   Product.findById(productId)
          .then((product) => {
             if(!product) {
                next(new Error('Product not found!'));
             } else {
                fs.unlink(product.imageURL, (error) => {
                   if(error) {
                      next(error);
                   }
                });
                return Product.deleteOne({ _id: productId, userID: req.user._id })
             }
          })
          .then((result) => res.redirect('all-products'))
          .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
         });
};