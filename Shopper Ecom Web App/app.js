const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const multer = require('multer');
const uuid = require('uuid');
const csrf = require('csurf');
const path = require('path');

const User = require('./models/user');

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');

const errorController = require('./controllers/error');

const app = express();

const store = new MongoDBStore({ uri: 'mongodb+srv://dg:200@cluster0.qyanq.mongodb.net/shopper?retryWrites=true&w=majority', collection: 'sessions' });

const fileStorage = multer.diskStorage({ 
    destination: 'images',
    filename: (req, file, callback) => {
        callback(null, uuid.v4() + '-' + file.originalname); 
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

const csrfSecurity = csrf();

app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images' , express.static(path.join(__dirname, 'images')));

app.use(session({ secret: 'session secret key', resave: false, saveUninitialized: false, store: store }));
app.use(csrfSecurity);

app.use((req, res, next) => {
    res.locals.auth = req.session.authState;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user._id)
            .then((user) => {
                if(!user) {
                    next();
                } else {
                    req.user = user;
                    next();
                }
            })
            .catch((error) => {
                next(new Error(error));
            });
    } else {
        next();
    }
});

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/', shopRouter);

app.use(errorController.notFound);
app.use((error, req, res, next) => res.status(500).render('500', { pageTitle: '500 Error!' }));  

const port = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://dg:200@cluster0.qyanq.mongodb.net/shopper?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then((result) => app.listen(port))
        .catch((error) => console.error(error.message));