
import React, { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine, RiDownload2Line } from 'react-icons/ri'
import { DataTable, Pagination } from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { offlineAPI } from '../api/offline'
import axios from 'axios'
import * as XLSX from 'xlsx'

// ADD: import useAuthStore

const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const emptyStyleType = () => ({ type: '', qty: '' })

const getEmptyForm = () => ({
  partyName: '',
  customPartyName: '',
  challanNo: '',
  salesman: '',
  styleTypes: [emptyStyleType()],
  totalQty: '',
  totalAmount: '',
  payment: '',
  remark: '',
})

// --- Editable: useImperativeHandle so parent can tell RecordForm to provide helper methods ---
const RecordForm = forwardRef(function RecordForm(props, ref) {
  const { onSuccess, initial, onClose, compact, onPartyNameAdded } = props
  const [dropdowns, setDropdowns] = useState({ styleTypes: [], salesMen: [], partyNames: [] })
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)
  const [form, setForm] = useState(() => {
    return initial
      ? {
        partyName: initial?.partyName || '',
        customPartyName: '',
        challanNo: initial?.challanNo || '',
        salesman: initial?.salesman || '',
        styleTypes: initial?.styleTypes?.length
          ? initial.styleTypes.map(st => ({ ...st }))
          : [emptyStyleType()],
        totalQty: initial?.totalQty || '',
        totalAmount: initial?.totalAmount || '', // Remains in state for backwards compatibility
        payment: initial?.payment || '',
        remark: initial?.remark || '',
      }
      : getEmptyForm();
  })
  const [loading, setLoading] = useState(false)
  const [isOtherPartyName, setIsOtherPartyName] = useState(false)

  // Expose refreshDropdowns method to parent via ref
  useImperativeHandle(ref, () => ({
    refreshDropdowns: fetchDropdowns,
    resetForm: () => {
      setIsOtherPartyName(false)
      setForm(getEmptyForm())
    },
  }));

  // Refactoring: hoist fetchDropdowns so can call from handlers as well as useEffect and via ref
  async function fetchDropdowns(_options = {}) {
    setLoadingDropdowns(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`)
      const toStrings = arr =>
        Array.isArray(arr)
          ? arr.map(x => typeof x === 'string' ? x : x?.name || '').filter(Boolean)
          : []

      const _dropdowns = {
        styleTypes: toStrings(res.data.styleTypes),
        salesMen: toStrings(res.data.salesMen),
        partyNames: toStrings(res.data.partyNames),
      }
      setDropdowns(_dropdowns)

      if (initial) {
        const mergeUnique = (arr, val) =>
          arr.includes(val) || !val ? arr : [...arr, val]
        const defSF = (initial.styleTypes || []).map(st => st.type).filter(Boolean)
        setDropdowns(dd => ({
          styleTypes: [...new Set([..._dropdowns.styleTypes, ...defSF])],
          salesMen: mergeUnique(_dropdowns.salesMen, initial.salesman),
          partyNames: mergeUnique(_dropdowns.partyNames, initial.partyName),
        }))
        // set "Other" state if partyName not in list, initial provided, and not empty
        if (initial.partyName && !_dropdowns.partyNames.includes(initial.partyName)) {
          setIsOtherPartyName(true)
          setForm(f => ({ ...f, partyName: 'other', customPartyName: initial.partyName }))
        }
      }

      // notify parent in case party names have changed
      if (_options.notifyParent && typeof onPartyNameAdded === 'function') {
        onPartyNameAdded();
      }
    } catch {
      toast.error('Failed to load dropdown values')
    } finally {
      setLoadingDropdowns(false)
    }
  }

  useEffect(() => {
    let ignore = false
    fetchDropdowns()
    return () => { ignore = true }
    // eslint-disable-next-line
  }, [initial])

  useEffect(() => {
    const qtySum = form.styleTypes.reduce((acc, curr) => acc + (parseInt(curr.qty || 0, 10)), 0)
    setForm(f => ({ ...f, totalQty: qtySum || '' }))
    // eslint-disable-next-line
  }, [form.styleTypes])

  // --- HANDLE PARTY NAME CHOICE: if Others, show text input ---
  const handlePartyNameChange = (e) => {
    const value = e.target.value
    if (value === 'other') {
      setIsOtherPartyName(true)
      setForm(f => ({
        ...f,
        partyName: 'other',
        customPartyName: '',
      }))
    } else {
      setIsOtherPartyName(false)
      setForm(f => ({
        ...f,
        partyName: value,
        customPartyName: '',
      }))
    }
  }

  // Updated: when custom party name is entered (and is not empty), refetch dropdowns (to refresh partyNames from backend)
  const handleCustomPartyNameChange = async (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, customPartyName: val }))
    if (val.trim().length > 0 && !dropdowns.partyNames.includes(val.trim())) {
      await fetchDropdowns({ notifyParent: true })
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

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

  const validateForm = () => {
    // Party Name validation!
    if (isOtherPartyName) {
      if (!form.customPartyName.trim()) {
        toast.error('Custom Party Name is required')
        return false
      }
    } else {
      if (!form.partyName.trim() || form.partyName === 'other') {
        toast.error('Party Name is required')
        return false
      }
    }
    if (!form.challanNo.trim()) { toast.error('Challan No. is required'); return false }
    if (!form.salesman.trim()) { toast.error('Salesman is required'); return false }
    const hasValidStyle =
      Array.isArray(form.styleTypes) &&
      form.styleTypes.length > 0 &&
      form.styleTypes.every(st =>
        st.type && st.type.trim() &&
        st.qty && !isNaN(Number(st.qty)) && Number(st.qty) > 0
      )
    if (!hasValidStyle) { toast.error('Each style type and quantity is required'); return false }
    if (!form.totalQty || Number(form.totalQty) < 1) { toast.error('Total Qty is required'); return false }
    // totalAmount is NOT required anymore
    if (form.totalAmount !== '' && Number(form.totalAmount) < 0) { toast.error('Total Amount must not be negative'); return false }
    if (!form.payment) { toast.error('Payment method is required'); return false }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    let partyNameToSave
    if (isOtherPartyName) {
      partyNameToSave = form.customPartyName.trim()
    } else {
      partyNameToSave = form.partyName.trim()
    }

    const payload = {
      partyName: partyNameToSave,
      challanNo: form.challanNo.trim(),
      salesman: form.salesman.trim(),
      styleTypes: form.styleTypes.map(st => ({ type: st.type.trim(), qty: Number(st.qty) })),
      totalQty: Number(form.totalQty),
      ...(form.totalAmount !== '' ? { totalAmount: Number(form.totalAmount) } : {}),
      payment: form.payment,
      remark: form.remark.trim(),
    }
    try {
      if (initial?._id) {
        await offlineAPI.update(initial._id, payload)
        toast.success('Record updated')
      } else {
        await offlineAPI.create(payload)
        toast.success('Record added')
        // Only clear the form after a successful add, not update
        setIsOtherPartyName(false)
        setForm(getEmptyForm())
      }
      // After submit, if we created a new partyName through "Other", refetch dropdowns for partyNames
      if (isOtherPartyName && form.customPartyName.trim() && typeof onPartyNameAdded === 'function') {
        // Trigger re-fetch of party list dropdown in parent
        onPartyNameAdded()
      }
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    } catch (err) {
      // Duplicate challan error handling
      let duplicate = false;
      if (
        err &&
        err.response &&
        err.response.data &&
        (
          (typeof err.response.data === 'string' && (
            err.response.data.toLowerCase().includes('duplicate challan') ||
            err.response.data.toLowerCase().includes('challan already exists') ||
            err.response.data.toLowerCase().includes('challan no already exists') ||
            err.response.data.toLowerCase().includes('unique') && err.response.data.toLowerCase().includes('challan')
          )) ||
          (typeof err.response.data?.message === 'string' && (
            err.response.data.message.toLowerCase().includes('duplicate challan') ||
            err.response.data.message.toLowerCase().includes('already exists') ||
            err.response.data.message.toLowerCase().includes('unique') && err.response.data.message.toLowerCase().includes('challan')
          )) ||
          (typeof err.response.data?.error === 'string' && (
            err.response.data.error.toLowerCase().includes('duplicate challan') ||
            err.response.data.error.toLowerCase().includes('already exists') ||
            err.response.data.error.toLowerCase().includes('unique') && err.response.data.error.toLowerCase().includes('challan')
          ))
        )
      ) {
        duplicate = true
      }
      if (
        err?.response?.status &&
        (err.response.status === 409 || err.response.status === 422) &&
        (
          (typeof err.response.data?.message === 'string' && (
            err.response.data.message.toLowerCase().includes('challan') &&
            (err.response.data.message.toLowerCase().includes('duplicate') || err.response.data.message.toLowerCase().includes('exists'))
          )) ||
          (typeof err.response.data?.error === 'string' && (
            err.response.data.error.toLowerCase().includes('challan') &&
            (err.response.data.error.toLowerCase().includes('duplicate') || err.response.data.error.toLowerCase().includes('exists'))
          ))
        )
      ) {
        duplicate = true
      }
      if (duplicate) {
        toast.error('Duplicate Challan No. for this Party. Please use a unique Challan No.')
      } else {
        console.error('[handleSubmit] Submission error:', err)
        toast.error('Failed to submit record')
      }
    } finally {
      setLoading(false)
    }
  }

  const wrapperClass = compact
    ? "bg-white border border-black/10 rounded-xl px-3 sm:px-6 py-4 sm:py-5 w-full"
    : "space-y-8 bg-white px-2 py-5 sm:px-6 sm:py-7 max-w-2xl mx-auto"

  useEffect(() => {
    if (!initial) {
      // If the form switches to "add" mode, reset the form to empty
      setIsOtherPartyName(false)
      setForm(getEmptyForm())
    } else {
      // If editing, set form state to initial values
      setIsOtherPartyName(initial.partyName && !(dropdowns.partyNames || []).includes(initial.partyName))
      setForm({
        partyName: initial?.partyName || '',
        customPartyName: '',
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
    }
    // eslint-disable-next-line
  }, [initial])

  return (
    <form className={wrapperClass} onSubmit={handleSubmit} autoComplete="off">
      {/* Title row when compact (inline on desktop) */}
      {compact && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-800">
            {initial ? 'Edit CHALLAN' : 'CHALLAN'}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition md:hidden"
              title="Close form"
            >
              <RiCloseLine className="text-xl" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-4">
        {/* Party Name */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Party Name<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="partyName"
            required
            autoFocus={!compact}
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={isOtherPartyName ? 'other' : form.partyName}
            onChange={handlePartyNameChange}
            disabled={loadingDropdowns}
          >
            <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select party name'}</option>
            {dropdowns.partyNames.map(name => <option key={name} value={name}>{name}</option>)}
            <option value="other">Other</option>
          </select>
          {isOtherPartyName && (
            <input
              type="text"
              className="mt-2 w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
              placeholder="Enter custom party name"
              name="customPartyName"
              maxLength={80}
              value={form.customPartyName}
              onChange={handleCustomPartyNameChange}
              required
              autoFocus
            />
          )}
        </div>
        {/* Challan No */}
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
        {/* Salesman */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Salesman<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="salesman"
            required
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.salesman}
            onChange={handleChange}
            disabled={loadingDropdowns}
          >
            <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select salesman'}</option>
            {dropdowns.salesMen.map(name => <option key={name} value={name}>{name}</option>)}
            {form.salesman && !dropdowns.salesMen.includes(form.salesman) && (
              <option value={form.salesman}>{form.salesman}</option>
            )}
          </select>
        </div>
        {/* Style Types */}
        <div className="flex flex-col sm:col-span-2 md:col-span-3">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Style Types<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {form.styleTypes.map((st, idx) => (
              <div
                key={idx}
                className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-center"
              >
                <select
                  name={`style-type-${idx}`}
                  required
                  className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition min-w-0"
                  value={st.type}
                  onChange={e => handleStyleTypeChange(idx, 'type', e.target.value)}
                  disabled={loadingDropdowns}
                >
                  <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select style type'}</option>
                  {dropdowns.styleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  {st.type && !dropdowns.styleTypes.includes(st.type) && (
                    <option value={st.type}>{st.type}</option>
                  )}
                </select>
                <input
                  name={`style-qty-${idx}`}
                  type="number"
                  required
                  min={1}
                  className="w-full xs:w-24 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
                  placeholder="Qty"
                  value={st.qty}
                  onChange={e => handleStyleTypeChange(idx, 'qty', e.target.value)}
                />
                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => removeStyleTypeRow(idx)}
                    disabled={form.styleTypes.length <= 1}
                    title="Remove row"
                    className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-red-100 text-red-600 border border-red-300 hover:bg-red-200 hover:text-red-800 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minWidth: 0 }}
                  >
                    <RiSubtractLine className="text-lg" />
                    <span className="hidden xs:inline">Remove</span>
                  </button>
                  {idx === form.styleTypes.length - 1 && (
                    <button
                      type="button"
                      onClick={addStyleTypeRow}
                      title="Add style type"
                      className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-green-100 text-green-600 border border-green-300 hover:bg-green-200 hover:text-green-800 rounded transition"
                      style={{ minWidth: 0 }}
                    >
                      <RiAddLine className="text-lg" />
                      <span className="hidden xs:inline">SAVE</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Total Qty */}
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
        {/* Total Amount */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Total Amount
          </label>
          <input
            name="totalAmount"
            type="number"
            min={0}
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.totalAmount}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        {/* Payment */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Payment<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="payment"
            required
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.payment}
            onChange={handleChange}
          >
            <option value="" disabled>Select Payment</option>
            {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {/* Remark */}
        <div className="flex flex-col sm:col-span-2 md:col-span-3">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">Remark</label>
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
      {/* Action buttons */}
      <div className="flex flex-col xs:flex-row gap-3 justify-end mt-5">
        {onClose && !compact && (
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed w-full xs:w-auto"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </button>
        )}
        {compact && onClose && (
          <button
            type="button"
            className="px-5 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full xs:w-auto"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded-md font-semibold bg-[#f58021] text-white border border-[#f58021] hover:bg-black hover:text-[#f58021] hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full xs:w-auto"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="mr-2 w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Saving...
            </span>
          ) : initial ? 'Update' : 'SAVE'}
        </button>
      </div>
    </form>
  )
})

// Match AWBFilterBar design & style, but for offline filters
import { RiSearchLine, RiRefreshLine, RiUpload2Fill } from 'react-icons/ri'
import { useAuthStore } from '../store/authStore'

const offlineOrange = "#f58021";
const offlineBlack = "#191919";
const offlineWhite = "#fff";
const offlineTheme = {
  container: "space-y-3 bg-white p-4 rounded-md shadow-sm",
  label: "text-black font-medium",
  input: `input-field pl-9 w-full bg-white border border-black text-black placeholder-[#888] focus:border-black focus:ring-black/20`,
  select: `select-field w-full sm:w-auto min-w-[140px] bg-white border border-black text-black focus:border-black focus:ring-black/20`,
  payment: `select-field w-full sm:w-auto min-w-[120px] bg-white border border-black text-black focus:border-black focus:ring-black/20`,
  button:
    `btn-secondary bg-[${offlineOrange}] hover:bg-black hover:text-[${offlineOrange}] text-white border border-[${offlineOrange}] font-medium transition whitespace-nowrap`,
  buttonDisabled: "opacity-60 cursor-not-allowed",
  dateInput: `input-field w-full sm:w-auto bg-white border border-black text-black focus:border-black focus:ring-black/20`,
  icon: `absolute left-3 top-1/2 -translate-y-1/2 text-[${offlineOrange}]`
};

function OfflineFilterBar({
  value,
  onChange,
  loading,
  onRefresh,
  onExport,
  partyNames,
  partyNameDropdownLoading,
}) {
  return (
    <div className={offlineTheme.container + " mt-6 mb-4"}>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <RiSearchLine className={offlineTheme.icon} style={{ color: offlineOrange }} />
          <input
            type="text"
            placeholder="Search party / challan / style / salesman"
            value={value.search || ''}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            className={offlineTheme.input}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        {/* Party Name */}
        <div className="w-full sm:w-auto">
          <select
            className={offlineTheme.select}
            value={value.partyName || ''}
            onChange={e => onChange({ partyName: e.target.value, page: 1 })}
            disabled={partyNameDropdownLoading}
          >
            <option value="">
              {partyNameDropdownLoading ? "Loading..." : "All Parties"}
            </option>
            {Array.isArray(partyNames) && partyNames.map(pn =>
              <option value={pn} key={pn}>{pn}</option>
            )}
          </select>
        </div>
        {/* Payment */}
        <div className="w-full sm:w-auto">
          <select
            className={offlineTheme.payment}
            value={value.payment}
            onChange={e => onChange({ payment: e.target.value, page: 1 })}
          >
            <option value="">All Payments</option>
            {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={value.startDate || ''}
            onChange={e => onChange({ startDate: e.target.value, page: 1 })}
            className={offlineTheme.dateInput}
          />
          <span className="text-black text-sm self-center">to</span>
          <input
            type="date"
            value={value.endDate || ''}
            onChange={e => onChange({ endDate: e.target.value, page: 1 })}
            className={offlineTheme.dateInput}
          />
        </div>
        {/* Sort */}
        <div className="w-full sm:w-auto">
          <select
            className={offlineTheme.select}
            value={value.sortOrder}
            onChange={e => onChange({ sortOrder: e.target.value, page: 1 })}
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className={offlineTheme.button}
            type="button"
            style={{
              background: offlineOrange,
              color: offlineWhite,
              borderColor: offlineOrange,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
            disabled={loading}
          >
            <RiRefreshLine style={{ color: offlineWhite }} />
            <span className="sr-only sm:not-sr-only">Refresh</span>
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className={offlineTheme.button}
              type="button"
              style={{
                background: offlineOrange,
                color: offlineWhite,
                borderColor: offlineOrange,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <RiUpload2Fill style={{ color: offlineWhite }} />
              <span className="sr-only sm:not-sr-only">Export CSV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OfflineManagementPage() {
  // Use useAuthStore to get user and isAdmin as in @AWBScanForm.jsx (44-45)
  const user = useAuthStore(state => state.user)
  const isAdmin = !!(user && (user.role === 'admin' || user.isAdmin))

  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    payment: '',
    partyName: '',
    startDate: '',
    endDate: ''
  })
  const [partyNameDropdownLoading, setPartyNameDropdownLoading] = useState(true)
  const [partyNames, setPartyNames] = useState([])
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [inlineEditingRecord, setInlineEditingRecord] = useState(null)
  const [mobileFormOpen, setMobileFormOpen] = useState(false)
  const [mobileEditingRecord, setMobileEditingRecord] = useState(null)

  // Refs to RecordForms so we can call .refreshDropdowns if needed
  const desktopRecordFormRef = useRef(null)
  const mobileRecordFormRef = useRef(null)

  // Fetch PartyName filter dropdown options
  const fetchPartyNames = useCallback(async () => {
    setPartyNameDropdownLoading(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`)
      let list = []
      if (Array.isArray(res.data?.partyNames)) {
        list = res.data.partyNames.map(x =>
          typeof x === 'string' ? x : x?.name || ''
        ).filter(Boolean)
      }
      setPartyNames(list)
    } catch {
      setPartyNames([])
    } finally {
      setPartyNameDropdownLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetchPartyNames()
    return () => { ignore = true }
  }, [fetchPartyNames])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const filterForApi = {
        ...filters,
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
        ...(filters.partyName ? { partyName: filters.partyName } : {}),
      }
      console.log(filterForApi);
      const response = await offlineAPI.list(filterForApi)

      let fetchedRecords = []
      let paginationData = null

      if (Array.isArray(response)) {
        fetchedRecords = response
      } else if (response && typeof response === 'object' && 'success' in response) {
        fetchedRecords = response.data.data || []
        paginationData = response.pagination || null
      } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
        fetchedRecords = response.data.data
        paginationData = response.pagination || null
      } else if (Array.isArray(response?.data?.data)) {
        fetchedRecords = response.data.data
        paginationData = response.pagination || null
      }
      setRecords(fetchedRecords)
      setPagination(paginationData)
    } catch {
      toast.error('Failed to load offline records')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleFilterChange = updates => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      ...(updates.page ? {} : { page: 1 })
    }))
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

  // When a new party name is added through 'Other', refresh main Party Name dropdowns everywhere
  const handlePartyNameAdded = () => {
    fetchPartyNames()
    // Also tell record forms (desktop/mobile) to refresh their dropdowns
    if (desktopRecordFormRef.current && typeof desktopRecordFormRef.current.refreshDropdowns === 'function') {
      desktopRecordFormRef.current.refreshDropdowns()
    }
    if (mobileRecordFormRef.current && typeof mobileRecordFormRef.current.refreshDropdowns === 'function') {
      mobileRecordFormRef.current.refreshDropdowns()
    }
  }

  const openEdit = (row) => {
    if (window.innerWidth >= 768) {
      setInlineEditingRecord(row)
    } else {
      setMobileEditingRecord(row)
      setMobileFormOpen(true)
    }
  }

  const clearInlineEditing = () => {
    setInlineEditingRecord(null)
  }

  const closeMobileForm = () => {
    setMobileFormOpen(false)
    setMobileEditingRecord(null)
  }

  // Only show Edit button if isAdmin (see instructions)
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
                  {` `}<span className="text-zinc-500">×</span>
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
        <span className={
          "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
          (v === 'CASH' ? 'bg-green-50 text-green-600'
            : v === 'UPI' ? 'bg-blue-50 text-blue-600'
            : v === 'DUE' ? 'bg-orange-50 text-orange-600'
            : 'text-zinc-300 bg-zinc-100')
        }>
          {v || '—'}
        </span>
      ),
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
          >
            <RiEyeLine className="text-lg" />
          </button>
          {/* Only show Edit button if isAdmin */}
          {isAdmin && (
            <button
              onClick={() => openEdit(row)}
              className="btn-icon rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600"
              title="Edit"
              type="button"
            >
              <RiEdit2Line className="text-lg" />
            </button>
          )}
          <button
            onClick={() => setDeleteItem(row)}
            className="btn-icon rounded-full bg-red-50 hover:bg-red-100 text-red-600"
            title="Delete"
            type="button"
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
        ['Total Amount', (viewItem.totalAmount !== undefined && viewItem.totalAmount !== null && viewItem.totalAmount !== '' && viewItem.totalAmount !== 0)
          ? `₹${viewItem.totalAmount}`
          : '—'],
        [
          'Payment',
          viewItem.payment ? (
            <span className={
              "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
              (viewItem.payment === 'CASH' ? 'bg-green-50 text-green-600'
                : viewItem.payment === 'UPI' ? 'bg-blue-50 text-blue-600'
                : viewItem.payment === 'DUE' ? 'bg-orange-50 text-orange-600'
                : 'text-zinc-300 bg-zinc-100')
            }>
              {viewItem.payment}
            </span>
          ) : '—'
        ],
        ['Remark', viewItem.remark],
        ['Created', viewItem.createdAt ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss') : '—']
      ]
    : []

  // --- EXPORT TO EXCEL HANDLER ---
  const handleExport = () => {
    if (!records || !records.length) {
      toast.error('No data to export')
      return
    }
    const exportRows = records.map((row) => ({
      "Party Name": row.partyName || '',
      "Challan No": row.challanNo || '',
      "Salesman": row.salesman || '',
      "Style Types": Array.isArray(row.styleTypes)
        ? row.styleTypes.map(st => `${st.type}×${st.qty}`).join(', ')
        : '',
      "Total Qty": row.totalQty || '',
      "Total Amount": (row.totalAmount !== undefined && row.totalAmount !== null && row.totalAmount !== '' && row.totalAmount !== 0) ? row.totalAmount : '',
      "Payment": row.payment || '',
      "Remark": row.remark || '',
      "Created": row.createdAt ? dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    }))
    const ws = XLSX.utils.json_to_sheet(exportRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'OfflineRecords')
    XLSX.writeFile(wb, 'offline_records.xlsx')
  }

  return (
    <div className="min-h-[100vh]">
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

      {/* Mobile Modal Form (shown only on small screens) */}
      <Modal
        open={mobileFormOpen}
        onClose={closeMobileForm}
        title={mobileEditingRecord ? 'Edit Offline Record' : 'Add Offline Record'}
        size="sm"
      >
        <RecordForm
          ref={mobileRecordFormRef}
          onSuccess={() => { fetchRecords(); closeMobileForm() }}
          onClose={closeMobileForm}
          initial={mobileEditingRecord}
          compact={false}
          onPartyNameAdded={handlePartyNameAdded}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title="Offline Record Details"
        size="sm"
      >
        {viewItem && (
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
        )}
      </Modal>

      <div className="max-w-7xl mx-auto px-3 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4 pb-4 sm:pb-6 border-b border-black/10">
          <div>
            <h1 className="text-black text-2xl font-bold tracking-tight mb-1">Challan Management</h1>
            <div className="text-sm text-zinc-500">
              Create, view, and manage offline stitched item/challan records and payments.
            </div>
          </div>

          {/* MOBILE ONLY: Add Record button (no desktop version!) */}
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-md shadow-sm bg-[#f58021] hover:bg-black text-white hover:text-[#f58021] border border-[#f58021] hover:border-black transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] md:hidden"
            onClick={() => {
              setMobileEditingRecord(null)
              setMobileFormOpen(true)
            }}
            type="button"
            title="Add new offline record"
          >
            <RiAddCircleLine className="text-2xl" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Record</span>
          </button>
        </div>

        {/* Desktop Inline Form: always shown, no toggle, never closes. Hidden on mobile. */}
        {/* Only show the form for admins */}

          <div className="hidden md:block mt-6">
            <RecordForm
              ref={desktopRecordFormRef}
              key={inlineEditingRecord?._id || 'new'}
              onSuccess={() => {
                fetchRecords()
                clearInlineEditing()
              }}
              onClose={clearInlineEditing}
              initial={inlineEditingRecord}
              compact={true}
              onPartyNameAdded={handlePartyNameAdded}
            />
          </div>

        {/* Filters Toolbar (Export button is here) */}
        <OfflineFilterBar
          value={filters}
          onChange={handleFilterChange}
          loading={loading}
          onRefresh={fetchRecords}
          onExport={handleExport}
          partyNames={partyNames}
          partyNameDropdownLoading={partyNameDropdownLoading}
        />

        <div className="bg-white border border-black/10 shadow rounded-xl overflow-x-auto mt-2">
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
  )
}