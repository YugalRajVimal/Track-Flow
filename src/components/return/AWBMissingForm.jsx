// /**
//  * AWBMissingForm.jsx
//  *
//  * Two-phase UI:
//  *   Phase 1 (upload)  – Channel Partner + Brand + Date Range + File → call /missing/preview
//  *   Phase 2 (confirm) – Show preview table → call /missing/save on confirm
//  */

// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import { useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
// import {
//   RiUpload2Line, RiLoader4Line, RiCheckDoubleLine,
//   RiCloseLine, RiAlertLine, RiFileExcelLine,
//   RiFileTextLine, RiArrowLeftLine, RiInformationLine,
//   RiBarcodeLine, RiQrScanLine,
// } from 'react-icons/ri'
// import { returnAPI } from '../../api/return'
// import { channelPartnersAPI, brandsAPI } from '../../api/services'
// import dayjs from 'dayjs'

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// const PARTNER_LABELS = {
//   flipkart: 'Flipkart',
//   meesho:   'Meesho',
//   myntra:   'Myntra',
//   website:  'Website (Excel)',
// }

// const PARTNER_COLORS = {
//   flipkart: 'bg-yellow-50 border-yellow-300 text-yellow-700',
//   meesho:   'bg-orange-50 border-orange-300 text-orange-700',
//   myntra:   'bg-pink-50   border-pink-300   text-pink-700',
//   website:  'bg-blue-50   border-blue-300   text-blue-700',
// }

// function FileIcon({ name }) {
//   if (!name) return <RiFileTextLine className="text-slate-400 text-2xl" />
//   const ext = name.split('.').pop().toLowerCase()
//   if (ext === 'xlsx' || ext === 'xls')
//     return <RiFileExcelLine className="text-emerald-500 text-2xl" />
//   return <RiFileTextLine className="text-blue-500 text-2xl" />
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Sub-components
// // ─────────────────────────────────────────────────────────────────────────────

// function PartnerBadge({ partner }) {
//   if (!partner) return null
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PARTNER_COLORS[partner] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
//       {PARTNER_LABELS[partner] || partner} format detected
//     </span>
//   )
// }

// function PreviewTable({ rows, partnerName }) {
//   if (!rows || rows.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
//         <RiCheckDoubleLine className="text-5xl text-emerald-400" />
//         <p className="text-base font-semibold text-emerald-600">No missing AWBs found!</p>
//         <p className="text-sm text-center">All AWBs in the file are already present in the database.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="overflow-x-auto rounded-xl border border-slate-200">
//       <table className="min-w-full text-sm">
//         <thead>
//           <tr className="bg-slate-50 border-b border-slate-200">
//             <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">AWB ID</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Missing At</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-100">
//           {rows.map((row, i) => (
//             <tr key={row.awbId} className="hover:bg-slate-50 transition-colors">
//               <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
//               <td className="px-4 py-3">
//                 <span className="font-mono text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg">
//                   {row.awbId}
//                 </span>
//               </td>
//               <td className="px-4 py-3 text-slate-600 text-xs">
//                 {row.missingAt ? dayjs(row.missingAt).format('MMM D, YYYY') : '—'}
//               </td>
//               <td className="px-4 py-3">
//                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
//                   <RiAlertLine className="shrink-0" />
//                   Missing
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ScanAlertBox component
// // ─────────────────────────────────────────────────────────────────────────────

// function ScanAlertBox({ scanInfo }) {
//   if (!scanInfo) return null
//   // Red for Meesho/QR, Blue for other/barcode
//   const boxClass =
//     scanInfo.type === 'qr'
//       ? 'bg-red-50 border border-red-300 text-red-700'
//       : 'bg-blue-50 border border-blue-300 text-blue-800'
//   const icon =
//     scanInfo.type === 'qr' ? (
//       <RiQrScanLine className="text-2xl mr-2 text-red-500" />
//     ) : (
//       <RiBarcodeLine className="text-2xl mr-2 text-blue-600" />
//     )
//   return (
//     <div className={`flex items-center gap-2 p-3 rounded mb-4 font-semibold ${boxClass}`}>
//       {icon}
//       <span>{scanInfo.label}</span>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main component
// // ─────────────────────────────────────────────────────────────────────────────

