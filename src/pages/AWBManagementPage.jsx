// import React, { useState, useEffect, useCallback } from 'react'
// import { motion } from 'framer-motion'
// import toast from 'react-hot-toast'
// import dayjs from 'dayjs'
// import {
//   RiBarcodeLine, RiCloseCircleLine, RiDeleteBinLine,
//   RiEyeLine, RiLoader4Line
// } from 'react-icons/ri'
// import { awbAPI } from '../api/awb'
// import { DataTable, Pagination } from '../components/common/DataTable'
// import StatusBadge from '../components/common/StatusBadge'
// import ConfirmDialog from '../components/common/ConfirmDialog'
// import Modal from '../components/common/Modal'
// import AWBScanForm from '../components/awb/AWBScanForm'
// import AWBCancelForm from '../components/awb/AWBCancelForm'
// import AWBFilterBar from '../components/awb/AWBFilterBar'

// // --- Light theme color palette overrides ---
// const textDark = 'text-slate-800'
// const textSubtle = 'text-slate-500'
// const borderLight = 'border-slate-200'
// const bgLight = 'bg-white'
// const bgHighlight = 'bg-blue-50'
// const accent = 'text-blue-600'
// const accentBorder = 'border-blue-400'
// const cardShadow = 'shadow'
// const cardBorder = 'border border-slate-200'

// // ------------------------------------------------

// const TABS = [
//   { id: 'scan', label: 'Scan AWB', icon: RiBarcodeLine },
//   { id: 'cancel', label: 'Cancel AWB', icon: RiCloseCircleLine },
// ]

// export default function AWBManagementPage() {
//   const [activeTab, setActiveTab] = useState('scan')
//   const [awbs, setAwbs] = useState([])
//   const [pagination, setPagination] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
//   const [deleteItem, setDeleteItem] = useState(null)
//   const [deleting, setDeleting] = useState(false)
//   const [viewItem, setViewItem] = useState(null)

//   const fetchAWBs = useCallback(async () => {
//     setLoading(true)
//     try {
//       const res = await awbAPI.list(filters)
//       if (res.data?.success) {

//         setAwbs(res.data.data || [])
//         setPagination(res.data.pagination || null)
//       }
//     } catch {
//       toast.error('Failed to load AWB records')
//     } finally {
//       setLoading(false)
//     }
//   }, [filters])

//   useEffect(() => { fetchAWBs() }, [fetchAWBs])

//   const handleFilterChange = (updates) => {
//     setFilters(prev => ({ ...prev, ...updates }))
//   }

//   const handleDelete = async () => {
//     if (!deleteItem) return
//     setDeleting(true)
//     try {
//       await awbAPI.delete(deleteItem._id)
//       toast.success('AWB deleted')
//       fetchAWBs()
//     } catch {
//       toast.error('Delete failed')
//     } finally {
//       setDeleting(false)
//       setDeleteItem(null)
//     }
//   }

//   const columns = [
//     {
//       key: 'channelPartner',
//       label: 'Channel Partner',
//       render: (val) => val?.name || '—',
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'brand',
//       label: 'Brand',
//       render: (val) => val?.name || '—',
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'awbId',
//       label: 'AWB ID',
//       render: (val) => (
//         <span className={`font-mono ${accent} text-xs ${bgHighlight} px-2 py-1 rounded-lg border ${accentBorder}/30`}>
//           {val}
//         </span>
//       ),
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (val) => <StatusBadge status={val} />,
//       headerClass: textSubtle,
//     },
//     {
//       key: 'scannedAt',
//       label: 'Date',
//       render: (val) => val ? dayjs(val).format('MMM D, YYYY') : '—',
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'scannedAt',
//       label: 'Time',
//       render: (val) => val ? dayjs(val).format('HH:mm:ss') : '—',
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'createdBy',
//       label: 'Created By',
//       render: (val) => val?.name || '—',
//       headerClass: textSubtle,
//       cellClass: textDark,
//     },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (_, row) => (
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setViewItem(row)}
//             className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
//             title="View"
//           >
//             <RiEyeLine />
//           </button>
//           <button
//             onClick={() => setDeleteItem(row)}
//             className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
//             title="Delete"
//           >
//             <RiDeleteBinLine />
//           </button>
//         </div>
//       ),
//       headerClass: textSubtle,
//     },
//   ]

//   return (
//     <div className={`${bgLight} min-h-[100svh] py-4`}>
//       <ConfirmDialog
//         open={!!deleteItem}
//         onClose={() => setDeleteItem(null)}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Delete AWB"
//         message={`Delete AWB "${deleteItem?.awbId}"? This cannot be undone.`}
//       />

