const jwt = require('jsonwebtoken')

exports.createToken = (ID) => {
    return jwt.sign({ ID }, 'u4y35u334h53u5', { expiresIn: '3h' })
}