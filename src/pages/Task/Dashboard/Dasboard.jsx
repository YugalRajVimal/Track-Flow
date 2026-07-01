// import React, { useEffect, useState, useCallback } from 'react';
// import dayjs from 'dayjs';
// import axios from 'axios';

// // --- Theme and constants (to match DashboardPage) ---
// const orange = "#f58021";
// const borderLight = 'border-gray-200';
// const bgCard = 'bg-white';
// const btnBrand = `bg-[#f58021] text-white border-[#f58021] hover:bg-[#f58021]/90`;
// const btnBrandOutline = `bg-white text-[#f58021] border-[#f58021] hover:bg-[#f58021]/10`;
// const focusRing = "focus:ring-2 focus:ring-[#f58021]";
// const FORMAT = 'YYYY-MM-DD';

// // --- Date presets (like DashboardPage) ---
// const PRESETS = [
//   { label: 'Today',      getDates: () => ({ start: dayjs().startOf('day'),          end: dayjs().endOf('day') }) },
//   { label: 'Yesterday',  getDates: () => ({ start: dayjs().subtract(1,'day').startOf('day'), end: dayjs().subtract(1,'day').endOf('day') }) },
//   { label: 'Last 7 days',getDates: () => ({ start: dayjs().subtract(6,'day').startOf('day'), end: dayjs().endOf('day') }) },
//   { label: 'Last 30 days',getDates:() => ({ start: dayjs().subtract(29,'day').startOf('day'),end: dayjs().endOf('day') }) },
//   { label: 'This month', getDates: () => ({ start: dayjs().startOf('month'),        end: dayjs().endOf('day') }) },
//   { label: 'Custom',     getDates: null },
// ];

// // --- FilterBar (styled like DashboardPage) ---
// function DateAndFilterBar({
//   startDate,
//   endDate,
//   onApply,
//   loading,
//   partyOptions = [],
//   fabricOptions = [],
//   partyName = "",
//   setPartyName = () => {},
//   fabricType = "",
//   setFabricType = () => {},
// }) {
//   const [activePreset, setActivePreset] = useState('Today');
//   const [customStart, setCustomStart] = useState(startDate);
//   const [customEnd, setCustomEnd] = useState(endDate);
//   const [showCustom, setShowCustom] = useState(false);

//   useEffect(() => {
//     setCustomStart(startDate);
//     setCustomEnd(endDate);
//   }, [startDate, endDate]);

//   // On preset select
//   const handlePreset = preset => {
//     setActivePreset(preset.label);
//     if (preset.label === 'Custom') {
//       setShowCustom(true);
//       return;
//     }
//     setShowCustom(false);
//     const { start, end } = preset.getDates();
//     onApply(start.format(FORMAT), end.format(FORMAT), partyName, fabricType);
//   };

//   const handleCustomApply = () => {
//     if (!customStart || !customEnd) return;
//     if (dayjs(customStart).isAfter(dayjs(customEnd))) return;
//     onApply(customStart, customEnd, partyName, fabricType)
//   };

//   const handlePartyChange = (e) => {
//     setPartyName(e.target.value);
//   };
//   const handleFabricChange = (e) => {
//     setFabricType(e.target.value);
//   };

//   return (
//     <div className="flex flex-col gap-2  mb-6">
//       {/* Date presets */}
//       <div className='flex flex-wrap gap-2 '>
//       <div className="flex gap-2">
//         {PRESETS.map((preset) => (
//           <button
//             key={preset.label}
//             type="button"
//             disabled={loading}
//             className={`px-3 py-1.5 rounded border text-sm transition
//                         ${preset.label === activePreset ? btnBrand : btnBrandOutline}
//                         ${focusRing}
//                         disabled:opacity-50`}
//             onClick={() => handlePreset(preset)}
//           >
//             {preset.label}
//           </button>
//         ))}
//       </div>
//       {/* If custom range, show pickers */}
//       {showCustom && (
//         <>
//           <div>
//             <input
//               type="date"
//               className="border rounded px-2 py-1 text-sm"
//               value={customStart}
//               onChange={e => setCustomStart(e.target.value)}
//               max={customEnd || undefined}
//             />
//           </div>
//           <div>
//             <input
//               type="date"
//               className="border rounded px-2 py-1 text-sm"
//               value={customEnd}
//               onChange={e => setCustomEnd(e.target.value)}
//               min={customStart || undefined}
//             />
//           </div>
//           <button
//             className={`ml-2 px-3 py-1.5 rounded border ${btnBrand} ${focusRing}`}
//             onClick={handleCustomApply}
//             disabled={loading}
//             type="button"
//           >
//             Apply
//           </button>
//         </>
//       )}

