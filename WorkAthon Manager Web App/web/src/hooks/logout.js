import { useAuth } from './auth'
import { useWorkout } from './workout'

export const useLogOut = () => {
    const { dispatch } = useAuth()
    const { dispatch: clearStore } = useWorkout()

    const logout = () => {
        localStorage.removeItem('user')
        dispatch({ type: 'USER_LOGOUT' })
        clearStore({ type: 'SET_WORKOUTS', payload: [] })
    }

    return { logout }
}