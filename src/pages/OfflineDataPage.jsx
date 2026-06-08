import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OfflineDataPage = () => {
  const [dropdowns, setDropdowns] = useState({
    styleTypes: [],
    salesMen: [],
    partyNames: [],
  });
  const [docId, setDocId] = useState(null); // To track the single OfflineDropdown doc (if any)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    styleTypes: [''],
    salesMen: [''],
    partyNames: [''],
  });
  const [savingSection, setSavingSection] = useState(null); // To show spinner per section

  // Fetch current dropdown doc
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`);
        setDropdowns(res.data);

        // Try to fetch the latest doc for updates/deletes
        const docListRes = await axios.get(`${API_BASE_URL}/offline-data/dropdowns?full=true`).catch(() => null);
        if (docListRes && Array.isArray(docListRes.data) && docListRes.data.length > 0) {
          setDocId(docListRes.data[0]._id);
        } else {
          // fallback: try to get the id by guessing
          if (res.data?._id) setDocId(res.data._id);
        }

        // Populate form with existing data, if any
        setForm({
          styleTypes: (res.data.styleTypes.length ? res.data.styleTypes : ['']),
          salesMen: (res.data.salesMen.length ? res.data.salesMen : ['']),
          partyNames: (res.data.partyNames.length ? res.data.partyNames : ['']),
        });
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'Failed to fetch offline dropdown values.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
    // eslint-disable-next-line
  }, []);

  // Handlers for form
  const handleFormChange = (section, idx, value) => {
    setForm((form) => {
      const arr = [...form[section]];
      arr[idx] = value;
      return { ...form, [section]: arr };
    });
  };

  const handleAddField = (section) => {
    setForm((form) => ({
      ...form,
      [section]: [...form[section], ''],
    }));
  };

  const handleRemoveField = (section, idx) => {
    setForm((form) => {
      const arr = [...form[section]];
      arr.splice(idx, 1);
      if (arr.length === 0) arr.push('');
      return { ...form, [section]: arr };
    });
  };

  // Save only one section at a time
  const handleSectionSave = async (section) => {
    setSavingSection(section);
    setError('');

    // Transform form entries to array of { name }
    const formatOne = arr =>
      arr && Array.isArray(arr)
        ? arr.filter(Boolean).map((str) => ({ name: str.trim() })).filter((o) => o.name)
        : [];

    // Prepare payload with only this section
    const payload = {};
    payload[section] = formatOne(form[section]);
    // Keep other sections intact from existing dropdowns
    if (section !== 'styleTypes')
      payload['styleTypes'] = (dropdowns.styleTypes ?? []).map((name) => ({ name }));
    if (section !== 'salesMen')
      payload['salesMen'] = (dropdowns.salesMen ?? []).map((name) => ({ name }));
    if (section !== 'partyNames')
      payload['partyNames'] = (dropdowns.partyNames ?? []).map((name) => ({ name }));

    try {
      let res;
      if (docId) {
        // Update existing doc
        res = await axios.put(`${API_BASE_URL}/offline-data/dropdowns/${docId}`, payload);
      } else {
        // Create new doc (all sections needed, so fill in all)
        const allPayload = {
          styleTypes: payload.styleTypes ?? [],
          salesMen: payload.salesMen ?? [],
          partyNames: payload.partyNames ?? [],
        };
        res = await axios.post(`${API_BASE_URL}/offline-data/dropdowns`, allPayload);
      }
      // Refresh local dropdowns with latest
      setDropdowns({
        styleTypes: res.data.styleTypes?.map(item => item.name) ?? [],
        salesMen: res.data.salesMen?.map(item => item.name) ?? [],
        partyNames: res.data.partyNames?.map(item => item.name) ?? [],
      });
      setDocId(res.data._id);
      setForm(f => ({
        ...f,
        // Only update form for this section (preserves editing of others)
        [section]: (res.data[section] && Array.isArray(res.data[section]) && res.data[section].length
          ? res.data[section].map(item => (item.name ? item.name : item))
          : [''])
      }));
      setError('');
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          `Failed to save ${section}.`
      );
    } finally {
      setSavingSection(null);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!docId) return;
    if (!window.confirm('Are you sure you want to delete all dropdown values?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/offline-data/dropdowns/${docId}`);
      setDropdowns({ styleTypes: [], salesMen: [], partyNames: [] });
      setForm({ styleTypes: [''], salesMen: [''], partyNames: [''] });
      setDocId(null);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to delete dropdown values.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Section labels
  const sectionLabels = {
    styleTypes: 'Style Types',
    salesMen: 'Sales Men',
    partyNames: 'Party Names',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>
      <h2>Offline Dropdown Values (CRUD)</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}

          <form onSubmit={e => e.preventDefault()}>
            {['styleTypes', 'salesMen', 'partyNames'].map(section => (
              <div
                key={section}
                style={{
                  marginBottom: 24,
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {sectionLabels[section]}
                </h4>
                {form[section].map((val, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <input
                      type="text"
                      value={val}
                      onChange={e => handleFormChange(section, idx, e.target.value)}
                      style={{ marginRight: 8, flex: 1 }}
                      placeholder={`Enter ${sectionLabels[section].toLowerCase().slice(0, -1)}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(section, idx)}
                      disabled={form[section].length === 1}
                      style={{ marginRight: 4 }}
                    >
                      -
                    </button>
                    {idx === form[section].length - 1 && (
                      <button type="button" onClick={() => handleAddField(section)}>
                        +
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    disabled={savingSection === section || loading}
                    onClick={() => handleSectionSave(section)}
                    style={{
                      marginRight: 8,
                      padding: '6px 16px',
                      background: '#f58021',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: (savingSection === section || loading) ? 'not-allowed' : 'pointer',
                      opacity: (savingSection === section || loading) ? 0.7 : 1,
                    }}
                  >
                    {savingSection === section ? 'Saving...' : (docId ? 'Update' : 'Create')}
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
                  borderRadius: 4
                }}
              >
                Delete ALL
              </button>
            )}
          </form>
          <div style={{ marginTop: 32 }}>
            <h3>Current Values</h3>
            <div>
              <b>Style Types:</b>{' '}
              {dropdowns.styleTypes.length
                ? dropdowns.styleTypes.join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
            <div>
              <b>Sales Men:</b>{' '}
              {dropdowns.salesMen.length
                ? dropdowns.salesMen.join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
            <div>
              <b>Party Names:</b>{' '}
              {dropdowns.partyNames.length
                ? dropdowns.partyNames.join(', ')
                : <span style={{ color: '#888' }}>None</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfflineDataPage;