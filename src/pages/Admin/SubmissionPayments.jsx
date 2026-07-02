
// import React, { useState, useEffect, useRef, useMemo } from 'react'
// import axios from 'axios'
// import toast from 'react-hot-toast'
// import { RiCloseLine, RiFilterLine, RiRefreshLine } from 'react-icons/ri'
// import WorkflowHeader from '../../components/common/WorkflowHeader'
// import Modal from '../../components/common/Modal'
// import EmptyState from '../../components/common/EmptyState'
// // exceljs is a relatively lightweight excel export lib; fallback to xlsx if needed
// import ExcelJS from 'exceljs'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const PASSCODE_API = API_BASE_URL
//   ? `${API_BASE_URL}/users/verify-payment-department-passcode`
//   : '/api/v1/verify-payment-department-passcode'

// // ─── Calculation helpers ──────────────────────────────────────────────────────
// // Only calculates L100 Amount = Sub MTR(L100) * Rate, NOT affected by sinkage or taskLength
// function computeL100(submissionMTR, submissionLength, paymentRate) {
//   const MTR = Number(submissionMTR)
//   const Length = Number(submissionLength)
//   if (
//     isNaN(MTR) || isNaN(Length) ||
//     paymentRate == null || isNaN(Number(paymentRate))
//   ) return null
//   const subMTRL100 = MTR - (MTR * (100 - Length) / 100)
//   const l100Amount = subMTRL100 * Number(paymentRate)
//   return { netLength: subMTRL100.toFixed(2), amount: l100Amount.toFixed(2) }
// }

// // Sub MTR (L100) calculation: Submission MTR - (100 - Submission Length)%
// function computeSubMTRL100(submissionMTR, submissionLength) {
//   const MTR = Number(submissionMTR)
//   const Length = Number(submissionLength)
//   if (submissionMTR == null || submissionLength == null || isNaN(MTR) || isNaN(Length)) return null
//   const deductionPercent = 100 - Length
//   const subMTR = MTR - (MTR * deductionPercent / 100)
//   return subMTR
// }

// const copyToClipboard = async (text) => {
//   try {
//     await navigator.clipboard.writeText(text)
//     toast.success('Copied')
//   } catch {
//     toast.error('Failed to copy')
//   }
// }

// function getSubmissionsArray(subTask) {
//   if (Array.isArray(subTask.submissions)) return subTask.submissions
//   if (Array.isArray(subTask.submission)) return subTask.submission
//   if (subTask.submission) return [subTask.submission]
//   return []
// }

// function rateKey(programName, partyName, fabricType) {
//   return `${(programName || '').trim()}|||${(partyName || '').trim()}|||${(fabricType || '').trim()}`
// }

// // ─── Passcode gate ──────────────────────────────────────────────────────────────
// function PasscodeGate({ onSuccess }) {
//   const [passcode, setPasscode] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const inputRef = useRef(null)

//   useEffect(() => { inputRef.current?.focus() }, [])

//   const handleSubmit = async () => {
//     if (!passcode.trim()) { setError('Enter the passcode to continue.'); return }
//     setError('')
//     setLoading(true)
//     try {
//       const token = localStorage.getItem('token')
//       const res = await axios.post(
//         PASSCODE_API,
//         { passcode: passcode.trim() },
//         { headers: token ? { Authorization: `Bearer ${token}` } : {} }
//       )
//       if (res.data?.success) {
//         onSuccess()
//       } else {
//         setError('Incorrect passcode. Try again.')
//         setPasscode('')
//         inputRef.current?.focus()
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Incorrect passcode. Try again.')
//       setPasscode('')
//       inputRef.current?.focus()
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       minHeight: '100vh', background: '#f9fafb',
//       fontFamily: 'system-ui, -apple-system, sans-serif',
//     }}>
//       <div style={{
//         background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
//         padding: '36px 32px 28px', width: 360,
//         boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
//       }}>
//         <div style={{
//           width: 44, height: 44, borderRadius: 10,
//           background: '#fff7ed', border: '1px solid #fed7aa',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           marginBottom: 20, fontSize: 20,
//         }}>🔒</div>
//         <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
//           Payment Department Access
//         </h2>
//         <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>
//           Enter the passcode to view submission payments.
//         </p>
//         <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
//           Passcode
//         </label>
//         <input
//           ref={inputRef}
//           type="password"
//           value={passcode}
//           onChange={(e) => { setPasscode(e.target.value); setError('') }}
//           onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
//           placeholder="Enter passcode"
//           disabled={loading}
//           style={{
//             width: '100%', padding: '9px 12px', borderRadius: 8,
//             border: error ? '1px solid #fca5a5' : '1px solid #d1d5db',
//             fontSize: 14, outline: 'none', boxSizing: 'border-box',
//             marginBottom: error ? 8 : 16,
//             background: loading ? '#f9fafb' : '#fff',
//           }}
//         />
//         {error && (
//           <div style={{
//             fontSize: 13, color: '#b91c1c', background: '#fef2f2',
//             border: '1px solid #fca5a5', borderRadius: 7,
//             padding: '7px 10px', marginBottom: 14,
//           }}>{error}</div>
//         )}
//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={loading}
//           style={{
//             width: '100%', padding: '9px 0',
//             background: loading ? '#fdba74' : '#f58021',
//             color: '#fff', border: 'none', borderRadius: 8,
//             fontSize: 14, fontWeight: 600,
//             cursor: loading ? 'not-allowed' : 'pointer',
//           }}
//         >
//           {loading ? 'Verifying…' : 'Continue'}
//         </button>
//       </div>
//     </div>
//   )
// }

// const EMPTY_FILTERS = {
//   search: '',
//   taskId: '',
//   fabricType: '',
//   partyName: '',
//   program: '',
//   fabricPartyName: '',
//   recieverPartyName: '',
//   submitterName: '',
//   challanNo: '',
//   locationStatus: '',
//   dateFrom: '',
//   dateTo: '',
// }

// // ─── Main component ─────────────────────────────────────────────────────────────
// function SubmissionPayments() {
//   const [authenticated, setAuthenticated] = useState(false)

//   const [tasks, setTasks] = useState([])
//   const [loadingTasks, setLoadingTasks] = useState(false)
//   const [loadError, setLoadError] = useState('')

//   const [rateMap, setRateMap] = useState({}) // key -> rate number | null
//   const [filters, setFilters] = useState(EMPTY_FILTERS)
//   const [showFilters, setShowFilters] = useState(true)

//   const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
//   const [detailModalRow, setDetailModalRow] = useState(null)
//   const [previewImageModal, setPreviewImageModal] = useState({ open: false, url: '', alt: '' })

