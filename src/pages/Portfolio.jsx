import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Star, Image, FileText, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function Portfolio() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('entries')
        .select('*, entry_files(id, file_name, file_url, file_type)')
        .eq('is_portfolio', true)
        .order('entry_date', { ascending: false })

      if (!error) setEntries(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <>
      <div className="page-header">
        <h1>Portfolio</h1>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Highlighted work and learning milestones. Mark any journal entry as a portfolio piece to feature it here.
      </p>

      {loading ? (
        <div className="spinner" />
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <Star size={48} />
          <h3>No portfolio entries yet</h3>
          <p>When adding or editing a journal entry, check "Add to portfolio" to feature it here.</p>
        </div>
      ) : (
        <div className="entries-list">
          {entries.map(entry => {
            const images = (entry.entry_files || []).filter(f => f.file_type?.startsWith('image/'))
            const docs = (entry.entry_files || []).filter(f => !f.file_type?.startsWith('image/'))

            return (
              <div
                key={entry.id}
                className="entry-card"
                onClick={() => navigate(`/entry/${entry.id}`)}
                style={{ borderLeft: '3px solid var(--color-amber)' }}
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
                    {format(parseISO(entry.entry_date), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Image thumbnails */}
                {images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                    overflowX: 'auto',
                  }}>
                    {images.slice(0, 4).map(img => (
                      <img
                        key={img.id}
                        src={img.file_url}
                        alt={img.file_name}
                        style={{
                          width: 100,
                          height: 72,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                        }}
                        onClick={e => { e.stopPropagation(); window.open(img.file_url, '_blank') }}
                      />
                    ))}
                    {images.length > 4 && (
                      <div style={{
                        width: 100,
                        height: 72,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                      }}>
                        +{images.length - 4} more
                      </div>
                    )}
                  </div>
                )}

                <div className="entry-card-footer">
                  <div className="subject-tags">
                    {(entry.subjects || []).slice(0, 4).map(s => (
                      <span key={s} className="subject-tag">{s}</span>
                    ))}
                  </div>
                  {docs.length > 0 && (
                    <span className="entry-card-files">
                      <FileText size={13} />
                      {docs.length} file{docs.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
