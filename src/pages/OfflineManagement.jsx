// // import React, { useEffect, useState, useCallback } from 'react'
// // import toast from 'react-hot-toast'
// // import dayjs from 'dayjs'
// // import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine } from 'react-icons/ri'
// // import { DataTable, Pagination } from '../components/common/DataTable'
// // import Modal from '../components/common/Modal'
// // import ConfirmDialog from '../components/common/ConfirmDialog'
// // import { offlineAPI } from '../api/offline'
// // import axios from 'axios'

// // // Now only these options (no BANK):
// // const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']

// // // --- Add API_BASE_URL for dropdowns fetch ---
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // // Reusable initial styleType row
// // const emptyStyleType = () => ({ type: '', qty: '' })

// // function RecordForm({ onSuccess, initial, onClose }) {
// //   // ... same as before
// //   // (No change: This part isn't about filters)
// //   // ... keep code as is for RecordForm
// //   // (omitted for brevity)
// //   // ... paste unchanged RecordForm here ...
// //   // ---- BEGIN COPIED ----
// //   const [dropdowns, setDropdowns] = useState({
// //     styleTypes: [],
// //     salesMen: [],
// //     partyNames: [],
// //   })
// //   const [loadingDropdowns, setLoadingDropdowns] = useState(true)
// //   const [form, setForm] = useState({
// //     partyName: initial?.partyName || '',
// //     challanNo: initial?.challanNo || '',
// //     salesman: initial?.salesman || '',
// //     styleTypes: initial?.styleTypes?.length
// //       ? initial.styleTypes.map(st => ({ ...st }))
// //       : [emptyStyleType()],
// //     totalQty: initial?.totalQty || '',
// //     totalAmount: initial?.totalAmount || '',
// //     payment: initial?.payment || '',
// //     remark: initial?.remark || '',
// //   })
// //   const [loading, setLoading] = useState(false)

// //   useEffect(() => {
// //     let ignore = false
// //     const fetchDropdowns = async () => {
// //       setLoadingDropdowns(true)
// //       try {
// //         const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`);
// //         const toStrings = arr =>
// //           Array.isArray(arr)
// //             ? arr.map(x => typeof x === 'string' ? x : x?.name || '')
// //                 .filter(Boolean)
// //             : []

// //         const _dropdowns = {
// //           styleTypes: toStrings(res.data.styleTypes),
// //           salesMen: toStrings(res.data.salesMen),
// //           partyNames: toStrings(res.data.partyNames),
// //         }

// //         if (!ignore) setDropdowns(_dropdowns)

// //         if (initial) {
// //           const mergeUnique = (arr, val) =>
// //             arr.includes(val) || !val ? arr : [...arr, val]

// //           const defSF = (initial.styleTypes || []).map(st => st.type).filter(Boolean)
// //           setDropdowns(dd => ({
// //             styleTypes: [...new Set([..._dropdowns.styleTypes, ...defSF])],
// //             salesMen: mergeUnique(_dropdowns.salesMen, initial.salesman),
// //             partyNames: mergeUnique(_dropdowns.partyNames, initial.partyName),
// //           }))
// //         }
// //       } catch (err) {
// //         toast.error('Failed to load dropdown values')
// //       } finally {
// //         if (!ignore) setLoadingDropdowns(false)
// //       }
// //     }
// //     fetchDropdowns()
// //     return () => { ignore = true }
// //   }, [initial])

// //   useEffect(() => {
// //     const qtySum = form.styleTypes.reduce(
// //       (acc, curr) => acc + (parseInt(curr.qty || 0, 10)), 0
// //     )
// //     setForm(f => ({ ...f, totalQty: qtySum || '' }))
// //     // eslint-disable-next-line
// //   }, [form.styleTypes])

// //   const handleChange = e => {
// //     const { name, value } = e.target
// //     setForm(f => ({ ...f, [name]: value }))
// //   }

// //   const handleStyleTypeChange = (idx, field, value) => {
// //     setForm(f => {
// //       const updated = [...f.styleTypes]
// //       updated[idx] = { ...updated[idx], [field]: value }
// //       return { ...f, styleTypes: updated }
// //     })
// //   }

// //   const addStyleTypeRow = () => {
// //     setForm(f => ({ ...f, styleTypes: [...f.styleTypes, emptyStyleType()] }))
// //   }

// //   const removeStyleTypeRow = idx => {
// //     setForm(f => {
// //       const updated = f.styleTypes.filter((_, i) => i !== idx)
// //       return { ...f, styleTypes: updated.length ? updated : [emptyStyleType()] }
// //     })
// //   }

// //   const validateForm = () => {
// //     if(!form.partyName.trim()) {
// //       toast.error('Party Name is required')
// //       return false
// //     }
// //     if(!form.challanNo.trim()) {
// //       toast.error('Challan No. is required')
// //       return false
// //     }
// //     if (!form.salesman.trim()) {
// //       toast.error('Salesman is required')
// //       return false
// //     }
// //     const hasValidStyle =
// //       Array.isArray(form.styleTypes) &&
// //       form.styleTypes.length > 0 &&
// //       form.styleTypes.every(st =>
// //         st.type && st.type.trim() &&
// //         st.qty && !isNaN(Number(st.qty)) && Number(st.qty) > 0
// //       )
// //     if(!hasValidStyle){
// //       toast.error('Each style type and quantity is required')
// //       return false
// //     }
// //     if(!form.totalQty || Number(form.totalQty) < 1){
// //       toast.error('Total Qty is required')
// //       return false
// //     }
// //     if(form.totalAmount === '' || Number(form.totalAmount) < 0){
// //       toast.error('Total Amount is required and must not be negative')
// //       return false
// //     }
// //     if(!form.payment){
// //       toast.error('Payment method is required')
// //       return false
// //     }
// //     return true
// //   }

// //   const handleSubmit = async e => {
// //     e.preventDefault()
// //     if(!validateForm()) return
// //     setLoading(true)
// //     const payload = {
// //       partyName: form.partyName.trim(),
// //       challanNo: form.challanNo.trim(),
// //       salesman: form.salesman.trim(),
// //       styleTypes: form.styleTypes.map(st => ({
// //         type: st.type.trim(), qty: Number(st.qty)
// //       })),
// //       totalQty: Number(form.totalQty),
// //       totalAmount: Number(form.totalAmount),
// //       payment: form.payment,
// //       remark: form.remark.trim(),
// //     }

// //     try {
// //       if (initial?._id) {
// //         await offlineAPI.update(initial._id, payload)
// //         toast.success('Record updated')
// //       } else {
// //         await offlineAPI.create(payload)
// //         toast.success('Record added')
// //       }
// //       if (onSuccess) onSuccess()
// //       if (onClose) onClose()
// //     } catch (err) {
// //       console.error('[handleSubmit] Submission error:', err)
// //       toast.error('Failed to submit record')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <form
// //       className="space-y-8 bg-white px-6 py-7 max-w-2xl mx-auto"
// //       onSubmit={handleSubmit}
// //       autoComplete="off"
// //     >
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
// //         {/* Party Name (dropdown) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Party Name<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="partyName"
// //             required
// //             autoFocus
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.partyName}
// //             onChange={handleChange}
// //             disabled={loadingDropdowns}
// //           >
// //             <option value="" disabled>
// //               {loadingDropdowns ? 'Loading...' : 'Select party name'}
// //             </option>
// //             {dropdowns.partyNames.map(name => (
// //               <option key={name} value={name}>{name}</option>
// //             ))}
// //             {form.partyName &&
// //               !dropdowns.partyNames.includes(form.partyName) && (
// //                 <option value={form.partyName}>{form.partyName}</option>
// //               )}
// //           </select>
// //         </div>
// //         {/* Challan No (text field) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Ch. No.<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="challanNo"
// //             type="text"
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.challanNo}
// //             onChange={handleChange}
// //             placeholder="Challan number"
// //             maxLength={40}
// //           />
// //         </div>
// //         {/* Salesman (dropdown) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Salesman<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="salesman"
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.salesman}
// //             onChange={handleChange}
// //             disabled={loadingDropdowns}
// //           >
// //             <option value="" disabled>
// //               {loadingDropdowns ? 'Loading...' : 'Select salesman'}
// //             </option>
// //             {dropdowns.salesMen.map(name => (
// //               <option key={name} value={name}>{name}</option>
// //             ))}
// //             {form.salesman &&
// //               !dropdowns.salesMen.includes(form.salesman) && (
// //                 <option value={form.salesman}>{form.salesman}</option>
// //               )}
// //           </select>
// //         </div>
// //         {/* Style Types dynamic rows (with dropdown for styleType) */}
// //         <div className="flex flex-col md:col-span-2">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Style Types<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <div className="flex flex-col gap-2">
// //             {form.styleTypes.map((st, idx) => (
// //               <div key={idx} className="flex gap-2 items-center">
// //                 <select
// //                   name={`style-type-${idx}`}
// //                   required
// //                   className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //                   value={st.type}
// //                   onChange={e =>
// //                     handleStyleTypeChange(idx, 'type', e.target.value)
// //                   }
// //                   disabled={loadingDropdowns}
// //                 >
// //                   <option value="" disabled>
// //                     {loadingDropdowns ? 'Loading...' : 'Select style type'}
// //                   </option>
// //                   {dropdowns.styleTypes.map(t => (
// //                     <option key={t} value={t}>{t}</option>
// //                   ))}
// //                   {st.type && !dropdowns.styleTypes.includes(st.type) && (
// //                     <option value={st.type}>{st.type}</option>
// //                   )}
// //                 </select>
// //                 <input
// //                   name={`style-qty-${idx}`}
// //                   type="number"
// //                   required
// //                   min={1}
// //                   className="w-24 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //                   placeholder="Qty"
// //                   value={st.qty}
// //                   onChange={e =>
// //                     handleStyleTypeChange(idx, 'qty', e.target.value)
// //                   }
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => removeStyleTypeRow(idx)}
// //                   disabled={form.styleTypes.length <= 1}
// //                   title="Remove row"
// //                   className="ml-1 p-1 text-red-500 hover:text-red-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
// //                 >
// //                   <RiSubtractLine className="text-lg" />
// //                 </button>
// //                 {idx === form.styleTypes.length - 1 && (
// //                   <button
// //                     type="button"
// //                     onClick={addStyleTypeRow}
// //                     title="Add style type"
// //                     className="ml-1 p-1 text-green-600 hover:text-green-800 rounded"
// //                   >
// //                     <RiAddLine className="text-lg" />
// //                   </button>
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Total Qty<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="totalQty"
// //             type="number"
// //             min={1}
// //             required
// //             readOnly
// //             className="w-full rounded-lg border border-zinc-300 bg-zinc-100 cursor-not-allowed px-3 py-2 text-sm transition"
// //             value={form.totalQty}
// //             placeholder="Total Qty"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Total Amount<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="totalAmount"
// //             type="number"
// //             min={0}
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.totalAmount}
// //             onChange={handleChange}
// //             placeholder="0"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Payment<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="payment"
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.payment}
// //             onChange={handleChange}
// //             required
// //           >
// //             <option value="" disabled>
// //               Select Payment
// //             </option>
// //             {PAYMENT_OPTIONS.map(opt => (
// //               <option key={opt} value={opt}>{opt}</option>
// //             ))}
// //           </select>
// //         </div>
// //         <div className="flex flex-col md:col-span-2">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Remark
// //           </label>
// //           <textarea
// //             name="remark"
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.remark}
// //             onChange={handleChange}
// //             rows={2}
// //             placeholder="Write any remarks"
// //             maxLength={200}
// //           />
// //         </div>
// //       </div>
// //       <div className="flex gap-3 justify-end mt-6">
// //         {onClose && (
// //           <button
// //             type="button"
// //             className="px-6 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
// //             disabled={loading}
// //             onClick={onClose}
// //           >
// //             Cancel
// //           </button>
// //         )}
// //         <button
// //           type="submit"
// //           className="px-6 py-2 rounded-md font-semibold bg-[#f58021] text-white border border-[#f58021] hover:bg-black hover:text-[#f58021] hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] transition disabled:opacity-50 disabled:cursor-not-allowed"
// //           disabled={loading}
// //         >
// //           {loading ? (
// //             <span className="inline-flex items-center">
// //               <svg className="mr-2 w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
// //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
// //               </svg>
// //               Saving...
// //             </span>
// //           ) : initial ? 'Update' : 'Add'}
// //         </button>
// //       </div>
// //     </form>
// //   )
// //   // ---- END COPIED ----
// // }