//       </div>
   
//    <div className='flex flex-wrap gap-2 '>
//  {/* Party Name */}
//  <div>
//         <select
//           className="border rounded px-2 py-1 min-w-[120px] text-sm"
//           value={partyName}
//           onChange={handlePartyChange}
//           disabled={loading}
//         >
//           <option value="">All Parties</option>
//           {partyOptions.map(val => (
//             <option key={val} value={val}>{val}</option>
//           ))}
//         </select>
//       </div>
//       {/* Fabric Type */}
//       <div>
//         <select
//           className="border rounded px-2 py-1 min-w-[120px] text-sm"
//           value={fabricType}
//           onChange={handleFabricChange}
//           disabled={loading}
//         >
//           <option value="">All Fabric Types</option>
//           {fabricOptions.map(val => (
//             <option key={val} value={val}>{val}</option>
//           ))}
//         </select>
//       </div>
//    </div>
     
//     </div>
//   );
// }

// // --- Fetch dropdown filter options (API) ---
// async function fetchTaskFilterDropdowns() {
//   const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
//   const url = `${baseUrl}/tasks/dropdowns`;
//   const res = await axios.get(url);
//   const { data } = res;
//   if (data.success && data.data) {
//     return data.data;
//   } else {
//     throw new Error(data.message || 'Failed to load filter dropdowns');
//   }
// }

// // --- Dashboard Main ---
// const HandlerDashboard = () => {
//   // Filter state (UI and request)
//   const [startDate, setStartDate] = useState(dayjs().startOf('day').format(FORMAT));
//   const [endDate, setEndDate] = useState(dayjs().endOf('day').format(FORMAT));
//   const [partyOptions, setPartyOptions] = useState([]);
//   const [fabricOptions, setFabricOptions] = useState([]);
//   const [partyName, setPartyName] = useState('');
//   const [fabricType, setFabricType] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [stats, setStats] = useState(null);

//   // Fetch dropdown options on mount
//   useEffect(() => {
//     fetchTaskFilterDropdowns().then((fields) => {
//       setPartyOptions(Array.isArray(fields.partyName) ? fields.partyName : []);
//       setFabricOptions(Array.isArray(fields.fabricType) ? fields.fabricType : []);
//     }).catch(() => {/* not critical */});
//   }, []);

//   // For emulating dashboardAPI
//   const fetchStats = useCallback(async (_start, _end, _party, _fabric) => {
//     setLoading(true);
//     setError('');
//     setStats(null);
//     const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
//     const params = new URLSearchParams();
//     params.set('from', _start);
//     params.set('to', _end);
//     if (_party) params.set('partyName', _party);
//     if (_fabric) params.set('fabricType', _fabric);

//     const url = `${baseUrl}/tasks/dashboard/fabric-stats?${params.toString()}`;
//     try {
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
//       const json = await res.json();
//       if (json.success && json.data) {
//         setStats(json.data);
//       } else {
//         setError(json.message || 'Failed to load stats');
//       }
//     } catch (e) {
//       setError(e.message || 'Failed to load stats');
//     }
//     setLoading(false);
//   }, []);

//   // Initial/whenever filters update
//   useEffect(() => {
//     fetchStats(startDate, endDate, partyName, fabricType);
//   }, [startDate, endDate, partyName, fabricType, fetchStats]);

//   // Handler for filter bar
//   const handleApply = (from, to, party, fabric) => {
//     setStartDate(from);
//     setEndDate(to);
//     setPartyName(party || '');
//     setFabricType(fabric || '');
//   };

