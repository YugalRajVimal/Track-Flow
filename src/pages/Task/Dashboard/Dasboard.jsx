import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';

// --- Theme and constants (to match DashboardPage) ---
const orange = "#f58021";
const borderLight = 'border-gray-200';
const bgCard = 'bg-white';
const btnBrand = `bg-[#f58021] text-white border-[#f58021] hover:bg-[#f58021]/90`;
const btnBrandOutline = `bg-white text-[#f58021] border-[#f58021] hover:bg-[#f58021]/10`;
const focusRing = "focus:ring-2 focus:ring-[#f58021]";
const FORMAT = 'YYYY-MM-DD';

// --- Date presets (like DashboardPage) ---
const PRESETS = [
  { label: 'Today',      getDates: () => ({ start: dayjs().startOf('day'),          end: dayjs().endOf('day') }) },
  { label: 'Yesterday',  getDates: () => ({ start: dayjs().subtract(1,'day').startOf('day'), end: dayjs().subtract(1,'day').endOf('day') }) },
  { label: 'Last 7 days',getDates: () => ({ start: dayjs().subtract(6,'day').startOf('day'), end: dayjs().endOf('day') }) },
  { label: 'Last 30 days',getDates:() => ({ start: dayjs().subtract(29,'day').startOf('day'),end: dayjs().endOf('day') }) },
  { label: 'This month', getDates: () => ({ start: dayjs().startOf('month'),        end: dayjs().endOf('day') }) },
  { label: 'Custom',     getDates: null },
];

