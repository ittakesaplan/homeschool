import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { BookOpen, Star, LogOut, Menu } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Journal', icon: BookOpen },
  { path: '/portfolio', label: 'Portfolio', icon: Star },
]

export default function Layout({ session, children }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-header">
        <h2>Learning Journal</h2>
        <button className="btn-ghost" onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.7)' }}>
          <LogOut size={18} />
        </button>
      </div>

      <div className="app-shell">
        {/* Desktop sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>Learning Journal</h2>
            <small>{session.user.email}</small>
          </div>
          <nav>
            {navItems.map(item => (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button onClick={handleSignOut}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main area */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`mobile-nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