//       {/* View Modal */}
//       <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="AWB Details">
//         {viewItem && (
//           <div className="space-y-3">
//             {[
//               ['AWB ID', viewItem.awbId, `font-mono ${accent}`],
//               ['Status', null, '', <StatusBadge status={viewItem.status} />],
//               ['Channel Partner', viewItem.channelPartner?.name],
//               ['Brand', viewItem.brand?.name],
//               ['Scanned At', viewItem.scannedAt ? dayjs(viewItem.scannedAt).format('MMM D, YYYY HH:mm:ss') : '—'],
//               ['Created By', viewItem.createdBy?.name],
//             ].map(([label, val, cls, custom]) => (
//               <div key={label} className={`flex justify-between items-center py-2 border-b ${borderLight} last:border-0`}>
//                 <span className={`text-sm ${textSubtle}`}>{label}</span>
//                 {custom || <span className={`text-sm ${textDark} ${cls}`}>{val || '—'}</span>}
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>

//       <div className="space-y-6 animate-fade-in">
//         {/* Header */}
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <div>
//             <h1 className={`${textDark} text-2xl font-bold tracking-tight`}>AWB Management</h1>
//             <p className={`${textSubtle} text-sm mt-1`}>Scan, track, and manage AWB barcodes</p>
//           </div>
//         </div>

//         {/* Two-column layout */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//           {/* Left: Scan/Cancel panel */}
//           <div className={`${bgLight} ${cardBorder} ${cardShadow} rounded-xl overflow-hidden`}>
//             {/* Tabs */}
//             <div className={`flex border-b ${borderLight} bg-slate-50`}>
//               {TABS.map(({ id, label, icon: Icon }) => (
//                 <button
//                   key={id}
//                   onClick={() => setActiveTab(id)}
//                   className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all border-b-2 ${
//                     activeTab === id
//                       ? 'text-blue-600 border-blue-600 bg-blue-50'
//                       : `${textSubtle} hover:text-blue-600 border-transparent hover:bg-blue-50`
//                   }`}
//                   style={{ outline: "none" }}
//                 >
//                   <Icon />
//                   {label}
//                 </button>
//               ))}
//             </div>

//             <div className="p-5">
//               {activeTab === 'scan' ? (
//                 <AWBScanForm onSuccess={fetchAWBs} />
//               ) : (
//                 <AWBCancelForm onSuccess={fetchAWBs} />
//               )}
//             </div>
//           </div>

//           {/* Right: Table */}
//           <div className={`xl:col-span-2 ${bgLight} ${cardShadow} ${cardBorder} rounded-xl overflow-hidden`}>
//             <div className={`p-5 border-b ${borderLight} bg-slate-50`}>
//               <h2 className={`${textDark} text-lg font-semibold mb-4`}>AWB Records</h2>
//               <AWBFilterBar
//                 filters={filters}
//                 onChange={handleFilterChange}
//                 onRefresh={fetchAWBs}
//               />
//             </div>

//             <div className="p-5">
//               <DataTable
//                 columns={columns}
//                 data={awbs}
//                 loading={loading}
//                 emptyMessage="No AWB records found"
//               />
//               <Pagination
//                 pagination={pagination}
//                 onChange={(page) => handleFilterChange({ page })}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import {
  RiBarcodeLine, RiCloseCircleLine, RiDeleteBinLine,
  RiEyeLine, RiLoader4Line, RiAlertLine,
} from 'react-icons/ri'
import { awbAPI } from '../api/awb'
import { DataTable, Pagination } from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import AWBScanForm from '../components/awb/AWBScanForm'
import AWBCancelForm from '../components/awb/AWBCancelForm'
import AWBFilterBar from '../components/awb/AWBFilterBar'
import AWBMissingForm from '../components/awb/AWBMissingForm'

// --- Light theme color palette overrides ---
const textDark = 'text-slate-800'
const textSubtle = 'text-slate-500'
const borderLight = 'border-slate-200'
const bgLight = 'bg-white'
const bgHighlight = 'bg-blue-50'
const accent = 'text-blue-600'
const accentBorder = 'border-blue-400'
const cardShadow = 'shadow'
const cardBorder = 'border border-slate-200'

// ─────────────────────────────────────────────────────────────────────────────
// Tabs — added "Missing AWB"
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'scan',    label: 'Scan AWB',    icon: RiBarcodeLine },
  { id: 'cancel',  label: 'Cancel AWB',  icon: RiCloseCircleLine },
  { id: 'missing', label: 'Missing AWB', icon: RiAlertLine },
]

// Per-tab accent colours so the active indicator matches the operation
const TAB_ACTIVE_CLASSES = {
  scan:    'text-blue-600  border-blue-600  bg-blue-50',
  cancel:  'text-red-600   border-red-600   bg-red-50',
  missing: 'text-amber-600 border-amber-600 bg-amber-50',
}