// --- FilterBar (styled like DashboardPage) ---
function DateAndFilterBar({
  startDate,
  endDate,
  onApply,
  loading,
  partyOptions = [],
  fabricOptions = [],
  partyName = "",
  setPartyName = () => {},
  fabricType = "",
  setFabricType = () => {},
}) {
  const [activePreset, setActivePreset] = useState('Today');
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setCustomStart(startDate);
    setCustomEnd(endDate);
  }, [startDate, endDate]);

  // On preset select
  const handlePreset = preset => {
    setActivePreset(preset.label);
    if (preset.label === 'Custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const { start, end } = preset.getDates();
    onApply(start.format(FORMAT), end.format(FORMAT), partyName, fabricType);
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    if (dayjs(customStart).isAfter(dayjs(customEnd))) return;
    onApply(customStart, customEnd, partyName, fabricType)
  };

  const handlePartyChange = (e) => {
    setPartyName(e.target.value);
  };
  const handleFabricChange = (e) => {
    setFabricType(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2  mb-6">
      {/* Date presets */}
      <div className='flex flex-wrap gap-2 '>
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            className={`px-3 py-1.5 rounded border text-sm transition
                        ${preset.label === activePreset ? btnBrand : btnBrandOutline}
                        ${focusRing}
                        disabled:opacity-50`}
            onClick={() => handlePreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {/* If custom range, show pickers */}
      {showCustom && (
        <>
          <div>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              max={customEnd || undefined}
            />
          </div>
          <div>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              min={customStart || undefined}
            />
          </div>
          <button
            className={`ml-2 px-3 py-1.5 rounded border ${btnBrand} ${focusRing}`}
            onClick={handleCustomApply}
            disabled={loading}
            type="button"
          >
            Apply
          </button>
        </>
      )}

      </div>
   
   <div className='flex flex-wrap gap-2 '>
 {/* Party Name */}
 <div>
        <select
          className="border rounded px-2 py-1 min-w-[120px] text-sm"
          value={partyName}
          onChange={handlePartyChange}
          disabled={loading}
        >
          <option value="">All Parties</option>
          {partyOptions.map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </div>
      {/* Fabric Type */}
      <div>
        <select
          className="border rounded px-2 py-1 min-w-[120px] text-sm"
          value={fabricType}
          onChange={handleFabricChange}
          disabled={loading}
        >
          <option value="">All Fabric Types</option>
          {fabricOptions.map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </div>
   </div>
     
    </div>
  );
}

// --- Fetch dropdown filter options (API) ---
async function fetchTaskFilterDropdowns() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}/tasks/dropdowns`;
  const res = await axios.get(url);
  const { data } = res;
  if (data.success && data.data) {
    return data.data;
  } else {
    throw new Error(data.message || 'Failed to load filter dropdowns');
  }
}

// --- Dashboard Main ---
const HandlerDashboard = () => {
  // Filter state (UI and request)
  const [startDate, setStartDate] = useState(dayjs().startOf('day').format(FORMAT));
  const [endDate, setEndDate] = useState(dayjs().endOf('day').format(FORMAT));
  const [partyOptions, setPartyOptions] = useState([]);
  const [fabricOptions, setFabricOptions] = useState([]);
  const [partyName, setPartyName] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // Fetch dropdown options on mount
  useEffect(() => {
    fetchTaskFilterDropdowns().then((fields) => {
      setPartyOptions(Array.isArray(fields.partyName) ? fields.partyName : []);
      setFabricOptions(Array.isArray(fields.fabricType) ? fields.fabricType : []);
    }).catch(() => {/* not critical */});
  }, []);

  // For emulating dashboardAPI
  const fetchStats = useCallback(async (_start, _end, _party, _fabric) => {
    setLoading(true);
    setError('');
    setStats(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const params = new URLSearchParams();
    params.set('from', _start);
    params.set('to', _end);
    if (_party) params.set('partyName', _party);
    if (_fabric) params.set('fabricType', _fabric);

    const url = `${baseUrl}/tasks/dashboard/fabric-stats?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      } else {
        setError(json.message || 'Failed to load stats');
      }
    } catch (e) {
      setError(e.message || 'Failed to load stats');
    }
    setLoading(false);
  }, []);

  // Initial/whenever filters update
  useEffect(() => {
    fetchStats(startDate, endDate, partyName, fabricType);
  }, [startDate, endDate, partyName, fabricType, fetchStats]);

  // Handler for filter bar
  const handleApply = (from, to, party, fabric) => {
    setStartDate(from);
    setEndDate(to);
    setPartyName(party || '');
    setFabricType(fabric || '');
  };

  // --- STAT CARDS list (match style and layout) ---
  const statCards = [
    {
      label: "Total Fabric In",
      field: "totalFabricIn",
      tooltip: "Sum of all subtask fabric meters received in all tasks."
    },
    {
      label: "Total In Processing",
      field: "totalFabricInProcessing",
      tooltip: "Meters currently in processing (no submissions or marked as processing/pending)."
    },
    {
      label: "Total Fabric Submitted",
      field: "totalFabricSubmitted",
      tooltip: "Total meters submitted in all subtasks (sum of all submissions' MTR)."
    },
    {
      label: "Total Fabric Missing",
      field: "totalFabricMissing",
      tooltip: "Meters missing (after sinkage/length loss if any submission is marked as missing for that subtask)."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Task Fabric Dashboard</h1>
      </div>

      {/* Filter Bar (reuse style) */}
      <DateAndFilterBar
        startDate={startDate}
        endDate={endDate}
        onApply={handleApply}
        loading={loading}
        partyOptions={partyOptions}
        fabricOptions={fabricOptions}
        partyName={partyName}
        setPartyName={setPartyName}
        fabricType={fabricType}
        setFabricType={setFabricType}
      />

      {/* Stat Cards, loading & error */}
      {loading && <div className="text-gray-400 mt-10 text-center">Loading dashboard...</div>}
      {error && !loading && <div className="text-red-500 mt-10 text-center">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {statCards.map(stat => (
          <div
            key={stat.label}
            className={`relative bg-white shadow rounded-lg p-6 flex flex-col items-center border
              ${stat.field==='totalFabricMissing' && stats && stats[stat.field] > 0 ? 'border-red-400' : borderLight}`}
            title={stat.tooltip}
            style={{ borderWidth: 2 }}
          >
            <span className="font-medium text-gray-600 mb-1">{stat.label}</span>
            <span className={
              "text-2xl font-bold " +
              (stat.field==='totalFabricMissing' && stats && stats[stat.field] > 0
                ? 'text-red-600 animate-pulse'
                : 'text-blue-600')
            }>
              {stats && typeof stats[stat.field] === 'number'
                ? Number(stats[stat.field]).toLocaleString(undefined, { maximumFractionDigits: 2 })
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HandlerDashboard;