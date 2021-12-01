const User = require('../models/user')
const { throwErrorMessage } = require('../helpers/error')
const { createToken } = require('../helpers/token')

exports.showSignUpFlow = (req, res) => {
    res.render('signup')
}

exports.signupUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = new User({ email, password })
        await user.save()

        const token = createToken(user._id)
        res.cookie('authKey', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 })

        res.status(201).json({ authState: 'success' })
    } catch (error) {
        const messages = throwErrorMessage(error)
        res.status(400).json({ messages })
    }
}

exports.showLogInFlow = (req, res) => {
    res.render('login')
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.loginUser(email, password)

        const token = createToken(user._id)
        res.cookie('authKey', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 })

        res.status(201).json({ authState: 'success' })
    } catch (error) {
        const messages = throwErrorMessage(error)
        res.status(400).json({ messages })
    }
}

exports.logoutUser = (req, res) => {
    res.clearCookie('authKey')
    res.redirect('/')
}