import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/auth'
import Nav from './components/nav'
import Home from './pages/home'
import SignUp from './pages/signup'
import LogIn from './pages/login'

function App() {
  const { user } = useAuth()

  return (
    <div className = "app">
      <BrowserRouter>
        <Nav />
        <div className = "pages">
          <Routes>
            <Route path = '/' element = { user ? <Home /> : <Navigate to = '/login' /> } />
            <Route path = '/signup' element = { !user ? <SignUp /> : <Navigate to = '/' /> } />
            <Route path = '/login' element = { !user ? <LogIn /> : <Navigate to = '/' /> } />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App