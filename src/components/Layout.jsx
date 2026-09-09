import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  BookOpen, Star, LogOut, Download, Pencil, Globe,
  Palette, FlaskConical, GraduationCap,
} from 'lucide-react'
import DecoIcons from './DecoIcons'

const navItems = [
  { path: '/', label: 'Journal', icon: BookOpen },
  { path: '/portfolio', label: 'Portfolio', icon: Star },
]

export default function Layout({ session, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [exporting, setExporting] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { data: entries, error } = await supabase
        .from('entries')
        .select('*, entry_files(*)')
        .order('entry_date', { ascending: false })

      if (error) throw error

      const exportData = {
        exported_at: new Date().toISOString(),
        total_entries: entries.length,
        entries: entries.map(e => ({
          title: e.title,
          date: e.entry_date,
          description: e.description,
          learnings: e.learnings,
          subjects: e.subjects,
          is_portfolio: e.is_portfolio,
          created_at: e.created_at,
          files: (e.entry_files || []).map(f => ({
            name: f.file_name,
            url: f.file_url,
            type: f.file_type,
          })),
        })),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `learning-journal-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
    setExporting(false)
  }

  return (
    <>
      <DecoIcons />

      {/* Mobile top bar */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={20} />
          <h2>Learning Journal</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={handleExport} disabled={exporting} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Download size={18} />
          </button>
          <button className="btn-ghost" onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="app-shell">
        {/* Desktop sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icons">
              {[
                { Icon: Pencil, bg: 'rgba(59,130,246,0.2)', color: '#93BBFD' },
                { Icon: Globe, bg: 'rgba(34,197,94,0.2)', color: '#86EFAC' },
                { Icon: Palette, bg: 'rgba(244,63,94,0.2)', color: '#FDA4AF' },
                { Icon: FlaskConical, bg: 'rgba(139,92,246,0.2)', color: '#C4B5FD' },
              ].map(({ Icon, bg, color }, i) => (
                <div key={i} className="sidebar-brand-icon" style={{ background: bg }}>
                  <Icon size={14} color={color} />
                </div>
              ))}
            </div>
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
            <button
              className="nav-link"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download size={18} />
              {exporting ? 'Exporting…' : 'Export backup'}
            </button>
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
