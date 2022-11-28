import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useAuth } from '../hooks/auth'
import { useWorkout } from '../hooks/workout'

const Tile = ({ body }) => {
    const { user } = useAuth()
    const { dispatch } = useWorkout()

    const { _id, title, reps, load, createdAt } = body

    const del = async () => {
        const response = await fetch(process.env.REACT_APP_API_URL + 'workouts/' + _id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + user.token
            }
        })
        const json =  await response.json()

        if(response.ok) {
            dispatch({ type: 'DELETE_WORKOUT', payload: json })
        }
    }

    return (
        <div className = "details">
            <h4>{ title }</h4>
            <p><strong>Load (kg's): </strong>{ load }</p>
            <p><strong>Reps: </strong>{ reps }</p>
            <p>{ formatDistanceToNow(new Date(createdAt), { addSuffix: true }) }</p>
            <span className = "material-symbols-outlined" onClick = { del }>delete</span>
        </div>
    )
}

export default Tile