// // // Extended filterBar to include all filters: search, payment, startDate, endDate, sortBy (fixed for now), sortOrder
// // function OfflineFilterBar({ value, onChange, loading, onRefresh }) {
// //   // value contains: {search, payment, startDate, endDate, sortBy, sortOrder}
// //   // Please update the inputs as you need to use all available filters.

// //   return (
// //     <div className="flex flex-wrap items-center gap-2 justify-between mt-6 mb-4">
// //       <div className="flex flex-wrap gap-2 items-center">
// //         {/* Search */}
// //         <div className="flex items-center border border-zinc-200 bg-white rounded-md shadow-sm px-2">
// //           <span className="pr-2 text-zinc-400">
// //             <svg
// //               aria-hidden="true"
// //               className="h-5 w-5"
// //               fill="none"
// //               stroke="currentColor"
// //               strokeWidth={2}
// //               viewBox="0 0 24 24"
// //             >
// //               <circle cx="11" cy="11" r="7" />
// //               <line x1="21" y1="21" x2="16.65" y2="16.65" />
// //             </svg>
// //           </span>
// //           <input
// //             type="text"
// //             className="!border-0 !bg-white focus:!ring-0 focus:!outline-none py-2 px-1 w-48 md:w-64 text-sm"
// //             placeholder="Search party / challan / style / salesman"
// //             value={value.search}
// //             onChange={e => onChange({ search: e.target.value, page: 1 })}
// //             spellCheck={false}
// //             autoComplete="off"
// //           />
// //           {!!value.search && (
// //             <button
// //               type="button"
// //               onClick={() => onChange({ search: '', page: 1 })}
// //               tabIndex={-1}
// //               className="ml-2 p-0.5 rounded hover:bg-zinc-100 text-zinc-400"
// //             >
// //               <RiCloseLine className="w-4 h-4" />
// //             </button>
// //           )}
// //         </div>
// //         {/* Payment Dropdown */}
// //         <select
// //           className="select select-bordered h-10 min-w-[120px] text-sm"
// //           value={value.payment}
// //           onChange={e => onChange({ payment: e.target.value, page: 1 })}
// //         >
// //           <option value="">All Payments</option>
// //           {PAYMENT_OPTIONS.map(opt => (
// //             <option key={opt} value={opt}>{opt}</option>
// //           ))}
// //         </select>
// //         {/* Start Date */}
// //         <input
// //           type="date"
// //           className="input input-bordered h-10 text-sm"
// //           value={value.startDate || ''}
// //           onChange={e => onChange({ startDate: e.target.value, page: 1 })}
// //           placeholder="Start date"
// //         />
// //         {/* End Date */}
// //         <input
// //           type="date"
// //           className="input input-bordered h-10 text-sm"
// //           value={value.endDate || ''}
// //           onChange={e => onChange({ endDate: e.target.value, page: 1 })}
// //           placeholder="End date"
// //         />
// //         {/* Sort Order */}
// //         <select
// //           className="select select-bordered h-10 min-w-[120px] text-sm"
// //           value={value.sortOrder}
// //           onChange={e => onChange({ sortOrder: e.target.value, page: 1 })}
// //         >
// //           <option value="desc">Newest</option>
// //           <option value="asc">Oldest</option>
// //         </select>
// //       </div>
// //       <div className="flex gap-1">
// //         <button
// //           type="button"
// //           className="btn btn-ghost btn-sm"
// //           onClick={onRefresh}
// //           disabled={loading}
// //         >
// //           Refresh
// //         </button>
// //       </div>
// //     </div>
// //   )
// // }

// // export default function OfflineManagementPage() {
// //   const [records, setRecords] = useState([])
// //   const [pagination, setPagination] = useState(null)
// //   const [loading, setLoading] = useState(false)
// //   const [filters, setFilters] = useState({
// //     page: 1,
// //     limit: 10,
// //     sortBy: 'createdAt',
// //     sortOrder: 'desc',
// //     search: '',
// //     payment: '',
// //     startDate: '',
// //     endDate: ''
// //   })
// //   const [deleteItem, setDeleteItem] = useState(null)
// //   const [deleting, setDeleting] = useState(false)
// //   const [viewItem, setViewItem] = useState(null)
// //   const [formOpen, setFormOpen] = useState(false)
// //   const [editingRecord, setEditingRecord] = useState(null)

// //   // fetchRecords will send all filters supported by backend: page, limit, search, payment, startDate, endDate, sortBy, sortOrder
// //   const fetchRecords = useCallback(async () => {
// //     setLoading(true)
// //     try {
// //       // Ensure backend gets all filters
// //       const response = await offlineAPI.list({
// //         ...filters,
// //         // If blank date, omit so backend defaults to today
// //         ...(filters.startDate ? { startDate: filters.startDate } : {}),
// //         ...(filters.endDate ? { endDate: filters.endDate } : {})
// //       })

// //       let fetchedRecords = []
// //       let paginationData = null
// //       // Defensive forms for different backend wrappers
// //       if (Array.isArray(response)) {
// //         fetchedRecords = response
// //       } else if (response && typeof response === 'object' && 'success' in response) {
// //         fetchedRecords = response.data.data || []
// //         paginationData = response.pagination || null
// //       } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
// //         fetchedRecords = response.data.data
// //         paginationData = response.pagination || null
// //       } else if (Array.isArray(response?.data?.data)) {
// //         fetchedRecords = response.data.data
// //         paginationData = response.pagination || null
// //       }
// //       setRecords(fetchedRecords)
// //       setPagination(paginationData)
// //     } catch (err) {
// //       toast.error('Failed to load offline records')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }, [filters])

// //   useEffect(() => { fetchRecords() }, [fetchRecords])

// //   const handleFilterChange = updates => {
// //     setFilters(prev => ({
// //       ...prev,
// //       ...updates,
// //       // When changing filters, reset page unless updating just page (for pagination)
// //       ...(updates.page ? {} : { page: 1 })
// //     }))
// //   }

// //   const handleDelete = async () => {
// //     if (!deleteItem) return
// //     setDeleting(true)
// //     try {
// //       await offlineAPI.delete(deleteItem._id)
// //       toast.success('Offline record deleted')
// //       fetchRecords()
// //     } catch {
// //       toast.error('Delete failed')
// //     } finally {
// //       setDeleting(false)
// //       setDeleteItem(null)
// //     }
// //   }

// //   // Updated columns for new schema (unchanged)
// //   const columns = [
// //     {
// //       key: 'partyName',
// //       label: 'Party Name',
// //       headerClass: 'min-w-[120px] whitespace-nowrap',
// //       render: v => <span className="truncate">{v || <span className="text-zinc-300">—</span>}</span>,
// //       cellClass: 'font-medium text-zinc-800',
// //     },
// //     {
// //       key: 'challanNo',
// //       label: 'Ch. No.',
// //       headerClass: 'min-w-[80px] whitespace-nowrap',
// //       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
// //       cellClass: '',
// //     },
// //     {
// //       key: 'salesman',
// //       label: 'Salesman',
// //       headerClass: 'min-w-[100px] whitespace-nowrap',
// //       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
// //       cellClass: 'text-zinc-700',
// //     },
// //     {
// //       key: 'styleTypes',
// //       label: 'Style Types',
// //       headerClass: 'min-w-[180px] whitespace-nowrap',
// //       render: v =>
// //         Array.isArray(v) && v.length
// //           ? (
// //             <div className="flex flex-col gap-0.5">
// //               {v.map((st, i) =>
// //                 <span key={i} className="text-xs">
// //                   <span className="font-medium">{st.type || <span className="text-zinc-300">—</span>}</span>
// //                   {` `}
// //                   <span className="text-zinc-500">×</span>
// //                   <span className="font-mono">{st.qty}</span>
// //                 </span>
// //               )}
// //             </div>
// //           )
// //           : <span className="text-zinc-300">—</span>,
// //       cellClass: 'text-zinc-700',
// //     },
// //     {
// //       key: 'totalQty',
// //       label: 'Total Qty',
// //       headerClass: 'text-right min-w-[70px]',
// //       render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
// //       cellClass: 'text-right',
// //     },
// //     {
// //       key: 'totalAmount',
// //       label: 'Total Amount',
// //       headerClass: 'text-right min-w-[90px]',
// //       render: v => v !== undefined && v !== null && v !== '' ? <span>&#8377;{v}</span> : <span className="text-zinc-300">—</span>,
// //       cellClass: 'text-right',
// //     },
// //     {
// //       key: 'payment',
// //       label: 'Payment',
// //       headerClass: 'min-w-[80px] whitespace-nowrap',
// //       render: v => (
// //         <span
// //           className={
// //             "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
// //             (v === 'CASH'
// //               ? 'bg-green-50 text-green-600'
// //               : v === 'UPI'
// //               ? 'bg-blue-50 text-blue-600'
// //               : v === 'DUE'
// //               ? 'bg-orange-50 text-orange-600'
// //               : 'text-zinc-300 bg-zinc-100')
// //           }
// //         >
// //           {v || '—'}
// //         </span>
// //       ),
// //       cellClass: '',
// //     },
// //     {
// //       key: 'remark',
// //       label: 'Remark',
// //       headerClass: 'min-w-[100px]',
// //       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
// //       cellClass: 'text-zinc-700',
// //     },
// //     {
// //       key: 'actions',
// //       label: '',
// //       headerClass: 'sticky right-0 bg-white z-10 min-w-[100px]',
// //       cellClass: 'text-right pr-1',
// //       render: (_, row) => (
// //         <div className="flex justify-end gap-1.5">
// //           <button
// //             onClick={() => setViewItem(row)}
// //             className="btn-icon rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
// //             title="View"
// //             type="button"
// //             tabIndex={0}
// //           >
// //             <RiEyeLine className="text-lg" />
// //           </button>
// //           <button
// //             onClick={() => {
// //               setEditingRecord(row)
// //               setFormOpen(true)
// //             }}
// //             className="btn-icon rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600"
// //             title="Edit"
// //             type="button"
// //             tabIndex={0}
// //           >
// //             <RiEdit2Line className="text-lg" />
// //           </button>
// //           <button
// //             onClick={() => setDeleteItem(row)}
// //             className="btn-icon rounded-full bg-red-50 hover:bg-red-100 text-red-600"
// //             title="Delete"
// //             type="button"
// //             tabIndex={0}
// //           >
// //             <RiDeleteBinLine className="text-lg" />
// //           </button>
// //         </div>
// //       ),
// //     },
// //   ]

