import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, deleteFile } from '../supabase'
import {
  ArrowLeft, Edit2, Trash2, Star, Image, FileText,
  ExternalLink, Download,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import EntryForm from '../components/EntryForm'

export default function EntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function fetchEntry() {
    const { data, error } = await supabase
      .from('entries')
      .select('*, entry_files(*)')
      .eq('id', id)
      .single()

    if (error || !data) {
      navigate('/')
      return
    }
    setEntry(data)
    setLoading(false)
  }

  useEffect(() => { fetchEntry() }, [id])

  async function handleDelete() {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    setDeleting(true)

    // Delete files from storage
    for (const f of (entry.entry_files || [])) {
      if (f.storage_path) {
        try { await deleteFile(f.storage_path) } catch {}
      }
    }

    // Delete file records
    await supabase.from('entry_files').delete().eq('entry_id', id)
    // Delete entry
    await supabase.from('entries').delete().eq('id', id)
    navigate('/')
  }

  async function togglePortfolio() {
    const { error } = await supabase
      .from('entries')
      .update({ is_portfolio: !entry.is_portfolio })
      .eq('id', id)
    if (!error) setEntry(prev => ({ ...prev, is_portfolio: !prev.is_portfolio }))
  }

  if (loading) return <div className="spinner" />
  if (!entry) return null

  const images = (entry.entry_files || []).filter(f => f.file_type?.startsWith('image/'))
  const docs = (entry.entry_files || []).filter(f => !f.file_type?.startsWith('image/'))

  return (
    <div className="entry-detail">
      <button
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="entry-detail-header">
        <h1>{entry.title}</h1>
        <div className="entry-detail-meta">
          <span>{format(parseISO(entry.entry_date), 'EEEE, MMMM d, yyyy')}</span>
          {entry.is_portfolio && (
            <span className="portfolio-badge">
              <Star size={14} fill="currentColor" />
              Portfolio
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            <Edit2 size={14} />
            Edit
          </button>
          <button className="btn btn-secondary btn-sm" onClick={togglePortfolio}>
            <Star size={14} fill={entry.is_portfolio ? 'currentColor' : 'none'} />
            {entry.is_portfolio ? 'Remove from portfolio' : 'Add to portfolio'}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {(entry.subjects || []).length > 0 && (
        <div className="subject-tags" style={{ marginBottom: '1.25rem' }}>
          {entry.subjects.map(s => (
            <span key={s} className="subject-tag">{s}</span>
          ))}
        </div>
      )}

      {entry.description && (
        <div className="entry-detail-section">
          <h2>What we did</h2>
          <p>{entry.description}</p>
        </div>
      )}

      {entry.learnings && (
        <div className="entry-detail-section">
          <h2>What we learned</h2>
          <p>{entry.learnings}</p>
        </div>
      )}

      {/* Photos */}
      {images.length > 0 && (
        <div className="entry-detail-section">
          <h2>Photos</h2>
          <div className="files-grid">
            {images.map(img => (
              <div key={img.id} className="file-card">
                <a href={img.file_url} target="_blank" rel="noopener noreferrer">
                  <img src={img.file_url} alt={img.file_name} />
                </a>
                <div className="file-card-info">
                  <Image size={12} />
                  {img.file_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents / work samples */}
      {docs.length > 0 && (
        <div className="entry-detail-section">
          <h2>Work Samples</h2>
          <div className="files-grid">
            {docs.map(doc => (
              <div key={doc.id} className="file-card">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <FileText size={28} style={{ color: 'var(--color-sage)' }} />
                  <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    Open file
                  </div>
                </a>
                <div className="file-card-info">
                  <Download size={12} />
                  {doc.file_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <EntryForm
          entry={entry}
          onClose={() => setEditing(false)}
          onSaved={fetchEntry}
        />
      )}
    </div>
  )
}
