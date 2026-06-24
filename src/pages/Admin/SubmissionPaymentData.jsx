import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const sectionLabels = {
  programName: "Program Name",
  partyName: "Party Name",
  fabricType: "Fabric Type",
  rate: "Rate",
};

const initialKeys = ["programName", "partyName", "fabricType", "rate"];

const initialForm = initialKeys.reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {});

const SubmissionPaymentData = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Dropdown options
  const [dropdowns, setDropdowns] = useState({
    partyName: [],
    fabricType: [],
    programName: [],
  });
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  // Fetch all rates from backend
  useEffect(() => {
    fetchDropdowns();
    fetchRates();
    // eslint-disable-next-line
  }, []);

  const fetchDropdowns = async () => {
    setDropdownsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tasks/dropdowns`);
      const d = res.data.data || {};
      setDropdowns({
        partyName: d.partyName || [],
        fabricType: d.fabricType || [],
        programName: d.programName || [],
      });
    } catch (err) {
      setError(
        "Failed to load dropdowns: " +
          (err?.response?.data?.message || err.message)
      );
      setDropdowns({
        partyName: [],
        fabricType: [],
        programName: [],
      });
    }
    setDropdownsLoading(false);
  };

  const fetchRates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE}/submission-payment-data/all`
      );
      setRates(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError("Failed to fetch rates.");
    }
    setLoading(false);
  };

  const handleInputChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate fields
    for (const key of ["programName", "partyName", "fabricType"]) {
      if (!form[key] || String(form[key]).trim() === "") {
        setError("All fields are required.");
        return;
      }
    }
    if (form.rate === "" || isNaN(Number(form.rate))) {
      setError("Rate must be a number.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/submission-payment-data/rate`, {
        programName: form.programName.trim(),
        partyName: form.partyName.trim(),
        fabricType: form.fabricType.trim(),
        rate: Number(form.rate),
      });
      setMessage("Rate saved successfully.");
      setForm({ ...initialForm });
      fetchRates();
    } catch (err) {
      setError("Failed to upsert rate.");
    }
    setSaving(false);
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete rate for Program: ${row.programName}, Party: ${row.partyName}, Fabric: ${row.fabricType}?`
      )
    )
      return;
    setError("");
    setMessage("");
    try {
      await axios.delete(`${API_BASE}/submission-payment-data/rate`, {
        data: {
          programName: row.programName,
          partyName: row.partyName,
          fabricType: row.fabricType,
        },
      });
      setMessage("Rate deleted.");
      fetchRates();
    } catch (err) {
      setError("Failed to delete rate.");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 0 }}>Submission Payment Data Rates</h2>
      {loading || dropdownsLoading ? (
        <p style={{ color: "#888" }}>Loading...</p>
      ) : (
        <>
          {(error || message) && (
            <div
              style={{
                marginBottom: 18,
                color: message ? "green" : "red",
                fontWeight: 500,
              }}
            >
              {error || message}
            </div>
          )}
          <form
            onSubmit={handleFormSubmit}
            style={{
              background: "#fafafa",
              border: "1px solid #ececec",
              borderRadius: 8,
              marginBottom: 32,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "1.07rem" }}>
              Upsert Rate
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  {sectionLabels.programName}
                </label>
                <select
                  name="programName"
                  value={form.programName}
                  onChange={(e) =>
                    handleInputChange("programName", e.target.value)
                  }
                  required
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                >
                  <option value="">Select program name</option>
                  {dropdowns.programName.map((opt, idx) => (
                    <option value={opt} key={opt || idx}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  {sectionLabels.partyName}
                </label>
                <select
                  name="partyName"
                  value={form.partyName}
                  onChange={(e) =>
                    handleInputChange("partyName", e.target.value)
                  }
                  required
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                >
                  <option value="">Select party name</option>
                  {dropdowns.partyName.map((opt, idx) => (
                    <option value={opt} key={opt || idx}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  {sectionLabels.fabricType}
                </label>
                <select
                  name="fabricType"
                  value={form.fabricType}
                  onChange={(e) =>
                    handleInputChange("fabricType", e.target.value)
                  }
                  required
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                >
                  <option value="">Select fabric type</option>
                  {dropdowns.fabricType.map((opt, idx) => (
                    <option value={opt} key={opt || idx}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  {sectionLabels.rate}
                </label>
                <input
                  type="number"
                  name="rate"
                  value={form.rate}
                  onChange={(e) => handleInputChange("rate", e.target.value)}
                  placeholder="Enter rate"
                  required
                  min={0}
                  style={{
                    padding: "7px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#f58021",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 24px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  transition: "opacity 0.2s",
                  marginTop: 6,
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
          <div
            style={{
              border: "1px solid #ececec",
              borderRadius: 8,
              padding: 0,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: 500,
                borderCollapse: "collapse",
                fontSize: 15,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f7f7f7",
                    color: "#444",
                    fontWeight: 600,
                    textAlign: "left",
                    borderBottom: "1px solid #ececec",
                  }}
                >
                  <th style={{ padding: "11px 12px" }}>Program Name</th>
                  <th style={{ padding: "11px 12px" }}>Party Name</th>
                  <th style={{ padding: "11px 12px" }}>Fabric Type</th>
                  <th style={{ padding: "11px 12px" }}>Rate</th>
                  <th style={{ padding: "11px 12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        color: "#999",
                        padding: "18px",
                      }}
                    >
                      No rates found.
                    </td>
                  </tr>
                ) : (
                  rates.map((item, idx) => (
                    <tr
                      key={`${item.programName}-${item.partyName}-${item.fabricType}-${idx}`}
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                        borderBottom: "1px solid #f1f1f3",
                      }}
                    >
                      <td style={{ padding: "9px 12px" }}>
                        {item.programName}
                      </td>
                      <td style={{ padding: "9px 12px" }}>{item.partyName}</td>
                      <td style={{ padding: "9px 12px" }}>{item.fabricType}</td>
                      <td style={{ padding: "9px 12px" }}>{item.rate}</td>
                      <td style={{ padding: "7px 12px" }}>
                        <button
                          style={{
                            color: "#c62828",
                            background: "none",
                            border: "1px solid #ffcdd2",
                            borderRadius: 4,
                            padding: "4px 12px",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "background 0.15s",
                          }}
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SubmissionPaymentData;