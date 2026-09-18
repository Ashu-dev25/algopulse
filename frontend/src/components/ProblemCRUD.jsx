import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, PlusCircle, ExternalLink, Trash2, Edit3,
  CheckCircle2, ShieldCheck, X, SlidersHorizontal
} from 'lucide-react';
import { problemsApi, validatorApi } from '../api/client';

export default function ProblemCRUD({ onNotify }) {
  // ============================================================
  // 1) Component State
  // ============================================================
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  // Add form fields
  const [platform, setPlatform] = useState('codeforces');
  const [title, setTitle] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [pUrl, setPUrl] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('solved');
  const [stuckCategory, setStuckCategory] = useState('tle');
  const [briefNote, setBriefNote] = useState('');
  const [notesUrl, setNotesUrl] = useState('');

  // Validation state
  const [urlValidation, setUrlValidation] = useState({ valid: null, msg: '' });
  const [autoDetectedPlatform, setAutoDetectedPlatform] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ============================================================
  // 2) Fetch problems list (CRUD: Read)
  // ============================================================
  const fetchProblems = useCallback(async () => {
    // Step A: Build query params from active filters
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      // Step B: Call list API and update state
      const data = await problemsApi.list(params);
      setProblems(data || []);
    } catch (err) {
      onNotify(err.message || 'Failed to fetch problems', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, platformFilter, difficultyFilter, search, onNotify]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // ============================================================
  // 3) Real-time URL validation + auto-platform detection
  // ============================================================
  useEffect(() => {
    // Step A: Clear when URL is empty
    if (!subUrl.trim()) {
      setUrlValidation({ valid: null, msg: '' });
      setAutoDetectedPlatform(null);
      return;
    }

    // Step B: Debounce 300ms to avoid hammering API on every keystroke
    const timer = setTimeout(async () => {
      try {
        // Step C: Call backend validator — it auto-detects platform
        const res = await validatorApi.validateUrl(subUrl.trim(), null);

        // Step D: Update validation message
        setUrlValidation({
          valid: res.is_valid,
          msg: res.is_valid
            ? `✅ Valid ${res.detected_platform || platform} submission proof`
            : res.error_message
        });

        // Step E: Auto-set platform if backend recognized it
        if (res.detected_platform && res.detected_platform !== 'other') {
          setPlatform(res.detected_platform);
          setAutoDetectedPlatform(res.detected_platform);
        } else {
          setAutoDetectedPlatform(null);
        }
      } catch (e) {
        setUrlValidation({ valid: false, msg: 'Invalid URL format' });
        setAutoDetectedPlatform(null);
      }
    }, 300);

    // Step F: Cleanup debounce timer
    return () => clearTimeout(timer);
  }, [subUrl]); // only subUrl triggers this — platform auto-set inside does not retrigger

  // ============================================================
  // 4) Reset add form to defaults
  // ============================================================
  const resetAddForm = () => {
    // Step A: Reset all form fields
    setTitle(''); setSubUrl(''); setPUrl(''); setTagsInput('');
    setBriefNote(''); setNotesUrl('');
    setPlatform('codeforces'); setStatus('solved'); setDifficulty('Medium');
    setStuckCategory('tle'); setFormError('');
    setUrlValidation({ valid: null, msg: '' });
    setAutoDetectedPlatform(null);
  };

  // ============================================================
  // 5) Create Problem (CRUD: Create)
  // ============================================================
  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      // Step A: Parse tag array from comma-separated input
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      // Step B: Call backend create problem API
      await problemsApi.create({
        platform,
        title: title.trim(),
        sub_url: subUrl.trim(),
        p_url: pUrl.trim() || undefined,
        difficulty,
        tags,
        status,
        stuck_category: status === 'tried' ? stuckCategory : undefined,
        brief_note: briefNote.trim() || undefined,
        notes_url: notesUrl.trim() || undefined,
      });

      // Step C: Reset form, close modal, notify success
      resetAddForm();
      setIsAddOpen(false);
      onNotify('Problem added successfully!', 'success');
      await fetchProblems();
    } catch (err) {
      setFormError(err.message || 'Failed to create problem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // 6) Update Problem (CRUD: Update)
  // ============================================================
  const handleUpdateProblem = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;
    try {
      // Step A: Send update request with changed fields
      await problemsApi.update(editingProblem.id, {
        title: editingProblem.title,
        difficulty: editingProblem.difficulty,
        status: editingProblem.status,
        brief_note: editingProblem.brief_note,
        notes_url: editingProblem.notes_url,
        stuck_category: editingProblem.stuck_category,
      });

      // Step B: Close edit modal, refresh list
      setEditingProblem(null);
      onNotify('Problem updated!', 'success');
      await fetchProblems();
    } catch (err) {
      onNotify(err.message || 'Failed to update problem.', 'error');
    }
  };

  // ============================================================
  // 7) Delete Problem (CRUD: Delete)
  // ============================================================
  const handleDeleteProblem = async (id, title) => {
    // Step A: Confirm deletion with user
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      // Step B: Call delete API and refresh list
      await problemsApi.delete(id);
      onNotify('Problem deleted.', 'info');
      await fetchProblems();
    } catch (err) {
      onNotify(err.message || 'Failed to delete.', 'error');
    }
  };

  // ============================================================
  // 8) Helper: difficulty badge class
  // ============================================================
  const diffBadge = (d) =>
    d === 'Easy' ? 'badge badge-easy' : d === 'Hard' ? 'badge badge-hard' : 'badge badge-medium';

  // ============================================================
  // 9) Render
  // ============================================================
  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '24px 28px 48px' }}>

      {/* ── Filter & Action Bar ─────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        {/* Search box */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '340px' }}>
          <Search
            size={15} color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}>
            <option value="">All Statuses</option>
            <option value="solved">🟢 Solved</option>
            <option value="tried">🟠 Tried</option>
          </select>

          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}>
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
            <option value="geeksforgeeks">GeeksforGeeks</option>
            <option value="atcoder">AtCoder</option>
            <option value="hackerrank">HackerRank</option>
            <option value="other">Other</option>
          </select>

          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}>
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Add Problem button */}
          <button onClick={() => setIsAddOpen(true)} className="btn-primary">
            <PlusCircle size={15} />
            Add Problem
          </button>
        </div>
      </div>

      {/* ── Problem count label ─────────────────────────────── */}
      {!loading && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {problems.length} {problems.length === 1 ? 'problem' : 'problems'} found
        </p>
      )}

      {/* ── Problem Grid ────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--cyan)', fontSize: '0.875rem', letterSpacing: '0.06em' }}>
          LOADING...
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-panel empty-state">
          <CheckCircle2 size={42} color="var(--cyan)" style={{ opacity: 0.3, marginBottom: '4px' }} />
          <h3>No problems yet</h3>
          <p>Click "Add Problem" to log your first submission with proof URL validation.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {problems.map((p) => {
            const isSolved = p.status === 'solved';
            return (
              <div
                key={p.id}
                className={`problem-card ${isSolved ? 'solved' : 'tried'}`}
              >
                {/* Card top row: badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-platform">{p.platform.toUpperCase()}</span>
                  <span className={diffBadge(p.difficulty)}>{p.difficulty}</span>
                  <span className={`badge ${isSolved ? 'badge-solved' : 'badge-tried'}`}>
                    {isSolved ? '✓ Solved' : '◷ Tried'}
                  </span>
                </div>

                {/* Problem title */}
                <div>
                  <h4 style={{
                    fontSize: '0.95rem', fontWeight: 600,
                    color: 'var(--text-primary)', lineHeight: 1.35,
                  }}>
                    {p.title}
                  </h4>
                  {p.brief_note && (
                    <p style={{
                      fontSize: '0.79rem', color: 'var(--text-muted)',
                      marginTop: '6px', lineHeight: 1.5,
                      padding: '6px 10px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      borderLeft: `2px solid ${isSolved ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    }}>
                      {p.brief_note}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {p.tags.map(t => <span key={t} className="tag-pill">#{t}</span>)}
                  </div>
                )}

                {/* Bottom action row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '10px', borderTop: '1px solid var(--border-faint)',
                }}>
                  {/* External links */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {p.sub_url && (
                      <a href={p.sub_url} target="_blank" rel="noreferrer"
                        style={{
                          fontSize: '0.75rem', color: isSolved ? '#4ade80' : '#fbbf24',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                        Proof <ExternalLink size={11} />
                      </a>
                    )}
                    {p.p_url && (
                      <a href={p.p_url} target="_blank" rel="noreferrer"
                        style={{
                          fontSize: '0.75rem', color: 'var(--text-muted)',
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                        Problem <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Edit / Delete */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setEditingProblem(p)}
                      style={{ padding: '5px 10px', fontSize: '0.775rem', gap: '5px' }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteProblem(p.id, p.title)}
                      style={{ padding: '5px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE PROBLEM MODAL ─────────────────────────────── */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-panel">
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--cyan)" />
                Add Problem
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); resetAddForm(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form error */}
            {formError && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: '0.825rem',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProblem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Submission URL field */}
              <div>
                <label>Submission Proof URL *</label>
                <input
                  type="url" required
                  placeholder="e.g. https://codeforces.com/contest/1800/submission/278912301"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                />
                {urlValidation.msg && (
                  <p style={{
                    fontSize: '0.76rem', marginTop: '5px',
                    color: urlValidation.valid ? '#4ade80' : '#f87171',
                  }}>
                    {urlValidation.msg}
                  </p>
                )}
              </div>

              {/* Platform & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>
                    Platform
                    {autoDetectedPlatform && (
                      <span style={{
                        marginLeft: '8px', fontSize: '0.68rem', color: 'var(--cyan)',
                        background: 'rgba(0,229,255,0.1)', padding: '1px 7px',
                        borderRadius: '4px', border: '1px solid rgba(0,229,255,0.25)',
                      }}>
                        ⚡ Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => { setPlatform(e.target.value); setAutoDetectedPlatform(null); }}
                    style={autoDetectedPlatform ? { borderColor: 'var(--cyan)', boxShadow: '0 0 0 3px rgba(0,229,255,0.1)' } : {}}
                  >
                    <option value="codeforces">Codeforces</option>
                    <option value="codechef">CodeChef</option>
                    <option value="geeksforgeeks">GeeksforGeeks</option>
                    <option value="atcoder">AtCoder</option>
                    <option value="hackerrank">HackerRank</option>
                    <option value="leetcode">LeetCode</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="solved">✓ Solved</option>
                    <option value="tried">◷ Tried</option>
                  </select>
                </div>
              </div>

              {/* Problem title */}
              <div>
                <label>Problem Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Difficulty & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label>Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Array, Hash Table, DP"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Stuck category — show only when tried */}
              {status === 'tried' && (
                <div>
                  <label>Blocker Reason</label>
                  <select value={stuckCategory} onChange={(e) => setStuckCategory(e.target.value)}>
                    <option value="tle">Time Limit Exceeded (TLE)</option>
                    <option value="wa">Wrong Answer (WA)</option>
                    <option value="mle">Memory Limit Exceeded</option>
                    <option value="logic_gap">Logic Gap</option>
                    <option value="need_algorithm">Need Algorithm Insight</option>
                  </select>
                </div>
              )}

              {/* Brief note */}
              <div>
                <label>Brief Note <span style={{ color: 'var(--text-disabled)' }}>(max 280 chars)</span></label>
                <input
                  type="text" maxLength={280}
                  placeholder="Key insight or approach (optional)"
                  value={briefNote}
                  onChange={(e) => setBriefNote(e.target.value)}
                />
              </div>

              {/* Form actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                <button type="button" className="btn-secondary"
                  onClick={() => { setIsAddOpen(false); resetAddForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROBLEM MODAL ───────────────────────────────── */}
      {editingProblem && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Edit Problem</h3>
              <button onClick={() => setEditingProblem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProblem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Title</label>
                <input type="text" required value={editingProblem.title}
                  onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Status</label>
                  <select value={editingProblem.status}
                    onChange={(e) => setEditingProblem({ ...editingProblem, status: e.target.value })}>
                    <option value="solved">✓ Solved</option>
                    <option value="tried">◷ Tried</option>
                  </select>
                </div>
                <div>
                  <label>Difficulty</label>
                  <select value={editingProblem.difficulty}
                    onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {editingProblem.status === 'tried' && (
                <div>
                  <label>Blocker Reason</label>
                  <select value={editingProblem.stuck_category || 'wa'}
                    onChange={(e) => setEditingProblem({ ...editingProblem, stuck_category: e.target.value })}>
                    <option value="tle">Time Limit Exceeded</option>
                    <option value="wa">Wrong Answer</option>
                    <option value="mle">Memory Limit</option>
                    <option value="logic_gap">Logic Gap</option>
                    <option value="need_algorithm">Need Algorithm Insight</option>
                  </select>
                </div>
              )}

              <div>
                <label>Brief Note</label>
                <textarea rows={2} maxLength={280}
                  value={editingProblem.brief_note || ''}
                  onChange={(e) => setEditingProblem({ ...editingProblem, brief_note: e.target.value })}
                  style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingProblem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