//   // ─── Excel Export: build and download Excel from filteredRows ──────────────
//   const handleExportExcel = async () => {
//     try {
//       const workbook = new ExcelJS.Workbook()
//       const sheet = workbook.addWorksheet('Submissions')
//       // Header row
//       sheet.addRow([
//         'Task ID',
//         'Fabric Type',
//         'Party Name',
//         'SubTask ID',
//         'Program',
//         'Jigar No',
//         'Fabric Party',
//         'Receiver Party',
//         'Submitter',
//         // 'Task Length', // removed
//         'Sinkage %',
//         'Length',
//         'Rate',
//         'MTR',
//         'Amount',
//         'Sub MTR (L100)',
//         'L100 Amount',
//         'Challan No',
//         'Location Status',
//         'Created',
//       ])
//       // Data rows
//       filteredRows.forEach(row => {
//         const { task, subTask, submission } = row
//         const sinkage = task?.sinkage
//         // const taskLength = task?.Length // removed
//         const submittedLength = submission?.length ?? subTask.length ?? task?.Length
//         const rate = getRateForRow(row)
//         const subMTRL100 =
//           submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//             ? computeSubMTRL100(submission.MTR, submission.length)
//             : null
//         const amount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
//           ? (Number(submission.MTR) * rate).toFixed(2)
//           : null
//         const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//           ? computeL100(submission.MTR, submission.length, rate)
//           : null
//         // "Warehouse" or "Missing"
//         const locationStatusLabel = submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'
//         sheet.addRow([
//           task.taskId || '',
//           task.FabricType || '',
//           task.partyName || '',
//           subTask.subTaskId || subTask._id || '',
//           subTask.program || '',
//           subTask.jigarNo || '',
//           submission.fabricPartyName || '',
//           submission.recieverPartyName || '',
//           submission.submitterName || '',
//           // taskLength ?? '', // removed
//           sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '',
//           submission.length ?? '',
//           (rate !== null && rate !== undefined ? Number(rate) : ''),
//           submission.MTR ?? '',
//           (amount != null ? amount : ''),
//           (subMTRL100 != null ? Number(subMTRL100).toFixed(2) : ''),
//           (l100 ? l100.amount : ''),
//           submission.challanNo ?? '',
//           locationStatusLabel,
//           (task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''),
//         ])
//       })
//       // Style header
//       sheet.getRow(1).font = { bold: true }
//       // Auto width
//       sheet.columns.forEach(column => {
//         let colMax = 10
//         column.eachCell({ includeEmpty: true }, cell => {
//           const val = String(cell.value ?? '')
//           colMax = Math.max(colMax, val.length + 2)
//         })
//         column.width = colMax
//       })
//       // Download
//       const buffer = await workbook.xlsx.writeBuffer()
//       const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `SubmissionPayments_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`
//       document.body.appendChild(a)
//       a.click()
//       setTimeout(() => {
//         window.URL.revokeObjectURL(url)
//         document.body.removeChild(a)
//       }, 100)
//       toast.success('Excel exported')
//     } catch (err) {
//       toast.error('Failed to export Excel')
//     }
//   }

//   // Fetch all tasks once authenticated
//   const loadTasks = () => {
//     setLoadingTasks(true)
//     setLoadError('')
//     axios
//       .get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
//       .then(res => {
//         setTasks(res.data?.success && Array.isArray(res.data.data) ? res.data.data : [])
//         setLoadingTasks(false)
//       })
//       .catch(() => {
//         setLoadError('Failed to load tasks')
//         setLoadingTasks(false)
//       })
//   }

//   useEffect(() => {
//     if (!authenticated) return
//     loadTasks()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [authenticated])

//   // ─── Flatten task -> subTask -> submission into rows ───────────────────────
//   const rows = useMemo(() => {
//     const out = []
//     for (const task of tasks) {
//       const subTasks = Array.isArray(task.subTask) ? task.subTask : []
//       for (const st of subTasks) {
//         const submissions = getSubmissionsArray(st)
//         if (!submissions.length) continue
//         submissions.forEach((submission, idx) => {
//           out.push({
//             id: `${task.taskId}__${st.subTaskId || st._id || ''}__${submission.challanNo || idx}`,
//             task,
//             subTask: st,
//             submission,
//             submissionIndex: idx,
//           })
//         })
//       }
//     }
//     return out
//   }, [tasks])

//   // ─── Fetch payment rates for all unique program/party/fabricType combos ────
//   useEffect(() => {
//     if (!rows.length) return
//     const uniqueKeys = new Map()
//     for (const row of rows) {
//       const programName = row.subTask.program || row.subTask.Program
//       const partyName = row.task.partyName || row.task.PartyName
//       const fabricType = row.task.FabricType || row.task.fabricType
//       if (typeof programName !== 'string' || !programName.trim()) continue
//       if (typeof partyName !== 'string' || !partyName.trim()) continue
//       if (typeof fabricType !== 'string' || !fabricType.trim()) continue
//       const key = rateKey(programName, partyName, fabricType)
//       if (!uniqueKeys.has(key) && !(key in rateMap)) {
//         uniqueKeys.set(key, { programName: programName.trim(), partyName: partyName.trim(), fabricType: fabricType.trim() })
//       }
//     }
//     if (!uniqueKeys.size) return

//     let cancelled = false
//     ;(async () => {
//       const updates = {}
//       await Promise.all(
//         Array.from(uniqueKeys.entries()).map(async ([key, params]) => {
//           try {
//             const res = await axios.get(`${API_BASE_URL}/submission-payment-data/rate`, { params })
//             updates[key] = res.data?.success && res.data.data && typeof res.data.data.rate === 'number'
//               ? res.data.data.rate
//               : null
//           } catch {
//             updates[key] = null
//           }
//         })
//       )
//       if (!cancelled) setRateMap(prev => ({ ...prev, ...updates }))
//     })()

//     return () => { cancelled = true }
//   }, [rows, rateMap])

//   function getRateForRow(row) {
//     const programName = row.subTask.program || row.subTask.Program
//     const partyName = row.task.partyName || row.task.PartyName
//     const fabricType = row.task.FabricType || row.task.fabricType
//     const key = rateKey(programName, partyName, fabricType)
//     return rateMap[key] ?? null
//   }

//   // ─── Apply filters ───────────────────────────────────────────────────────
//   const filteredRows = useMemo(() => {
//     const f = filters
//     const dateFrom = f.dateFrom ? new Date(f.dateFrom) : null
//     const dateTo = f.dateTo ? new Date(f.dateTo + 'T23:59:59') : null
//     const search = f.search.trim().toLowerCase()

//     return rows.filter(row => {
//       const { task, subTask, submission } = row