// //   // For better styleTypes display
// //   const viewDetails = viewItem
// //     ? [
// //         ['Party Name', viewItem.partyName],
// //         ['Ch. No.', viewItem.challanNo],
// //         ['Salesman', viewItem.salesman],
// //         [
// //           'Style Types',
// //           Array.isArray(viewItem.styleTypes) && viewItem.styleTypes.length > 0
// //             ? (
// //               <div className="flex flex-col gap-0.5">
// //                 {viewItem.styleTypes.map((s, i) =>
// //                   <span key={i}>
// //                     <span className="font-medium">{s.type}</span>{' '}
// //                     <span className="text-zinc-500">×</span>
// //                     <span className="font-mono">{s.qty}</span>
// //                   </span>
// //                 )}
// //               </div>
// //             )
// //             : '—'
// //         ],
// //         ['Total Qty', viewItem.totalQty],
// //         ['Total Amount', viewItem.totalAmount !== undefined && viewItem.totalAmount !== null && viewItem.totalAmount !== '' ? `₹${viewItem.totalAmount}` : '—'],
// //         [
// //           'Payment',
// //           viewItem.payment ? (
// //             <span
// //               className={
// //                 "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
// //                 (viewItem.payment === 'CASH'
// //                   ? 'bg-green-50 text-green-600'
// //                   : viewItem.payment === 'UPI'
// //                   ? 'bg-blue-50 text-blue-600'
// //                   : viewItem.payment === 'DUE'
// //                   ? 'bg-orange-50 text-orange-600'
// //                   : 'text-zinc-300 bg-zinc-100')
// //               }
// //             >
// //               {viewItem.payment}
// //             </span>
// //           ) : '—'
// //         ],
// //         ['Remark', viewItem.remark],
// //         [
// //           'Created',
// //           viewItem.createdAt
// //             ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss')
// //             : '—'
// //         ]
// //       ]
// //     : []

// //   return (
// //     <div className="min-h-[100vh] ">
// //       {/* Confirm Delete */}
// //       <ConfirmDialog
// //         open={!!deleteItem}
// //         onClose={() => setDeleteItem(null)}
// //         onConfirm={handleDelete}
// //         loading={deleting}
// //         title="Delete Offline Record"
// //         message={
// //           <span>
// //             Delete offline record for <span className="font-medium">{deleteItem?.partyName}</span>?<br />
// //             <span className="text-red-500">This action cannot be undone.</span>
// //           </span>
// //         }
// //       />

// //       {/* Form Modal */}
// //       <Modal
// //         open={formOpen}
// //         onClose={() => { setFormOpen(false); setEditingRecord(null); }}
// //         title={editingRecord ? 'Edit Offline Record' : 'Add Offline Record'}
// //         size="sm"
// //       >
// //         <RecordForm
// //           onSuccess={() => {
// //             fetchRecords()
// //             setFormOpen(false)
// //             setEditingRecord(null)
// //           }}
// //           onClose={() => { setFormOpen(false); setEditingRecord(null); }}
// //           initial={editingRecord}
// //         />
// //       </Modal>

// //       {/* View Details Modal */}
// //       <Modal
// //         open={!!viewItem}
// //         onClose={() => setViewItem(null)}
// //         title="Offline Record Details"
// //         size="sm"
// //       >
// //         {viewItem &&
// //           <div className="space-y-2">
// //             {viewDetails.map(([label, val]) => (
// //               <div key={label} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
// //                 <span className="text-sm text-zinc-500">{label}</span>
// //                 <span className="text-sm font-medium text-zinc-900">
// //                   {typeof val === 'object' ? val : (val ?? '—')}
// //                 </span>
// //               </div>
// //             ))}
// //           </div>
// //         }
// //       </Modal>

// //       <div className="max-w-7xl mx-auto px-3 sm:px-8">
// //         {/* Header */}
// //         <div className="flex items-center justify-between pt-4 pb-4 sm:pb-6 border-b border-black/10">
// //           <div>
// //             <h1 className="text-black text-2xl font-bold tracking-tight mb-1">Offline Management</h1>
// //             <div className="text-sm text-zinc-500">
// //               Create, view, and manage offline stitched item/challan records and payments.
// //             </div>
// //           </div>
// //           <button
// //             className="flex items-center gap-2 px-5 py-2 rounded-md shadow-sm bg-[#f58021] hover:bg-black text-white hover:text-[#f58021] border border-[#f58021] hover:border-black transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021]"
// //             onClick={() => { setFormOpen(true); setEditingRecord(null); }}
// //             type="button"
// //             title="Add new offline record"
// //           >
// //             <RiAddCircleLine className="text-2xl" />
// //             <span className="hidden sm:inline">Add Record</span>
// //             <span className="sm:hidden">Add</span>
// //           </button>
// //         </div>

// //         {/* Filters Toolbar */}
// //         <OfflineFilterBar
// //           value={filters}
// //           onChange={handleFilterChange}
// //           loading={loading}
// //           onRefresh={fetchRecords}
// //         />

// //         <div className="bg-white border border-black/10 shadow rounded-xl overflow-x-auto mt-2">
// //           <div className="p-0 sm:p-0">
// //             <DataTable
// //               columns={columns}
// //               data={records}
// //               loading={loading}
// //               emptyMessage="No offline records found"
// //               tableClass="min-w-full border-collapse"
// //               striped
// //               stickyHeader
// //               compact
// //               hover
// //             />
// //             <div className="p-2 sm:p-4">
// //               <Pagination
// //                 pagination={pagination}
// //                 onChange={page => handleFilterChange({ page })}
// //                 className="mt-4"
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// import React, { useEffect, useState, useCallback } from 'react'
// import toast from 'react-hot-toast'
// import dayjs from 'dayjs'
// import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine, RiDownload2Line } from 'react-icons/ri'
// import { DataTable, Pagination } from '../components/common/DataTable'
// import Modal from '../components/common/Modal'
// import ConfirmDialog from '../components/common/ConfirmDialog'
// import { offlineAPI } from '../api/offline'

// const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']

// const emptyStyleType = () => ({ type: '', qty: '' })

// // function RecordForm({ onSuccess, initial, onClose, compact }) {
// //   // ...Unchanged RecordForm omitted for brevity (copy from original)...
// //   // (No changes needed for RecordForm for export feature)
// //   // Paste your RecordForm code here
// //   // --- SNIP ---
// //   // [RecordForm code unchanged]
// //   // --- SNIP ---
// // }


// // function RecordForm({ onSuccess, initial, onClose }) {
// //   // ... same as before
// //   // (No change: This part isn't about filters)
// //   // ... keep code as is for RecordForm
// //   // (omitted for brevity)
// //   // ... paste unchanged RecordForm here ...
// //   // ---- BEGIN COPIED ----
// //   const [dropdowns, setDropdowns] = useState({
// //     styleTypes: [],
// //     salesMen: [],
// //     partyNames: [],
// //   })
// //   const [loadingDropdowns, setLoadingDropdowns] = useState(true)
// //   const [form, setForm] = useState({
// //     partyName: initial?.partyName || '',
// //     challanNo: initial?.challanNo || '',
// //     salesman: initial?.salesman || '',
// //     styleTypes: initial?.styleTypes?.length
// //       ? initial.styleTypes.map(st => ({ ...st }))
// //       : [emptyStyleType()],
// //     totalQty: initial?.totalQty || '',
// //     totalAmount: initial?.totalAmount || '',
// //     payment: initial?.payment || '',
// //     remark: initial?.remark || '',
// //   })
// //   const [loading, setLoading] = useState(false)

// //   useEffect(() => {
// //     let ignore = false
// //     const fetchDropdowns = async () => {
// //       setLoadingDropdowns(true)
// //       try {
// //         const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`);
// //         const toStrings = arr =>
// //           Array.isArray(arr)
// //             ? arr.map(x => typeof x === 'string' ? x : x?.name || '')
// //                 .filter(Boolean)
// //             : []

// //         const _dropdowns = {
// //           styleTypes: toStrings(res.data.styleTypes),
// //           salesMen: toStrings(res.data.salesMen),
// //           partyNames: toStrings(res.data.partyNames),
// //         }

// //         if (!ignore) setDropdowns(_dropdowns)

// //         if (initial) {
// //           const mergeUnique = (arr, val) =>
// //             arr.includes(val) || !val ? arr : [...arr, val]

// //           const defSF = (initial.styleTypes || []).map(st => st.type).filter(Boolean)
// //           setDropdowns(dd => ({
// //             styleTypes: [...new Set([..._dropdowns.styleTypes, ...defSF])],
// //             salesMen: mergeUnique(_dropdowns.salesMen, initial.salesman),
// //             partyNames: mergeUnique(_dropdowns.partyNames, initial.partyName),
// //           }))
// //         }
// //       } catch (err) {
// //         toast.error('Failed to load dropdown values')
// //       } finally {
// //         if (!ignore) setLoadingDropdowns(false)
// //       }
// //     }
// //     fetchDropdowns()
// //     return () => { ignore = true }
// //   }, [initial])

// //   useEffect(() => {
// //     const qtySum = form.styleTypes.reduce(
// //       (acc, curr) => acc + (parseInt(curr.qty || 0, 10)), 0
// //     )
// //     setForm(f => ({ ...f, totalQty: qtySum || '' }))
// //     // eslint-disable-next-line
// //   }, [form.styleTypes])

// //   const handleChange = e => {
// //     const { name, value } = e.target
// //     setForm(f => ({ ...f, [name]: value }))
// //   }

// //   const handleStyleTypeChange = (idx, field, value) => {
// //     setForm(f => {
// //       const updated = [...f.styleTypes]
// //       updated[idx] = { ...updated[idx], [field]: value }
// //       return { ...f, styleTypes: updated }
// //     })
// //   }

// //   const addStyleTypeRow = () => {
// //     setForm(f => ({ ...f, styleTypes: [...f.styleTypes, emptyStyleType()] }))
// //   }

// //   const removeStyleTypeRow = idx => {
// //     setForm(f => {
// //       const updated = f.styleTypes.filter((_, i) => i !== idx)
// //       return { ...f, styleTypes: updated.length ? updated : [emptyStyleType()] }
// //     })
// //   }

// //   const validateForm = () => {
// //     if(!form.partyName.trim()) {
// //       toast.error('Party Name is required')
// //       return false
// //     }
// //     if(!form.challanNo.trim()) {
// //       toast.error('Challan No. is required')
// //       return false
// //     }
// //     if (!form.salesman.trim()) {
// //       toast.error('Salesman is required')
// //       return false
// //     }
// //     const hasValidStyle =
// //       Array.isArray(form.styleTypes) &&
// //       form.styleTypes.length > 0 &&
// //       form.styleTypes.every(st =>
// //         st.type && st.type.trim() &&
// //         st.qty && !isNaN(Number(st.qty)) && Number(st.qty) > 0
// //       )
// //     if(!hasValidStyle){
// //       toast.error('Each style type and quantity is required')
// //       return false
// //     }
// //     if(!form.totalQty || Number(form.totalQty) < 1){
// //       toast.error('Total Qty is required')
// //       return false
// //     }
// //     if(form.totalAmount === '' || Number(form.totalAmount) < 0){
// //       toast.error('Total Amount is required and must not be negative')
// //       return false
// //     }
// //     if(!form.payment){
// //       toast.error('Payment method is required')
// //       return false
// //     }
// //     return true
// //   }

