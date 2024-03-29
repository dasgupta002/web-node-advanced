const jwt = require('jsonwebtoken')

const User = require('../models/user') 

exports.checker = async (req, res, next) => {
    const { authorization } = req.headers

    if(!authorization) {
        res.status(401).json({ 'msg': 'Auth token missing!' })
    } else {
        const token = authorization.split(' ')[1]

        try {
            const { _id } = jwt.verify(token, process.env.SECRET_KEY)
            req.user = await User.findOne({ _id }).select('_id')
            
            next()
        } catch(error) {
            res.status(401).json({ 'msg': 'Request is not authorized!' })
        }
    }
}