//   // --- STAT CARDS list (all backend fields + totalMTRShort) ---
//   const statCards = [
//     {
//       label: "Total Fabric In",
//       field: "totalFabricIn",
//       tooltip: "Sum of all subtask fabric meters received in all tasks."
//     },
//     {
//       label: "Total Fabric In (L100)",
//       field: "totalFabricInL100",
//       tooltip: "Sum of all subtask fabric meters received after normalizing to 100m length."
//     },
//     {
//       label: "Total In Processing",
//       field: "totalFabricInProcessing",
//       tooltip: "Meters currently in processing (no submissions or marked as processing/pending)."
//     },
//     {
//       label: "Total Fabric In Submission",
//       field: "totalFabricInSubmission",
//       tooltip: "Sum of fabric meters in all submissions."
//     },
//     {
//       label: "Total Fabric In Submission (L100)",
//       field: "totalFabricInSubmissionL100",
//       tooltip: "Sum of fabric meters in all submissions after normalizing to 100m length."
//     },
//     {
//       label: "Total Fabric Missing",
//       field: "totalFabricMissing",
//       tooltip: "Meters missing (after sinkage/length loss if any submission is marked as missing for that subtask)."
//     },
//     {
//       label: "Saved Sinkage",
//       field: "savedSinkage",
//       tooltip: "Sum of saved sinkages for all submissions marked as savedSinkage."
//     },
//     {
//       label: "Total Meter Short",
//       field: "totalMTRShort",
//       tooltip: "Total meter short across all subtasks (sum of subTask.mtrShort)."
//     },
//   ];

//   return (
//     <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl sm:text-3xl font-bold text-black">Task Fabric Dashboard</h1>
//       </div>

//       {/* Filter Bar (reuse style) */}
//       <DateAndFilterBar
//         startDate={startDate}
//         endDate={endDate}
//         onApply={handleApply}
//         loading={loading}
//         partyOptions={partyOptions}
//         fabricOptions={fabricOptions}
//         partyName={partyName}
//         setPartyName={setPartyName}
//         fabricType={fabricType}
//         setFabricType={setFabricType}
//       />