// //   const handleSubmit = async e => {
// //     e.preventDefault()
// //     if(!validateForm()) return
// //     setLoading(true)
// //     const payload = {
// //       partyName: form.partyName.trim(),
// //       challanNo: form.challanNo.trim(),
// //       salesman: form.salesman.trim(),
// //       styleTypes: form.styleTypes.map(st => ({
// //         type: st.type.trim(), qty: Number(st.qty)
// //       })),
// //       totalQty: Number(form.totalQty),
// //       totalAmount: Number(form.totalAmount),
// //       payment: form.payment,
// //       remark: form.remark.trim(),
// //     }

// //     try {
// //       if (initial?._id) {
// //         await offlineAPI.update(initial._id, payload)
// //         toast.success('Record updated')
// //       } else {
// //         await offlineAPI.create(payload)
// //         toast.success('Record added')
// //       }
// //       if (onSuccess) onSuccess()
// //       if (onClose) onClose()
// //     } catch (err) {
// //       console.error('[handleSubmit] Submission error:', err)
// //       toast.error('Failed to submit record')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <form
// //       className="space-y-8 bg-white px-6 py-7 max-w-2xl mx-auto"
// //       onSubmit={handleSubmit}
// //       autoComplete="off"
// //     >
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
// //         {/* Party Name (dropdown) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Party Name<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="partyName"
// //             required
// //             autoFocus
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.partyName}
// //             onChange={handleChange}
// //             disabled={loadingDropdowns}
// //           >
// //             <option value="" disabled>
// //               {loadingDropdowns ? 'Loading...' : 'Select party name'}
// //             </option>
// //             {dropdowns.partyNames.map(name => (
// //               <option key={name} value={name}>{name}</option>
// //             ))}
// //             {form.partyName &&
// //               !dropdowns.partyNames.includes(form.partyName) && (
// //                 <option value={form.partyName}>{form.partyName}</option>
// //               )}
// //           </select>
// //         </div>
// //         {/* Challan No (text field) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Ch. No.<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="challanNo"
// //             type="text"
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.challanNo}
// //             onChange={handleChange}
// //             placeholder="Challan number"
// //             maxLength={40}
// //           />
// //         </div>
// //         {/* Salesman (dropdown) */}
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Salesman<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="salesman"
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.salesman}
// //             onChange={handleChange}
// //             disabled={loadingDropdowns}
// //           >
// //             <option value="" disabled>
// //               {loadingDropdowns ? 'Loading...' : 'Select salesman'}
// //             </option>
// //             {dropdowns.salesMen.map(name => (
// //               <option key={name} value={name}>{name}</option>
// //             ))}
// //             {form.salesman &&
// //               !dropdowns.salesMen.includes(form.salesman) && (
// //                 <option value={form.salesman}>{form.salesman}</option>
// //               )}
// //           </select>
// //         </div>
// //         {/* Style Types dynamic rows (with dropdown for styleType) */}
// //         <div className="flex flex-col md:col-span-2">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Style Types<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <div className="flex flex-col gap-2">
// //             {form.styleTypes.map((st, idx) => (
// //               <div key={idx} className="flex gap-2 items-center">
// //                 <select
// //                   name={`style-type-${idx}`}
// //                   required
// //                   className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //                   value={st.type}
// //                   onChange={e =>
// //                     handleStyleTypeChange(idx, 'type', e.target.value)
// //                   }
// //                   disabled={loadingDropdowns}
// //                 >
// //                   <option value="" disabled>
// //                     {loadingDropdowns ? 'Loading...' : 'Select style type'}
// //                   </option>
// //                   {dropdowns.styleTypes.map(t => (
// //                     <option key={t} value={t}>{t}</option>
// //                   ))}
// //                   {st.type && !dropdowns.styleTypes.includes(st.type) && (
// //                     <option value={st.type}>{st.type}</option>
// //                   )}
// //                 </select>
// //                 <input
// //                   name={`style-qty-${idx}`}
// //                   type="number"
// //                   required
// //                   min={1}
// //                   className="w-24 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //                   placeholder="Qty"
// //                   value={st.qty}
// //                   onChange={e =>
// //                     handleStyleTypeChange(idx, 'qty', e.target.value)
// //                   }
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => removeStyleTypeRow(idx)}
// //                   disabled={form.styleTypes.length <= 1}
// //                   title="Remove row"
// //                   className="ml-1 p-1 text-red-500 hover:text-red-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
// //                 >
// //                   <RiSubtractLine className="text-lg" />
// //                 </button>
// //                 {idx === form.styleTypes.length - 1 && (
// //                   <button
// //                     type="button"
// //                     onClick={addStyleTypeRow}
// //                     title="Add style type"
// //                     className="ml-1 p-1 text-green-600 hover:text-green-800 rounded"
// //                   >
// //                     <RiAddLine className="text-lg" />
// //                   </button>
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Total Qty<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="totalQty"
// //             type="number"
// //             min={1}
// //             required
// //             readOnly
// //             className="w-full rounded-lg border border-zinc-300 bg-zinc-100 cursor-not-allowed px-3 py-2 text-sm transition"
// //             value={form.totalQty}
// //             placeholder="Total Qty"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Total Amount<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <input
// //             name="totalAmount"
// //             type="number"
// //             min={0}
// //             required
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.totalAmount}
// //             onChange={handleChange}
// //             placeholder="0"
// //           />
// //         </div>
// //         <div className="flex flex-col">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Payment<span className="text-red-500 ml-1">*</span>
// //           </label>
// //           <select
// //             name="payment"
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.payment}
// //             onChange={handleChange}
// //             required
// //           >
// //             <option value="" disabled>
// //               Select Payment
// //             </option>
// //             {PAYMENT_OPTIONS.map(opt => (
// //               <option key={opt} value={opt}>{opt}</option>
// //             ))}
// //           </select>
// //         </div>
// //         <div className="flex flex-col md:col-span-2">
// //           <label className="block text-sm font-semibold mb-1 text-neutral-800">
// //             Remark
// //           </label>
// //           <textarea
// //             name="remark"
// //             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
// //             value={form.remark}
// //             onChange={handleChange}
// //             rows={2}
// //             placeholder="Write any remarks"
// //             maxLength={200}
// //           />
// //         </div>
// //       </div>
// //       <div className="flex gap-3 justify-end mt-6">
// //         {onClose && (
// //           <button
// //             type="button"
// //             className="px-6 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
// //             disabled={loading}
// //             onClick={onClose}
// //           >
// //             Cancel
// //           </button>
// //         )}
// //         <button
// //           type="submit"
// //           className="px-6 py-2 rounded-md font-semibold bg-[#f58021] text-white border border-[#f58021] hover:bg-black hover:text-[#f58021] hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] transition disabled:opacity-50 disabled:cursor-not-allowed"
// //           disabled={loading}
// //         >
// //           {loading ? (
// //             <span className="inline-flex items-center">
// //               <svg className="mr-2 w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
// //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
// //               </svg>
// //               Saving...
// //             </span>
// //           ) : initial ? 'Update' : 'Add'}
// //         </button>
// //       </div>
// //     </form>
// //   )
// //   // ---- END COPIED ----
// // }


// function OfflineFilterBar({ value, onChange, loading, onRefresh, onExport, exporting }) {
//   return (
//     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8 mb-6 bg-white border border-zinc-200 shadow-lg rounded-2xl px-4 py-3 transition-all">
//       <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
//         {/* Search */}
//         <div className="flex items-center bg-zinc-100 border border-zinc-300 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all">
//           <span className="pr-2 text-zinc-400">
//             <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <circle cx="11" cy="11" r="7" />
//               <line x1="21" y1="21" x2="16.65" y2="16.65" />
//             </svg>
//           </span>
//           <input
//             type="text"
//             className="!border-0 !bg-transparent focus:!ring-0 focus:!outline-none py-1 px-0.5 w-40 md:w-56 text-xs placeholder-zinc-400"
//             placeholder="Search party / challan / style / salesman"
//             value={value.search}
//             onChange={e => onChange({ search: e.target.value, page: 1 })}
//             spellCheck={false}
//             autoComplete="off"
//           />
//           {!!value.search && (
//             <button
//               type="button"
//               onClick={() => onChange({ search: '', page: 1 })}
//               tabIndex={-1}
//               className="ml-1 p-0.5 rounded-full hover:bg-blue-100 hover:text-blue-800 text-zinc-400 transition"
//               aria-label="Clear search"
//             >
//               <RiCloseLine className="w-3.5 h-3.5" />
//             </button>
//           )}
//         </div>
//         {/* Payment */}
//         <select
//           className="h-8 min-w-[105px] px-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//           value={value.payment}
//           onChange={e => onChange({ payment: e.target.value, page: 1 })}
//         >
//           <option value="">All Payments</option>
//           {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//         </select>
//         {/* Start Date */}
//         <input
//           type="date"
//           className="h-8 px-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//           value={value.startDate || ''}
//           onChange={e => onChange({ startDate: e.target.value, page: 1 })}
//         />
//         {/* End Date */}
//         <input
//           type="date"
//           className="h-8 px-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//           value={value.endDate || ''}
//           onChange={e => onChange({ endDate: e.target.value, page: 1 })}
//         />
//         {/* Sort Order */}
//         <select
//           className="h-8 min-w-[95px] px-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//           value={value.sortOrder}
//           onChange={e => onChange({ sortOrder: e.target.value, page: 1 })}
//         >
//           <option value="desc">Newest</option>
//           <option value="asc">Oldest</option>
//         </select>
//       </div>
//       <div className="flex gap-2 mt-2 md:mt-0 justify-end w-full md:w-auto">
//         <button
//           type="button"
//           className="flex items-center gap-1 btn btn-ghost btn-xs rounded-md border border-zinc-200 hover:bg-blue-100 text-blue-700 transition-all font-medium px-2 py-1 disabled:opacity-70 text-xs"
//           onClick={onRefresh}
//           disabled={loading}
//         >
//           <svg className="w-3.5 h-3.5 stroke-current" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4.05 11A8 8 0 1 1 12 20m-8-8V4.01M4 4h7"></path></svg>
//           Refresh
//         </button>
//         <button
//           type="button"
//           className="flex items-center gap-1 btn btn-outline btn-xs rounded-md border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium shadow-sm px-2 py-1 disabled:opacity-70 text-xs"
//           onClick={onExport}
//           disabled={exporting}
//           title="Export filtered data as Excel"
//         >
//           <RiDownload2Line className="w-4 h-4" />
//           {exporting ? 'Exporting...' : 'Export'}
//         </button>
//       </div>
//     </div>
//   );
// }

// // Utilities for Excel (xlsx) export - client-side only with table data

// function escapeCSV(val) {
//   if (val == null) return '';
//   const str = String(val);
//   if (str.includes('"') || str.includes(',') || str.includes('\n')) {
//     return '"' + str.replace(/"/g, '""') + '"';
//   }
//   return str;
// }

// // Use a simple CSV to Excel download via Blob.
// // For more advanced export (styling, xlsx), integrate a lib like XLSX.js if needed.

// /**
//  * Flatten styleTypes field for export.
//  * Returns a string like: "Type1 (10), Type2 (20)"
//  */
// function styleTypesExport(styleTypes) {
//   if (!Array.isArray(styleTypes) || styleTypes.length === 0) return '';
//   return styleTypes.map(st =>
//     (st.type ? st.type : '') + (st.qty !== undefined && st.qty !== null ? ` (${st.qty})` : '')
//   ).join(', ');
// }

