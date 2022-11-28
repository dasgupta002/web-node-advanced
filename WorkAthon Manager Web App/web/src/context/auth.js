import { createContext, useReducer, useEffect } from 'react'

export const authContext = createContext()

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOGIN':
            return {
                user: action.payload
            }

        case 'USER_LOGOUT':
            return {
                user: null
            }
            
        default:
            return state
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if(user) {
            dispatch({ type: 'USER_LOGIN', payload: user })
        }
    }, [])

    return (
        <authContext.Provider value = {{ ...state, dispatch }}>
          { children }
        </authContext.Provider>
    )
}