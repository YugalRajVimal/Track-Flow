import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// All fields are arrays for dropdowns, and user can CRUD different sets of dropdowns (single DB doc).
const PaymentDataPage = () => {
  const [docId, setDocId] = useState(null); // There should be a single PaymentData doc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    receiverName: [''],
    senderName: [''],
    department: [''],
  });
  const [savingSection, setSavingSection] = useState(null);

  // Load the one PaymentData document if it exists
  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/payment-data`);
        // The API should return an array (possibly of length 0 or 1)
        const dataArr = res.data?.data || res.data || [];
        const doc = Array.isArray(dataArr) && dataArr.length > 0 ? dataArr[0] : null;
        if (doc && doc._id) {
          setDocId(doc._id);
          setForm({
            receiverName: doc.receiverName?.length ? doc.receiverName : [''],
            senderName: doc.senderName?.length ? doc.senderName : [''],
            department: doc.department?.length ? doc.department : [''],
          });
        } else {
          setDocId(null);
          setForm({
            receiverName: [''],
            senderName: [''],
            department: [''],
          });
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to fetch payment dropdown values.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, []);

  // Single dropdown section change (for any of the 3 arrays)
  const handleDropdownChange = (sectName, idx, value) => {
    setForm((prev) => {
      const arr = [...prev[sectName]];
      arr[idx] = value;
      return {
        ...prev,
        [sectName]: arr,
      };
    });
  };

  // Add a row in a dropdown section
  const handleAddRow = (sectName) => {
    setForm((prev) => ({
      ...prev,
      [sectName]: [...prev[sectName], ''],
    }));
  };

  // Remove a row in a dropdown section
  const handleRemoveRow = (sectName, idx) => {
    setForm((prev) => {
      const arr = prev[sectName].slice();
      arr.splice(idx, 1);
      return {
        ...prev,
        [sectName]: arr.length > 0 ? arr : [''],
      };
    });
  };

  // Save (create new or update existing)
  const handleSave = async (section) => {
    setSavingSection(section);
    setError('');

    // Validate: at least one non-empty value in array
    const values = form[section].map(v => v.trim()).filter(Boolean);
    if (values.length === 0) {
      setError('At least one non-empty value is required.');
      setSavingSection(null);
      return;
    }

    try {
      if (docId) {
        // Update one field in the doc
        await axios.put(`${API_BASE_URL}/payment-data/${docId}`, {
          [section]: form[section]
        });
      } else {
        // Create new doc (with all fields)
        const body = {};
        ['receiverName', 'senderName', 'department'].forEach(k => {
          body[k] = form[k].map(v => v.trim()).filter(Boolean);
        });
        const res = await axios.post(`${API_BASE_URL}/payment-data`, body);
        setDocId(res.data?._id || res.data?.data?._id);
      }
      // Refresh the data from backend to update state
      const refreshed = await axios.get(`${API_BASE_URL}/payment-data`);
      const newDoc = Array.isArray(refreshed.data?.data) && refreshed.data.data[0];
      if (newDoc) {
        setForm({
          receiverName: newDoc.receiverName?.length ? newDoc.receiverName : [''],
          senderName: newDoc.senderName?.length ? newDoc.senderName : [''],
          department: newDoc.department?.length ? newDoc.department : [''],
        });
        setDocId(newDoc._id);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (docId ? 'Failed to update entry.' : 'Failed to create entry.')
      );
    } finally {
      setSavingSection(null);
    }
  };

  // Delete all dropdowns (i.e., delete the single PaymentData doc)
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete ALL payment dropdown data?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/payment-data/${docId}`);
      setDocId(null);
      setForm({
        receiverName: [''],
        senderName: [''],
        department: [''],
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to delete entry.'
      );
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: 'receiverName', label: 'Receiver Names' },
    { key: 'senderName', label: 'Sender Names' },
    { key: 'department', label: 'Departments' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Payment Dropdown Data</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}
          <form style={{
            display: 'flex', flexDirection: 'column',
            border: '1px solid #eee', borderRadius: 8,
            padding: 16, maxWidth: 540, marginBottom: 32, gap: 28,
          }}>
            {sections.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 5 }}>{label}</div>
                {form[key].map((value, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 5 }}>
                    <input
                      type="text"
                      value={value}
                      onChange={e => handleDropdownChange(key, idx, e.target.value)}
                      placeholder={label.slice(0,-1)}
                      disabled={savingSection === key || loading}
                      style={{ flex: 1, padding: 6, marginRight: 4, borderRadius: 4, border: '1px solid #bbb' }}
                    />
                    {form[key].length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(key, idx)}
                        style={{ background: '#c62828', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
                        disabled={savingSection === key || loading}
                        title="Remove"
                      >
                        &#x2715;
                      </button>
                    )}
                    {idx === form[key].length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddRow(key)}
                        style={{ background: '#2196f3', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, marginLeft: 3, cursor: 'pointer' }}
                        disabled={savingSection === key || loading}
                        title="Add"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={() => handleSave(key)}
                    disabled={savingSection === key || loading}
                    style={{
                      padding: '6px 18px',
                      background: '#f58021',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: (savingSection === key || loading) ? 'not-allowed' : 'pointer',
                      opacity: (savingSection === key || loading) ? 0.7 : 1,
                      marginTop: 2
                    }}
                  >
                    {savingSection === key ? 'Saving...' : docId ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            ))}
            {docId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  color: 'white',
                  background: '#c62828',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontWeight: 600,
                  marginTop: 12,
                  alignSelf: 'flex-start'
                }}
              >
                Delete ALL
              </button>
            )}
          </form>
          <div style={{ marginTop: 24 }}>
            <h3>Current Dropdown Values</h3>
            <div>
              <b>Receiver Names:</b>{' '}
              {form.receiverName && form.receiverName.filter(v => v.trim()).length
                ? form.receiverName.filter(v => v.trim()).join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
            <div>
              <b>Sender Names:</b>{' '}
              {form.senderName && form.senderName.filter(v => v.trim()).length
                ? form.senderName.filter(v => v.trim()).join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
            <div>
              <b>Departments:</b>{' '}
              {form.department && form.department.filter(v => v.trim()).length
                ? form.department.filter(v => v.trim()).join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentDataPage;