import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import {
  RiBarcodeLine, RiAlertLine, RiDeleteBinLine,
  RiEyeLine, RiLoader4Line
} from 'react-icons/ri'
import { returnAPI } from '../api/return'
import { DataTable, Pagination } from '../components/common/DataTable'
import StatusBadge from '../components/common/StatusBadge'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import AWBScanForm from '../components/return/AWBScanForm'
import AWBMissingForm from '../components/return/AWBMissingForm'
import AWBFilterBar from '../components/return/AWBFilterBar'

// --- Orange and B/W Theme ---
const ORANGE = '#f58021'
const textDark = 'text-black'
const textSubtle = 'text-zinc-700'
const borderLight = 'border-black/10'
const bgLight = 'bg-white'
const bgHighlight = 'bg-white' // no inline orange backgrounds, keep white/black
const accent = 'text-[#f58021]'
const accentBorder = 'border-[#f58021]'
const cardShadow = 'shadow'
const cardBorder = 'border border-black/10'

// Tabs — includes "Scan" and "Missing"
const TABS = [
  { id: 'scan',    label: 'Scan AWB',    icon: RiBarcodeLine },
  { id: 'missing', label: 'Missing AWB', icon: RiAlertLine },
]

// Tab active/hover: only color orange; everything else B/W
const TAB_ACTIVE_CLASSES = {
  scan:    'text-[#f58021] border-[#f58021] bg-white',
  missing: 'text-[#f58021] border-[#f58021] bg-white',
}
const TAB_HOVER_CLASSES = {
  scan:    'hover:text-[#f58021] hover:bg-[#fff] hover:border-[#f58021]',
  missing: 'hover:text-[#f58021] hover:bg-[#fff] hover:border-[#f58021]',
}

export default function ReturnManagementPage() {
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
      const res = await returnAPI.list(filters)
      if (res.data?.success) {
        setAwbs(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch {
      toast.error('Failed to load return records')
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
      await returnAPI.delete(deleteItem._id)
      toast.success('Return deleted')
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
      label: 'Return ID',
      render: (val) => (
        <span className={`font-mono ${accent} text-xs bg-white px-2 py-1 rounded-lg border ${accentBorder}`}>
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
            className="p-1.5 text-white bg-[#f58021] hover:opacity-90 rounded-lg transition-all"
            title="View"
          >
            <RiEyeLine className="text-white" />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className="p-1.5 text-white bg-[#f58021] hover:opacity-90 rounded-lg transition-all"
            title="Delete"
          >
            <RiDeleteBinLine className="text-white" />
          </button>
        </div>
      ),
      headerClass: textSubtle,
    },
  ]

  // ── View modal detail rows ─────────────────────────────────────────────
  const viewDetails = viewItem
    ? [
        ['AWB ID', viewItem.awbId, `font-mono ${accent}`],
        ['Status', null, '', <StatusBadge status={viewItem.status} />],
        ['Channel Partner', viewItem.channelPartner?.name],
        ['Brand', viewItem.brand?.name],
        ['Scanned At', viewItem.scannedAt ? dayjs(viewItem.scannedAt).format('MMM D, YYYY HH:mm:ss') : '—'],
        ['Created By', viewItem.createdBy?.name],
        ...(viewItem.missingAt   ? [['Missing At',   dayjs(viewItem.missingAt).format('MMM D, YYYY HH:mm:ss')]]  : []),
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
            <h1 className={`text-black text-2xl font-bold tracking-tight`}>Return Management</h1>
            <p className={`text-zinc-700 text-sm mt-1`}>Scan, track, and manage AWB barcodes</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Tab panel */}
          <div className={`${bgLight} ${cardBorder} ${cardShadow} rounded-xl overflow-hidden`}>
            {/* Tabs */}
            <div className={`flex border-b ${borderLight} bg-white`}>
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
                  <Icon className={`${activeTab === id ? 'text-[#f58021]' : 'text-black'} shrink-0`} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'scan' && <AWBScanForm onSuccess={fetchAWBs} />}
              {activeTab === 'missing' && <AWBMissingForm onSuccess={fetchAWBs} />}
            </div>
          </div>

          {/* Right: Table */}
          <div className={`xl:col-span-2 ${bgLight} ${cardShadow} ${cardBorder} rounded-xl overflow-hidden`}>
            <div className={`p-5 border-b ${borderLight} bg-white`}>
              <h2 className={`text-black text-lg font-semibold mb-4`}>Return Records</h2>
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
