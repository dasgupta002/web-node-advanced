const express = require('express')
const mongoose = require('mongoose')
const cookie = require('cookie-parser')

const app = express()

const authRoutes = require('./routes/auth')

const { validateUser, trackUser } = require('./middleware/checker')

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.json())
app.use(cookie())

app.get('*', trackUser)
app.get('/', (req, res) => res.render('home'))
app.get('/smoothies', validateUser, (req, res) => res.render('recipes'))

app.use(authRoutes)

mongoose.connect('mongodb+srv://dg:100@cluster0.jiyt5.mongodb.net/auth')
        .then(result => app.listen(60))
        .catch(error => console.log(error))