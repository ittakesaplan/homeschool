import React, { useState } from 'react'
import { supabase } from '../supabase'
import {
  BookOpen, Pencil, GraduationCap, Globe, Palette,
  FlaskConical, Calculator, Music,
} from 'lucide-react'
import DecoIcons from '../components/DecoIcons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <DecoIcons />
      <div className="login-card">
        {/* Colorful icon row */}
        <div className="login-icon-row">
          {[
            { Icon: Pencil, bg: '#EFF6FF', color: '#3B82F6' },
            { Icon: Globe, bg: '#F0FDF4', color: '#22C55E' },
            { Icon: Palette, bg: '#FFF1F2', color: '#F43F5E' },
            { Icon: FlaskConical, bg: '#F5F3FF', color: '#8B5CF6' },
            { Icon: Calculator, bg: '#FFF7ED', color: '#F97316' },
            { Icon: Music, bg: '#FEFCE8', color: '#EAB308' },
          ].map(({ Icon, bg, color }, i) => (
            <div key={i} className="login-icon-dot" style={{ background: bg }}>
              <Icon size={20} color={color} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
          <GraduationCap size={26} color="#1E40AF" />
          <h1>Learning Journal</h1>
        </div>
        <p style={{ textAlign: 'center' }}>Sign in to add entries and manage the portfolio.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
