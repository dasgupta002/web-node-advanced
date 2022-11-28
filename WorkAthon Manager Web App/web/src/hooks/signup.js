import { useState } from 'react'
import { useAuth } from './auth'

export const useSignUp = () => {
    const { dispatch } = useAuth()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const signup = async (email, password) => {
        setLoading(true)
        setError(null)

        const response = await fetch(process.env.REACT_APP_API_URL + 'user/signup/', { 
            method: 'POST', 
            body: JSON.stringify({ email, password }), 
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if(!response.ok) {
            setLoading(false)
            setError(json.msg)
        } else {
            localStorage.setItem('user', JSON.stringify(json))
            dispatch({ type: 'USER_LOGIN', payload: json })
            
            setLoading(false)
        }
    }

    return { loading, error, signup }
}