//       {/* Stat Cards, loading & error */}
//       {loading && <div className="text-gray-400 mt-10 text-center">Loading dashboard...</div>}
//       {error && !loading && <div className="text-red-500 mt-10 text-center">{error}</div>}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
//         {statCards.map(stat => (
//           <div
//             key={stat.label}
//             className={`relative bg-white shadow rounded-lg p-6 flex flex-col items-center border
//               ${stat.field==='totalFabricMissing' && stats && stats[stat.field] > 0 ? 'border-red-400' : borderLight}`}
//             title={stat.tooltip}
//             style={{ borderWidth: 2 }}
//           >
//             <span className="font-medium text-gray-600 mb-1">{stat.label}</span>
//             <span className={
//               "text-2xl font-bold " +
//               (stat.field==='totalFabricMissing' && stats && stats[stat.field] > 0
//                 ? 'text-red-600 animate-pulse'
//                 : 'text-blue-600')
//             }>
//               {stats && typeof stats[stat.field] === 'number'
//                 ? Number(stats[stat.field]).toLocaleString(undefined, { maximumFractionDigits: 2 })
//                 : '—'}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default HandlerDashboard;

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import axios from 'axios';
import {
  RiCalendarLine,
  RiRefreshLine,
  RiInboxArchiveLine,
  RiRulerLine,
  RiTimeLine,
  RiSendPlaneLine,
  RiFileList3Line,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { TbAlertCircle, TbAlertTriangle } from 'react-icons/tb';

// --- Theme tokens (matches DashboardPage) ---
const FORMAT = 'YYYY-MM-DD';
const orange = '#f58021';
const borderLight = 'border-gray-200';
const bgCard = 'bg-white';
const brandIcon = 'text-[#f58021]';
const btnBrand = `bg-[#f58021] text-white border-[#f58021] hover:bg-[#f58021]/90`;
const btnBrandOutline = `bg-white text-[#f58021] border-[#f58021] hover:bg-[#f58021]/10`;
const focusRing = 'focus:ring-2 focus:ring-[#f58021]';

// --- Date presets (matches DashboardPage) ---
const PRESETS = [
  { label: 'Today', getDates: () => ({ start: dayjs().startOf('day'), end: dayjs().endOf('day') }) },
  { label: 'Yesterday', getDates: () => ({ start: dayjs().subtract(1, 'day').startOf('day'), end: dayjs().subtract(1, 'day').endOf('day') }) },
  { label: 'Last 7 days', getDates: () => ({ start: dayjs().subtract(6, 'day').startOf('day'), end: dayjs().endOf('day') }) },
  { label: 'Last 30 days', getDates: () => ({ start: dayjs().subtract(29, 'day').startOf('day'), end: dayjs().endOf('day') }) },
  { label: 'This month', getDates: () => ({ start: dayjs().startOf('month'), end: dayjs().endOf('day') }) },
  { label: 'Custom', getDates: null },
];

// ---------------------------------------------------------------------------
// DateAndFilterBar — restyled to match DashboardPage's pill filter bar
// ---------------------------------------------------------------------------
function DateAndFilterBar({
  startDate,
  endDate,
  onApply,
  loading,
  partyOptions = [],
  fabricOptions = [],
  partyName = '',
  setPartyName = () => {},
  fabricType = '',
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

  const handlePreset = (preset) => {
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
    onApply(customStart, customEnd, partyName, fabricType);
  };

  const handlePartyChange = (e) => {
    setPartyName(e.target.value);
    onApply(startDate, endDate, e.target.value, fabricType);
  };

  const handleFabricChange = (e) => {
    setFabricType(e.target.value);
    onApply(startDate, endDate, partyName, e.target.value);
  };

  return (
    <div className={`rounded-xl border ${borderLight} ${bgCard} p-4`}>
      {/* Date presets */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <RiCalendarLine className={`${brandIcon} text-base shrink-0`} />
        <span className="text-sm font-medium text-black mr-1">Filter by date:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => handlePreset(preset)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors border
              ${activePreset === preset.label
                ? 'bg-[#f58021] text-white border-[#f58021]'
                : 'bg-white text-[#f58021] border-gray-200 hover:bg-orange-50 hover:border-[#f58021]'}
              disabled:opacity-50
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Party / Fabric filters */}
      <div className="flex flex-wrap gap-3 mb-1 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-800 mb-1">Party Name</label>
          <select
            value={partyName}
            disabled={loading}
            onChange={handlePartyChange}
            className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black rounded border`}
          >
            <option value="">All Parties</option>
            {partyOptions.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-800 mb-1">Fabric Type</label>
          <select
            value={fabricType}
            disabled={loading}
            onChange={handleFabricChange}
            className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black rounded border`}
          >
            <option value="">All Fabric Types</option>
            {fabricOptions.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom date range */}
      {showCustom && (
        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-800">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd || dayjs().format(FORMAT)}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black rounded border"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-800">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={dayjs().format(FORMAT)}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black rounded border"
            />
          </div>
          <button
            type="button"
            disabled={!customStart || !customEnd || loading || dayjs(customStart).isAfter(dayjs(customEnd))}
            onClick={handleCustomApply}
            className={`px-4 py-1.5 text-sm flex items-center gap-1.5 rounded ${btnBrand} disabled:opacity-50`}
          >
            <RiRefreshLine className={loading ? 'animate-spin' : ''} />
            Apply
          </button>
          {customStart && customEnd && dayjs(customStart).isAfter(dayjs(customEnd)) && (
            <p className="text-xs text-red-500 self-center">"From" must be before "To"</p>
          )}
        </div>
      )}

      {/* Summary line */}
      {activePreset !== 'Custom' && (
        <p className="text-xs text-gray-400 mt-2">
          Showing data for&nbsp;
          <span className="text-[#f58021] font-medium">
            {startDate === endDate
              ? dayjs(startDate).format('MMM D, YYYY')
              : `${dayjs(startDate).format('MMM D, YYYY')} – ${dayjs(endDate).format('MMM D, YYYY')}`}
          </span>
          {partyName && (
            <> &middot; <span className="text-[#f58021]">{partyName}</span></>
          )}
          {fabricType && (
            <> &middot; <span className="text-[#f58021]">{fabricType}</span></>
          )}
        </p>
      )}
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

// ---------------------------------------------------------------------------
// StatCard — inline card matching DashboardPage's icon-badge style
// ---------------------------------------------------------------------------
function FabricStatCard({ icon: Icon, label, value, tooltip, alert, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      title={tooltip}
      className={`relative rounded-xl border ${bgCard} p-5 flex flex-col gap-3
        ${alert ? 'border-red-300' : borderLight}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center
            ${alert ? 'bg-red-50' : 'bg-orange-50'}`}
        >
          <Icon className={`text-lg ${alert ? 'text-red-500' : brandIcon}`} />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600 animate-pulse' : 'text-black'}`}>
          {typeof value === 'number'
            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : '—'}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HandlerDashboard
// ---------------------------------------------------------------------------
const HandlerDashboard = () => {
  const [startDate, setStartDate] = useState(dayjs().startOf('day').format(FORMAT));
  const [endDate, setEndDate] = useState(dayjs().endOf('day').format(FORMAT));
  const [partyOptions, setPartyOptions] = useState([]);
  const [fabricOptions, setFabricOptions] = useState([]);
  const [partyName, setPartyName] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTaskFilterDropdowns()
      .then((fields) => {
        setPartyOptions(Array.isArray(fields.partyName) ? fields.partyName : []);
        setFabricOptions(Array.isArray(fields.fabricType) ? fields.fabricType : []);
      })
      .catch(() => {/* not critical */});
  }, []);

  const fetchStats = useCallback(async (_start, _end, _party, _fabric) => {
    setLoading(true);
    setError('');
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

  useEffect(() => {
    fetchStats(startDate, endDate, partyName, fabricType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = (from, to, party, fabric) => {
    setStartDate(from);
    setEndDate(to);
    setPartyName(party || '');
    setFabricType(fabric || '');
    fetchStats(from, to, party || '', fabric || '');
  };

  const handleRefresh = () => {
    fetchStats(startDate, endDate, partyName, fabricType);
  };

  // --- STAT CARDS list (icons matched to the orange theme) ---
  const statCards = [
    { icon: RiInboxArchiveLine, label: 'Total Fabric In', field: 'totalFabricIn', tooltip: 'Sum of all subtask fabric meters received in all tasks.' },
    { icon: RiRulerLine, label: 'Total Fabric In (L100)', field: 'totalFabricInL100', tooltip: 'Sum of all subtask fabric meters received after normalizing to 100m length.' },
    { icon: RiTimeLine, label: 'Total In Processing', field: 'totalFabricInProcessing', tooltip: 'Meters currently in processing (no submissions or marked as processing/pending).' },
    { icon: RiSendPlaneLine, label: 'Total Fabric In Submission', field: 'totalFabricInSubmission', tooltip: 'Sum of fabric meters in all submissions.' },
    { icon: RiFileList3Line, label: 'Total Fabric In Submission (L100)', field: 'totalFabricInSubmissionL100', tooltip: 'Sum of fabric meters in all submissions after normalizing to 100m length.' },
    { icon: TbAlertCircle, label: 'Total Fabric Missing', field: 'totalFabricMissing', tooltip: 'Meters missing (after sinkage/length loss if any submission is marked as missing for that subtask).', alertField: true },
    { icon: RiShieldCheckLine, label: 'Saved Sinkage', field: 'savedSinkage', tooltip: 'Sum of saved sinkages for all submissions marked as savedSinkage.' },
    { icon: TbAlertTriangle, label: 'Total Meter Short', field: 'totalMTRShort', tooltip: 'Total meter short across all subtasks (sum of subTask.mtrShort).', alertField: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-bold text-black">Task Fabric Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 self-start rounded border ${btnBrandOutline} disabled:opacity-50`}
        >
          <RiRefreshLine className={loading ? 'animate-spin text-[#f58021]' : 'text-[#f58021]'} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
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

      {/* Error */}
      {error && !loading && (
        <div className={`rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3`}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {loading && !stats
          ? Array(8).fill(0).map((_, i) => (
              <div key={i} className={`h-32 rounded-xl ${bgCard} border ${borderLight} animate-pulse`} />
            ))
          : statCards.map((stat, i) => {
              const value = stats ? stats[stat.field] : undefined;
              const isAlert = stat.alertField && typeof value === 'number' && value > 0;
              return (
                <FabricStatCard
                  key={stat.label}
                  icon={stat.icon}
                  label={stat.label}
                  value={typeof value === 'number' ? value : undefined}
                  tooltip={stat.tooltip}
                  alert={isAlert}
                  index={i}
                />
              );
            })}
      </div>
    </div>
  );
};

export default HandlerDashboard;