import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import dayjs from 'dayjs'
import { brandsAPI, channelPartnersAPI } from '../api/services'
import { DataTable, Pagination } from '../components/common/DataTable'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EntityFormModal from '../components/admin/EntityFormModal'

// Orange color for theme
const ORANGE = '#f58021'
const orangeBg = 'bg-[#f58021]'
const orangeText = 'text-[#f58021]'
const orangeBorder = 'border-[#f58021]'
const orangeBgHover = 'hover:bg-[#e56d15]'
const orangeTextHover = 'hover:text-[#f58021]'
const orangeBgSubtle = 'bg-[#fff4ec]'
const orangeBgSubtleHover = 'hover:bg-[#ffe5d1]'

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [partners, setPartners] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    channelPartnersAPI.list({ limit: 100 })
      .then(r => setPartners(r.data?.data || []))
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await brandsAPI.list({ page, limit: 10 })
      if (res.data?.success) {
        setBrands(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch { toast.error('Failed to load brands') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  // Only orange, black, white theme
  const FIELDS = [
    { name: 'name', label: 'Brand Name', required: true, placeholder: 'e.g. Nike' },
    {
      name: 'channelPartner', label: 'Channel Partner', type: 'select', required: true,
      options: partners.map(p => ({ value: p._id, label: p.name }))
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brand description...' },
  ]

  const handleSave = async (data) => {
    setSaving(true)
    try {
      // Convert selected "channelPartner" ID to a partner object for sending
      const selectedPartner = partners.find(
        p => p._id === (data.channelPartner?._id || data.channelPartner || data.channelPartnerId)
      )
      const sendData = {
        ...data,
        channelPartner: selectedPartner ? { _id: selectedPartner._id, name: selectedPartner.name } : undefined,
      }

      delete sendData.channelPartnerId

      if (editing) {
        await brandsAPI.update(editing._id, sendData)
        toast.success('Brand updated')
      } else {
        await brandsAPI.create(sendData)
        toast.success('Brand created')
      }
      setModalOpen(false)
      setEditing(null)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await brandsAPI.delete(deleteItem._id)
      toast.success('Brand deleted')
      fetch()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false); setDeleteItem(null) }
  }

  const columns = [
    { key: 'name', label: 'Brand Name',
      render: (val) => (
        <span className="font-medium text-black">{val || '—'}</span>
      )
    },
    {
      key: 'channelPartner', label: 'Channel Partner',
      render: (val) => (
        <span className="text-xs text-black/60">{val?.name || '—'}</span>
      )
    },
    { key: 'description', label: 'Description', render: v => <span className="text-black/40 text-xs">{v || '—'}</span> },
    {
      key: 'createdAt', label: 'Created',
      render: v => v ? <span className="text-xs text-black/40">{dayjs(v).format('MMM D, YYYY')}</span> : '—'
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setEditing(row); setModalOpen(true) }}
            className={`p-1.5 ${orangeText} ${orangeBgSubtle} hover:${orangeBgSubtleHover} hover:${orangeText} rounded-lg transition-all`}
          >
            <RiEditLine className={orangeText} />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className={`p-1.5 ${orangeText} ${orangeBgSubtle} hover:bg-red-100 hover:text-red-600 rounded-lg transition-all`}
          >
            <RiDeleteBinLine className={orangeText} />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Brand"
        message={`Delete brand "${deleteItem?.name}"?`} />
      <EntityFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSave}
        title={editing ? 'Edit Brand' : 'Add Brand'}
        fields={FIELDS}
        defaultValues={
          editing
            ? {
                ...editing,
                channelPartner:
                  editing.channelPartner?._id ||
                  editing.channelPartnerId ||
                  (typeof editing.channelPartner === 'string' ? editing.channelPartner : undefined),
              }
            : {}
        }
        loading={saving}
      />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Brands</h1>
            <p className="text-black/50 text-sm mt-1">Manage brands under channel partners</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${orangeBg} text-white text-sm font-medium shadow ${orangeBgHover} transition-colors`}
          >
            <RiAddLine className="text-white" /> Add Brand
          </button>
        </div>
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
          <div className="p-5">
            <DataTable columns={columns} data={brands} loading={loading} emptyMessage="No brands found" />
            <Pagination pagination={pagination} onChange={setPage} />
          </div>
        </div>
      </div>
    </>
  )
}
