const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

const Workout = require('../models/workout')

router.get('/', async (req, res) => {
    const createdBy = req.user._id
    const workouts = await Workout.find({ createdBy }).sort({ createdAt: -1 })
    
    res.status(200).json(workouts)
})

router.post('/', async (req, res) => {
    const { title, reps, load } = req.body
    let fields = []

    if(!title) {
        fields.push('title')
    } 
    
    if(!load) {
        fields.push('load')
    }
    
    if(!reps) {
        fields.push('reps')
    }

    if(fields.length > 0) {
        res.status(400).json({ 'msg': 'Please fill in all fields!', fields })
    } else {
        try {
            const createdBy = req.user._id
            const workout = await Workout.create({ title, createdBy, reps, load })
            
            res.status(200).json(workout)
        } catch(error) {
            res.status(400).json({ 'msg': error.message })
        }
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ 'msg': 'Invalid request!' })
    } else {
        const workout = await Workout.findById(id)

        if (!workout) {       
            res.status(404).json({ 'msg': 'No such workout!' })
        } else {
            res.status(200).json(workout)
        }
    }
})

router.patch('/:id', async (req, res) => {
    const { id } = req.params 

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ 'msg': 'Invalid request!' })
    } else {
        try {
            const workout = await Workout.findByIdAndUpdate({ _id: id }, { ...req.body })
            res.status(200).json(workout)
        } catch(error) {
            res.status(400).json({ 'msg': error.message })
        }
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ 'msg': 'Invalid request!' })
    } else {
        const workout = await Workout.findByIdAndDelete({ _id: id })

        if (!workout) {       
            res.status(404).json({ 'msg': 'No such workout!' })
        } else {
            res.status(200).json(workout)
        }
    }
})

module.exports = router