// export default function OfflineManagementPage() {
//   const [records, setRecords] = useState([])
//   const [pagination, setPagination] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     sortBy: 'createdAt',
//     sortOrder: 'desc',
//     search: '',
//     payment: '',
//     startDate: '',
//     endDate: ''
//   })
//   const [deleteItem, setDeleteItem] = useState(null)
//   const [deleting, setDeleting] = useState(false)
//   const [viewItem, setViewItem] = useState(null)

//   const [exporting, setExporting] = useState(false)

//   // Desktop inline form state removed - always show on desktop
//   // Mobile modal form state
//   const [mobileFormOpen, setMobileFormOpen] = useState(false)
//   const [mobileEditingRecord, setMobileEditingRecord] = useState(null)

//   const fetchRecords = useCallback(async () => {
//     setLoading(true)
//     try {
//       const response = await offlineAPI.list({
//         ...filters,
//         ...(filters.startDate ? { startDate: filters.startDate } : {}),
//         ...(filters.endDate ? { endDate: filters.endDate } : {})
//       })

//       let fetchedRecords = []
//       let paginationData = null

//       if (Array.isArray(response)) {
//         fetchedRecords = response
//       } else if (response && typeof response === 'object' && 'success' in response) {
//         fetchedRecords = response.data.data || []
//         paginationData = response.pagination || null
//       } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
//         fetchedRecords = response.data.data
//         paginationData = response.pagination || null
//       } else if (Array.isArray(response?.data?.data)) {
//         fetchedRecords = response.data.data
//         paginationData = response.pagination || null
//       }
//       setRecords(fetchedRecords)
//       setPagination(paginationData)
//     } catch {
//       toast.error('Failed to load offline records')
//     } finally {
//       setLoading(false)
//     }
//   }, [filters])

//   useEffect(() => { fetchRecords() }, [fetchRecords])

//   const handleFilterChange = updates => {
//     setFilters(prev => ({
//       ...prev,
//       ...updates,
//       ...(updates.page ? {} : { page: 1 })
//     }))
//   }

//   const handleDelete = async () => {
//     if (!deleteItem) return
//     setDeleting(true)
//     try {
//       await offlineAPI.delete(deleteItem._id)
//       toast.success('Offline record deleted')
//       fetchRecords()
//     } catch {
//       toast.error('Delete failed')
//     } finally {
//       setDeleting(false)
//       setDeleteItem(null)
//     }
//   }

//   // Opens edit: always modal on mobile, always inline on desktop
//   const [inlineEditingRecord, setInlineEditingRecord] = useState(null)
//   const openEdit = (row) => {
//     if (window.innerWidth >= 768) {
//       setInlineEditingRecord(row)
//       // inline add form visible always, just swap for editing
//     } else {
//       setMobileEditingRecord(row)
//       setMobileFormOpen(true)
//     }
//   }

//   const closeInlineForm = () => {
//     setInlineEditingRecord(null)
//   }

//   const closeMobileForm = () => {
//     setMobileFormOpen(false)
//     setMobileEditingRecord(null)
//   }

//   // Export function using table data (client-side, no API)
//   const handleExport = () => {
//     setExporting(true)
//     try {
//       // The records in the current filter view are in `records` (filtered server-side, but you only have that page)
//       // Do client-side filtering/sorting if you want ALL with current filters, but here just export the current visible data.

//       // If you want to export all filtered data, you must implement client-side pagination and keep all; for now, we export `records` shown in the table.

//       const headers = [
//         'Party Name',
//         'Challan No.',
//         'Salesman',
//         'Style Types',
//         'Total Qty',
//         'Total Amount',
//         'Payment',
//         'Remark',
//         'Created At'
//       ];

//       const rows = records.map(row => ([
//         row.partyName ?? '',
//         row.challanNo ?? '',
//         row.salesman ?? '',
//         styleTypesExport(row.styleTypes),
//         row.totalQty ?? '',
//         row.totalAmount ?? '',
//         row.payment ?? '',
//         row.remark ?? '',
//         row.createdAt ? dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''
//       ]));

//       // Build CSV content
//       const csvContent = [
//         headers.map(escapeCSV).join(','),
//         ...rows.map(row => row.map(escapeCSV).join(','))
//       ].join('\r\n');

//       // Download as Excel (CSV)
//       const now = dayjs().format('YYYYMMDD_HHmmss')
//       const blob = new Blob([csvContent], { type: 'text/csv' });
//       const url = URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = `offline-records-${now}.csv` // .csv, since we are generating CSV. Excel will open it.
//       document.body.appendChild(link)
//       link.click()
//       link.remove()
//       setTimeout(() => {
//         URL.revokeObjectURL(url)
//       }, 1000);
//       toast.success('Exported current page to Excel')
//     } catch (err) {
//       console.error('[Export Excel]', err)
//       toast.error('Export failed')
//     } finally {
//       setExporting(false)
//     }
//   }

//   const columns = [
//     {
//       key: 'partyName',
//       label: 'Party Name',
//       headerClass: 'min-w-[120px] whitespace-nowrap',
//       render: v => <span className="truncate">{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'font-medium text-zinc-800',
//     },
//     {
//       key: 'challanNo',
//       label: 'Ch. No.',
//       headerClass: 'min-w-[80px] whitespace-nowrap',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//     },
//     {
//       key: 'salesman',
//       label: 'Salesman',
//       headerClass: 'min-w-[100px] whitespace-nowrap',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'styleTypes',
//       label: 'Style Types',
//       headerClass: 'min-w-[180px] whitespace-nowrap',
//       render: v =>
//         Array.isArray(v) && v.length
//           ? (
//             <div className="flex flex-col gap-0.5">
//               {v.map((st, i) =>
//                 <span key={i} className="text-xs">
//                   <span className="font-medium">{st.type || <span className="text-zinc-300">—</span>}</span>
//                   {` `}<span className="text-zinc-500">×</span>
//                   <span className="font-mono">{st.qty}</span>
//                 </span>
//               )}
//             </div>
//           )
//           : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'totalQty',
//       label: 'Total Qty',
//       headerClass: 'text-right min-w-[70px]',
//       render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-right',
//     },
//     {
//       key: 'totalAmount',
//       label: 'Total Amount',
//       headerClass: 'text-right min-w-[90px]',
//       render: v => v !== undefined && v !== null && v !== '' ? <span>&#8377;{v}</span> : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-right',
//     },
//     {
//       key: 'payment',
//       label: 'Payment',
//       headerClass: 'min-w-[80px] whitespace-nowrap',
//       render: v => (
//         <span className={
//           "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
//           (v === 'CASH' ? 'bg-green-50 text-green-600'
//             : v === 'UPI' ? 'bg-blue-50 text-blue-600'
//             : v === 'DUE' ? 'bg-orange-50 text-orange-600'
//             : 'text-zinc-300 bg-zinc-100')
//         }>
//           {v || '—'}
//         </span>
//       ),
//     },
//     {
//       key: 'remark',
//       label: 'Remark',
//       headerClass: 'min-w-[100px]',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'actions',
//       label: '',
//       headerClass: 'sticky right-0 bg-white z-10 min-w-[100px]',
//       cellClass: 'text-right pr-1',
//       render: (_, row) => (
//         <div className="flex justify-end gap-1.5">
//           <button
//             onClick={() => setViewItem(row)}
//             className="btn-icon rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
//             title="View"
//             type="button"
//           >
//             <RiEyeLine className="text-lg" />
//           </button>
//           <button
//             onClick={() => openEdit(row)}
//             className="btn-icon rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600"
//             title="Edit"
//             type="button"
//           >
//             <RiEdit2Line className="text-lg" />
//           </button>
//           <button
//             onClick={() => setDeleteItem(row)}
//             className="btn-icon rounded-full bg-red-50 hover:bg-red-100 text-red-600"
//             title="Delete"
//             type="button"
//           >
//             <RiDeleteBinLine className="text-lg" />
//           </button>
//         </div>
//       ),
//     },
//   ]

//   const viewDetails = viewItem
//     ? [
//         ['Party Name', viewItem.partyName],
//         ['Ch. No.', viewItem.challanNo],
//         ['Salesman', viewItem.salesman],
//         [
//           'Style Types',
//           Array.isArray(viewItem.styleTypes) && viewItem.styleTypes.length > 0
//             ? (
//               <div className="flex flex-col gap-0.5">
//                 {viewItem.styleTypes.map((s, i) =>
//                   <span key={i}>
//                     <span className="font-medium">{s.type}</span>{' '}
//                     <span className="text-zinc-500">×</span>
//                     <span className="font-mono">{s.qty}</span>
//                   </span>
//                 )}
//               </div>
//             )
//             : '—'
//         ],
//         ['Total Qty', viewItem.totalQty],
//         ['Total Amount', viewItem.totalAmount !== undefined && viewItem.totalAmount !== null && viewItem.totalAmount !== '' ? `₹${viewItem.totalAmount}` : '—'],
//         [
//           'Payment',
//           viewItem.payment ? (
//             <span className={
//               "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
//               (viewItem.payment === 'CASH' ? 'bg-green-50 text-green-600'
//                 : viewItem.payment === 'UPI' ? 'bg-blue-50 text-blue-600'
//                 : viewItem.payment === 'DUE' ? 'bg-orange-50 text-orange-600'
//                 : 'text-zinc-300 bg-zinc-100')
//             }>
//               {viewItem.payment}
//             </span>
//           ) : '—'
//         ],
//         ['Remark', viewItem.remark],
//         ['Created', viewItem.createdAt ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss') : '—']
//       ]
//     : []

//   return (
//     <div className="min-h-[100vh]">
//       {/* Confirm Delete */}
//       <ConfirmDialog
//         open={!!deleteItem}
//         onClose={() => setDeleteItem(null)}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Delete Offline Record"
//         message={
//           <span>
//             Delete offline record for <span className="font-medium">{deleteItem?.partyName}</span>?<br />
//             <span className="text-red-500">This action cannot be undone.</span>
//           </span>
//         }
//       />

//       {/* Mobile Modal Form (shown only on small screens) */}
//       <Modal
//         open={mobileFormOpen}
//         onClose={closeMobileForm}
//         title={mobileEditingRecord ? 'Edit Offline Record' : 'Add Offline Record'}
//         size="sm"
//       >
//         <RecordForm
//           onSuccess={() => { fetchRecords(); closeMobileForm() }}
//           onClose={closeMobileForm}
//           initial={mobileEditingRecord}
//           compact={false}
//         />
//       </Modal>

//       {/* View Details Modal */}
//       <Modal
//         open={!!viewItem}
//         onClose={() => setViewItem(null)}
//         title="Offline Record Details"
//         size="sm"
//       >
//         {viewItem && (
//           <div className="space-y-2">
//             {viewDetails.map(([label, val]) => (
//               <div key={label} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
//                 <span className="text-sm text-zinc-500">{label}</span>
//                 <span className="text-sm font-medium text-zinc-900">
//                   {typeof val === 'object' ? val : (val ?? '—')}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>

//       <div className="max-w-7xl mx-auto px-3 sm:px-8">
//         {/* Header */}
//         <div className="flex items-center justify-between pt-4 pb-4 sm:pb-6 border-b border-black/10">
//           <div>
//             <h1 className="text-black text-2xl font-bold tracking-tight mb-1">Offline Management</h1>
//             <div className="text-sm text-zinc-500">
//               Create, view, and manage offline stitched item/challan records and payments.
//             </div>
//           </div>

