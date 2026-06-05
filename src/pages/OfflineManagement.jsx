import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine } from 'react-icons/ri'
import { DataTable, Pagination } from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { offlineAPI } from '../api/offline'

const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']

function RecordForm({ onSuccess, initial, onClose }) {
  const [form, setForm] = useState({
    partyName: initial?.partyName || '',
    challanNo: initial?.challanNo || '',
    styleType: initial?.styleType || '',
    qty: initial?.qty || '',
    totalQty: initial?.totalQty || '',
    payment: initial?.payment || '',
    remark: initial?.remark || '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial?._id) {
        await offlineAPI.update(initial._id, form)
        toast.success('Record updated')
      } else {
        await offlineAPI.create(form)
        toast.success('Record added')
      }
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    } catch {
      toast.error('Failed to submit record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="space-y-8 bg-white px-6 py-7 max-w-2xl mx-auto"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Party Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="partyName"
            type="text"
            required
            autoFocus
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.partyName}
            onChange={handleChange}
            placeholder="Enter party name"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Ch. No.
          </label>
          <input
            name="challanNo"
            type="text"
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.challanNo}
            onChange={handleChange}
            placeholder="Challan number"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Style Type
          </label>
          <input
            name="styleType"
            type="text"
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.styleType}
            onChange={handleChange}
            placeholder="Ex: Gown, St. Top"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="block text-sm font-semibold mb-1 text-neutral-800">
              Qty
            </label>
            <input
              name="qty"
              type="number"
              min={0}
              className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
              value={form.qty}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="block text-sm font-semibold mb-1 text-neutral-800">
              Total Qty
            </label>
            <input
              name="totalQty"
              type="number"
              min={0}
              className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
              value={form.totalQty}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Payment<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="payment"
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.payment}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Payment
            </option>
            {PAYMENT_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Remark
          </label>
          <textarea
            name="remark"
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.remark}
            onChange={handleChange}
            rows={2}
            placeholder="Write any remarks"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        {onClose && (
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded-md font-semibold bg-[#f58021] text-white border border-[#f58021] hover:bg-black hover:text-[#f58021] hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="mr-2 w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Saving...
            </span>
          ) : initial ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  )
}

