

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyDepartment = () => ({
  name: '',
  senderNames: [],
  receiverNames: [],
});

// ─── Tag chip input ────────────────────────────────────────────────────────────
function TagInput({ values = [], onChange, placeholder, disabled }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (val) => {
    const trimmed = val.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setInput('');
  };

  const removeTag = (idx) => {
    const next = [...values];
    next.splice(idx, 1);
    onChange(next);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && values.length) {
      removeTag(values.length - 1);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '6px 10px',
        minHeight: 42,
        cursor: 'text',
        background: disabled ? '#f9fafb' : '#fff',
      }}
    >
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: '#f0f4ff',
            color: '#2d4fb8',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            padding: '2px 8px',
            border: '1px solid #c7d4f5',
          }}
        >
          {v}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#2d4fb8',
                lineHeight: 1,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(input)}
          placeholder={values.length === 0 ? placeholder : 'Add more…'}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: 13,
            flex: 1,
            minWidth: 100,
            background: 'transparent',
            color: '#111',
          }}
        />
      )}
    </div>
  );
}

// ─── Sidebar department item ────────────────────────────────────────────────────
function DeptItem({ dept, isActive, onClick, onRemove }) {
  const total = (dept.senderNames?.length || 0) + (dept.receiverNames?.length || 0);
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isActive ? '#f0f4ff' : 'transparent',
        border: isActive ? '1px solid #c7d4f5' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: isActive ? '#1e3a8a' : '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {dept.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Untitled</span>}
        </div>
        {/* <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {total} {total === 1 ? 'member' : 'members'}
        </div> */}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const PaymentDataPage = () => {
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [departments, setDepartments] = useState([emptyDepartment()]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Fetch
  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/payment-data`);
        const dataArr = res.data?.data || res.data || [];
        const doc = Array.isArray(dataArr) && dataArr.length > 0 ? dataArr[0] : null;
        if (doc?._id) {
          setDocId(doc._id);
          setDepartments(
            Array.isArray(doc.departments) && doc.departments.length > 0
              ? doc.departments.map((d) => ({
                  name: d.name || '',
                  senderNames: Array.isArray(d.senderNames) ? d.senderNames : [],
                  receiverNames: Array.isArray(d.receiverNames) ? d.receiverNames : [],
                }))
              : [emptyDepartment()]
          );
        } else {
          setDocId(null);
          setDepartments([emptyDepartment()]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, []);

  // Refresh helper
  const refreshFromServer = async () => {
    const refreshed = await axios.get(`${API_BASE_URL}/payment-data`);
    const arr = refreshed.data?.data || refreshed.data || [];
    const doc = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    if (doc) {
      setDocId(doc._id);
      setDepartments(
        Array.isArray(doc.departments) && doc.departments.length > 0
          ? doc.departments.map((d) => ({
              name: d.name || '',
              senderNames: Array.isArray(d.senderNames) ? d.senderNames : [],
              receiverNames: Array.isArray(d.receiverNames) ? d.receiverNames : [],
            }))
          : [emptyDepartment()]
      );
    }
  };

  // Department field change
  const handleFieldChange = (field, value) => {
    setDepartments((prev) => {
      const arr = [...prev];
      arr[selectedIdx] = { ...arr[selectedIdx], [field]: value };
      return arr;
    });
  };

  // Add department
  const handleAddDepartment = () => {
    setDepartments((prev) => [...prev, emptyDepartment()]);
    setSelectedIdx(departments.length);
  };

  // Remove department
  const handleRemoveDepartment = (idx) => {
    setDepartments((prev) => {
      const arr = [...prev];
      arr.splice(idx, 1);
      const next = arr.length > 0 ? arr : [emptyDepartment()];
      return next;
    });
    setSelectedIdx((prev) => Math.min(prev, Math.max(0, departments.length - 2)));
  };

  // Save
  const handleSave = async () => {
    setError('');
    const dept = departments[selectedIdx];
    if (!dept.name.trim()) {
      setError('Department name is required.');
      return;
    }
    if (!dept.senderNames.length && !dept.receiverNames.length) {
      setError('Add at least one sender or receiver.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        departments: departments.map((d) => ({
          name: d.name.trim(),
          senderNames: d.senderNames.map((v) => v.trim()).filter(Boolean),
          receiverNames: d.receiverNames.map((v) => v.trim()).filter(Boolean),
        })),
      };

      if (docId) {
        await axios.put(`${API_BASE_URL}/payment-data/${docId}`, payload);
      } else {
        const res = await axios.post(`${API_BASE_URL}/payment-data`, payload);
        setDocId(res.data?._id || res.data?.data?._id);
      }

      await refreshFromServer();
      flash('Changes saved.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  // Delete all
  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL payment dropdown data? This cannot be undone.')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/payment-data/${docId}`);
      setDocId(null);
      setDepartments([emptyDepartment()]);
      setSelectedIdx(0);
      flash('All data deleted.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete.');
    } finally {
      setLoading(false);
    }
  };

  const selected = departments[selectedIdx];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6b7280', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#111827' }}>Payment dropdowns</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Manage departments and their sender / receiver names used in payment forms.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {docId && (
            <button
              type="button"
              onClick={handleDeleteAll}
              style={{
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 7,
                border: '1px solid #fca5a5',
                background: '#fff',
                color: '#dc2626',
                cursor: 'pointer',
              }}
            >
              Delete all
            </button>
          )}
          <button
            type="button"
            onClick={handleAddDepartment}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 7,
              border: 'none',
              background: '#1d4ed8',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + Add department
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {error}
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}
      {successMsg && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontSize: 13,
        }}>
          {successMsg}
        </div>
      )}

      {/* Split panel */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{
          width: 220,
          flexShrink: 0,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
            Departments ({departments.length})
          </div>
          {departments.map((dept, i) => (
            <DeptItem
              key={i}
              dept={dept}
              isActive={i === selectedIdx}
              onClick={() => setSelectedIdx(i)}
              onRemove={() => handleRemoveDepartment(i)}
            />
          ))}
        </div>

        {/* Edit panel */}
        <div style={{
          flex: 1,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24,
        }}>
          {selected ? (
            <>
              {/* Department name */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Department name
                </label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="e.g. Operations"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 24px' }} />

              {/* Senders */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Sender names
                </label>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af' }}>
                  Type a name and press Enter or comma to add.
                </p>
                <TagInput
                  values={selected.senderNames}
                  onChange={(val) => handleFieldChange('senderNames', val)}
                  placeholder="Type sender name and press Enter…"
                />
                {selected.senderNames.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                    {selected.senderNames.length} {selected.senderNames.length === 1 ? 'sender' : 'senders'}
                  </div>
                )}
              </div>

              {/* Receivers */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Receiver names
                </label>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af' }}>
                  Type a name and press Enter or comma to add.
                </p>
                <TagInput
                  values={selected.receiverNames}
                  onChange={(val) => handleFieldChange('receiverNames', val)}
                  placeholder="Type receiver name and press Enter…"
                />
                {selected.receiverNames.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                    {selected.receiverNames.length} {selected.receiverNames.length === 1 ? 'receiver' : 'receivers'}
                  </div>
                )}
              </div>

              {/* Save */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '8px 22px',
                    background: saving ? '#93c5fd' : '#f58021',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving…' : docId ? 'Save changes' : 'Create'}
                </button>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  Saves all departments at once.
                </span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px 0', fontSize: 14 }}>
              Select a department to edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDataPage;