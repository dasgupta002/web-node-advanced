const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

const User = require('../models/user')

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '3d' })

        res.status(200).json({ email, token })
    } catch(error) {
        res.status(400).json({ 'msg': error.message })
    }
})

router.post('/signup', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.signup(email, password)
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '3d' })

        res.status(200).json({ email, token })
    } catch(error) {
        res.status(400).json({ 'msg': error.message })
    }
})

module.exports = router