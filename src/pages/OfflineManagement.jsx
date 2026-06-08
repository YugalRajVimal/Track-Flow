import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine } from 'react-icons/ri'
import { DataTable, Pagination } from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { offlineAPI } from '../api/offline'

// Now only these options (no BANK):
const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']

// Reusable initial styleType row
const emptyStyleType = () => ({ type: '', qty: '' })

function RecordForm({ onSuccess, initial, onClose }) {
  const [form, setForm] = useState({
    partyName: initial?.partyName || '',
    challanNo: initial?.challanNo || '',
    salesman: initial?.salesman || '',
    styleTypes: initial?.styleTypes?.length
      ? initial.styleTypes.map(st => ({ ...st }))
      : [emptyStyleType()],
    totalQty: initial?.totalQty || '',
    totalAmount: initial?.totalAmount || '',
    payment: initial?.payment || '',
    remark: initial?.remark || '',
  })
  const [loading, setLoading] = useState(false)

  // Helper to calculate totalQty from styleTypes
  useEffect(() => {
    const qtySum = form.styleTypes.reduce(
      (acc, curr) => acc + (parseInt(curr.qty || 0, 10)), 0
    )
    setForm(f => ({ ...f, totalQty: qtySum || '' }))
    // eslint-disable-next-line
  }, [form.styleTypes])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  // For dynamic styleType array change
  const handleStyleTypeChange = (idx, field, value) => {
    setForm(f => {
      const updated = [...f.styleTypes]
      updated[idx] = { ...updated[idx], [field]: value }
      return { ...f, styleTypes: updated }
    })
  }

  const addStyleTypeRow = () => {
    setForm(f => ({ ...f, styleTypes: [...f.styleTypes, emptyStyleType()] }))
  }

  const removeStyleTypeRow = idx => {
    setForm(f => {
      const updated = f.styleTypes.filter((_, i) => i !== idx)
      return { ...f, styleTypes: updated.length ? updated : [emptyStyleType()] }
    })
  }

  // Validation for styleTypes required and each entry valid
  const validateForm = () => {
    if(!form.partyName.trim()) {
      toast.error('Party Name is required')
      return false
    }
    if(!form.challanNo.trim()) {
      toast.error('Challan No. is required')
      return false
    }
    if (!form.salesman.trim()) {
      toast.error('Salesman is required')
      return false
    }
    const hasValidStyle =
      Array.isArray(form.styleTypes) &&
      form.styleTypes.length > 0 &&
      form.styleTypes.every(st =>
        st.type && st.type.trim() &&
        st.qty && !isNaN(Number(st.qty)) && Number(st.qty) > 0
      )
    if(!hasValidStyle){
      toast.error('Each style type and quantity is required')
      return false
    }
    if(!form.totalQty || Number(form.totalQty) < 1){
      toast.error('Total Qty is required')
      return false
    }
    if(form.totalAmount === '' || Number(form.totalAmount) < 0){
      toast.error('Total Amount is required and must not be negative')
      return false
    }
    if(!form.payment){
      toast.error('Payment method is required')
      return false
    }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if(!validateForm()) return
    setLoading(true)
    const payload = {
      partyName: form.partyName.trim(),
      challanNo: form.challanNo.trim(),
      salesman: form.salesman.trim(),
      styleTypes: form.styleTypes.map(st => ({
        type: st.type.trim(), qty: Number(st.qty)
      })),
      totalQty: Number(form.totalQty),
      totalAmount: Number(form.totalAmount),
      payment: form.payment,
      remark: form.remark.trim(),
    }

    // Console.log checks to debug submission
    console.log('[handleSubmit] form:', form)
    console.log('[handleSubmit] payload:', payload)
    if (initial) {
      console.log('[handleSubmit] Updating record with _id:', initial._id)
    } else {
      console.log('[handleSubmit] Creating new record')
    }

    try {
      if (initial?._id) {
        await offlineAPI.update(initial._id, payload)
        toast.success('Record updated')
      } else {
        await offlineAPI.create(payload)
        toast.success('Record added')
      }
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    } catch (err) {
      console.error('[handleSubmit] Submission error:', err)
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
            maxLength={100}
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Ch. No.<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="challanNo"
            type="text"
            required
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.challanNo}
            onChange={handleChange}
            placeholder="Challan number"
            maxLength={40}
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Salesman<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="salesman"
            type="text"
            required
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.salesman}
            onChange={handleChange}
            placeholder="Enter salesman name"
            maxLength={80}
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Style Types<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {form.styleTypes.map((st, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  name={`style-type-${idx}`}
                  type="text"
                  required
                  className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
                  placeholder="Style Type (ex: Gown, Shirt)"
                  value={st.type}
                  maxLength={80}
                  onChange={e =>
                    handleStyleTypeChange(idx, 'type', e.target.value)
                  }
                />
                <input
                  name={`style-qty-${idx}`}
                  type="number"
                  required
                  min={1}
                  className="w-24 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
                  placeholder="Qty"
                  value={st.qty}
                  onChange={e =>
                    handleStyleTypeChange(idx, 'qty', e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeStyleTypeRow(idx)}
                  disabled={form.styleTypes.length <= 1}
                  title="Remove row"
                  className="ml-1 p-1 text-red-500 hover:text-red-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RiSubtractLine className="text-lg" />
                </button>
                {idx === form.styleTypes.length - 1 && (
                  <button
                    type="button"
                    onClick={addStyleTypeRow}
                    title="Add style type"
                    className="ml-1 p-1 text-green-600 hover:text-green-800 rounded"
                  >
                    <RiAddLine className="text-lg" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Total Qty<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="totalQty"
            type="number"
            min={1}
            required
            readOnly
            className="w-full rounded-lg border border-zinc-300 bg-zinc-100 cursor-not-allowed px-3 py-2 text-sm transition"
            value={form.totalQty}
            placeholder="Total Qty"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Total Amount<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="totalAmount"
            type="number"
            min={0}
            required
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.totalAmount}
            onChange={handleChange}
            placeholder="0"
          />
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
            maxLength={200}
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

// FilterBar component updated (same as original, but "BANK" removed)
function OfflineFilterBar({ value, onChange, loading, onRefresh }) {
  // value contains: {search, payment}
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
            placeholder="Search party / challan / style / salesman"
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

  // --- BEGIN MODIFIED fetchRecords ---
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await offlineAPI.list(filters)
      console.log(res.data.data);
      let fetchedRecords = []
      let paginationData = null
      if (Array.isArray(res)) {
        // Backend returns an array directly (like [ {...}, ... ])
        fetchedRecords = res
      } else if (res && typeof res === 'object' && 'success' in res) {
        // API response with .success and maybe .data field
        fetchedRecords = res.data.data || []
        paginationData = res.pagination || null
      } else if (res && typeof res === 'object' && Array.isArray(res.data.data)) {
        // Defensive: API response with data as array
        fetchedRecords = res.data.data
        paginationData = res.pagination || null
      } else if (Array.isArray(res?.data.data)) {
        // Defensive fallback
        fetchedRecords = res.data.data
        paginationData = res.pagination || null
      }
      setRecords(fetchedRecords)
      setPagination(paginationData)
    } catch (err) {
      toast.error('Failed to load offline records')
    } finally {
      setLoading(false)
    }
  }, [filters])
  // --- END MODIFIED fetchRecords ---

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

  // Updated columns for new schema
  const columns = [
    {
      key: 'partyName',
      label: 'Party Name',
      headerClass: 'min-w-[120px] whitespace-nowrap',
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
      key: 'salesman',
      label: 'Salesman',
      headerClass: 'min-w-[100px] whitespace-nowrap',
      render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
      cellClass: 'text-zinc-700',
    },
    {
      key: 'styleTypes',
      label: 'Style Types',
      headerClass: 'min-w-[180px] whitespace-nowrap',
      render: v =>
        Array.isArray(v) && v.length
          ? (
            <div className="flex flex-col gap-0.5">
              {v.map((st, i) =>
                <span key={i} className="text-xs">
                  <span className="font-medium">{st.type || <span className="text-zinc-300">—</span>}</span>
                  {` `}
                  <span className="text-zinc-500">×</span>
                  <span className="font-mono">{st.qty}</span>
                </span>
              )}
            </div>
          )
          : <span className="text-zinc-300">—</span>,
      cellClass: 'text-zinc-700',
    },
    {
      key: 'totalQty',
      label: 'Total Qty',
      headerClass: 'text-right min-w-[70px]',
      render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
      cellClass: 'text-right',
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      headerClass: 'text-right min-w-[90px]',
      render: v => v !== undefined && v !== null && v !== '' ? <span>&#8377;{v}</span> : <span className="text-zinc-300">—</span>,
      cellClass: 'text-right',
    },
    {
      key: 'payment',
      label: 'Payment',
      headerClass: 'min-w-[80px] whitespace-nowrap',
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
      headerClass: 'min-w-[100px]',
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

  // For better styleTypes display
  const viewDetails = viewItem
    ? [
        ['Party Name', viewItem.partyName],
        ['Ch. No.', viewItem.challanNo],
        ['Salesman', viewItem.salesman],
        [
          'Style Types',
          Array.isArray(viewItem.styleTypes) && viewItem.styleTypes.length > 0
            ? (
              <div className="flex flex-col gap-0.5">
                {viewItem.styleTypes.map((s, i) =>
                  <span key={i}>
                    <span className="font-medium">{s.type}</span>{' '}
                    <span className="text-zinc-500">×</span>
                    <span className="font-mono">{s.qty}</span>
                  </span>
                )}
              </div>
            )
            : '—'
        ],
        ['Total Qty', viewItem.totalQty],
        ['Total Amount', viewItem.totalAmount !== undefined && viewItem.totalAmount !== null && viewItem.totalAmount !== '' ? `₹${viewItem.totalAmount}` : '—'],
        [
          'Payment',
          viewItem.payment ? (
            <span
              className={
                "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
                (viewItem.payment === 'CASH'
                  ? 'bg-green-50 text-green-600'
                  : viewItem.payment === 'UPI'
                  ? 'bg-blue-50 text-blue-600'
                  : viewItem.payment === 'DUE'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-zinc-300 bg-zinc-100')
              }
            >
              {viewItem.payment}
            </span>
          ) : '—'
        ],
        ['Remark', viewItem.remark],
        [
          'Created',
          viewItem.createdAt
            ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss')
            : '—'
        ]
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
                <span className="text-sm font-medium text-zinc-900">
                  {typeof val === 'object' ? val : (val ?? '—')}
                </span>
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

        {/* Filters Toolbar */}
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
