import { useState } from 'react'
import { useLogIn } from '../hooks/login'

const LogIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { loading, error, login } = useLogIn()

    const submit = async (event) => {
        event.preventDefault()

        await login(email, password)
    }

    return (
        <form className = "auth" onSubmit = { submit }>
            <h3>LogIn To Account</h3>
            <label>Mailing Address:</label>
            <input 
                type = "email" 
                value = { email } 
                onChange = { (event) => setEmail(event.target.value) } 
            />
            <label>Password:</label>
            <input 
                type = "password" 
                value = { password } 
                onChange = { (event) => setPassword(event.target.value) } 
            />
            <button disabled = { loading }>Jump Back</button>
            { error && <div className = "error">{ error }</div> }
        </form>
    )
}

export default LogIn