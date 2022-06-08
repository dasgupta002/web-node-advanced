module.exports = (req, res, next) => {
    if (req.session.authState) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};