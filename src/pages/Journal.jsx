import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Plus, Search, BookOpen, Star, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import EntryForm from '../components/EntryForm'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState(null)
  const navigate = useNavigate()

  async function fetchEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*, entry_files(id)')
      .order('entry_date', { ascending: false })

    if (!error) setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [])

  // Collect all subjects across entries for filtering
  const allSubjects = [...new Set(entries.flatMap(e => e.subjects || []))].sort()

  // Filter entries
  const filtered = entries.filter(e => {
    if (search) {
      const q = search.toLowerCase()
      const matchesText =
        e.title.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.learnings || '').toLowerCase().includes(q)
      if (!matchesText) return false
    }
    if (filterSubject && !(e.subjects || []).includes(filterSubject)) return false
    return true
  })

  // Group entries by month
  const grouped = filtered.reduce((acc, entry) => {
    const monthKey = format(parseISO(entry.entry_date), 'MMMM yyyy')
    if (!acc[monthKey]) acc[monthKey] = []
    acc[monthKey].push(entry)
    return acc
  }, {})

  return (
    <>
      <div className="page-header">
        <h1>Journal</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          New entry
        </button>
      </div>

      {/* Search & filter */}
      {entries.length > 0 && (
        <div className="filter-bar">
          <div className="search-input">
            <Search size={16} />
            <input
              className="form-input"
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
      )}

      {allSubjects.length > 0 && (
        <div className="subject-tags" style={{ marginBottom: '1.25rem' }}>
          <span
            className={`subject-tag clickable ${!filterSubject ? 'active' : ''}`}
            onClick={() => setFilterSubject(null)}
          >
            All
          </span>
          {allSubjects.map(s => (
            <span
              key={s}
              className={`subject-tag clickable ${filterSubject === s ? 'active' : ''}`}
              onClick={() => setFilterSubject(filterSubject === s ? null : s)}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="spinner" />
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>Start your journal</h3>
          <p>Add your first entry to begin recording what you've done and learned.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New entry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={36} />
          <h3>No matching entries</h3>
          <p>Try a different search term or subject filter.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500, marginBottom: '0.625rem' }}>
              {month}
            </h2>
            <div className="entries-list">
              {monthEntries.map(entry => (
                <div
                  key={entry.id}
                  className="entry-card"
                  onClick={() => navigate(`/entry/${entry.id}`)}
                >
                  <div className="entry-card-header">
                    <div>
                      <h3>{entry.title}</h3>
                      {entry.description && (
                        <div className="entry-card-body">
                          <p>{entry.description}</p>
                        </div>
                      )}
                    </div>
                    <span className="entry-card-date">
                      {format(parseISO(entry.entry_date), 'MMM d')}
                    </span>
                  </div>

                  <div className="entry-card-footer">
                    <div className="subject-tags">
                      {(entry.subjects || []).slice(0, 4).map(s => (
                        <span key={s} className="subject-tag">{s}</span>
                      ))}
                      {(entry.subjects || []).length > 4 && (
                        <span className="subject-tag">+{entry.subjects.length - 4}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {entry.entry_files?.length > 0 && (
                        <span className="entry-card-files">
                          <Paperclip size={13} />
                          {entry.entry_files.length}
                        </span>
                      )}
                      {entry.is_portfolio && (
                        <span className="portfolio-badge">
                          <Star size={13} fill="currentColor" />
                          Portfolio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <EntryForm
          onClose={() => setShowForm(false)}
          onSaved={fetchEntries}
        />
      )}
    </>
  )
}