//           {/* Desktop: just show Add button on mobile, do nothing on desktop */}
//           <button
//             className="flex items-center gap-2 px-5 py-2 rounded-md shadow-sm bg-[#f58021] hover:bg-black text-white hover:text-[#f58021] border border-[#f58021] hover:border-black transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] md:hidden"
//             onClick={() => {
//               // Only open modal (add) on mobile
//               if (window.innerWidth < 768) {
//                 setMobileEditingRecord(null)
//                 setMobileFormOpen(true)
//               }
//             }}
//             type="button"
//             title="Add new offline record"
//           >
//             <RiAddCircleLine className="text-2xl" />
//             <span className="hidden sm:inline">Add Record</span>
//             <span className="sm:hidden">Add</span>
//           </button>
  
//         </div>

//         {/* ── Desktop Inline Form (always visible on desktop) ── */}
//         <div className="hidden md:block mt-6">
//           <RecordForm
//             key={inlineEditingRecord?._id || 'new'}
//             onSuccess={() => { fetchRecords(); closeInlineForm() }}
//             onClose={inlineEditingRecord ? closeInlineForm : undefined}
//             initial={inlineEditingRecord}
//             compact={true}
//           />
//         </div>

//         {/* Filters Toolbar + Export */}
//         <OfflineFilterBar
//           value={filters}
//           onChange={handleFilterChange}
//           loading={loading}
//           onRefresh={fetchRecords}
//           onExport={handleExport}
//           exporting={exporting}
//         />

//         <div className="bg-white border border-black/10 shadow rounded-xl overflow-x-auto mt-2">
//           <DataTable
//             columns={columns}
//             data={records}
//             loading={loading}
//             emptyMessage="No offline records found"
//             tableClass="min-w-full border-collapse"
//             striped
//             stickyHeader
//             compact
//             hover
//           />
//           <div className="p-2 sm:p-4">
//             <Pagination
//               pagination={pagination}
//               onChange={page => handleFilterChange({ page })}
//               className="mt-4"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }








import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine } from 'react-icons/ri'
import { DataTable, Pagination } from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { offlineAPI } from '../api/offline'
import axios from 'axios'

// Now only these options (no BANK):
const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']

// --- Add API_BASE_URL for dropdowns fetch ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Reusable initial styleType row
const emptyStyleType = () => ({ type: '', qty: '' })

