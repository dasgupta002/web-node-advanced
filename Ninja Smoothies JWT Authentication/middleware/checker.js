const jwt = require('jsonwebtoken')
const User = require('../models/user')

const validateUser = (req, res, next) => {
    const token = req.cookies.authKey
    if(token) {
        jwt.verify(token, 'u4y35u334h53u5', (error, decodedKey) => {
            if(error) {
                res.redirect('/login')
            } else {
                next()
            }
        })        
    } else {
        res.redirect('/login')
    }
}

const trackUser = (req, res, next) => {
    const token = req.cookies.authKey
    if(token) {
        jwt.verify(token, 'u4y35u334h53u5', async (error, decodedKey) => {
            if(error) {
                res.locals.user = null
                next()
            } else {
                const user = await User.findById(decodedKey.ID)
                res.locals.user = user

                next()
            }
        })        
    } else {
        res.locals.user = null
        next()
    }
}

module.exports = { validateUser, trackUser }