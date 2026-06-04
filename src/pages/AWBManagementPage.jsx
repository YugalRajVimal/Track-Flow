
import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import {
  RiBarcodeLine, RiCloseCircleLine, RiDeleteBinLine,
  RiEyeLine, RiAlertLine,
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

// --- Orange, Black and White ONLY theme ---
// Updated border colors to match ReturnManagementPage.jsx style
const ORANGE = '#f58021'
const textDark = 'text-black'
const textSubtle = 'text-zinc-700'
const borderLight = 'border-black/10'
const bgLight = 'bg-white'
const bgHighlight = 'bg-white' // removed orange for highlight, just white for b/w look
const accent = 'text-[#f58021]'
const accentBorder = 'border-[#f58021]'
const cardShadow = 'shadow'
const cardBorder = 'border border-black/10'

const TABS = [
  { id: 'scan',    label: 'Scan AWB',    icon: RiBarcodeLine },
  { id: 'cancel',  label: 'Cancel AWB',  icon: RiCloseCircleLine },
  { id: 'missing', label: 'Missing AWB', icon: RiAlertLine },
]

// Only orange for active, black/white otherwise (matches ReturnManagementPage)
const TAB_ACTIVE_CLASSES = {
  scan:    'text-[#f58021] border-[#f58021] bg-white',
  cancel:  'text-[#f58021] border-[#f58021] bg-white',
  missing: 'text-[#f58021] border-[#f58021] bg-white',
}
const TAB_HOVER_CLASSES = {
  scan:    'hover:text-[#f58021] hover:bg-[#fff] hover:border-[#f58021]',
  cancel:  'hover:text-[#f58021] hover:bg-[#fff] hover:border-[#f58021]',
  missing: 'hover:text-[#f58021] hover:bg-[#fff] hover:border-[#f58021]',
}

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
      toast.error('Failed to load AWB records');
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
        <span className={`font-mono ${accent} text-xs ${bgHighlight} px-2 py-1 rounded-lg border ${accentBorder}/40`}>
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
          {/* Orange only buttons with white icon or background, rest black and white */}
          <button
            onClick={() => setViewItem(row)}
            className="p-1.5 bg-[#f58021] text-white hover:opacity-80 rounded-lg transition-all"
            title="View"
          >
            <RiEyeLine />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className="p-1.5 bg-[#f58021] text-white hover:opacity-80 rounded-lg transition-all"
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
            <h1 className={` text-2xl font-bold tracking-tight ${textDark}`}>Dispatch Management</h1>
            <p className={`text-black text-sm mt-1`}>Scan, track, and manage AWB barcodes</p>
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
          {/* Tab panel on first col (1fr on mobile, 1 on lg, 1 on xl) */}
          <div className="col-span-1">
            <div className={`${bgLight} ${cardBorder} ${cardShadow} rounded-xl overflow-hidden`}>
              {/* Tabs */}
              <div className={`flex flex-col sm:flex-row border-b ${borderLight} bg-white`}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs font-medium transition-all border-b-2 sm:border-b-0 sm:border-r-2 sm:last:border-r-0 ${
                      activeTab === id
                        ? TAB_ACTIVE_CLASSES[id]
                        : `${textSubtle} border-transparent ${TAB_HOVER_CLASSES[id]}`
                    }`}
                    style={{ outline: 'none' }}
                  >
                    <Icon className={`${activeTab === id ? 'text-[#f58021]' : 'text-black'} shrink-0`} />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
              <div className="p-5">
                {activeTab === 'scan' && <AWBScanForm onSuccess={fetchAWBs} />}
                {activeTab === 'cancel' && <AWBCancelForm onSuccess={fetchAWBs} />}
                {activeTab === 'missing' && <AWBMissingForm onSuccess={fetchAWBs} />}
              </div>
            </div>
          </div>

          {/* Table on right (fills remainder), spans 2 columns on lg, 3 on 2xl */}
          <div className="col-span-1 lg:col-span-2 2xl:col-span-3">
            <div className={`${bgLight} ${cardShadow} ${cardBorder} rounded-xl overflow-hidden`}>
              <div className={`p-5 border-b ${borderLight} bg-white`}>
                <h2 className={`text-black text-lg font-semibold mb-4 ${accent}`}>AWB Records</h2>
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
    </div>
  )
}