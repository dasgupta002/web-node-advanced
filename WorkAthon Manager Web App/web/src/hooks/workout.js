import { useContext } from 'react'
import { workoutContext } from '../context/workout'

export const useWorkout = () => {
    const context = useContext(workoutContext)
    
    if(!context) {
        throw new Error('Context out of scope!')
    } 

    return context
}