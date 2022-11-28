import { useState } from 'react'
import { useAuth } from '../hooks/auth'
import { useWorkout } from '../hooks/workout'

const Form = () => {
    const { user } = useAuth()
    const { dispatch } = useWorkout()
    
    const [title, setTitle] = useState('')
    const [load, setLoad] = useState('')
    const [reps, setReps] = useState('')
    const [error, setError] = useState(null)
    const [fields, setFields] = useState([])

    const submit = async (event) => {
        event.preventDefault()

        const workout = { title, load, reps }
        const response = await fetch(process.env.REACT_APP_API_URL + 'workouts/', { 
            method: 'POST', 
            body: JSON.stringify(workout), 
            headers: {
                'Authorization': 'Bearer ' + user.token,
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if(!response.ok) {
            setError(json.msg)
            setFields(json.fields)
        } else {
            setError(null)
            setFields([])
            
            setTitle('')
            setLoad('')
            setReps('')

            dispatch({ type: 'CREATE_WORKOUT', payload: json })
        }
    }

    return (
        <form className = "create" onSubmit = { submit }>
            <h3>Add A New Workout</h3>
            <label>Exercise Title:</label>
            <input 
                type = "text" 
                value = { title } 
                className = { fields.includes('title') ? 'error' : '' }
                onChange = { (event) => setTitle(event.target.value) } 
            />
            <label>Load (in kg's):</label>
            <input 
                type = "number" 
                value = { load } 
                className = { fields.includes('load') ? 'error' : '' }
                onChange = { (event) => setLoad(event.target.value) } 
            />
            <label>Number Of Reps:</label>
            <input 
                type = "number" 
                value = { reps } 
                className = { fields.includes('reps') ? 'error' : '' }
                onChange = { (event) => setReps(event.target.value) } 
            />
            <button>Add Workout</button>
            { error && <div className = "error">{ error }</div> }
        </form>
    )
}

export default Form