// export default function AWBMissingForm({ onSuccess }) {
//   // ── Shared state ──────────────────────────────────────────────────────────
//   const [partners, setPartners] = useState([])
//   const [brands, setBrands] = useState([])
//   const [loadingBrands, setLoadingBrands] = useState(false)
//   const [phase, setPhase] = useState('upload') // 'upload' | 'preview'

//   // ── Upload phase state ────────────────────────────────────────────────────
//   const [channelPartnerId, setChannelPartnerId] = useState('')
//   const [brandId, setBrandId] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [file, setFile] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const fileInputRef = useRef(null)

//   // ── Preview phase state ───────────────────────────────────────────────────
//   const [previewData, setPreviewData] = useState(null)   // { partner, totalInFile, missing[] }
//   const [saving, setSaving] = useState(false)

//   // ── Load channel partners ─────────────────────────────────────────────────
//   useEffect(() => {
//     channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
//   }, [])

//   // ── Load brands when channelPartnerId changes ─────────────────────────────
//   useEffect(() => {
//     if (!channelPartnerId) {
//       setBrands([]); setBrandId('');
//       return
//     }
//     setLoadingBrands(true)
//     brandsAPI
//       .listByPartner(channelPartnerId)
//       .then(r => {
//         setBrands(r.data?.data || [])
//         setBrandId('')
//       })
//       .finally(() => setLoadingBrands(false))
//   }, [channelPartnerId])

//   // ── File selection ────────────────────────────────────────────────────────
//   const handleFileDrop = (e) => {
//     e.preventDefault()
//     const dropped = e.dataTransfer?.files?.[0]
//     if (dropped) validateAndSetFile(dropped)
//   }

//   const handleFileChange = (e) => {
//     const chosen = e.target.files?.[0]
//     if (chosen) validateAndSetFile(chosen)
//     // reset input so the same file can be re-selected after clearing
//     if (fileInputRef.current) fileInputRef.current.value = ''
//   }

//   const validateAndSetFile = (f) => {
//     const ext = f.name.split('.').pop().toLowerCase()
//     if (!['csv', 'xls', 'xlsx'].includes(ext)) {
//       toast.error('Only CSV, XLS, or XLSX files are supported.')
//       return
//     }
//     if (f.size > 10 * 1024 * 1024) {
//       toast.error('File size exceeds 10 MB.')
//       return
//     }
//     setFile(f)
//   }

//   // ── Scan Info logic
//   let scanInfo = null
//   let selectedPartnerObj = partners.find(p => p._id === channelPartnerId)
//   if (selectedPartnerObj) {
//     if (
//       selectedPartnerObj.name?.toLowerCase().includes('meesho')
//     ) {
//       scanInfo = {
//         type: 'qr',
//         label: 'MEESHO: Scan only Packet QR Code.',
//       }
//     } else {
//       scanInfo = {
//         type: 'barcode',
//         label: 'Scan only Label Barcode.',
//       }
//     }
//   }

//   // ── Phase 1: Preview ──────────────────────────────────────────────────────
//   const handlePreview = async () => {
//     if (!channelPartnerId) { toast.error('Please select a Channel Partner.'); return }
//     if (!brandId) { toast.error('Please select a Brand.'); return }
//     if (!startDate || !endDate) { toast.error('Please enter both Start and End dates.'); return }
//     if (new Date(startDate) > new Date(endDate)) { toast.error('Start date cannot be after end date.'); return }
//     if (!file) { toast.error('Please upload a CSV or Excel file.'); return }

//     setLoading(true)
//     try {
//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('channelPartnerId', channelPartnerId)
//       formData.append('brandId', brandId)
//       formData.append('startDate', startDate)
//       formData.append('endDate', endDate)

