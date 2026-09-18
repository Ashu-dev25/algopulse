import React, { useState, useEffect } from 'react';
import {
  Search, PlusCircle, ExternalLink, Trash2, Edit3,
  CheckCircle2, AlertTriangle, Filter, ShieldCheck, Tag, X
} from 'lucide-react';
import { problemsApi, validatorApi } from '../api/client';

export default function ProblemCRUD({ onNotify }) {
  // 1) Component State
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Add & Edit Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  // Form State for Add Problem
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
  
  const [urlValidation, setUrlValidation] = useState({ valid: null, msg: '' });
  const [autoDetectedPlatform, setAutoDetectedPlatform] = useState(null); // tracks if platform was auto-detected from URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 2) Fetch problems list (CRUD: Read List)
  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const data = await problemsApi.list(params);
      setProblems(data || []);
    } catch (err) {
      onNotify(err.message || 'Failed to fetch problems', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [statusFilter, platformFilter, difficultyFilter, search]);

  // 3) Real-time URL validation + auto-platform detection using backend API
  useEffect(() => {
    // Step A: Clear state when URL is empty
    if (!subUrl.trim()) {
      setUrlValidation({ valid: null, msg: '' });
      setAutoDetectedPlatform(null);
      return;
    }

    // Step B: Debounce 300ms to avoid hammering the API on every keystroke
    const timer = setTimeout(async () => {
      try {
        // Step C: Call backend validator — it auto-detects platform from the URL
        const res = await validatorApi.validateUrl(subUrl.trim(), null);

        // Step D: Update validation message
        setUrlValidation({
          valid: res.is_valid,
          msg: res.is_valid
            ? `✅ Valid ${res.detected_platform || platform} submission proof URL!`
            : res.error_message
        });

        // Step E: Auto-set platform dropdown if backend detected one
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

    // Step F: Cleanup debounce timer on re-render
    return () => clearTimeout(timer);
  }, [subUrl]); // only depends on subUrl — platform auto-set inside does NOT retrigger

  // 4) Create Problem (CRUD: Create)
  const handleCreateProblem = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      // Step A: Format tag array
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
        notes_url: notesUrl.trim() || undefined
      });

      // Step C: Reset form and close modal
      setTitle('');
      setSubUrl('');
      setPUrl('');
      setTagsInput('');
      setBriefNote('');
      setNotesUrl('');
      setAutoDetectedPlatform(null);
      setUrlValidation({ valid: null, msg: '' });
      setPlatform('codeforces');
      setIsAddOpen(false);
      onNotify('Problem created successfully!', 'success');
      await fetchProblems();
    } catch (err) {
      setFormError(err.message || 'Failed to create problem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5) Update Problem (CRUD: Update)
  const handleUpdateProblem = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;
    try {
      await problemsApi.update(editingProblem.id, {
        title: editingProblem.title,
        difficulty: editingProblem.difficulty,
        status: editingProblem.status,
        brief_note: editingProblem.brief_note,
        notes_url: editingProblem.notes_url,
        stuck_category: editingProblem.stuck_category
      });
      setEditingProblem(null);
      onNotify('Problem updated successfully!', 'success');
      await fetchProblems();
    } catch (err) {
      onNotify(err.message || 'Failed to update problem.', 'error');
    }
  };

  // 6) Delete Problem (CRUD: Delete)
  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await problemsApi.delete(id);
      onNotify('Problem deleted successfully!', 'info');
      await fetchProblems();
    } catch (err) {
      onNotify(err.message || 'Failed to delete problem.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Top Filter & Action Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search problems by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="solved">🟢 Solved Only</option>
            <option value="tried">🟠 Tried Only</option>
          </select>

          {/* Platform Filter */}
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
            <option value="geeksforgeeks">GeeksforGeeks</option>
            <option value="atcoder">AtCoder</option>
            <option value="hackerrank">HackerRank</option>
            <option value="other">Other</option>
          </select>

          {/* Difficulty Filter */}
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Add Problem Button */}
          <button onClick={() => setIsAddOpen(true)} className="btn-primary" style={{ padding: '8px 14px' }}>
            <PlusCircle size={15} color="#050608" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Problems List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#00f2fe' }}>
          <p>LOADING PROBLEMS...</p>
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={40} color="#00f2fe" style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '6px' }}>No problems found</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Click the "Add Problem" button above to log your first problem with strict submission URL validation!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {problems.map((p) => {
            const isSolved = p.status === 'solved';
            return (
              <div key={p.id} className="glass-panel" style={{ padding: '16px', borderLeft: isSolved ? '3px solid #10b981' : '3px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                {/* Card Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#00f2fe' }}>
                        {p.platform.toUpperCase()}
                      </span>
                      <span className={p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Hard' ? 'badge-hard' : 'badge-medium'}>
                        {p.difficulty}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSolved ? '#34d399' : '#fbbf24', background: isSolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {isSolved ? '🟢 Solved' : '🟠 Tried'}
                      </span>
                    </div>
                  </div>

                  {/* Problem Title */}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.3 }}>
                    {p.title}
                  </h4>

                  {/* Notes / Blocker */}
                  {p.brief_note && (
                    <p style={{ fontSize: '0.8rem', color: isSolved ? 'var(--text-muted)' : '#fbbf24', marginTop: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                      💡 {p.brief_note}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {p.tags.map(t => (
                      <span key={t} className="tag-pill">#{t}</span>
                    ))}
                  </div>
                )}

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {p.sub_url && (
                      <a href={p.sub_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: isSolved ? '#34d399' : '#f59e0b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Verdict Proof</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {p.p_url && (
                      <a href={p.p_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#00f2fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Problem</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setEditingProblem(p)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Edit Problem"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(p.id, p.title)}
                      className="btn-secondary"
                      style={{ padding: '4px 6px', color: '#ef4444' }}
                      title="Delete Problem"
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

      {/* CREATE PROBLEM MODAL */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#00f2fe" />
                <span>Create Problem (Phase 1)</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.82rem', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProblem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Submission URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Submission Proof URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://codeforces.com/contest/1800/submission/278912301"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  style={{ width: '100%' }}
                />
                {urlValidation.msg && (
                  <p style={{ fontSize: '0.74rem', marginTop: '4px', color: urlValidation.valid ? '#34d399' : '#f87171' }}>
                    {urlValidation.msg}
                  </p>
                )}
              </div>

              {/* Platform & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Platform
                    {autoDetectedPlatform && (
                      <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#00f2fe', background: 'rgba(0,242,254,0.1)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(0,242,254,0.3)' }}>
                        ⚡ Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => { setPlatform(e.target.value); setAutoDetectedPlatform(null); }}
                    style={{ width: '100%', ...(autoDetectedPlatform ? { borderColor: 'rgba(0,242,254,0.6)', boxShadow: '0 0 6px rgba(0,242,254,0.2)' } : {}) }}
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
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="solved">🟢 Solved (Accepted)</option>
                    <option value="tried">🟠 Tried (Unsolved)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Difficulty & Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Difficulty
                  </label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%' }}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Array, Hash Table"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Brief Note (Max 280 chars)
                </label>
                <input
                  type="text"
                  maxLength={280}
                  placeholder="Hash map for O(1) complements."
                  value={briefNote}
                  onChange={(e) => setBriefNote(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Creating...' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROBLEM MODAL */}
      {editingProblem && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Edit Problem</h3>
              <button onClick={() => setEditingProblem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProblem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProblem.title}
                  onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingProblem.status}
                    onChange={(e) => setEditingProblem({ ...editingProblem, status: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="solved">🟢 Solved</option>
                    <option value="tried">🟠 Tried</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Difficulty
                  </label>
                  <select
                    value={editingProblem.difficulty}
                    onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Brief Note
                </label>
                <textarea
                  rows={2}
                  maxLength={280}
                  value={editingProblem.brief_note || ''}
                  onChange={(e) => setEditingProblem({ ...editingProblem, brief_note: e.target.value })}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setEditingProblem(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
