import React, { useState, useRef } from 'react'
import { X, Upload, FileText, Image, Paperclip } from 'lucide-react'
import { supabase, uploadFile } from '../supabase'

const SUGGESTED_SUBJECTS = [
  'Math', 'Science', 'Reading', 'Writing', 'History',
  'Geography', 'Art', 'Music', 'PE', 'Life Skills',
  'Field Trip', 'Nature', 'Technology', 'Social Studies',
]

export default function EntryForm({ entry, onClose, onSaved }) {
  const isEditing = !!entry

  const [title, setTitle] = useState(entry?.title || '')
  const [entryDate, setEntryDate] = useState(
    entry?.entry_date || new Date().toISOString().split('T')[0]
  )
  const [description, setDescription] = useState(entry?.description || '')
  const [learnings, setLearnings] = useState(entry?.learnings || '')
  const [subjects, setSubjects] = useState(entry?.subjects || [])
  const [isPortfolio, setIsPortfolio] = useState(entry?.is_portfolio || false)
  const [newSubject, setNewSubject] = useState('')
  const [files, setFiles] = useState([])
  const [existingFiles, setExistingFiles] = useState(entry?.entry_files || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  function toggleSubject(subj) {
    setSubjects(prev =>
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    )
  }

  function addCustomSubject(e) {
    e.preventDefault()
    const trimmed = newSubject.trim()
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects(prev => [...prev, trimmed])
    }
    setNewSubject('')
  }

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList).filter(f => f.size <= 50 * 1024 * 1024) // 50MB limit
    setFiles(prev => [...prev, ...newFiles])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    try {
      let entryId = entry?.id

      const payload = {
        title: title.trim(),
        entry_date: entryDate,
        description: description.trim(),
        learnings: learnings.trim(),
        subjects,
        is_portfolio: isPortfolio,
      }

      if (isEditing) {
        const { error: updateErr } = await supabase
          .from('entries')
          .update(payload)
          .eq('id', entryId)
        if (updateErr) throw updateErr
      } else {
        const { data, error: insertErr } = await supabase
          .from('entries')
          .insert([payload])
          .select()
          .single()
        if (insertErr) throw insertErr
        entryId = data.id
      }

      // Upload new files
      for (const file of files) {
        const fileData = await uploadFile(file, entryId)
        const { error: fileErr } = await supabase
          .from('entry_files')
          .insert([{ entry_id: entryId, ...fileData }])
        if (fileErr) throw fileErr
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Entry' : 'New Journal Entry'}</h2>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="entry-title">What did we do?</label>
                <input
                  id="entry-title"
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Nature walk at Devou Park"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ width: '160px' }}>
                <label htmlFor="entry-date">Date</label>
                <input
                  id="entry-date"
                  type="date"
                  className="form-input"
                  value={entryDate}
                  onChange={e => setEntryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What happened? What did we explore or work on?"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="learnings">What did we learn?</label>
              <textarea
                id="learnings"
                className="form-textarea"
                value={learnings}
                onChange={e => setLearnings(e.target.value)}
                placeholder="Key takeaways, new skills, or concepts covered"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Subjects</label>
              <div className="subject-tags" style={{ marginBottom: '0.5rem' }}>
                {SUGGESTED_SUBJECTS.map(s => (
                  <span
                    key={s}
                    className={`subject-tag clickable ${subjects.includes(s) ? 'active' : ''}`}
                    onClick={() => toggleSubject(s)}
                  >
                    {s}
                  </span>
                ))}
                {subjects.filter(s => !SUGGESTED_SUBJECTS.includes(s)).map(s => (
                  <span key={s} className="subject-tag active">
                    {s}
                    <button type="button" onClick={() => toggleSubject(s)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={addCustomSubject} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="Add custom subject"
                  style={{ flex: 1, padding: '0.35rem 0.625rem', fontSize: '0.8rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm">Add</button>
              </form>
            </div>

            <div className="form-group">
              <label>Photos, Videos &amp; Work Samples</label>
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload size={24} style={{ marginBottom: '0.25rem' }} />
                <div>Drop files here or click to browse</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Images, videos, PDFs, docs up to 50 MB each
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              {/* Existing files (editing mode) */}
              {existingFiles.length > 0 && (
                <div className="uploaded-files">
                  {existingFiles.map(f => (
                    <div key={f.id} className="uploaded-file">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {f.file_type?.startsWith('image/') ? <Image size={14} /> : <FileText size={14} />}
                        {f.file_name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>saved</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New files to upload */}
              {files.length > 0 && (
                <div className="uploaded-files">
                  {files.map((f, i) => (
                    <div key={i} className="uploaded-file">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Paperclip size={14} />
                        {f.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPortfolio}
                  onChange={e => setIsPortfolio(e.target.checked)}
                />
                Add to portfolio
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