const TAB_HOVER_CLASSES = {
  scan:    'hover:text-blue-600  hover:bg-blue-50',
  cancel:  'hover:text-red-600   hover:bg-red-50',
  missing: 'hover:text-amber-600 hover:bg-amber-50',
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AWBManagementPage() {
  const [activeTab, setActiveTab] = useState('scan')
  const [awbs, setAwbs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewItem, setViewItem] = useState(null)

  const fetchAWBs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await awbAPI.list(filters)
      if (res.data?.success) {
        setAwbs(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch {
      toast.error('Failed to load AWB records')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchAWBs() }, [fetchAWBs])

  const handleFilterChange = (updates) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      await awbAPI.delete(deleteItem._id)
      toast.success('AWB deleted')
      fetchAWBs()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
      setDeleteItem(null)
    }
  }

  const columns = [
    {
      key: 'channelPartner',
      label: 'Channel Partner',
      render: (val) => val?.name || '—',
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (val) => val?.name || '—',
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'awbId',
      label: 'AWB ID',
      render: (val) => (
        <span className={`font-mono ${accent} text-xs ${bgHighlight} px-2 py-1 rounded-lg border ${accentBorder}/30`}>
          {val}
        </span>
      ),
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
      headerClass: textSubtle,
    },
    {
      key: 'scannedAt',
      label: 'Date',
      render: (val) => val ? dayjs(val).format('MMM D, YYYY') : '—',
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'scannedAt',
      label: 'Time',
      render: (val) => val ? dayjs(val).format('HH:mm:ss') : '—',
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (val) => val?.name || '—',
      headerClass: textSubtle,
      cellClass: textDark,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewItem(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
            title="View"
          >
            <RiEyeLine />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
            title="Delete"
          >
            <RiDeleteBinLine />
          </button>
        </div>
      ),
      headerClass: textSubtle,
    },
  ]

  // ── View modal detail rows ────────────────────────────────────────────────
  const viewDetails = viewItem
    ? [
        ['AWB ID',          viewItem.awbId,                                              `font-mono ${accent}`],
        ['Status',          null,                                                         '',               <StatusBadge status={viewItem.status} />],
        ['Channel Partner', viewItem.channelPartner?.name],
        ['Brand',           viewItem.brand?.name || 'N/A'],
        ['Scanned At',      viewItem.scannedAt ? dayjs(viewItem.scannedAt).format('MMM D, YYYY HH:mm:ss') : '—'],
        ...(viewItem.cancelledAt ? [['Cancelled At', dayjs(viewItem.cancelledAt).format('MMM D, YYYY HH:mm:ss')]] : []),
        ...(viewItem.missingAt   ? [['Missing At',   dayjs(viewItem.missingAt).format('MMM D, YYYY HH:mm:ss')]]  : []),
        ['Created By',      viewItem.createdBy?.name],
        ...(viewItem.cancelledBy ? [['Cancelled By', viewItem.cancelledBy?.name]] : []),
        ...(viewItem.missingBy   ? [['Missing By',   viewItem.missingBy?.name]]   : []),
      ]
    : []

  return (
    <div className={`${bgLight} min-h-[100svh] py-4`}>
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete AWB"
        message={`Delete AWB "${deleteItem?.awbId}"? This cannot be undone.`}
      />

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="AWB Details">
        {viewItem && (
          <div className="space-y-3">
            {viewDetails.map(([label, val, cls, custom]) => (
              <div key={label} className={`flex justify-between items-center py-2 border-b ${borderLight} last:border-0`}>
                <span className={`text-sm ${textSubtle}`}>{label}</span>
                {custom || <span className={`text-sm ${textDark} ${cls || ''}`}>{val || '—'}</span>}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className={`${textDark} text-2xl font-bold tracking-tight`}>AWB Management</h1>
            <p className={`${textSubtle} text-sm mt-1`}>Scan, track, and manage AWB barcodes</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6">

          {/* ── Left: tab panel ─────────────────────────────────────────── */}
          <div className={`${bgLight} ${cardBorder} ${cardShadow} rounded-xl overflow-hidden`}>

            {/* Tabs */}
            <div className={`flex border-b ${borderLight} bg-slate-50`}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs font-medium transition-all border-b-2 ${
                    activeTab === id
                      ? TAB_ACTIVE_CLASSES[id]
                      : `${textSubtle} border-transparent ${TAB_HOVER_CLASSES[id]}`
                  }`}
                  style={{ outline: 'none' }}
                >
                  <Icon className="shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'scan' && (
                <AWBScanForm onSuccess={fetchAWBs} />
              )}
              {activeTab === 'cancel' && (
                <AWBCancelForm onSuccess={fetchAWBs} />
              )}
              {activeTab === 'missing' && (
                <AWBMissingForm onSuccess={fetchAWBs} />
              )}
            </div>
          </div>

          {/* ── Right: table ─────────────────────────────────────────────── */}
          <div className={`xl:col-span-2 ${bgLight} ${cardShadow} ${cardBorder} rounded-xl overflow-hidden`}>
            <div className={`p-5 border-b ${borderLight} bg-slate-50`}>
              <h2 className={`${textDark} text-lg font-semibold mb-4`}>AWB Records</h2>
              <AWBFilterBar
                filters={filters}
                onChange={handleFilterChange}
                onRefresh={fetchAWBs}
              />
            </div>

            <div className="p-5">
              <DataTable
                columns={columns}
                data={awbs}
                loading={loading}
                emptyMessage="No AWB records found"
              />
              <Pagination
                pagination={pagination}
                onChange={(page) => handleFilterChange({ page })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}