import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/auth'
import { WorkoutProvider } from './context/workout'
import App from './app'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <AuthProvider>
    <WorkoutProvider>
      <App />
    </WorkoutProvider>
  </AuthProvider> 
)