function RecordForm({ onSuccess, initial, onClose }) {
  // ... same as before
  // (No change: This part isn't about filters)
  // ... keep code as is for RecordForm
  // (omitted for brevity)
  // ... paste unchanged RecordForm here ...
  // ---- BEGIN COPIED ----
  const [dropdowns, setDropdowns] = useState({
    styleTypes: [],
    salesMen: [],
    partyNames: [],
  })
  const [loadingDropdowns, setLoadingDropdowns] = useState(true)
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

  useEffect(() => {
    let ignore = false
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true)
      try {
        const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`);
        const toStrings = arr =>
          Array.isArray(arr)
            ? arr.map(x => typeof x === 'string' ? x : x?.name || '')
                .filter(Boolean)
            : []

        const _dropdowns = {
          styleTypes: toStrings(res.data.styleTypes),
          salesMen: toStrings(res.data.salesMen),
          partyNames: toStrings(res.data.partyNames),
        }

        if (!ignore) setDropdowns(_dropdowns)

        if (initial) {
          const mergeUnique = (arr, val) =>
            arr.includes(val) || !val ? arr : [...arr, val]

          const defSF = (initial.styleTypes || []).map(st => st.type).filter(Boolean)
          setDropdowns(dd => ({
            styleTypes: [...new Set([..._dropdowns.styleTypes, ...defSF])],
            salesMen: mergeUnique(_dropdowns.salesMen, initial.salesman),
            partyNames: mergeUnique(_dropdowns.partyNames, initial.partyName),
          }))
        }
      } catch (err) {
        toast.error('Failed to load dropdown values')
      } finally {
        if (!ignore) setLoadingDropdowns(false)
      }
    }
    fetchDropdowns()
    return () => { ignore = true }
  }, [initial])

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
        {/* Party Name (dropdown) */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Party Name<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="partyName"
            required
            autoFocus
            className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
            value={form.partyName}
            onChange={handleChange}
            disabled={loadingDropdowns}
          >
            <option value="" disabled>
              {loadingDropdowns ? 'Loading...' : 'Select party name'}
            </option>
            {dropdowns.partyNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            {form.partyName &&
              !dropdowns.partyNames.includes(form.partyName) && (
                <option value={form.partyName}>{form.partyName}</option>
              )}
          </select>
        </div>
        {/* Challan No (text field) */}
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
        {/* Salesman (dropdown) */}
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
            <option value="" disabled>
              {loadingDropdowns ? 'Loading...' : 'Select salesman'}
            </option>
            {dropdowns.salesMen.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            {form.salesman &&
              !dropdowns.salesMen.includes(form.salesman) && (
                <option value={form.salesman}>{form.salesman}</option>
              )}
          </select>
        </div>
        {/* Style Types dynamic rows (with dropdown for styleType) */}
        <div className="flex flex-col md:col-span-2">
          <label className="block text-sm font-semibold mb-1 text-neutral-800">
            Style Types<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {form.styleTypes.map((st, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  name={`style-type-${idx}`}
                  required
                  className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
                  value={st.type}
                  onChange={e =>
                    handleStyleTypeChange(idx, 'type', e.target.value)
                  }
                  disabled={loadingDropdowns}
                >
                  <option value="" disabled>
                    {loadingDropdowns ? 'Loading...' : 'Select style type'}
                  </option>
                  {dropdowns.styleTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  {st.type && !dropdowns.styleTypes.includes(st.type) && (
                    <option value={st.type}>{st.type}</option>
                  )}
                </select>
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
  // ---- END COPIED ----
}

// Extended filterBar to include all filters: search, payment, startDate, endDate, sortBy (fixed for now), sortOrder
function OfflineFilterBar({ value, onChange, loading, onRefresh }) {
  // value contains: {search, payment, startDate, endDate, sortBy, sortOrder}
  // Please update the inputs as you need to use all available filters.

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
        {/* Start Date */}
        <input
          type="date"
          className="input input-bordered h-10 text-sm"
          value={value.startDate || ''}
          onChange={e => onChange({ startDate: e.target.value, page: 1 })}
          placeholder="Start date"
        />
        {/* End Date */}
        <input
          type="date"
          className="input input-bordered h-10 text-sm"
          value={value.endDate || ''}
          onChange={e => onChange({ endDate: e.target.value, page: 1 })}
          placeholder="End date"
        />
        {/* Sort Order */}
        <select
          className="select select-bordered h-10 min-w-[120px] text-sm"
          value={value.sortOrder}
          onChange={e => onChange({ sortOrder: e.target.value, page: 1 })}
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
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
    payment: '',
    startDate: '',
    endDate: ''
  })
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // fetchRecords will send all filters supported by backend: page, limit, search, payment, startDate, endDate, sortBy, sortOrder
  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      // Ensure backend gets all filters
      const response = await offlineAPI.list({
        ...filters,
        // If blank date, omit so backend defaults to today
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {})
      })

      let fetchedRecords = []
      let paginationData = null
      // Defensive forms for different backend wrappers
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
    } catch (err) {
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
      // When changing filters, reset page unless updating just page (for pagination)
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

  // Updated columns for new schema (unchanged)
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

// import React, { useEffect, useState, useCallback } from 'react'
// import toast from 'react-hot-toast'
// import dayjs from 'dayjs'
// import { RiAddCircleLine, RiEyeLine, RiDeleteBinLine, RiEdit2Line, RiCloseLine, RiAddLine, RiSubtractLine } from 'react-icons/ri'
// import { DataTable, Pagination } from '../components/common/DataTable'
// import Modal from '../components/common/Modal'
// import ConfirmDialog from '../components/common/ConfirmDialog'
// import { offlineAPI } from '../api/offline'
// import axios from 'axios'

// const PAYMENT_OPTIONS = ['CASH', 'DUE', 'UPI']
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const emptyStyleType = () => ({ type: '', qty: '' })

// function RecordForm({ onSuccess, initial, onClose, compact }) {
//   const [dropdowns, setDropdowns] = useState({ styleTypes: [], salesMen: [], partyNames: [] })
//   const [loadingDropdowns, setLoadingDropdowns] = useState(true)
//   const [form, setForm] = useState({
//     partyName: initial?.partyName || '',
//     challanNo: initial?.challanNo || '',
//     salesman: initial?.salesman || '',
//     styleTypes: initial?.styleTypes?.length
//       ? initial.styleTypes.map(st => ({ ...st }))
//       : [emptyStyleType()],
//     totalQty: initial?.totalQty || '',
//     totalAmount: initial?.totalAmount || '',
//     payment: initial?.payment || '',
//     remark: initial?.remark || '',
//   })
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     let ignore = false
//     const fetchDropdowns = async () => {
//       setLoadingDropdowns(true)
//       try {
//         const res = await axios.get(`${API_BASE_URL}/offline-data/dropdowns`)
//         const toStrings = arr =>
//           Array.isArray(arr)
//             ? arr.map(x => typeof x === 'string' ? x : x?.name || '').filter(Boolean)
//             : []

//         const _dropdowns = {
//           styleTypes: toStrings(res.data.styleTypes),
//           salesMen: toStrings(res.data.salesMen),
//           partyNames: toStrings(res.data.partyNames),
//         }
//         if (!ignore) setDropdowns(_dropdowns)

//         if (initial) {
//           const mergeUnique = (arr, val) =>
//             arr.includes(val) || !val ? arr : [...arr, val]
//           const defSF = (initial.styleTypes || []).map(st => st.type).filter(Boolean)
//           setDropdowns(dd => ({
//             styleTypes: [...new Set([..._dropdowns.styleTypes, ...defSF])],
//             salesMen: mergeUnique(_dropdowns.salesMen, initial.salesman),
//             partyNames: mergeUnique(_dropdowns.partyNames, initial.partyName),
//           }))
//         }
//       } catch {
//         toast.error('Failed to load dropdown values')
//       } finally {
//         if (!ignore) setLoadingDropdowns(false)
//       }
//     }
//     fetchDropdowns()
//     return () => { ignore = true }
//   }, [initial])

//   useEffect(() => {
//     const qtySum = form.styleTypes.reduce((acc, curr) => acc + (parseInt(curr.qty || 0, 10)), 0)
//     setForm(f => ({ ...f, totalQty: qtySum || '' }))
//     // eslint-disable-next-line
//   }, [form.styleTypes])

//   const handleChange = e => {
//     const { name, value } = e.target
//     setForm(f => ({ ...f, [name]: value }))
//   }

//   const handleStyleTypeChange = (idx, field, value) => {
//     setForm(f => {
//       const updated = [...f.styleTypes]
//       updated[idx] = { ...updated[idx], [field]: value }
//       return { ...f, styleTypes: updated }
//     })
//   }

//   const addStyleTypeRow = () => {
//     setForm(f => ({ ...f, styleTypes: [...f.styleTypes, emptyStyleType()] }))
//   }

//   const removeStyleTypeRow = idx => {
//     setForm(f => {
//       const updated = f.styleTypes.filter((_, i) => i !== idx)
//       return { ...f, styleTypes: updated.length ? updated : [emptyStyleType()] }
//     })
//   }

//   const validateForm = () => {
//     if (!form.partyName.trim()) { toast.error('Party Name is required'); return false }
//     if (!form.challanNo.trim()) { toast.error('Challan No. is required'); return false }
//     if (!form.salesman.trim()) { toast.error('Salesman is required'); return false }
//     const hasValidStyle =
//       Array.isArray(form.styleTypes) &&
//       form.styleTypes.length > 0 &&
//       form.styleTypes.every(st =>
//         st.type && st.type.trim() &&
//         st.qty && !isNaN(Number(st.qty)) && Number(st.qty) > 0
//       )
//     if (!hasValidStyle) { toast.error('Each style type and quantity is required'); return false }
//     if (!form.totalQty || Number(form.totalQty) < 1) { toast.error('Total Qty is required'); return false }
//     if (form.totalAmount === '' || Number(form.totalAmount) < 0) { toast.error('Total Amount is required and must not be negative'); return false }
//     if (!form.payment) { toast.error('Payment method is required'); return false }
//     return true
//   }

//   const handleSubmit = async e => {
//     e.preventDefault()
//     if (!validateForm()) return
//     setLoading(true)
//     const payload = {
//       partyName: form.partyName.trim(),
//       challanNo: form.challanNo.trim(),
//       salesman: form.salesman.trim(),
//       styleTypes: form.styleTypes.map(st => ({ type: st.type.trim(), qty: Number(st.qty) })),
//       totalQty: Number(form.totalQty),
//       totalAmount: Number(form.totalAmount),
//       payment: form.payment,
//       remark: form.remark.trim(),
//     }
//     try {
//       if (initial?._id) {
//         await offlineAPI.update(initial._id, payload)
//         toast.success('Record updated')
//       } else {
//         await offlineAPI.create(payload)
//         toast.success('Record added')
//       }
//       if (onSuccess) onSuccess()
//       if (onClose) onClose()
//     } catch (err) {
//       console.error('[handleSubmit] Submission error:', err)
//       toast.error('Failed to submit record')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // compact = true when rendered inline above the table on desktop
//   const wrapperClass = compact
//     ? "bg-white border border-black/10 rounded-xl px-6 py-5 w-full"
//     : "space-y-8 bg-white px-6 py-7 max-w-2xl mx-auto"

//   return (
//     <form className={wrapperClass} onSubmit={handleSubmit} autoComplete="off">
//       {/* Title row when compact (inline on desktop) */}
//       {compact && (
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-base font-bold text-zinc-800">
//             {initial ? 'Edit Offline Record' : 'Add Offline Record'}
//           </h2>
//           {onClose && (
//             <button
//               type="button"
//               onClick={onClose}
//               className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition md:hidden"
//               title="Close form"
//             >
//               <RiCloseLine className="text-xl" />
//             </button>
//           )}
     
//         </div>
//       )}

//       {/* Scrollable wrapper for small height screens */}
//       <div
//         className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4"
//         style={{
//           maxHeight: '60vh',
//           overflowY: 'auto',
//           overscrollBehavior: 'contain',
//         }}
//       >
//         {/* Party Name */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Party Name<span className="text-red-500 ml-1">*</span>
//           </label>
//           <select
//             name="partyName"
//             required
//             autoFocus={!compact}
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.partyName}
//             onChange={handleChange}
//             disabled={loadingDropdowns}
//           >
//             <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select party name'}</option>
//             {dropdowns.partyNames.map(name => <option key={name} value={name}>{name}</option>)}
//             {form.partyName && !dropdowns.partyNames.includes(form.partyName) && (
//               <option value={form.partyName}>{form.partyName}</option>
//             )}
//           </select>
//         </div>

//         {/* Challan No */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Ch. No.<span className="text-red-500 ml-1">*</span>
//           </label>
//           <input
//             name="challanNo"
//             type="text"
//             required
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.challanNo}
//             onChange={handleChange}
//             placeholder="Challan number"
//             maxLength={40}
//           />
//         </div>

//         {/* Salesman */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Salesman<span className="text-red-500 ml-1">*</span>
//           </label>
//           <select
//             name="salesman"
//             required
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.salesman}
//             onChange={handleChange}
//             disabled={loadingDropdowns}
//           >
//             <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select salesman'}</option>
//             {dropdowns.salesMen.map(name => <option key={name} value={name}>{name}</option>)}
//             {form.salesman && !dropdowns.salesMen.includes(form.salesman) && (
//               <option value={form.salesman}>{form.salesman}</option>
//             )}
//           </select>
//         </div>

//         {/* Style Types — spans full width */}
//         <div className="flex flex-col md:col-span-3">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Style Types<span className="text-red-500 ml-1">*</span>
//           </label>
//           <div className="flex flex-col gap-2">
//             {form.styleTypes.map((st, idx) => (
//               <div key={idx} className="flex gap-2 items-center">
//                 <select
//                   name={`style-type-${idx}`}
//                   required
//                   className="flex-1 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//                   value={st.type}
//                   onChange={e => handleStyleTypeChange(idx, 'type', e.target.value)}
//                   disabled={loadingDropdowns}
//                 >
//                   <option value="" disabled>{loadingDropdowns ? 'Loading...' : 'Select style type'}</option>
//                   {dropdowns.styleTypes.map(t => <option key={t} value={t}>{t}</option>)}
//                   {st.type && !dropdowns.styleTypes.includes(st.type) && (
//                     <option value={st.type}>{st.type}</option>
//                   )}
//                 </select>
//                 <input
//                   name={`style-qty-${idx}`}
//                   type="number"
//                   required
//                   min={1}
//                   className="w-24 rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//                   placeholder="Qty"
//                   value={st.qty}
//                   onChange={e => handleStyleTypeChange(idx, 'qty', e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => removeStyleTypeRow(idx)}
//                   disabled={form.styleTypes.length <= 1}
//                   title="Remove row"
//                   className="ml-1 p-1 text-red-500 hover:text-red-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <RiSubtractLine className="text-lg" />
//                 </button>
//                 {idx === form.styleTypes.length - 1 && (
//                   <button
//                     type="button"
//                     onClick={addStyleTypeRow}
//                     title="Add style type"
//                     className="ml-1 p-1 text-green-600 hover:text-green-800 rounded"
//                   >
//                     <RiAddLine className="text-lg" />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Total Qty */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Total Qty<span className="text-red-500 ml-1">*</span>
//           </label>
//           <input
//             name="totalQty"
//             type="number"
//             min={1}
//             required
//             readOnly
//             className="w-full rounded-lg border border-zinc-300 bg-zinc-100 cursor-not-allowed px-3 py-2 text-sm transition"
//             value={form.totalQty}
//             placeholder="Total Qty"
//           />
//         </div>

//         {/* Total Amount */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Total Amount<span className="text-red-500 ml-1">*</span>
//           </label>
//           <input
//             name="totalAmount"
//             type="number"
//             min={0}
//             required
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.totalAmount}
//             onChange={handleChange}
//             placeholder="0"
//           />
//         </div>

//         {/* Payment */}
//         <div className="flex flex-col">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">
//             Payment<span className="text-red-500 ml-1">*</span>
//           </label>
//           <select
//             name="payment"
//             required
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.payment}
//             onChange={handleChange}
//           >
//             <option value="" disabled>Select Payment</option>
//             {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//           </select>
//         </div>

//         {/* Remark */}
//         <div className="flex flex-col md:col-span-3">
//           <label className="block text-sm font-semibold mb-1 text-neutral-800">Remark</label>
//           <textarea
//             name="remark"
//             className="w-full rounded-lg border border-zinc-300 focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]/80 px-3 py-2 text-sm transition"
//             value={form.remark}
//             onChange={handleChange}
//             rows={2}
//             placeholder="Write any remarks"
//             maxLength={200}
//           />
//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="flex gap-3 justify-end mt-5">
//         {onClose && !compact && (
//           <button
//             type="button"
//             className="px-6 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={loading}
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         )}
//         {compact && onClose && (
//           <button
//             type="button"
//             className="px-5 py-2 rounded-md bg-white border border-neutral-300 text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//             disabled={loading}
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         )}
//         <button
//           type="submit"
//           className="px-6 py-2 rounded-md font-semibold bg-[#f58021] text-white border border-[#f58021] hover:bg-black hover:text-[#f58021] hover:border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//           disabled={loading}
//         >
//           {loading ? (
//             <span className="inline-flex items-center">
//               <svg className="mr-2 w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//               </svg>
//               Saving...
//             </span>
//           ) : initial ? 'Update' : 'Add'}
//         </button>
//       </div>
//     </form>
//   )
// }

// function OfflineFilterBar({ value, onChange, loading, onRefresh }) {
//   return (
//     <div className="flex flex-wrap items-center gap-2 justify-between mt-6 mb-4">
//       <div className="flex flex-wrap gap-2 items-center">
//         {/* Search */}
//         <div className="flex items-center border border-zinc-200 bg-white rounded-md shadow-sm px-2">
//           <span className="pr-2 text-zinc-400">
//             <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//               <circle cx="11" cy="11" r="7" />
//               <line x1="21" y1="21" x2="16.65" y2="16.65" />
//             </svg>
//           </span>
//           <input
//             type="text"
//             className="!border-0 !bg-white focus:!ring-0 focus:!outline-none py-2 px-1 w-48 md:w-64 text-sm"
//             placeholder="Search party / challan / style / salesman"
//             value={value.search}
//             onChange={e => onChange({ search: e.target.value, page: 1 })}
//             spellCheck={false}
//             autoComplete="off"
//           />
//           {!!value.search && (
//             <button
//               type="button"
//               onClick={() => onChange({ search: '', page: 1 })}
//               tabIndex={-1}
//               className="ml-2 p-0.5 rounded hover:bg-zinc-100 text-zinc-400"
//             >
//               <RiCloseLine className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//         {/* Payment */}
//         <select
//           className="select select-bordered h-10 min-w-[120px] text-sm"
//           value={value.payment}
//           onChange={e => onChange({ payment: e.target.value, page: 1 })}
//         >
//           <option value="">All Payments</option>
//           {PAYMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//         </select>
//         {/* Start Date */}
//         <input
//           type="date"
//           className="input input-bordered h-10 text-sm"
//           value={value.startDate || ''}
//           onChange={e => onChange({ startDate: e.target.value, page: 1 })}
//         />
//         {/* End Date */}
//         <input
//           type="date"
//           className="input input-bordered h-10 text-sm"
//           value={value.endDate || ''}
//           onChange={e => onChange({ endDate: e.target.value, page: 1 })}
//         />
//         {/* Sort Order */}
//         <select
//           className="select select-bordered h-10 min-w-[120px] text-sm"
//           value={value.sortOrder}
//           onChange={e => onChange({ sortOrder: e.target.value, page: 1 })}
//         >
//           <option value="desc">Newest</option>
//           <option value="asc">Oldest</option>
//         </select>
//       </div>
//       <div className="flex gap-1">
//         <button
//           type="button"
//           className="btn btn-ghost btn-sm"
//           onClick={onRefresh}
//           disabled={loading}
//         >
//           Refresh
//         </button>
//       </div>
//     </div>
//   )
// }

// export default function OfflineManagementPage() {
//   const [records, setRecords] = useState([])
//   const [pagination, setPagination] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     sortBy: 'createdAt',
//     sortOrder: 'desc',
//     search: '',
//     payment: '',
//     startDate: '',
//     endDate: ''
//   })
//   const [deleteItem, setDeleteItem] = useState(null)
//   const [deleting, setDeleting] = useState(false)
//   const [viewItem, setViewItem] = useState(null)

//   // Desktop inline form state is eliminated. Form should always be open, so no open/close for desktop.
//   // But we keep editingRecord for editing in desktop.
//   const [inlineEditingRecord, setInlineEditingRecord] = useState(null)

//   // Mobile modal form state
//   const [mobileFormOpen, setMobileFormOpen] = useState(false)
//   const [mobileEditingRecord, setMobileEditingRecord] = useState(null)

//   const fetchRecords = useCallback(async () => {
//     setLoading(true)
//     try {
//       const response = await offlineAPI.list({
//         ...filters,
//         ...(filters.startDate ? { startDate: filters.startDate } : {}),
//         ...(filters.endDate ? { endDate: filters.endDate } : {})
//       })

//       let fetchedRecords = []
//       let paginationData = null

//       if (Array.isArray(response)) {
//         fetchedRecords = response
//       } else if (response && typeof response === 'object' && 'success' in response) {
//         fetchedRecords = response.data.data || []
//         paginationData = response.pagination || null
//       } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
//         fetchedRecords = response.data.data
//         paginationData = response.pagination || null
//       } else if (Array.isArray(response?.data?.data)) {
//         fetchedRecords = response.data.data
//         paginationData = response.pagination || null
//       }
//       setRecords(fetchedRecords)
//       setPagination(paginationData)
//     } catch {
//       toast.error('Failed to load offline records')
//     } finally {
//       setLoading(false)
//     }
//   }, [filters])

//   useEffect(() => { fetchRecords() }, [fetchRecords])

//   const handleFilterChange = updates => {
//     setFilters(prev => ({
//       ...prev,
//       ...updates,
//       ...(updates.page ? {} : { page: 1 })
//     }))
//   }

//   const handleDelete = async () => {
//     if (!deleteItem) return
//     setDeleting(true)
//     try {
//       await offlineAPI.delete(deleteItem._id)
//       toast.success('Offline record deleted')
//       fetchRecords()
//     } catch {
//       toast.error('Delete failed')
//     } finally {
//       setDeleting(false)
//       setDeleteItem(null)
//     }
//   }

//   // Opens edit: inline on desktop (md+), modal on mobile
//   const openEdit = (row) => {
//     // We check window width to decide which to open.
//     // On desktop, set the edit. On mobile, open modal.
//     if (window.innerWidth >= 768) {
//       setInlineEditingRecord(row)
//       // no open/close - always open!
//     } else {
//       setMobileEditingRecord(row)
//       setMobileFormOpen(true)
//     }
//   }

//   // On desktop, clear editing form after save
//   const clearInlineEditing = () => {
//     setInlineEditingRecord(null)
//   }

//   const closeMobileForm = () => {
//     setMobileFormOpen(false)
//     setMobileEditingRecord(null)
//   }

//   const columns = [
//     {
//       key: 'partyName',
//       label: 'Party Name',
//       headerClass: 'min-w-[120px] whitespace-nowrap',
//       render: v => <span className="truncate">{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'font-medium text-zinc-800',
//     },
//     {
//       key: 'challanNo',
//       label: 'Ch. No.',
//       headerClass: 'min-w-[80px] whitespace-nowrap',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//     },
//     {
//       key: 'salesman',
//       label: 'Salesman',
//       headerClass: 'min-w-[100px] whitespace-nowrap',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'styleTypes',
//       label: 'Style Types',
//       headerClass: 'min-w-[180px] whitespace-nowrap',
//       render: v =>
//         Array.isArray(v) && v.length
//           ? (
//             <div className="flex flex-col gap-0.5">
//               {v.map((st, i) =>
//                 <span key={i} className="text-xs">
//                   <span className="font-medium">{st.type || <span className="text-zinc-300">—</span>}</span>
//                   {` `}<span className="text-zinc-500">×</span>
//                   <span className="font-mono">{st.qty}</span>
//                 </span>
//               )}
//             </div>
//           )
//           : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'totalQty',
//       label: 'Total Qty',
//       headerClass: 'text-right min-w-[70px]',
//       render: v => v !== undefined && v !== null && v !== '' ? <span>{v}</span> : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-right',
//     },
//     {
//       key: 'totalAmount',
//       label: 'Total Amount',
//       headerClass: 'text-right min-w-[90px]',
//       render: v => v !== undefined && v !== null && v !== '' ? <span>&#8377;{v}</span> : <span className="text-zinc-300">—</span>,
//       cellClass: 'text-right',
//     },
//     {
//       key: 'payment',
//       label: 'Payment',
//       headerClass: 'min-w-[80px] whitespace-nowrap',
//       render: v => (
//         <span className={
//           "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
//           (v === 'CASH' ? 'bg-green-50 text-green-600'
//             : v === 'UPI' ? 'bg-blue-50 text-blue-600'
//             : v === 'DUE' ? 'bg-orange-50 text-orange-600'
//             : 'text-zinc-300 bg-zinc-100')
//         }>
//           {v || '—'}
//         </span>
//       ),
//     },
//     {
//       key: 'remark',
//       label: 'Remark',
//       headerClass: 'min-w-[100px]',
//       render: v => <span>{v || <span className="text-zinc-300">—</span>}</span>,
//       cellClass: 'text-zinc-700',
//     },
//     {
//       key: 'actions',
//       label: '',
//       headerClass: 'sticky right-0 bg-white z-10 min-w-[100px]',
//       cellClass: 'text-right pr-1',
//       render: (_, row) => (
//         <div className="flex justify-end gap-1.5">
//           <button
//             onClick={() => setViewItem(row)}
//             className="btn-icon rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
//             title="View"
//             type="button"
//           >
//             <RiEyeLine className="text-lg" />
//           </button>
//           <button
//             onClick={() => openEdit(row)}
//             className="btn-icon rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600"
//             title="Edit"
//             type="button"
//           >
//             <RiEdit2Line className="text-lg" />
//           </button>
//           <button
//             onClick={() => setDeleteItem(row)}
//             className="btn-icon rounded-full bg-red-50 hover:bg-red-100 text-red-600"
//             title="Delete"
//             type="button"
//           >
//             <RiDeleteBinLine className="text-lg" />
//           </button>
//         </div>
//       ),
//     },
//   ]

//   const viewDetails = viewItem
//     ? [
//         ['Party Name', viewItem.partyName],
//         ['Ch. No.', viewItem.challanNo],
//         ['Salesman', viewItem.salesman],
//         [
//           'Style Types',
//           Array.isArray(viewItem.styleTypes) && viewItem.styleTypes.length > 0
//             ? (
//               <div className="flex flex-col gap-0.5">
//                 {viewItem.styleTypes.map((s, i) =>
//                   <span key={i}>
//                     <span className="font-medium">{s.type}</span>{' '}
//                     <span className="text-zinc-500">×</span>
//                     <span className="font-mono">{s.qty}</span>
//                   </span>
//                 )}
//               </div>
//             )
//             : '—'
//         ],
//         ['Total Qty', viewItem.totalQty],
//         ['Total Amount', viewItem.totalAmount !== undefined && viewItem.totalAmount !== null && viewItem.totalAmount !== '' ? `₹${viewItem.totalAmount}` : '—'],
//         [
//           'Payment',
//           viewItem.payment ? (
//             <span className={
//               "capitalize px-2 py-0.5 rounded font-semibold text-xs " +
//               (viewItem.payment === 'CASH' ? 'bg-green-50 text-green-600'
//                 : viewItem.payment === 'UPI' ? 'bg-blue-50 text-blue-600'
//                 : viewItem.payment === 'DUE' ? 'bg-orange-50 text-orange-600'
//                 : 'text-zinc-300 bg-zinc-100')
//             }>
//               {viewItem.payment}
//             </span>
//           ) : '—'
//         ],
//         ['Remark', viewItem.remark],
//         ['Created', viewItem.createdAt ? dayjs(viewItem.createdAt).format('MMM D, YYYY HH:mm:ss') : '—']
//       ]
//     : []

//   return (
//     <div className="min-h-[100vh]">
//       {/* Confirm Delete */}
//       <ConfirmDialog
//         open={!!deleteItem}
//         onClose={() => setDeleteItem(null)}
//         onConfirm={handleDelete}
//         loading={deleting}
//         title="Delete Offline Record"
//         message={
//           <span>
//             Delete offline record for <span className="font-medium">{deleteItem?.partyName}</span>?<br />
//             <span className="text-red-500">This action cannot be undone.</span>
//           </span>
//         }
//       />

//       {/* Mobile Modal Form (shown only on small screens) */}
//       <Modal
//         open={mobileFormOpen}
//         onClose={closeMobileForm}
//         title={mobileEditingRecord ? 'Edit Offline Record' : 'Add Offline Record'}
//         size="sm"
//       >
//         <RecordForm
//           onSuccess={() => { fetchRecords(); closeMobileForm() }}
//           onClose={closeMobileForm}
//           initial={mobileEditingRecord}
//           compact={false}
//         />
//       </Modal>

//       {/* View Details Modal */}
//       <Modal
//         open={!!viewItem}
//         onClose={() => setViewItem(null)}
//         title="Offline Record Details"
//         size="sm"
//       >
//         {viewItem && (
//           <div className="space-y-2">
//             {viewDetails.map(([label, val]) => (
//               <div key={label} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
//                 <span className="text-sm text-zinc-500">{label}</span>
//                 <span className="text-sm font-medium text-zinc-900">
//                   {typeof val === 'object' ? val : (val ?? '—')}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>

//       <div className="max-w-7xl mx-auto px-3 sm:px-8">
//         {/* Header */}
//         <div className="flex items-center justify-between pt-4 pb-4 sm:pb-6 border-b border-black/10">
//           <div>
//             <h1 className="text-black text-2xl font-bold tracking-tight mb-1">Offline Management</h1>
//             <div className="text-sm text-zinc-500">
//               Create, view, and manage offline stitched item/challan records and payments.
//             </div>
//           </div>

//           {/* MOBILE ONLY: Add Record button (no desktop version!) */}
//           <button
//             className="flex items-center gap-2 px-5 py-2 rounded-md shadow-sm bg-[#f58021] hover:bg-black text-white hover:text-[#f58021] border border-[#f58021] hover:border-black transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f58021] md:hidden"
//             onClick={() => {
//               // Only used on mobile; on desktop the form is always open and button is hidden
//               setMobileEditingRecord(null)
//               setMobileFormOpen(true)
//             }}
//             type="button"
//             title="Add new offline record"
//           >
//             <RiAddCircleLine className="text-2xl" />
//             <span className="sm:hidden">Add</span>
//             <span className="hidden sm:inline">Add Record</span>
//           </button>
//         </div>

//         {/* Desktop Inline Form: always shown, no toggle, never closes. Hidden on mobile. */}
//         <div className="hidden md:block mt-6">
//           <RecordForm
//             key={inlineEditingRecord?._id || 'new'}
//             onSuccess={() => {
//               fetchRecords()
//               clearInlineEditing()
//             }}
//             // Cancel editing returns to add mode (blank form, not closes)
//             onClose={clearInlineEditing}
//             initial={inlineEditingRecord}
//             compact={true}
//           />
//         </div>

//         {/* Filters Toolbar */}
//         <OfflineFilterBar
//           value={filters}
//           onChange={handleFilterChange}
//           loading={loading}
//           onRefresh={fetchRecords}
//         />

//         <div className="bg-white border border-black/10 shadow rounded-xl overflow-x-auto mt-2">
//           <DataTable
//             columns={columns}
//             data={records}
//             loading={loading}
//             emptyMessage="No offline records found"
//             tableClass="min-w-full border-collapse"
//             striped
//             stickyHeader
//             compact
//             hover
//           />
//           <div className="p-2 sm:p-4">
//             <Pagination
//               pagination={pagination}
//               onChange={page => handleFilterChange({ page })}
//               className="mt-4"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }