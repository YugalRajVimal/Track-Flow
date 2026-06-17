import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialDropdownKeys = [
  'partyName',
  'transportName',
  'fabricType',
  'length',
  'sinkage',
  'recieverName',
  'programName',
  'FabricPartyName',
  'recieverPartyName',
  'jigars', // <-- added jigars
];

const initialDropdowns = initialDropdownKeys.reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

const initialForm = initialDropdownKeys.reduce((acc, key) => {
  acc[key] = [''];
  return acc;
}, {});

const TaskDataPage = () => {
  const [dropdowns, setDropdowns] = useState(initialDropdowns);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [savingSection, setSavingSection] = useState(null);

  // Fetch current dropdown doc
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/task-data/dropdowns`);

        setDropdowns(
          initialDropdownKeys.reduce((acc, key) => {
            acc[key] =
              res.data[key]?.map((item) =>
                typeof item === 'object' && item.name != null ? item.name : item
              ) || [];
            return acc;
          }, {})
        );

        // Try to fetch the latest doc for updates/deletes
        const docListRes = await axios
          .get(`${API_BASE_URL}/task-data/dropdowns?full=true`)
          .catch(() => null);
        if (
          docListRes &&
          Array.isArray(docListRes.data) &&
          docListRes.data.length > 0
        ) {
          setDocId(docListRes.data[0]._id);
        } else {
          // fallback: try to get the id by guessing
          if (res.data?._id) setDocId(res.data._id);
        }

        // Populate form with existing data, if any
        setForm(
          initialDropdownKeys.reduce((acc, key) => {
            const values = res.data[key];
            acc[key] =
              values && values.length
                ? values.map((item) =>
                    typeof item === 'object' && item.name != null
                      ? item.name
                      : item
                  )
                : [''];
            return acc;
          }, {})
        );
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'Failed to fetch task data dropdown values.'
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

  // Collects ALL current form data for every key as array of { name: value } (filtering empties)
  const getFullPayloadFromForm = () => {
    const data = {};
    for (const key of initialDropdownKeys) {
      data[key] =
        form[key]
          .filter(
            (val) =>
              (typeof val === 'string' && val.trim() !== '') ||
              (typeof val === 'number' && val !== '' && val !== null)
          )
          .map((val) =>
            typeof val === 'object' && val?.name != null
              ? { name: val.name }
              : { name: String(val).trim() }
          ) || [];
    }
    return data;
  };

  // Save all values from all sections (all fields passed always)
  const handleSectionSave = async (section) => {
    setSavingSection(section);
    setError('');

    // Always send FULL data from all fields, not just the edited one, on create and update
    const fullPayload = getFullPayloadFromForm();

    try {
      let res;
      if (docId) {
        // Update existing doc (send all)
        res = await axios.put(
          `${API_BASE_URL}/task-data/dropdowns/${docId}`,
          fullPayload
        );
      } else {
        // Create new doc (send all)
        res = await axios.post(
          `${API_BASE_URL}/task-data/dropdowns`,
          fullPayload
        );
      }
      // Refresh local dropdowns with latest
      setDropdowns(
        initialDropdownKeys.reduce((acc, key) => {
          acc[key] = res.data[key]?.map((item) => item?.name ?? item) ?? [];
          return acc;
        }, {})
      );
      setDocId(res.data._id);

      // Update the form with all sections from server response
      setForm(
        initialDropdownKeys.reduce((acc, key) => {
          const values = res.data[key];
          acc[key] =
            values && Array.isArray(values) && values.length
              ? values.map((item) =>
                  typeof item === 'object' && item.name != null
                    ? item.name
                    : item
                )
              : [''];
          return acc;
        }, {})
      );
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
    if (
      !window.confirm(
        'Are you sure you want to delete all dropdown values?'
      )
    )
      return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/task-data/dropdowns/${docId}`);
      setDropdowns(initialDropdowns);
      setForm(initialForm);
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
    partyName: 'Party Name',
    transportName: 'Transport Name',
    fabricType: 'Fabric Type',
    length: 'Length',
    sinkage: 'Sinkage',
    recieverName: 'Receiver Name',
    programName: 'Program Name',
    FabricPartyName: 'Fabric Party Name',
    recieverPartyName: 'Receiver Party Name',
    jigars: 'Jigars', // <-- added label for jigars
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>
      <h2>Task Data Dropdown Values (CRUD)</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          )}

          <form onSubmit={e => e.preventDefault()}>
            {initialDropdownKeys.map((section) => (
              <div
                key={section}
                style={{
                  marginBottom: 24,
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {sectionLabels[section]}
                </h4>
                {form[section].map((val, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <input
                      type={
                        section === 'length' || section === 'sinkage'
                          ? 'number'
                          : 'text'
                      }
                      value={val}
                      onChange={(e) =>
                        handleFormChange(section, idx, e.target.value)
                      }
                      style={{ marginRight: 8, flex: 1 }}
                      placeholder={`Enter ${sectionLabels[
                        section
                      ].toLowerCase()}`}
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
                      <button
                        type="button"
                        onClick={() => handleAddField(section)}
                      >
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
                      cursor:
                        savingSection === section || loading
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        savingSection === section || loading ? 0.7 : 1,
                    }}
                  >
                    {savingSection === section
                      ? 'Saving...'
                      : docId
                      ? 'Update'
                      : 'Create'}
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
                }}
              >
                Delete ALL
              </button>
            )}
          </form>
          <div style={{ marginTop: 32 }}>
            <h3>Current Values</h3>
            {initialDropdownKeys.map((section) => (
              <div key={section}>
                <b>{sectionLabels[section]}:</b>{' '}
                {dropdowns[section] && dropdowns[section].length ? (
                  dropdowns[section].join(', ')
                ) : (
                  <span style={{ color: '#888' }}>None</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDataPage;