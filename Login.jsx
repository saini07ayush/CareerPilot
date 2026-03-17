import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleEmail = async () => {
    setError('')
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      nav('/')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      nav('/')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>CareerPilot</h1>
        <p style={{ color: '#8b88a0', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ ...inputStyle, marginTop: '10px' }}
        />

        {error && <p style={{ color: '#f4736a', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

        <button onClick={handleEmail} style={btnPrimary}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button onClick={handleGoogle} style={{ ...btnPrimary, background: '#1c1b26', border: '1px solid #2a2938', marginTop: '10px' }}>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#8b88a0', marginTop: '1rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: '#7c6af7', cursor: 'pointer', fontSize: '13px' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#1c1b26',
  border: '1px solid #2a2938',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e8e6f0',
  fontSize: '14px',
  outline: 'none',
}

const btnPrimary = {
  width: '100%',
  background: '#7c6af7',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '12px',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  marginTop: '14px',
}