//       const res = await returnAPI.previewMissing(formData)
//       if (res.data?.success) {
//         setPreviewData(res.data.data)
//         setPhase('preview')
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Preview failed. Check the file format.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── Phase 2: Save ─────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!previewData?.missing?.length) {
//       toast('No missing AWBs to save.', { icon: 'ℹ️' })
//       return
//     }

//     setSaving(true)
//     try {
//       const res = await returnAPI.saveMissing(previewData.missing)
//       if (res.data?.success) {
//         toast.success(res.data.message || 'Missing AWBs saved successfully.')
//         onSuccess?.()
//         resetAll()
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Save failed. Please try again.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const resetAll = () => {
//     setPhase('upload')
//     setPreviewData(null)
//     setFile(null)
//     setChannelPartnerId('')
//     setBrandId('')
//     setStartDate('')
//     setEndDate('')
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // Render helpers
//   // ─────────────────────────────────────────────────────────────────────────

//   const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder-slate-400 disabled:opacity-60'
//   const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

//   // ─── PHASE 1: Upload form ─────────────────────────────────────────────────
//   if (phase === 'upload') {
//     return (
//       <div className="space-y-5 w-full">

//         {/* Info banner */}
//         <div className="flex gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
//           <RiInformationLine className="text-blue-500 text-xl shrink-0 mt-0.5" />
//           <div className="text-xs text-blue-700 space-y-1">
//             <p className="font-semibold">How this works:</p>
//             <p>Upload a Flipkart CSV, Meesho CSV, Myntra CSV, or Website Excel. The system will compare AWB IDs in the file against scanned records in the selected date range and flag any that are missing.</p>
//           </div>
//         </div>

//         {/* Scan Alert Box */}
//         <ScanAlertBox scanInfo={scanInfo} />

//         {/* Channel Partner */}
//         <div>
//           <label className={labelCls}>Channel Partner *</label>
//           <select
//             value={channelPartnerId}
//             onChange={e => setChannelPartnerId(e.target.value)}
//             className={inputCls}
//             disabled={loading}
//           >
//             <option value="">Select channel partner...</option>
//             {partners.map(p => (
//               <option key={p._id} value={p._id}>{p.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* Brand */}
//         <div>
//           <label className={labelCls}>Brand *</label>
//           <select
//             value={brandId}
//             onChange={e => setBrandId(e.target.value)}
//             className={inputCls}
//             disabled={!channelPartnerId || loadingBrands || loading}
//           >
//             <option value="">
//               {!channelPartnerId
//                 ? 'Select partner first...'
//                 : loadingBrands
//                 ? 'Loading brands...'
//                 : 'Select brand...'}
//             </option>
//             {brands.map(b => (
//               <option key={b._id} value={b._id}>{b.name}</option>
//             ))}
//           </select>
//         </div>

//         {/* Date Range */}
//         <div>
//           <label className={labelCls}>Date Range (Scanned At) *</label>
//           <div className="flex items-center gap-2">
//             <input
//               type="date"
//               value={startDate}
//               onChange={e => setStartDate(e.target.value)}
//               className={inputCls}
//               disabled={loading}
//             />
//             <span className="text-slate-400 text-sm shrink-0">to</span>
//             <input
//               type="date"
//               value={endDate}
//               onChange={e => setEndDate(e.target.value)}
//               className={inputCls}
//               disabled={loading}
//             />
//           </div>
//         </div>

//         {/* File Upload */}
//         <div>
//           <label className={labelCls}>Upload File (CSV / XLS / XLSX) *</label>

//           {file ? (
//             /* File selected — show chip */
//             <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
//               <FileIcon name={file.name} />
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
//                 <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setFile(null)}
//                 className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
//                 disabled={loading}
//               >
//                 <RiCloseLine />
//               </button>
//             </div>
//           ) : (
//             /* Drop zone */
//             <div
//               onDragOver={e => e.preventDefault()}
//               onDrop={handleFileDrop}
//               onClick={() => fileInputRef.current?.click()}
//               className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
//             >
//               <RiUpload2Line className="text-3xl text-slate-300" />
//               <p className="text-sm text-slate-500 font-medium">Click or drag & drop</p>
//               <p className="text-xs text-slate-400">CSV · XLS · XLSX — max 10 MB</p>
//             </div>
//           )}

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".csv,.xls,.xlsx"
//             className="hidden"
//             onChange={handleFileChange}
//             disabled={loading}
//           />
//         </div>

//         {/* Supported formats note */}
//         <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 space-y-1.5">
//           <p className="font-semibold text-slate-600">Supported file formats:</p>
//           <ul className="space-y-1 list-none pl-0">
//             <li><span className="font-medium text-yellow-700">Flipkart CSV</span> — column: <code className="bg-slate-100 px-1 rounded">Tracking ID</code></li>
//             <li><span className="font-medium text-orange-700">Meesho CSV</span> — column: <code className="bg-slate-100 px-1 rounded">Packet Id</code> (only SHIPPED rows)</li>
//             <li><span className="font-medium text-pink-700">Myntra CSV</span> — column: <code className="bg-slate-100 px-1 rounded">AWB Number</code></li>
//             <li><span className="font-medium text-blue-700">Website Excel</span> — sheet: <code className="bg-slate-100 px-1 rounded">AWB wise Details</code>, column: <code className="bg-slate-100 px-1 rounded">AWB NO.</code></li>
//           </ul>
//         </div>

//         {/* Submit */}
//         <button
//           type="button"
//           onClick={handlePreview}
//           disabled={loading}
//           className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <><RiLoader4Line className="animate-spin" /> Analysing file...</>
//           ) : (
//             <><RiAlertLine /> Find Missing AWBs</>
//           )}
//         </button>
//       </div>
//     )
//   }

//   // ─── PHASE 2: Preview + Confirm ───────────────────────────────────────────
//   const missingCount  = previewData?.missing?.length  ?? 0
//   const totalInFile   = previewData?.totalInFile ?? 0
//   const foundCount    = totalInFile - missingCount
//   const partnerLabel  = PARTNER_LABELS[previewData?.partner] || previewData?.partner || '—'
//   const cpName        = partners.find(p => p._id === channelPartnerId)?.name || channelPartnerId
//   const brandName     = brands.find(b => b._id === brandId)?.name || brandId

//   return (
//     <div className="space-y-5 w-full">

//       {/* Back button */}
//       <button
//         type="button"
//         onClick={resetAll}
//         className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
//         disabled={saving}
//       >
//         <RiArrowLeftLine />
//         Back to upload
//       </button>

//       {/* Scan Alert Box */}
//       <ScanAlertBox scanInfo={scanInfo} />

//       {/* Summary banner */}
//       <div className={`rounded-xl border p-4 space-y-2 ${missingCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
//         <div className="flex items-start justify-between gap-4 flex-wrap">
//           <div>
//             <p className={`font-bold text-lg ${missingCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
//               {missingCount > 0
//                 ? `${missingCount} Missing AWB${missingCount !== 1 ? 's' : ''} Found`
//                 : 'All AWBs Accounted For'}
//             </p>
//             <p className="text-xs text-slate-500 mt-0.5">
//               {totalInFile} AWBs in file · {foundCount} already in DB · {missingCount} missing
//             </p>
//           </div>
//           <PartnerBadge partner={previewData?.partner} />
//         </div>

//         <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
//           <span><span className="font-medium">Partner:</span> {cpName}</span>
//           <span><span className="font-medium">Brand:</span> {brandName}</span>
//           <span><span className="font-medium">Date range:</span> {dayjs(startDate).format('MMM D')} – {dayjs(endDate).format('MMM D, YYYY')}</span>
//           <span><span className="font-medium">Source:</span> {partnerLabel}</span>
//           <span><span className="font-medium">File:</span> {file?.name}</span>
//         </div>
//       </div>

//       {/* Preview table */}
//       <PreviewTable rows={previewData?.missing} partnerName={partnerLabel} />

//       {/* Action buttons */}
//       {missingCount > 0 && (
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={resetAll}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-60"
//           >
//             <RiCloseLine />
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {saving ? (
//               <><RiLoader4Line className="animate-spin" /> Saving...</>
//             ) : (
//               <><RiCheckDoubleLine /> Confirm & Save {missingCount} Record{missingCount !== 1 ? 's' : ''}</>
//             )}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

/**
 * AWBMissingForm.jsx
 *
 * Two-phase UI:
 *   Phase 1 (upload)  – Channel Partner + Brand + Date Range + File → call /missing/preview
 *   Phase 2 (confirm) – Show preview table → call /missing/save on confirm
 */

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  RiUpload2Line, RiLoader4Line, RiCheckDoubleLine,
  RiCloseLine, RiAlertLine, RiFileExcelLine,
  RiFileTextLine, RiArrowLeftLine, RiInformationLine,
  RiQrScanLine, RiBarcodeLine,
} from 'react-icons/ri'
import { returnAPI } from '../../api/return'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import dayjs from 'dayjs'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PARTNER_LABELS = {
  flipkart: 'Flipkart',
  meesho:   'Meesho',
  myntra:   'Myntra',
  website:  'Website (Excel)',
}

const PARTNER_COLORS = {
  flipkart: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  meesho:   'bg-orange-50 border-orange-300 text-orange-700',
  myntra:   'bg-pink-50   border-pink-300   text-pink-700',
  website:  'bg-blue-50   border-blue-300   text-blue-700',
}

function FileIcon({ name }) {
  if (!name) return <RiFileTextLine className="text-slate-400 text-2xl" />
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'xlsx' || ext === 'xls')
    return <RiFileExcelLine className="text-emerald-500 text-2xl" />
  return <RiFileTextLine className="text-blue-500 text-2xl" />
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function PartnerBadge({ partner }) {
  if (!partner) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PARTNER_COLORS[partner] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
      {PARTNER_LABELS[partner] || partner} format detected
    </span>
  )
}

function PreviewTable({ rows, partnerName }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
        <RiCheckDoubleLine className="text-5xl text-emerald-400" />
        <p className="text-base font-semibold text-emerald-600">No missing AWBs found!</p>
        <p className="text-sm text-center">All AWBs in the file are already present in the database.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">AWB ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Missing At</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={row.awbId} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg">
                  {row.awbId}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs">
                {row.missingAt ? dayjs(row.missingAt).format('MMM D, YYYY') : '—'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                  <RiAlertLine className="shrink-0" />
                  Missing
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ScanAlertBox component (custom alert for scan type/info)
// ─────────────────────────────────────────────────────────────────────────────

function ScanAlertBox({ scanInfo }) {
  if (!scanInfo) return null
  // Red for Meesho/QR, Blue for other/barcode
  const boxClass = scanInfo.type === 'qr'
    ? 'bg-red-50 border border-red-300 text-red-700'
    : 'bg-blue-50 border border-blue-300 text-blue-800'

  const icon = scanInfo.type === 'qr' ? (
    <RiQrScanLine className="text-2xl mr-2 text-red-500" />
  ) : (
    <RiBarcodeLine className="text-2xl mr-2 text-blue-600" />
  )

  return (
    <div className={`flex items-center gap-2 p-3 rounded mb-4 font-semibold ${boxClass}`}>
      {icon}
      <span>{scanInfo.label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AWBMissingForm({ onSuccess }) {
  // ── Shared state ──────────────────────────────────────────────────────────
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [phase, setPhase] = useState('upload') // 'upload' | 'preview'

  // ── Upload phase state ────────────────────────────────────────────────────
  const [channelPartnerId, setChannelPartnerId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // ── Preview phase state ───────────────────────────────────────────────────
  const [previewData, setPreviewData] = useState(null)   // { partner, totalInFile, missing[] }
  const [saving, setSaving] = useState(false)

  // ── Save date range locally for passing to save API ───────────────────────
  // We need to keep the date range that was used for preview so it doesn't get reset by state changes before save
  const [savedPreviewDates, setSavedPreviewDates] = useState({ startDate: '', endDate: '' })

  // ── Load channel partners ─────────────────────────────────────────────────
  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
  }, [])

  // ── Load brands when channelPartnerId changes ─────────────────────────────
  useEffect(() => {
    if (!channelPartnerId) {
      setBrands([]); setBrandId('');
      return
    }
    setLoadingBrands(true)
    brandsAPI
      .listByPartner(channelPartnerId)
      .then(r => {
        setBrands(r.data?.data || [])
        setBrandId('')
      })
      .finally(() => setLoadingBrands(false))
  }, [channelPartnerId])

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped) validateAndSetFile(dropped)
  }

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0]
    if (chosen) validateAndSetFile(chosen)
    // reset input so the same file can be re-selected after clearing
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv', 'xls', 'xlsx'].includes(ext)) {
      toast.error('Only CSV, XLS, or XLSX files are supported.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB.')
      return
    }
    setFile(f)
  }

  // ── Scan Alert Info Calculation ──────────────────────────────────────────
  let scanInfo = null
  const selectedPartnerObj = partners.find(p => p._id === channelPartnerId)
  if (selectedPartnerObj) {
    if (
      selectedPartnerObj.name?.toLowerCase().includes('meesho')
    ) {
      scanInfo = {
        type: 'qr',
        label: 'MEESHO: Scan only Packet QR Code.',
      }
    } else {
      scanInfo = {
        type: 'barcode',
        label: 'Scan only Label Barcode.',
      }
    }
  }

  // ── Phase 1: Preview ──────────────────────────────────────────────────────
  const handlePreview = async () => {
    if (!channelPartnerId) { toast.error('Please select a Channel Partner.'); return }
    if (!brandId) { toast.error('Please select a Brand.'); return }
    if (!startDate || !endDate) { toast.error('Please enter both Start and End dates.'); return }
    if (new Date(startDate) > new Date(endDate)) { toast.error('Start date cannot be after end date.'); return }
    if (!file) { toast.error('Please upload a CSV or Excel file.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('channelPartnerId', channelPartnerId)
      formData.append('brandId', brandId)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)

      const res = await returnAPI.previewMissing(formData)
      // Instead of only saving previewData, also save used date range for preview "from" and "to"
      if (res.data?.success) {
        setPreviewData({
          ...res.data.data,
          missingFromDate: startDate,
          missingToDate: endDate,
        })
        setSavedPreviewDates({ startDate, endDate })
        setPhase('preview')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Preview failed. Check the file format.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phase 2: Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Send required payload: rows, missingFromDate, missingToDate (see instructions)
    // rows = previewData?.missing; missingFromDate, missingToDate saved
    if (!previewData?.missing?.length) {
      toast('No missing AWBs to save.', { icon: 'ℹ️' })
      return
    }
    setSaving(true)
    try {
      
      const savePayload = {
        rows: previewData.missing, // rows = missing
        missingFromDate: previewData.missingFromDate || savedPreviewDates.startDate,
        missingToDate: previewData.missingToDate || savedPreviewDates.endDate,
      }
      console.log(savePayload)
      const res = await returnAPI.saveMissing(savePayload)

      if (res.data?.success) {
        toast.success(res.data.message || 'Missing AWBs saved successfully.')
        if (typeof onSuccess === 'function') onSuccess()
        resetAll()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed. Please try again. ')
    } finally {
      setSaving(false)
    }
  }

  const resetAll = () => {
    setPhase('upload')
    setPreviewData(null)
    setFile(null)
    setChannelPartnerId('')
    setBrandId('')
    setStartDate('')
    setEndDate('')
    setSavedPreviewDates({ startDate: '', endDate: '' })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder-slate-400 disabled:opacity-60'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

  // ─── PHASE 1: Upload form ─────────────────────────────────────────────────
  if (phase === 'upload') {
    return (
      <div className="space-y-5 w-full">

        {/* Info banner */}
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
          <RiInformationLine className="text-blue-500 text-xl shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-semibold">How this works:</p>
            <p>Upload a Flipkart CSV, Meesho CSV, Myntra CSV, or Website Excel. The system will compare AWB IDs in the file against scanned records in the selected date range and flag any that are missing.</p>
          </div>
        </div>



        {/* Channel Partner */}
        <div>
          <label className={labelCls}>Channel Partner *</label>
          <select
            value={channelPartnerId}
            onChange={e => setChannelPartnerId(e.target.value)}
            className={inputCls}
            disabled={loading}
          >
            <option value="">Select channel partner...</option>
            {partners.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className={labelCls}>Brand *</label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className={inputCls}
            disabled={!channelPartnerId || loadingBrands || loading}
          >
            <option value="">
              {!channelPartnerId
                ? 'Select partner first...'
                : loadingBrands
                  ? 'Loading brands...'
                  : 'Select brand...'}
            </option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className={labelCls}>Date Range (Scanned At) *</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={inputCls}
              disabled={loading}
            />
            <span className="text-slate-400 text-sm shrink-0">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputCls}
              disabled={loading}
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className={labelCls}>Upload File (CSV / XLS / XLSX) *</label>

          {file ? (
            /* File selected — show chip */
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
              <FileIcon name={file.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                disabled={loading}
              >
                <RiCloseLine />
              </button>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <RiUpload2Line className="text-3xl text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">Click or drag & drop</p>
              <p className="text-xs text-slate-400">CSV · XLS · XLSX — max 10 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* Supported formats note */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 space-y-1.5">
          <p className="font-semibold text-slate-600">Supported file formats:</p>
          <ul className="space-y-1 list-none pl-0">
            <li><span className="font-medium text-yellow-700">Flipkart CSV</span> — column: <code className="bg-slate-100 px-1 rounded">Tracking ID</code></li>
            <li><span className="font-medium text-orange-700">Meesho CSV</span> — column: <code className="bg-slate-100 px-1 rounded">Packet Id</code> (only SHIPPED rows)</li>
            <li><span className="font-medium text-pink-700">Myntra CSV</span> — column: <code className="bg-slate-100 px-1 rounded">AWB Number</code></li>
            <li><span className="font-medium text-blue-700">Website Excel</span> — sheet: <code className="bg-slate-100 px-1 rounded">AWB wise Details</code>, column: <code className="bg-slate-100 px-1 rounded">AWB NO.</code></li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RiLoader4Line className="animate-spin" /> Analysing file...</>
          ) : (
            <><RiAlertLine /> Find Missing AWBs</>
          )}
        </button>
      </div>
    )
  }

  // ─── PHASE 2: Preview + Confirm ───────────────────────────────────────────
  const missingCount = previewData?.missing?.length ?? 0
  const totalInFile = previewData?.totalInFile ?? 0
  const foundCount = totalInFile - missingCount
  const partnerLabel = PARTNER_LABELS[previewData?.partner] || previewData?.partner || '—'
  const cpName = partners.find(p => p._id === channelPartnerId)?.name || channelPartnerId
  const brandName = brands.find(b => b._id === brandId)?.name || brandId

  // Scan Alert Info for Preview Phase (Try to use preview partner if found, else selected partner)
  let previewScanInfo = null
  let previewPartnerName = previewData?.partner || ''
  let previewPartnerObj = partners.find(
    p =>
      p.name?.toLowerCase() === previewPartnerName?.toLowerCase() ||
      p._id === channelPartnerId
  )
  if (previewPartnerObj) {
    if (previewPartnerObj.name?.toLowerCase().includes('meesho')) {
      previewScanInfo = {
        type: 'qr',
        label: 'MEESHO: Scan only Packet QR Code.',
      }
    } else {
      previewScanInfo = {
        type: 'barcode',
        label: 'Scan only Label Barcode.',
      }
    }
  }

  // The date range used for preview should always show the saved preview dates in phase 2
  // Fallback to startDate/endDate in case of manual navigation bugs (shouldn't happen)
  const displayStartDate = previewData?.missingFromDate || savedPreviewDates.startDate || startDate
  const displayEndDate = previewData?.missingToDate || savedPreviewDates.endDate || endDate

  return (
    <div className="space-y-5 w-full">

      {/* Back button */}
      <button
        type="button"
        onClick={resetAll}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        disabled={saving}
      >
        <RiArrowLeftLine />
        Back to upload
      </button>

      {/* Scan Alert Box */}
      <ScanAlertBox scanInfo={previewScanInfo} />

      {/* Summary banner */}
      <div className={`rounded-xl border p-4 space-y-2 ${missingCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className={`font-bold text-lg ${missingCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {missingCount > 0
                ? `${missingCount} Missing AWB${missingCount !== 1 ? 's' : ''} Found`
                : 'All AWBs Accounted For'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalInFile} AWBs in file · {foundCount} already in DB · {missingCount} missing
            </p>
          </div>
          <PartnerBadge partner={previewData?.partner} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
          <span><span className="font-medium">Partner:</span> {cpName}</span>
          <span><span className="font-medium">Brand:</span> {brandName}</span>
          <span><span className="font-medium">Date range:</span> {dayjs(displayStartDate).format('MMM D')} – {dayjs(displayEndDate).format('MMM D, YYYY')}</span>
          <span><span className="font-medium">Source:</span> {partnerLabel}</span>
          <span><span className="font-medium">File:</span> {file?.name}</span>
        </div>
      </div>

      {/* Preview table */}
      <PreviewTable rows={previewData?.missing} partnerName={partnerLabel} />

      {/* Action buttons */}
      {missingCount > 0 && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetAll}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <RiCloseLine />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><RiLoader4Line className="animate-spin" /> Saving...</>
            ) : (
              <><RiCheckDoubleLine /> Confirm & Save {missingCount} Record{missingCount !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}