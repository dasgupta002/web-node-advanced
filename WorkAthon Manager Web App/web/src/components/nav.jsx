import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/auth'
import { useLogOut } from '../hooks/logout'

const Nav = () => {
    const { user } = useAuth()
    const { logout } = useLogOut()

    return (
        <header>
            <div className = "container">
                <Link to = '/'>
                    <h1>WorkAthon</h1>
                </Link>
                <nav>
                    { 
                        !user && <div>
                            <Link to = '/signup'>
                                <h1>New here?</h1>
                            </Link>
                            <Link to = '/login'>
                                <h1>Get back to last!</h1>
                            </Link>
                        </div> 
                    }
                    { 
                        user && <div>
                            <span>{ user.email }</span>
                            <button onClick = { () => logout() }>LogOut</button>
                        </div> 
                    }
                </nav>
            </div>
        </header>
    )
}

export default Nav