//       if (f.taskId && !String(task.taskId || '').toLowerCase().includes(f.taskId.toLowerCase())) return false
//       if (f.fabricType && !String(task.FabricType || '').toLowerCase().includes(f.fabricType.toLowerCase())) return false
//       if (f.partyName && !String(task.partyName || '').toLowerCase().includes(f.partyName.toLowerCase())) return false
//       if (f.program && !String(subTask.program || '').toLowerCase().includes(f.program.toLowerCase())) return false
//       if (f.fabricPartyName && !String(submission.fabricPartyName || '').toLowerCase().includes(f.fabricPartyName.toLowerCase())) return false
//       if (f.recieverPartyName && !String(submission.recieverPartyName || '').toLowerCase().includes(f.recieverPartyName.toLowerCase())) return false
//       if (f.submitterName && !String(submission.submitterName || '').toLowerCase().includes(f.submitterName.toLowerCase())) return false
//       if (f.challanNo && !String(submission.challanNo || '').toLowerCase().includes(f.challanNo.toLowerCase())) return false
//       if (f.locationStatus) {
//         const status = submission.locationStatus === 'missing' ? 'missing' : 'warehouse'
//         if (status !== f.locationStatus) return false
//       }
//       if (dateFrom || dateTo) {
//         const created = task.createdAt ? new Date(task.createdAt) : null
//         if (!created) return false
//         if (dateFrom && created < dateFrom) return false
//         if (dateTo && created > dateTo) return false
//       }
//       if (search) {
//         const haystack = [
//           task.taskId, task.FabricType, task.partyName, task.BuiltyNo, task.challanNo,
//           subTask.subTaskId, subTask.program, subTask.jigarNo,
//           submission.fabricPartyName, submission.recieverPartyName, submission.submitterName, submission.challanNo,
//         ].map(v => String(v ?? '').toLowerCase()).join(' ')
//         if (!haystack.includes(search)) return false
//       }
//       return true
//     })
//   }, [rows, filters])

//   // ─── Filter option lists (derived from data) ───────────────────────────────
//   const locationStatusOptions = [
//     { value: '', label: 'All' },
//     { value: 'warehouse', label: 'Warehouse' },
//     { value: 'missing', label: 'Missing' },
//   ]

//   function updateFilter(key, value) {
//     setFilters(prev => ({ ...prev, [key]: value }))
//   }

//   function resetFilters() {
//     setFilters(EMPTY_FILTERS)
//   }

//   const activeFilterCount = Object.entries(filters).filter(([, v]) => v && v.trim()).length

//   function handlePreviewImage(path, alt) {
//     if (!path) return
//     let fullUrl = path
//     if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
//     setPreviewImageModal({ open: true, url: fullUrl, alt })
//   }

//   function handleClosePreviewImage() {
//     setPreviewImageModal({ open: false, url: '', alt: '' })
//   }

//   function renderChallanPhotoLink(path, altLabel) {
//     if (!path) return <span className="text-gray-400 text-xs">-</span>
//     let fullUrl = path
//     if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
//     return (
//       <button
//         type="button"
//         className="text-orange-600 underline underline-offset-2 font-medium text-xs px-0.5 hover:text-orange-700"
//         style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
//         onClick={() => handlePreviewImage(fullUrl, altLabel || 'Challan photo')}
//         title="Preview Image"
//       >
//         Preview
//       </button>
//     )
//   }

//   function handleShowDetails(row) {
//     setDetailModalRow(row)
//     setShowSubmissionDetailModal(true)
//   }

//   // Show passcode gate first
//   if (!authenticated) {
//     return <PasscodeGate onSuccess={() => setAuthenticated(true)} />
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* <WorkflowHeader
//         activeStep="submission"
//         topLabel="Fabric Task Workflow"
//         title="View Submissions"
//         subtitle="All submissions across all tasks, with filters."
//       /> */}

//           {/* Thin brand bar */}
//           <div className="w-full border-b-2 border-gray-900">
//         <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
//           <span className="text-base font-bold text-gray-900 tracking-tight">
//           View Submissions
//           </span>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-6 sm:px-10">
//         {/* Page heading */}
//         <div className="pt-10 pb-6">
//           <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
//           View Submissions
//           </h1>
//          <p className="mt-2 text-gray-500 text-base">All submissions across all tasks, with filters.</p>
//         </div>
//         </div>

//       <div className="max-w-[1600px] mx-auto px-2 md:px-6 sm:px-10 pb-6">

//         {/* Top bar: refresh + filter toggle + counts */}
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-2">
//           <div className="flex items-center gap-3">
//             <h3 className="font-bold text-gray-900 text-lg">
//               Submissions
//               <span className="ml-2 text-sm font-medium text-gray-500">
//                 ({filteredRows.length} of {rows.length})
//               </span>
//             </h3>
//             {loadingTasks && <span className="text-xs text-orange-600 animate-pulse">Loading...</span>}
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={() => setShowFilters(s => !s)}
//               className="flex items-center gap-1.5 rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-1.5 text-sm font-semibold text-gray-700 transition"
//             >
//               <RiFilterLine size={15} />
//               Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
//             </button>
//             {activeFilterCount > 0 && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="rounded-full border border-gray-200 hover:bg-gray-50 px-4 py-1.5 text-sm font-semibold text-gray-500 transition"
//               >
//                 Clear
//               </button>
//             )}

//             {/* EXPORT BUTTON ADDED HERE */}
//             <button
//               type="button"
//               className="flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm font-semibold transition"
//               onClick={handleExportExcel}
//               disabled={filteredRows.length === 0}
//             >
//               Export to Excel
//             </button>

//             <button
//               type="button"
//               onClick={loadTasks}
//               className="flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-sm font-semibold transition"
//             >
//               <RiRefreshLine size={15} /> Refresh
//             </button>
//           </div>
//         </div>

//         {/* Filter panel */}
//         {showFilters && (
//           <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//             <FilterInput label="Search (any field)" value={filters.search} onChange={v => updateFilter('search', v)} placeholder="Search everything…" />
//             <FilterInput label="Task ID" value={filters.taskId} onChange={v => updateFilter('taskId', v)} />
//             <FilterInput label="Fabric Type" value={filters.fabricType} onChange={v => updateFilter('fabricType', v)} />
//             <FilterInput label="Party Name (Task)" value={filters.partyName} onChange={v => updateFilter('partyName', v)} />
//             <FilterInput label="Program" value={filters.program} onChange={v => updateFilter('program', v)} />
//             <FilterInput label="Fabric Party (Submission)" value={filters.fabricPartyName} onChange={v => updateFilter('fabricPartyName', v)} />
//             <FilterInput label="Receiver Party" value={filters.recieverPartyName} onChange={v => updateFilter('recieverPartyName', v)} />
//             <FilterInput label="Submitter Name" value={filters.submitterName} onChange={v => updateFilter('submitterName', v)} />
//             <FilterInput label="Challan No" value={filters.challanNo} onChange={v => updateFilter('challanNo', v)} />
//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Location Status</label>
//               <select
//                 value={filters.locationStatus}
//                 onChange={e => updateFilter('locationStatus', e.target.value)}
//                 className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
//               >
//                 {locationStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//               </select>
//             </div>
//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Date From</label>
//               <input
//                 type="date"
//                 value={filters.dateFrom}
//                 onChange={e => updateFilter('dateFrom', e.target.value)}
//                 className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Date To</label>
//               <input
//                 type="date"
//                 value={filters.dateTo}
//                 onChange={e => updateFilter('dateTo', e.target.value)}
//                 className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
//               />
//             </div>
//           </div>
//         )}

//         {loadError && (
//           <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">
//             {loadError}
//           </div>
//         )}

//         {!loadingTasks && filteredRows.length === 0 && (
//           <div className="rounded-3xl border border-gray-200 bg-white">
//             <EmptyState icon="📭" text={rows.length === 0 ? 'No submissions found.' : 'No submissions match the current filters.'} />
//           </div>
//         )}

