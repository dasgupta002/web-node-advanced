import { useContext } from 'react'
import { authContext } from '../context/auth'

export const useAuth = () => {
    const context = useContext(authContext)
    
    if(!context) {
        throw new Error('Context out of scope!')
    } 

    return context
}