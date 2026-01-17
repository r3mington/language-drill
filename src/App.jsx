import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/Auth/AuthGuard'
import AudioDrill from './components/AudioDrill'
import AdminDashboard from './components/Admin/AdminDashboard'
import './App.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <AuthProvider>
      <div className="app">
        <AuthGuard>
          {path === '/admin' ? <AdminDashboard /> : <AudioDrill />}
        </AuthGuard>
      </div>
    </AuthProvider>
  )
}

export default App