//         {filteredRows.length > 0 && (
//           <div className="overflow-x-auto rounded-2xl border border-gray-100">
//             <table className="w-full min-w-[1400px] text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <Th>Task ID</Th>
//                   <Th>Fabric Type</Th>
//                   <Th>Party Name</Th>
//                   <Th>SubTask ID</Th>
//                   <Th>Program</Th>
//                   <Th>Jigar No</Th>
//                   <Th>Fabric Party</Th>
//                   <Th>Receiver Party</Th>
//                   <Th>Submitter</Th>
//                   {/* <Th>Task Length</Th> */}
//                   <Th>Sinkage %</Th>
//                   <Th>Length</Th>
//                   <Th>Rate</Th>
//                   <Th>MTR</Th>
//                   <Th highlight>Amount</Th>
//                   <Th >Sub MTR (L100)</Th>
//                   <Th highlight>L100 Amount</Th>
//                   <Th>Challan No</Th>
//                   <Th>Challan Photo</Th>
//                   <Th>Status</Th>
//                   <Th>Created</Th>
//                   <Th></Th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRows.map(row => {
//                   const { task, subTask, submission } = row
//                   const sinkage = task?.sinkage
//                   // const taskLength = task?.Length // removed
//                   const submittedLength = submission?.length ?? subTask.length ?? task?.Length
//                   const rate = getRateForRow(row)
//                   // Sub MTR (L100) calculation: Submission MTR - (100 - Submission Length)%
//                   const subMTRL100 =
//                     submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//                       ? (computeSubMTRL100(submission.MTR, submission.length))
//                       : null

//                   // Amount = MTR * Rate
//                   const amount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
//                     ? (Number(submission.MTR) * rate).toFixed(2)
//                     : null
//                   // L100 Amount = Sub MTR (L100) * Rate
//                   const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//                     ? computeL100(submission.MTR, submission.length, rate)
//                     : null

//                   return (
//                     <tr key={row.id} className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors">
//                       <Td>
//                         <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 font-mono text-xs">
//                           {task.taskId}
//                         </span>
//                       </Td>
//                       <Td>{task.FabricType ?? '-'}</Td>
//                       <Td>{task.partyName ?? '-'}</Td>
//                       <Td>
//                         <span className="bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 font-mono text-xs">
//                           {subTask.subTaskId ?? subTask._id ?? '-'}
//                         </span>
//                       </Td>
//                       <Td>{subTask.program ?? '-'}</Td>
//                       <Td>{subTask.jigarNo ?? '-'}</Td>
//                       <Td>{submission.fabricPartyName ?? '-'}</Td>
//                       <Td>{submission.recieverPartyName ?? '-'}</Td>
//                       <Td>{submission.submitterName ?? '-'}</Td>
//                       {/* <Td>{taskLength ?? '-'}</Td> */}
//                       <Td>{sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '-'}</Td>
//                       <Td>{submission.length ?? '-'}</Td>
//                       <Td>{rate !== null && rate !== undefined ? <>₹ {Number(rate).toLocaleString()}</> : <span className="text-gray-300">-</span>}</Td>
//                       <Td>{submission.MTR ?? '-'}</Td>
//                       <Td highlight>{amount != null ? <>₹ {amount}</> : '-'}</Td>
//                       <Td >
//                         {subMTRL100 != null
//                           ? Number(subMTRL100).toFixed(2)
//                           : <span className="text-gray-300">-</span>
//                         }
//                       </Td>
                      
                     
//                       <Td highlight>
//                         {l100 ? (
//                           <span>
//                              ₹ {l100.amount}
//                           </span>
//                         ) : '-'}
//                       </Td>
//                       <Td>{submission.challanNo ?? '-'}</Td>
//                       <Td>{renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ''}`)}</Td>
//                       <Td>
//                         <span className={'rounded-lg text-xs px-2 py-0.5 font-bold ' + (submission.locationStatus === 'missing' ? 'bg-red-300 text-red-900 border border-red-400' : 'bg-green-100 text-green-700 border border-green-200')}>
//                           {submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'}
//                         </span>
//                       </Td>
//                       <Td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}</Td>
//                       <Td>
//                         <button
//                           className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
//                           onClick={() => handleShowDetails(row)}
//                         >
//                           View
//                         </button>
//                       </Td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Submission Details Modal */}
//         <Modal open={showSubmissionDetailModal} onClose={() => setShowSubmissionDetailModal(false)} width={480} title="Submission Details" showClose>
//           {detailModalRow ? (
//             (() => {
//               const { task, subTask, submission, submissionIndex } = detailModalRow
//               const sinkage = task?.sinkage
//               // const taskLength = task?.Length // removed
//               const submittedLength = submission?.length ?? subTask.length ?? task?.Length

//               // Sub MTR (L100) calculation for modal
//               const subMTRL100 =
//                 submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//                   ? (computeSubMTRL100(submission.MTR, submission.length))
//                   : null

//               // Amount = MTR * Rate
//               const rate = getRateForRow(detailModalRow)
//               const partyAmount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
//                 ? (Number(submission.MTR) * rate).toFixed(2)
//                 : null
//               // L100 Amount = Sub MTR (L100) * Rate
//               const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
//                 ? computeL100(submission.MTR, submission.length, rate)
//                 : null

