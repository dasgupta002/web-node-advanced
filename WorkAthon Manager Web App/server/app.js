require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const authRouter = require('./routes/auth')
const workoutRouter = require('./routes/workouts')
const { checker } = require('./middlewares/utils')

const app = express()

app.use(express.json())

mongoose.connect(process.env.MONGO_URL)

app.use('/user', authRouter)
app.use('/workouts', checker, workoutRouter)

app.listen(process.env.PORT)