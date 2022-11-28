import { useEffect } from 'react'
import { useAuth } from '../hooks/auth'
import { useWorkout } from '../hooks/workout'
import Tile from '../components/tile'
import Form from '../components/form'

const Home = () => {
    const { user } = useAuth()
    const { workouts, dispatch } = useWorkout()
    
    useEffect(() =>{
        async function get() {
            const response = await fetch(process.env.REACT_APP_API_URL + 'workouts/', {
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            })
            const json = await response.json()
    
            if(response.ok) {
                dispatch({ type: 'SET_WORKOUTS', payload: json })
            }
        }

        get() 
    }, [user, dispatch])

    return (
        <div className = "home">
            <div>
                { workouts && workouts.map((item) => <Tile key = { item._id } body = { item } />) }
            </div>
            <Form />
        </div>
    )
}

export default Home