//               return (
//                 <div className="py-1">
//                   <div className="font-bold text-gray-900 mb-4 text-base text-center">
//                     SubTask{' '}
//                     <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">
//                       {subTask.subTaskId ?? subTask._id ?? '-'}
//                     </span>
//                     <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">
//                       Submission #{submissionIndex + 1}
//                     </span>
//                   </div>
//                   <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
//                     <div>
//                       <span className="font-bold text-gray-500">Location Status: </span>
//                       <span className={submission.locationStatus === 'missing' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
//                         {submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'}
//                       </span>
//                     </div>
//                     <div><span className="font-bold text-gray-500">Fabric Party: </span><span className="text-gray-800">{submission.fabricPartyName ?? '-'}</span></div>
//                     <div><span className="font-bold text-gray-500">Receiver Party: </span><span className="text-gray-800">{submission.recieverPartyName ?? '-'}</span></div>
//                     <div><span className="font-bold text-gray-500">Submitter Name: </span><span className="text-gray-800">{submission.submitterName ?? '-'}</span></div>
//                     {/* <div><span className="font-bold text-gray-500">Task Length: </span><span className="text-gray-800">{taskLength ?? '-'}</span></div> */}
//                     <div>
//                       <span className="font-bold text-gray-500">Sinkage %: </span>
//                       <span className="text-gray-800">{sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '-'}</span>
//                     </div>
//                     <div><span className="font-bold text-gray-500">Length: </span><span className="text-gray-800">{submission.length ?? '-'}</span></div>
//                     <div><span className="font-bold text-gray-500">MTR: </span><span className="text-gray-800">{submission.MTR ?? '-'}</span></div>
//                     <div>
//                       <span className="font-bold text-gray-500">Sub MTR (L100): </span>
//                       <span className="text-gray-800">
//                         {subMTRL100 != null
//                           ? Number(subMTRL100).toFixed(2)
//                           : '-'
//                         }
//                         {subMTRL100 != null &&
//                           <span className="ml-2 text-gray-400">(MTR - (100 - Length)%)</span>
//                         }
//                       </span>
//                     </div>
//                     <div>
//                       <span className="font-bold text-gray-500">Amount: </span>
//                       <span className="text-gray-800">
//                         {partyAmount != null ? <>₹ {partyAmount}</> : '-'}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="font-bold text-gray-500">L100 Submission Payment: </span>
//                       <span className="text-gray-800">
//                         {l100 ? (
//                           <>
//                             {l100.netLength}
//                             <span className="ml-2 text-orange-800 font-semibold inline-block">(Amount: ₹ {l100.amount})</span>
//                           </>
//                         ) : '-'}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="font-bold text-gray-500">Rate: </span>
//                       <span className="text-gray-800">
//                         {rate !== null && rate !== undefined ? <>₹ {Number(rate).toLocaleString()}</> : <span className="text-gray-300">-</span>}
//                       </span>
//                     </div>
//                     <div><span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{submission.challanNo ?? '-'}</span></div>
//                     <div className="flex items-center gap-2">
//                       <span className="font-bold text-gray-500">Challan Photo: </span>
//                       {renderChallanPhotoLink(submission.challanPhotoPath, 'Preview Challan')}
//                     </div>
//                     <div>
//                       <span className="font-bold text-gray-500">Task ID: </span>
//                       <span className="font-mono text-gray-800 flex items-center gap-1">
//                         {task?.taskId}
//                         <button type="button" aria-label="Copy Task ID"
//                           className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
//                           onClick={() => copyToClipboard(task?.taskId)}>Copy</button>
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex justify-end mt-6 gap-3">
//                     <button type="button"
//                       className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//                       onClick={() => setShowSubmissionDetailModal(false)}>
//                       <RiCloseLine size={16} /> Close
//                     </button>
//                   </div>
//                 </div>
//               )
//             })()
//           ) : (
//             <EmptyState icon="📭" text="No submission data found." />
//           )}
//         </Modal>

//         {/* Challan preview modal */}
//         <Modal open={previewImageModal.open} onClose={handleClosePreviewImage} width={480} title="Challan Photo Preview" showClose>
//           <div className="p-4 flex flex-col items-center gap-4">
//             {previewImageModal.url ? (
//               <img src={previewImageModal.url} alt={previewImageModal.alt || 'Challan photo'}
//                 className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
//                 style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
//                 crossOrigin="anonymous" />
//             ) : (
//               <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
//             )}
//           </div>
//         </Modal>
//       </div>
//     </div>
//   )
// }

// function FilterInput({ label, value, onChange, placeholder }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</label>
//       <input
//         type="text"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder || `Filter ${label.toLowerCase()}…`}
//         className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
//       />
//     </div>
//   )
// }

// function Th({ children, highlight }) {
//   return (
//     <th className={`px-3 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${highlight ? 'text-orange-700' : 'text-gray-500'}`}>
//       {children}
//     </th>
//   )
// }

// function Td({ children, highlight }) {
//   return (
//     <td className={`px-3 py-2 whitespace-nowrap ${highlight ? 'bg-orange-50/40' : ''}`}>
//       {children}
//     </td>
//   )
// }

// export default SubmissionPayments

import React, { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RiCloseLine, RiFilterLine, RiRefreshLine } from 'react-icons/ri'
import WorkflowHeader from '../../components/common/WorkflowHeader'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
// exceljs is a relatively lightweight excel export lib; fallback to xlsx if needed
import ExcelJS from 'exceljs'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const PASSCODE_API = API_BASE_URL
  ? `${API_BASE_URL}/users/verify-payment-department-passcode`
  : '/api/v1/verify-payment-department-passcode'

// ─── Calculation helpers ──────────────────────────────────────────────────────
function computeL100(submissionMTR, submissionLength, paymentRate) {
  const MTR = Number(submissionMTR)
  const Length = Number(submissionLength)
  if (
    isNaN(MTR) || isNaN(Length) ||
    paymentRate == null || isNaN(Number(paymentRate))
  ) return null
  const subMTRL100 = MTR - (MTR * (100 - Length) / 100)
  const l100Amount = subMTRL100 * Number(paymentRate)
  return { netLength: subMTRL100.toFixed(2), amount: l100Amount.toFixed(2) }
}

function computeSubMTRL100(submissionMTR, submissionLength) {
  const MTR = Number(submissionMTR)
  const Length = Number(submissionLength)
  if (submissionMTR == null || submissionLength == null || isNaN(MTR) || isNaN(Length)) return null
  const deductionPercent = 100 - Length
  const subMTR = MTR - (MTR * deductionPercent / 100)
  return subMTR
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied')
  } catch {
    toast.error('Failed to copy')
  }
}

function getSubmissionsArray(subTask) {
  if (Array.isArray(subTask.submissions)) return subTask.submissions
  if (Array.isArray(subTask.submission)) return subTask.submission
  if (subTask.submission) return [subTask.submission]
  return []
}

function rateKey(programName, partyName, fabricType) {
  return `${(programName || '').trim()}|||${(partyName || '').trim()}|||${(fabricType || '').trim()}`
}

