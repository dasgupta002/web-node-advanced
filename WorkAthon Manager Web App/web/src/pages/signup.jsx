import { useState } from 'react'
import { useSignUp } from '../hooks/signup'

const SignUp = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { loading, error, signup } = useSignUp()

    const submit = async (event) => {
        event.preventDefault()

        await signup(email, password)
    }

    return (
        <form className = "auth" onSubmit = { submit }>
            <h3>SignUp User</h3>
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
            <button disabled = { loading }>Create Account</button>
            { error && <div className = "error">{ error }</div> }
        </form>
    )
}

export default SignUp