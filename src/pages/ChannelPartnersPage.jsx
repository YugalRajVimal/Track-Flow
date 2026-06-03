import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import dayjs from 'dayjs'
import { channelPartnersAPI } from '../api/services'
import { DataTable, Pagination } from '../components/common/DataTable'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EntityFormModal from '../components/admin/EntityFormModal'

// --- Orange (#f58021) & White color palette theme ---
const ORANGE = '#f58021'
const textPrimary = 'text-slate-800'
const textSecondary = 'text-orange-500'
const borderLight = 'border-orange-200'
const bgCard = 'bg-white'
const bgHighlight = '[background-color:#fff4ec]' // subtle orange tint
const accent = 'text-[#f58021]'
const accentSubtle = 'text-orange-400'
const btnPrimary = 'bg-[#f58021] hover:bg-[#e46e06] text-white border-[#f58021]'
const btnPrimaryOutline = 'border border-[#f58021] bg-white hover:bg-[#f58021]/10 text-[#f58021]'
const shadow = 'shadow'
const rounded = 'rounded-xl'

const FIELDS = [
  { name: 'name', label: 'Partner Name', required: true, placeholder: 'e.g. DHL Express' },
  { name: 'code', label: 'Partner Code', required: true, placeholder: 'e.g. DHL001' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@partner.com' },
  { name: 'phone', label: 'Phone', placeholder: '+91 99999 00000' },
  { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Address...' },
]

export default function ChannelPartnersPage() {
  const [partners, setPartners] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await channelPartnersAPI.list({ page, limit: 10 })
      if (res.data?.success) {
        setPartners(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch {
      toast.error('Failed to load partners')
    }
    finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await channelPartnersAPI.update(editing._id, data)
        toast.success('Partner updated')
      } else {
        await channelPartnersAPI.create(data)
        toast.success('Partner created')
      }
      setModalOpen(false)
      setEditing(null)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await channelPartnersAPI.delete(deleteItem._id)
      toast.success('Partner deleted')
      fetch()
    } catch {
      toast.error('Delete failed')
    }
    finally {
      setDeleting(false)
      setDeleteItem(null)
    }
  }

  const columns = [
    { key: 'name', label: 'Partner Name', render: v => <span className={textPrimary}>{v}</span> },
    {
      key: 'code',
      label: 'Code',
      render: v => <span className="font-mono text-xs text-orange-400">{v}</span>
    },
    {
      key: 'email',
      label: 'Email',
      render: v => <span className={`${textSecondary} text-xs`}>{v || '—'}</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      render: v => <span className={`${textSecondary} text-xs`}>{v || '—'}</span>
    },
    {
      key: 'createdAt', label: 'Created',
      render: v =>
        v ? <span className="text-xs text-orange-300">{dayjs(v).format('MMM D, YYYY')}</span> : '—'
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setEditing(row); setModalOpen(true) }}
            className="p-1.5 text-orange-400 hover:text-[#f58021] hover:bg-[#f58021]/10 rounded-lg transition-all"
            aria-label="Edit"
            style={{ outline: 'none' }}
          >
            <RiEditLine />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className="p-1.5 text-orange-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            aria-label="Delete"
            style={{ outline: 'none' }}
          >
            <RiDeleteBinLine />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Channel Partner"
        message={`Delete "${deleteItem?.name}"?`}
      />
      <EntityFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSave}
        title={editing ? 'Edit Channel Partner' : 'Add Channel Partner'}
        fields={FIELDS}
        defaultValues={editing || {}}
        loading={saving}
      />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-slate-800">Channel Partners</h1>
            <p className="text-orange-400 text-sm mt-1">Manage logistics and channel partners</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className={`flex items-center gap-2 px-4 py-2 ${btnPrimary} rounded-lg font-medium shadow transition-colors`}
          >
            <RiAddLine /> Add Partner
          </button>
        </div>
        <div className={`${bgCard} border ${borderLight} ${rounded} ${shadow} overflow-hidden`}>
          <div className="p-5">
            <DataTable
              columns={columns}
              data={partners}
              loading={loading}
              emptyMessage="No channel partners found"
            />
            <Pagination pagination={pagination} onChange={setPage} />
          </div>
        </div>
      </div>
    </>
  )
}