// ─── Passcode gate ──────────────────────────────────────────────────────────────
function PasscodeGate({ onSuccess }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async () => {
    if (!passcode.trim()) { setError('Enter the passcode to continue.'); return }
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        PASSCODE_API,
        { passcode: passcode.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      if (res.data?.success) {
        onSuccess()
      } else {
        setError('Incorrect passcode. Try again.')
        setPasscode('')
        inputRef.current?.focus()
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Incorrect passcode. Try again.')
      setPasscode('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '16px',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '32px 24px 24px', width: '100%', maxWidth: 360,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: '#fff7ed', border: '1px solid #fed7aa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, fontSize: 20,
        }}>🔒</div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
          Payment Department Access
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>
          Enter the passcode to view submission payments.
        </p>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Passcode
        </label>
        <input
          ref={inputRef}
          type="password"
          value={passcode}
          onChange={(e) => { setPasscode(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter passcode"
          disabled={loading}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            border: error ? '1px solid #fca5a5' : '1px solid #d1d5db',
            fontSize: 16, outline: 'none', boxSizing: 'border-box',
            marginBottom: error ? 8 : 16,
            background: loading ? '#f9fafb' : '#fff',
          }}
        />
        {error && (
          <div style={{
            fontSize: 13, color: '#b91c1c', background: '#fef2f2',
            border: '1px solid #fca5a5', borderRadius: 7,
            padding: '7px 10px', marginBottom: 14,
          }}>{error}</div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px 0',
            background: loading ? '#fdba74' : '#f58021',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

const EMPTY_FILTERS = {
  search: '',
  taskId: '',
  fabricType: '',
  partyName: '',
  program: '',
  fabricPartyName: '',
  recieverPartyName: '',
  submitterName: '',
  challanNo: '',
  locationStatus: '',
  dateFrom: '',
  dateTo: '',
}

// ─── Main component ─────────────────────────────────────────────────────────────
function SubmissionPayments() {
  const [authenticated, setAuthenticated] = useState(false)

  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [rateMap, setRateMap] = useState({})
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(true)

  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
  const [detailModalRow, setDetailModalRow] = useState(null)
  const [previewImageModal, setPreviewImageModal] = useState({ open: false, url: '', alt: '' })

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Submissions')
      sheet.addRow([
        'Task ID', 'Fabric Type', 'Party Name', 'SubTask ID', 'Program', 'Jigar No',
        'Fabric Party', 'Receiver Party', 'Submitter', 'Sinkage %', 'Length', 'Rate',
        'MTR', 'Amount', 'Sub MTR (L100)', 'L100 Amount', 'Challan No', 'Location Status', 'Created',
      ])
      filteredRows.forEach(row => {
        const { task, subTask, submission } = row
        const sinkage = task?.sinkage
        const rate = getRateForRow(row)
        const subMTRL100 =
          submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
            ? computeSubMTRL100(submission.MTR, submission.length)
            : null
        const amount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
          ? (Number(submission.MTR) * rate).toFixed(2)
          : null
        const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
          ? computeL100(submission.MTR, submission.length, rate)
          : null
        const locationStatusLabel = submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'
        sheet.addRow([
          task.taskId || '', task.FabricType || '', task.partyName || '',
          subTask.subTaskId || subTask._id || '', subTask.program || '', subTask.jigarNo || '',
          submission.fabricPartyName || '', submission.recieverPartyName || '', submission.submitterName || '',
          sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '',
          submission.length ?? '',
          (rate !== null && rate !== undefined ? Number(rate) : ''),
          submission.MTR ?? '',
          (amount != null ? amount : ''),
          (subMTRL100 != null ? Number(subMTRL100).toFixed(2) : ''),
          (l100 ? l100.amount : ''),
          submission.challanNo ?? '',
          locationStatusLabel,
          (task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''),
        ])
      })
      sheet.getRow(1).font = { bold: true }
      sheet.columns.forEach(column => {
        let colMax = 10
        column.eachCell({ includeEmpty: true }, cell => {
          const val = String(cell.value ?? '')
          colMax = Math.max(colMax, val.length + 2)
        })
        column.width = colMax
      })
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SubmissionPayments_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
      toast.success('Excel exported')
    } catch (err) {
      toast.error('Failed to export Excel')
    }
  }

  const loadTasks = () => {
    setLoadingTasks(true)
    setLoadError('')
    axios
      .get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
      .then(res => {
        setTasks(res.data?.success && Array.isArray(res.data.data) ? res.data.data : [])
        setLoadingTasks(false)
      })
      .catch(() => {
        setLoadError('Failed to load tasks')
        setLoadingTasks(false)
      })
  }

  useEffect(() => {
    if (!authenticated) return
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated])

  const rows = useMemo(() => {
    const out = []
    for (const task of tasks) {
      const subTasks = Array.isArray(task.subTask) ? task.subTask : []
      for (const st of subTasks) {
        const submissions = getSubmissionsArray(st)
        if (!submissions.length) continue
        submissions.forEach((submission, idx) => {
          out.push({
            id: `${task.taskId}__${st.subTaskId || st._id || ''}__${submission.challanNo || idx}`,
            task, subTask: st, submission, submissionIndex: idx,
          })
        })
      }
    }
    return out
  }, [tasks])

  useEffect(() => {
    if (!rows.length) return
    const uniqueKeys = new Map()
    for (const row of rows) {
      const programName = row.subTask.program || row.subTask.Program
      const partyName = row.task.partyName || row.task.PartyName
      const fabricType = row.task.FabricType || row.task.fabricType
      if (typeof programName !== 'string' || !programName.trim()) continue
      if (typeof partyName !== 'string' || !partyName.trim()) continue
      if (typeof fabricType !== 'string' || !fabricType.trim()) continue
      const key = rateKey(programName, partyName, fabricType)
      if (!uniqueKeys.has(key) && !(key in rateMap)) {
        uniqueKeys.set(key, { programName: programName.trim(), partyName: partyName.trim(), fabricType: fabricType.trim() })
      }
    }
    if (!uniqueKeys.size) return

    let cancelled = false
    ;(async () => {
      const updates = {}
      await Promise.all(
        Array.from(uniqueKeys.entries()).map(async ([key, params]) => {
          try {
            const res = await axios.get(`${API_BASE_URL}/submission-payment-data/rate`, { params })
            updates[key] = res.data?.success && res.data.data && typeof res.data.data.rate === 'number'
              ? res.data.data.rate
              : null
          } catch {
            updates[key] = null
          }
        })
      )
      if (!cancelled) setRateMap(prev => ({ ...prev, ...updates }))
    })()

    return () => { cancelled = true }
  }, [rows, rateMap])

  function getRateForRow(row) {
    const programName = row.subTask.program || row.subTask.Program
    const partyName = row.task.partyName || row.task.PartyName
    const fabricType = row.task.FabricType || row.task.fabricType
    const key = rateKey(programName, partyName, fabricType)
    return rateMap[key] ?? null
  }

  const filteredRows = useMemo(() => {
    const f = filters
    const dateFrom = f.dateFrom ? new Date(f.dateFrom) : null
    const dateTo = f.dateTo ? new Date(f.dateTo + 'T23:59:59') : null
    const search = f.search.trim().toLowerCase()

    return rows.filter(row => {
      const { task, subTask, submission } = row

      if (f.taskId && !String(task.taskId || '').toLowerCase().includes(f.taskId.toLowerCase())) return false
      if (f.fabricType && !String(task.FabricType || '').toLowerCase().includes(f.fabricType.toLowerCase())) return false
      if (f.partyName && !String(task.partyName || '').toLowerCase().includes(f.partyName.toLowerCase())) return false
      if (f.program && !String(subTask.program || '').toLowerCase().includes(f.program.toLowerCase())) return false
      if (f.fabricPartyName && !String(submission.fabricPartyName || '').toLowerCase().includes(f.fabricPartyName.toLowerCase())) return false
      if (f.recieverPartyName && !String(submission.recieverPartyName || '').toLowerCase().includes(f.recieverPartyName.toLowerCase())) return false
      if (f.submitterName && !String(submission.submitterName || '').toLowerCase().includes(f.submitterName.toLowerCase())) return false
      if (f.challanNo && !String(submission.challanNo || '').toLowerCase().includes(f.challanNo.toLowerCase())) return false
      if (f.locationStatus) {
        const status = submission.locationStatus === 'missing' ? 'missing' : 'warehouse'
        if (status !== f.locationStatus) return false
      }
      if (dateFrom || dateTo) {
        const created = task.createdAt ? new Date(task.createdAt) : null
        if (!created) return false
        if (dateFrom && created < dateFrom) return false
        if (dateTo && created > dateTo) return false
      }
      if (search) {
        const haystack = [
          task.taskId, task.FabricType, task.partyName, task.BuiltyNo, task.challanNo,
          subTask.subTaskId, subTask.program, subTask.jigarNo,
          submission.fabricPartyName, submission.recieverPartyName, submission.submitterName, submission.challanNo,
        ].map(v => String(v ?? '').toLowerCase()).join(' ')
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [rows, filters])

  const locationStatusOptions = [
    { value: '', label: 'All' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'missing', label: 'Missing' },
  ]

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
  }

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v && v.trim()).length

  function handlePreviewImage(path, alt) {
    if (!path) return
    let fullUrl = path
    if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
    setPreviewImageModal({ open: true, url: fullUrl, alt })
  }

  function handleClosePreviewImage() {
    setPreviewImageModal({ open: false, url: '', alt: '' })
  }

  function renderChallanPhotoLink(path, altLabel) {
    if (!path) return <span className="text-gray-400 text-xs">-</span>
    let fullUrl = path
    if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
    return (
      <button
        type="button"
        className="text-orange-600 underline underline-offset-2 font-medium text-xs px-0.5 hover:text-orange-700"
        style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
        onClick={() => handlePreviewImage(fullUrl, altLabel || 'Challan photo')}
        title="Preview Image"
      >
        Preview
      </button>
    )
  }

  function handleShowDetails(row) {
    setDetailModalRow(row)
    setShowSubmissionDetailModal(true)
  }

  if (!authenticated) {
    return <PasscodeGate onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full border-b-2 border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
            View Submissions
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="pt-6 sm:pt-10 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            View Submissions
          </h1>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">All submissions across all tasks, with filters.</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 md:px-6 sm:px-10 pb-6">

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-4 mt-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Submissions
              <span className="ml-2 text-sm font-medium text-gray-500">
                ({filteredRows.length} of {rows.length})
              </span>
            </h3>
            {loadingTasks && <span className="text-xs text-orange-600 animate-pulse">Loading...</span>}
          </div>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(s => !s)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-gray-300 hover:bg-gray-50 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 transition"
            >
              <RiFilterLine size={15} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-gray-200 hover:bg-gray-50 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-500 transition"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition"
              onClick={handleExportExcel}
              disabled={filteredRows.length === 0}
            >
              Export to Excel
            </button>

            <button
              type="button"
              onClick={loadTasks}
              className="flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition"
            >
              <RiRefreshLine size={15} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 mb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <FilterInput label="Search (any field)" value={filters.search} onChange={v => updateFilter('search', v)} placeholder="Search everything…" className="col-span-2 sm:col-span-1" />
            <FilterInput label="Task ID" value={filters.taskId} onChange={v => updateFilter('taskId', v)} />
            <FilterInput label="Fabric Type" value={filters.fabricType} onChange={v => updateFilter('fabricType', v)} />
            <FilterInput label="Party Name (Task)" value={filters.partyName} onChange={v => updateFilter('partyName', v)} />
            <FilterInput label="Program" value={filters.program} onChange={v => updateFilter('program', v)} />
            <FilterInput label="Fabric Party (Submission)" value={filters.fabricPartyName} onChange={v => updateFilter('fabricPartyName', v)} />
            <FilterInput label="Receiver Party" value={filters.recieverPartyName} onChange={v => updateFilter('recieverPartyName', v)} />
            <FilterInput label="Submitter Name" value={filters.submitterName} onChange={v => updateFilter('submitterName', v)} />
            <FilterInput label="Challan No" value={filters.challanNo} onChange={v => updateFilter('challanNo', v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Location Status</label>
              <select
                value={filters.locationStatus}
                onChange={e => updateFilter('locationStatus', e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
              >
                {locationStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => updateFilter('dateFrom', e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => updateFilter('dateTo', e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
              />
            </div>
          </div>
        )}

        {loadError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">
            {loadError}
          </div>
        )}

        {!loadingTasks && filteredRows.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white">
            <EmptyState icon="📭" text={rows.length === 0 ? 'No submissions found.' : 'No submissions match the current filters.'} />
          </div>
        )}

        {filteredRows.length > 0 && (
          <>
            {/* Mobile card list */}
            <div className="flex flex-col gap-3 lg:hidden">
              {filteredRows.map(row => {
                const { task, subTask, submission } = row
                const rate = getRateForRow(row)
                const amount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
                  ? (Number(submission.MTR) * rate).toFixed(2)
                  : null
                const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
                  ? computeL100(submission.MTR, submission.length, rate)
                  : null
                return (
                  <div key={row.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 font-mono text-xs">{task.taskId}</span>
                      <span className={'rounded-lg text-xs px-2 py-0.5 font-bold ' + (submission.locationStatus === 'missing' ? 'bg-red-300 text-red-900 border border-red-400' : 'bg-green-100 text-green-700 border border-green-200')}>
                        {submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs mb-3">
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">Party</div><div className="text-gray-800">{task.partyName ?? '-'}</div></div>
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">Program</div><div className="text-gray-800">{subTask.program ?? '-'}</div></div>
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">MTR</div><div className="text-gray-800">{submission.MTR ?? '-'}</div></div>
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">Amount</div><div className="font-bold text-orange-700">{amount != null ? `₹${amount}` : '-'}</div></div>
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">L100 Amount</div><div className="font-bold text-orange-700">{l100 ? `₹${l100.amount}` : '-'}</div></div>
                      <div><div className="text-gray-400 font-semibold uppercase text-[10px]">Challan No</div><div className="text-gray-800">{submission.challanNo ?? '-'}</div></div>
                    </div>
                    <button
                      className="w-full rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-2 transition"
                      onClick={() => handleShowDetails(row)}
                    >
                      View Details
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full min-w-[1400px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Task ID</Th>
                    <Th>Fabric Type</Th>
                    <Th>Party Name</Th>
                    <Th>SubTask ID</Th>
                    <Th>Program</Th>
                    <Th>Jigar No</Th>
                    <Th>Fabric Party</Th>
                    <Th>Receiver Party</Th>
                    <Th>Submitter</Th>
                    <Th>Sinkage %</Th>
                    <Th>Length</Th>
                    <Th>Rate</Th>
                    <Th>MTR</Th>
                    <Th highlight>Amount</Th>
                    <Th >Sub MTR (L100)</Th>
                    <Th highlight>L100 Amount</Th>
                    <Th>Challan No</Th>
                    <Th>Challan Photo</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(row => {
                    const { task, subTask, submission } = row
                    const sinkage = task?.sinkage
                    const rate = getRateForRow(row)
                    const subMTRL100 =
                      submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
                        ? (computeSubMTRL100(submission.MTR, submission.length))
                        : null

                    const amount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
                      ? (Number(submission.MTR) * rate).toFixed(2)
                      : null
                    const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
                      ? computeL100(submission.MTR, submission.length, rate)
                      : null

                    return (
                      <tr key={row.id} className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors">
                        <Td>
                          <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 font-mono text-xs">
                            {task.taskId}
                          </span>
                        </Td>
                        <Td>{task.FabricType ?? '-'}</Td>
                        <Td>{task.partyName ?? '-'}</Td>
                        <Td>
                          <span className="bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 font-mono text-xs">
                            {subTask.subTaskId ?? subTask._id ?? '-'}
                          </span>
                        </Td>
                        <Td>{subTask.program ?? '-'}</Td>
                        <Td>{subTask.jigarNo ?? '-'}</Td>
                        <Td>{submission.fabricPartyName ?? '-'}</Td>
                        <Td>{submission.recieverPartyName ?? '-'}</Td>
                        <Td>{submission.submitterName ?? '-'}</Td>
                        <Td>{sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '-'}</Td>
                        <Td>{submission.length ?? '-'}</Td>
                        <Td>{rate !== null && rate !== undefined ? <>₹ {Number(rate).toLocaleString()}</> : <span className="text-gray-300">-</span>}</Td>
                        <Td>{submission.MTR ?? '-'}</Td>
                        <Td highlight>{amount != null ? <>₹ {amount}</> : '-'}</Td>
                        <Td >
                          {subMTRL100 != null
                            ? Number(subMTRL100).toFixed(2)
                            : <span className="text-gray-300">-</span>
                          }
                        </Td>
                        <Td highlight>
                          {l100 ? (
                            <span>
                               ₹ {l100.amount}
                            </span>
                          ) : '-'}
                        </Td>
                        <Td>{submission.challanNo ?? '-'}</Td>
                        <Td>{renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ''}`)}</Td>
                        <Td>
                          <span className={'rounded-lg text-xs px-2 py-0.5 font-bold ' + (submission.locationStatus === 'missing' ? 'bg-red-300 text-red-900 border border-red-400' : 'bg-green-100 text-green-700 border border-green-200')}>
                            {submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'}
                          </span>
                        </Td>
                        <Td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}</Td>
                        <Td>
                          <button
                            className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
                            onClick={() => handleShowDetails(row)}
                          >
                            View
                          </button>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Submission Details Modal */}
        <Modal open={showSubmissionDetailModal} onClose={() => setShowSubmissionDetailModal(false)} width={480} title="Submission Details" showClose>
          {detailModalRow ? (
            (() => {
              const { task, subTask, submission, submissionIndex } = detailModalRow
              const sinkage = task?.sinkage

              const subMTRL100 =
                submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
                  ? (computeSubMTRL100(submission.MTR, submission.length))
                  : null

              const rate = getRateForRow(detailModalRow)
              const partyAmount = rate != null && submission?.MTR != null && !isNaN(Number(submission.MTR))
                ? (Number(submission.MTR) * rate).toFixed(2)
                : null
              const l100 = rate != null && submission?.MTR != null && submission?.length != null && !isNaN(Number(submission.MTR)) && !isNaN(Number(submission.length))
                ? computeL100(submission.MTR, submission.length, rate)
                : null

              return (
                <div className="py-1">
                  <div className="font-bold text-gray-900 mb-4 text-sm sm:text-base text-center">
                    SubTask{' '}
                    <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">
                      {subTask.subTaskId ?? subTask._id ?? '-'}
                    </span>
                    <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">
                      Submission #{submissionIndex + 1}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 py-4 flex flex-col gap-2.5 text-sm">
                    <div>
                      <span className="font-bold text-gray-500">Location Status: </span>
                      <span className={submission.locationStatus === 'missing' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                        {submission.locationStatus === 'missing' ? 'Missing' : 'Warehouse'}
                      </span>
                    </div>
                    <div><span className="font-bold text-gray-500">Fabric Party: </span><span className="text-gray-800">{submission.fabricPartyName ?? '-'}</span></div>
                    <div><span className="font-bold text-gray-500">Receiver Party: </span><span className="text-gray-800">{submission.recieverPartyName ?? '-'}</span></div>
                    <div><span className="font-bold text-gray-500">Submitter Name: </span><span className="text-gray-800">{submission.submitterName ?? '-'}</span></div>
                    <div>
                      <span className="font-bold text-gray-500">Sinkage %: </span>
                      <span className="text-gray-800">{sinkage != null && !isNaN(Number(sinkage)) ? `${sinkage}%` : '-'}</span>
                    </div>
                    <div><span className="font-bold text-gray-500">Length: </span><span className="text-gray-800">{submission.length ?? '-'}</span></div>
                    <div><span className="font-bold text-gray-500">MTR: </span><span className="text-gray-800">{submission.MTR ?? '-'}</span></div>
                    <div>
                      <span className="font-bold text-gray-500">Sub MTR (L100): </span>
                      <span className="text-gray-800">
                        {subMTRL100 != null
                          ? Number(subMTRL100).toFixed(2)
                          : '-'
                        }
                        {subMTRL100 != null &&
                          <span className="ml-2 text-gray-400 block sm:inline">(MTR - (100 - Length)%)</span>
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Amount: </span>
                      <span className="text-gray-800">
                        {partyAmount != null ? <>₹ {partyAmount}</> : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">L100 Submission Payment: </span>
                      <span className="text-gray-800">
                        {l100 ? (
                          <>
                            {l100.netLength}
                            <span className="ml-2 text-orange-800 font-semibold block sm:inline">(Amount: ₹ {l100.amount})</span>
                          </>
                        ) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Rate: </span>
                      <span className="text-gray-800">
                        {rate !== null && rate !== undefined ? <>₹ {Number(rate).toLocaleString()}</> : <span className="text-gray-300">-</span>}
                      </span>
                    </div>
                    <div><span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{submission.challanNo ?? '-'}</span></div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-500">Challan Photo: </span>
                      {renderChallanPhotoLink(submission.challanPhotoPath, 'Preview Challan')}
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Task ID: </span>
                      <span className="font-mono text-gray-800 flex items-center gap-1 flex-wrap">
                        {task?.taskId}
                        <button type="button" aria-label="Copy Task ID"
                          className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                          onClick={() => copyToClipboard(task?.taskId)}>Copy</button>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 gap-3">
                    <button type="button"
                      className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                      onClick={() => setShowSubmissionDetailModal(false)}>
                      <RiCloseLine size={16} /> Close
                    </button>
                  </div>
                </div>
              )
            })()
          ) : (
            <EmptyState icon="📭" text="No submission data found." />
          )}
        </Modal>

        {/* Challan preview modal */}
        <Modal open={previewImageModal.open} onClose={handleClosePreviewImage} width={480} title="Challan Photo Preview" showClose>
          <div className="p-3 sm:p-4 flex flex-col items-center gap-4">
            {previewImageModal.url ? (
              <img src={previewImageModal.url} alt={previewImageModal.alt || 'Challan photo'}
                className="max-w-full max-h-[50vh] sm:max-h-[400px] rounded-xl border border-orange-200 shadow"
                style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
                crossOrigin="anonymous" />
            ) : (
              <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

function FilterInput({ label, value, onChange, placeholder, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || `Filter ${label.toLowerCase()}…`}
        className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
      />
    </div>
  )
}

function Th({ children, highlight }) {
  return (
    <th className={`px-3 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${highlight ? 'text-orange-700' : 'text-gray-500'}`}>
      {children}
    </th>
  )
}

function Td({ children, highlight }) {
  return (
    <td className={`px-3 py-2 whitespace-nowrap ${highlight ? 'bg-orange-50/40' : ''}`}>
      {children}
    </td>
  )
}

export default SubmissionPayments