// FilterBar component to match @AWBFilterBar.jsx style (1-169)
function OfflineFilterBar({ value, onChange, loading, onRefresh }) {
  // value contains: {search, payment} (other filter values can be added as required)
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between mt-6 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="flex items-center border border-zinc-200 bg-white rounded-md shadow-sm px-2">
          <span className="pr-2 text-zinc-400">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="!border-0 !bg-white focus:!ring-0 focus:!outline-none py-2 px-1 w-48 md:w-64 text-sm"
            placeholder="Search party / challan / style"
            value={value.search}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            spellCheck={false}
            autoComplete="off"
          />
          {!!value.search && (
            <button
              type="button"
              onClick={() => onChange({ search: '', page: 1 })}
              tabIndex={-1}
              className="ml-2 p-0.5 rounded hover:bg-zinc-100 text-zinc-400"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Payment Dropdown */}
        <select
          className="select select-bordered h-10 min-w-[120px] text-sm"
          value={value.payment}
          onChange={e => onChange({ payment: e.target.value, page: 1 })}
        >
          <option value="">All Payments</option>
          {PAYMENT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {/* More filters could be added here */}
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

export default function OfflineManagementPage() {
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    payment: ''
  })
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offlineAPI.list(filters)
      if (res.data?.success) {
        setRecords(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch {
      toast.error('Failed to load offline records')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleFilterChange = updates => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      await offlineAPI.delete(deleteItem._id)
      toast.success('Offline record deleted')
      fetchRecords()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
      setDeleteItem(null)
    }
  }

  // Columns in the style of @DataTable.jsx (compact borders, striped, sticky header, hover, minimal header, button alignment)
  const columns = [
    {
      key: 'partyName',
      label: 'Party Name',
      headerClass: 'min-w-[140px] whitespace-nowrap',
      render: v => <span className="truncate">{v || <span className="text-zinc-300">—</span>}</span>,
      cellClass: 'font-medium text-zinc-800',
    },
    {
      key: 'challanNo',
      label: 'Ch. No.',
      headerClass: 'min-w-[80px] whitespace-nowrap',
      render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
      cellClass: '',
    },
    {
      key: 'styleType',
      label: 'Style Type',
      headerClass: 'min-w-[120px] whitespace-nowrap',
      render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
      cellClass: 'text-zinc-700',
    },
    {
      key: 'qty',
      label: 'Qty',
      headerClass: 'text-right min-w-[60px]',
      render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
      cellClass: 'text-right',
    },
    {
      key: 'totalQty',
      label: 'Total Qty',
      headerClass: 'text-right min-w-[80px]',
      render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
      cellClass: 'text-right',
    },
    {
      key: 'payment',
      label: 'Payment',
      headerClass: 'min-w-[100px] whitespace-nowrap',
      render: v => (
        <span
          className={
            "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
            (v === 'CASH'
              ? 'bg-green-50 text-green-600'
              : v === 'UPI'
              ? 'bg-blue-50 text-blue-600'
              : v === 'DUE'
              ? 'bg-orange-50 text-orange-600'
              : 'text-zinc-300 bg-zinc-100')
          }
        >
          {v || '—'}
        </span>
      ),
      cellClass: '',
    },
    {
      key: 'remark',
      label: 'Remark',
      headerClass: 'min-w-[120px]',
      render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
      cellClass: 'text-zinc-700',
    },
    {
      key: 'actions',
      label: '',
      headerClass: 'sticky right-0 bg-white z-10 min-w-[100px]',
      cellClass: 'text-right pr-1',
      render: (_, row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => setViewItem(row)}
            className="btn-icon rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
            title="View"
            type="button"
            tabIndex={0}
          >
            <RiEyeLine className="text-lg" />
          </button>
          <button
            onClick={() => {
              setEditingRecord(row)
              setFormOpen(true)
            }}
            className="btn-icon rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600"
            title="Edit"
            type="button"
            tabIndex={0}
          >
            <RiEdit2Line className="text-lg" />
          </button>
          <button
            onClick={() => setDeleteItem(row)}
            className="btn-icon rounded-full bg-red-50 hover:bg-red-100 text-red-600"
            title="Delete"
            type="button"
            tabIndex={0}
          >
            <RiDeleteBinLine className="text-lg" />
          </button>
        </div>
      ),
    },
  ]

  const viewDetails = viewItem
    ? [
        ['Party Name', viewItem.partyName],
        ['Ch. No.', viewItem.challanNo],
        ['Style Type', viewItem.styleType],
        ['Qty', viewItem.qty],
        ['Total Qty', viewItem.totalQty],
        ['Payment', viewItem.payment],
        ['Remark', viewItem.remark],
        ['Created', viewItem.createdAt ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss') : '—']
      ]
    : []

  return (
    <div className="min-h-[100vh] ">
      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Offline Record"
        message={
          <span>
            Delete offline record for <span className="font-medium">{deleteItem?.partyName}</span>?<br />
            <span className="text-red-500">This action cannot be undone.</span>
          </span>
        }
      />

      {/* Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRecord(null); }}
        title={editingRecord ? 'Edit Offline Record' : 'Add Offline Record'}
        size="sm"
      >
        <RecordForm
          onSuccess={() => {
            fetchRecords()
            setFormOpen(false)
            setEditingRecord(null)
          }}
          onClose={() => { setFormOpen(false); setEditingRecord(null); }}
          initial={editingRecord}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="Offline Record Details"
        size="sm"
      >
        {viewItem &&
          <div className="space-y-2">
            {viewDetails.map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
                <span className="text-sm text-zinc-500">{label}</span>
                <span className="text-sm font-medium text-zinc-900">{val ?? '—'}</span>
              </div>
            ))}
          </div>
        }
      </Modal>

      <div className="max-w-7xl mx-auto px-3 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-4 sm:pb-6 border-b border-black/10">
          <div>
            <h1 className="text-black text-2xl font-bold tracking-tight mb-1">Offline Management</h1>
            <div className="text-sm text-zinc-500">
              Create, view, and manage offline stitched item/challan records and payments.
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-md shadow-sm bg-[#f58021] hover:bg-black text-white hover:text-[#f58021] border border-[#f58021] hover:border-black transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021]"
            onClick={() => { setFormOpen(true); setEditingRecord(null); }}
            type="button"
            title="Add new offline record"
          >
            <RiAddCircleLine className="text-2xl" />
            <span className="hidden sm:inline">Add Record</span>
            <span className="sm:hidden">Add</span>
          </button>
     
        </div>

        {/* Filters Toolbar (AWBFilterBar style) */}
        <OfflineFilterBar
          value={filters}
          onChange={handleFilterChange}
          loading={loading}
          onRefresh={fetchRecords}
        />

        <div className="bg-white border border-black/10 shadow rounded-xl overflow-x-auto mt-2">
          <div className="p-0 sm:p-0">
            <DataTable
              columns={columns}
              data={records}
              loading={loading}
              emptyMessage="No offline records found"
              tableClass="min-w-full border-collapse"
              // Add design props inspired by @DataTable.jsx:
              // striped, sticky headers, compact, hover
              striped
              stickyHeader
              compact
              hover
            />
            <div className="p-2 sm:p-4">
              <Pagination
                pagination={pagination}
                onChange={page => handleFilterChange({ page })}
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
