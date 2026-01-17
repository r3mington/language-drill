import { useAuth } from '../../contexts/AuthContext'
import LoginForm from './LoginForm'
import './AuthGuard.css'

export default function AuthGuard({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!user) {
        return <LoginForm />
    }

    return children
}
