import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginForm.css'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const { signInWithEmail } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ text: '', type: '' })

        try {
            await signInWithEmail(email)
            setMessage({
                text: 'Check your email for the magic link!',
                type: 'success'
            })
            setEmail('')
        } catch (error) {
            setMessage({
                text: error.message || 'Failed to send magic link',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Language Drill</h1>
                    <p>Master Mandarin pronunciation through repetition</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Sending...
                            </>
                        ) : (
                            'Send Magic Link'
                        )}
                    </button>
                </form>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="login-footer">
                    <p>No password required • Secure magic link authentication</p>
                </div>
            </div>
        </div>
    )
}
