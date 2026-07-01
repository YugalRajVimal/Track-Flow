
// import React, { useState, useEffect, useMemo } from 'react'
// import toast from 'react-hot-toast'
// import axios from 'axios'
// import {
//   RiCheckLine, RiCloseLine, RiDeleteBin5Line, RiSearchLine,
//   RiFilter3Line, RiRefreshLine, RiAddLine, RiPencilLine, RiInboxArchiveLine
// } from 'react-icons/ri'
// import WorkflowHeader from '../../components/common/WorkflowHeader'
// import EmptyState from '../../components/common/EmptyState'
// import Modal from '../../components/common/Modal'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const initialSubmissionForm = {
//   fabricPartyName: '',
//   receiverPartyName: '',
//   submitterName: '',
//   length: '',
//   mtr: '',
//   remark: '',
//   challanNo: '',
//   challanPhotoPath: '',
//   locationStatus: 'warehouse',
//   savedSinkage: '',
// }

// /* ---------------------------------------------------------------- */
// /*  Calculation helpers                                             */
// /* ---------------------------------------------------------------- */
// /**
//  * Compute MTR after sinkage: (MTR - (MTR * sinkage / 100))
//  * Always use task.sinkage, ignore savedSinkage for all calculations.
//  */
// function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage, _savedSinkage) {
//   if (
//     subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined || sinkage === null || isNaN(Number(sinkage))
//   ) return '-'
//   return (Number(subTaskMtr) - (Number(subTaskMtr) * Number(sinkage) / 100)).toFixed(2)
// }

// function computeSubmissionMtrL100(mtr, length) {
//   if (
//     mtr === undefined || mtr === null || isNaN(Number(mtr)) ||
//     length === undefined || length === null || isNaN(Number(length))
//   ) return '-'
//   return (Number(mtr) * (Number(length) / 100)).toFixed(2)
// }

// function getSubmittedMtrL100Sum(subTask) {
//   const subs = getSubTaskSubmissionsArray(subTask)
//   let total = 0
//   for (const s of subs) {
//     const mtr = Number(s?.MTR)
//     const len = Number(s?.length)
//     if (!isNaN(mtr) && !isNaN(len)) {
//       total += mtr * (len / 100)
//     }
//   }
//   return total
// }

// function computeRemainingMtrL100(subTask, task, currentMtrL100) {
//   const afterSink = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, task.sinkage))
//   if (isNaN(afterSink)) return '-'
//   let sumL100 = getSubmittedMtrL100Sum(subTask)
//   if (typeof currentMtrL100 === 'number') {
//     sumL100 += currentMtrL100
//   }
//   const remaining = afterSink - sumL100
//   return remaining.toFixed(2)
// }

// function getSubTaskSubmissionsArray(subTask) {
//   if (!subTask) return []
//   if (Array.isArray(subTask.submissions)) return subTask.submissions
//   if (Array.isArray(subTask.submission)) return subTask.submission
//   if (subTask.submission) return [subTask.submission]
//   return []
// }

// function canAddSubmissionToSubTask(subTask, taskData) {
//   if (!subTask || !taskData) return { isAddDisabled: false, hasMissing: false, hasSavedSinkage: false, mtrLeft: null, allowedMtr: null }
//   let subtaskMtrAfterSinkage
//   if (typeof subTask.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined') {
//     subtaskMtrAfterSinkage = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
//   }
//   const submissions = getSubTaskSubmissionsArray(subTask)
//   const submissionMtrSum = submissions.reduce((sum, s) => {
//     const mtrVal = Number(s?.MTR)
//     return isNaN(mtrVal) ? sum : sum + mtrVal
//   }, 0)
//   const mtrLeft = (subtaskMtrAfterSinkage !== undefined && !isNaN(subtaskMtrAfterSinkage))
//     ? Math.max(subtaskMtrAfterSinkage - submissionMtrSum, 0)
//     : null
//   const hasMissing = submissions.some(x => x.locationStatus === 'missing')
//   const hasSavedSinkage = submissions.some(x => x.locationStatus === 'savedSinkage')
//   const isAddDisabled = (mtrLeft === 0) || hasMissing || hasSavedSinkage
//   return {
//     isAddDisabled,
//     hasMissing,
//     hasSavedSinkage,
//     mtrLeft,
//     allowedMtr: (subtaskMtrAfterSinkage !== undefined && !isNaN(subtaskMtrAfterSinkage)) ? subtaskMtrAfterSinkage : null,
//     submittedMtr: submissionMtrSum,
//   }
// }

// function getSubTaskMissingStats(subTask, taskData) {
//   const submissions = getSubTaskSubmissionsArray(subTask)
//   const sumAllMTR = submissions.reduce((sum, s) => {
//     const mtr = Number(s?.MTR)
//     return isNaN(mtr) ? sum : sum + mtr
//   }, 0)
//   const subTaskMtrAfterSinkageRaw =
//     typeof subTask.mtr !== 'undefined' &&
//     typeof taskData?.sinkage !== 'undefined'
//       ? Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
//       : undefined
//   const hasMissing = submissions.some(x => x.locationStatus === 'missing')
//   const hasSavedSinkage = submissions.some(x => x.locationStatus === 'savedSinkage')
//   let missingMTRAfterSinkage = null
//   if (hasMissing || hasSavedSinkage) {
//     missingMTRAfterSinkage =
//       (isNaN(subTaskMtrAfterSinkageRaw) || isNaN(sumAllMTR))
//         ? null
//         : Math.max(subTaskMtrAfterSinkageRaw - sumAllMTR, 0)
//   }
//   return { hasMissing, hasSavedSinkage, missingMTR: missingMTRAfterSinkage, warehouseSum: sumAllMTR }
// }

// // -- Only these three statuses now: warehouse, missing, savedSinkage --
// // Row status is one of: warehouse, missing, savedSinkage
// function getRowStatus(subTask, taskData) {
//   const submissions = getSubTaskSubmissionsArray(subTask)
//   // SavedSinkage overrides
//   if (submissions.some((x) => x.locationStatus === 'savedSinkage')) return "savedSinkage"
//   if (submissions.some((x) => x.locationStatus === 'missing')) return "missing"
//   // If there is at least one warehouse submission, call it warehouse. If none at all, it's still warehouse by default.
//   if (submissions.length === 0) return "warehouse"
//   // If all have warehouse status
//   if (submissions.every(x => x.locationStatus === "warehouse")) return "warehouse"
//   // Fallback (shouldn't happen, but for completeness)
//   return "warehouse"
// }

// // Proper styles for these three statuses
// const STATUS_STYLES = {
//   warehouse: { label: 'Warehouse', cls: 'bg-green-100 text-green-700 border-green-200' },
//   missing: { label: 'Missing', cls: 'bg-red-100 text-red-700 border-red-300' },
//   savedSinkage: { label: 'Saved Sinkage', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
// }

// const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
// const pillInput =
//   'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
// const softInput =
//   'w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400 resize-none'
// const fileInput =
//   'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

// const copyToClipboard = async (text) => {
//   if (!text) return
//   try {
//     await navigator.clipboard.writeText(text)
//     toast.success('Copied')
//   } catch {
//     toast.error('Failed to copy')
//   }
// }

// function usePreviewImageModal() {
//   const [previewUrl, setPreviewUrl] = useState(null)
//   const [previewAlt, setPreviewAlt] = useState('')
//   const [showPreview, setShowPreview] = useState(false)
//   const [downloadError, setDownloadError] = useState('')
//   const [downloading, setDownloading] = useState(false)

//   function open(url, alt = '') {
//     setPreviewUrl(url)
//     setPreviewAlt(alt)
//     setShowPreview(true)
//     setDownloadError('')
//   }
//   function close() {
//     setShowPreview(false)
//     setPreviewUrl(null)
//     setPreviewAlt('')
//     setDownloadError('')
//   }

//   const handleDownload = async () => {
//     if (!previewUrl) return
//     setDownloadError('')
//     setDownloading(true)
//     try {
//       const response = await fetch(previewUrl, { credentials: 'same-origin', mode: 'cors' })
//       if (!response.ok) throw new Error('Image download failed')
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       const fname = decodeURIComponent(previewUrl.split('/').pop() || 'challan_image.png')
//       link.download = fname
//       document.body.appendChild(link)
//       link.click()
//       setTimeout(() => {
//         document.body.removeChild(link)
//         window.URL.revokeObjectURL(url)
//       }, 100)
//     } catch {
//       setDownloadError('Download failed — the file may not be accessible right now. Try again in a moment.')
//     }
//     setDownloading(false)
//   }

//   const ModalPreview = ({ width = 480 }) =>
//     <Modal open={showPreview} onClose={close} width={width} showClose title="Challan Photo">
//       {previewUrl ? (
//         <div className="p-4 flex flex-col items-center gap-4">
//           <img
//             src={previewUrl}
//             alt={previewAlt || 'Challan photo'}
//             className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
//             style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
//           />
//           <button
//             type="button"
//             className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2 transition disabled:bg-gray-300"
//             onClick={handleDownload}
//             disabled={downloading}
//           >
//             {downloading ? 'Downloading…' : 'Download'}
//           </button>
//           {downloadError && <div className="text-center text-xs text-red-500">{downloadError}</div>}
//         </div>
//       ) : (
//         <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
//       )}
//     </Modal>
//   return { open, close, ModalPreview }
// }

// /* ---------------------------------------------------------------- */
// /*  Main component                                                   */
// /* ---------------------------------------------------------------- */
// const AllSubTasksTable = () => {
//   const [allTasks, setAllTasks] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [loadError, setLoadError] = useState('')

//   // filters
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [fabricTypeFilter, setFabricTypeFilter] = useState('all')

//   // submission form / modal state
//   const [selectedTask, setSelectedTask] = useState(null)
//   const [selectedSubTask, setSelectedSubTask] = useState(null)
//   const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)
//   const [showSubmissionModal, setShowSubmissionModal] = useState(false)
//   const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)
//   const [existingChallanPhotoPath, setExistingChallanPhotoPath] = useState('')
//   const [submitting, setSubmitting] = useState(false)
//   const [deletingIndex, setDeletingIndex] = useState(null)
//   const [error, setError] = useState('')

//   // Submissions modal — opens when a sub-task row is selected/clicked
//   const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
//   const [submissionsContext, setSubmissionsContext] = useState(null)
//   const [cameFromSubmissionsModal, setCameFromSubmissionsModal] = useState(false)

//   const [dropdownOptions, setDropdownOptions] = useState({ fabricPartyNames: [], receiverPartyNames: [], length: [] })
//   const [dropdownLoading, setDropdownLoading] = useState(false)

//   const challanPreview = usePreviewImageModal()

//   /* ---------------- data loading ---------------- */
//   async function fetchAllTasks() {
//     setLoading(true)
//     setLoadError('')
//     try {
//       const res = await axios.get(`${API_BASE_URL}/tasks`)
//       const data = res.data?.success && Array.isArray(res.data.data) ? res.data.data : []
//       setAllTasks(data)
//     } catch {
//       setLoadError('Could not load tasks. Check your connection and try refreshing.')
//       setAllTasks([])
//     }
//     setLoading(false)
//   }

//   useEffect(() => {
//     fetchAllTasks()
//     let isSubscribed = true
//     setDropdownLoading(true)
//     axios.get(`${API_BASE_URL}/tasks/dropdowns`)
//       .then(res => {
//         if (!isSubscribed) return
//         setDropdownOptions({
//           fabricPartyNames: Array.isArray(res.data?.data?.FabricPartyName) ? res.data.data.FabricPartyName : [],
//           receiverPartyNames: Array.isArray(res.data?.data?.recieverPartyName) ? res.data.data.recieverPartyName : [],
//           length: Array.isArray(res.data?.data?.length) ? res.data.data.length : [],
//         })
//       })
//       .catch(() => {})
//       .finally(() => { if (isSubscribed) setDropdownLoading(false) })
//     return () => { isSubscribed = false }
//   }, [])

//   async function refreshOneTask(taskId) {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId } })
//       if (res.data?.data) {
//         setAllTasks(prev => prev.map(t => (t.taskId === taskId ? res.data.data : t)))
//         return res.data.data
//       }
//     } catch {
//       await fetchAllTasks()
//     }
//     return null
//   }

//   function openSubmissionsModal(task, subTask) {
//     setSubmissionsContext({ task, subTask })
//     setShowSubmissionsModal(true)
//   }

//   function closeSubmissionsModal() {
//     setShowSubmissionsModal(false)
//     setSubmissionsContext(null)
//   }

//   function syncSubmissionsContext(updatedTask, subTaskId) {
//     if (!updatedTask) return
//     const freshSubTask = (Array.isArray(updatedTask.subTask) ? updatedTask.subTask : [])
//       .find(st => (st.subTaskId || st._id) === subTaskId)
//     if (freshSubTask) {
//       setSubmissionsContext({ task: updatedTask, subTask: freshSubTask })
//     }
//   }

//   const flatRows = useMemo(() => {
//     const rows = []
//     allTasks.forEach(task => {
//       const subs = Array.isArray(task.subTask) ? task.subTask : []
//       subs.forEach((st, idx) => {
//         rows.push({ task, subTask: st, subTaskIndex: idx, status: getRowStatus(st, task) })
//       })
//     })
//     return rows
//   }, [allTasks])

//   const fabricTypes = useMemo(() => {
//     const set = new Set()
//     allTasks.forEach(t => { if (t.FabricType) set.add(t.FabricType) })
//     return Array.from(set)
//   }, [allTasks])

//   const filteredRows = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase()
//     return flatRows.filter(row => {
//       if (statusFilter !== 'all' && row.status !== statusFilter) return false
//       if (fabricTypeFilter !== 'all' && row.task.FabricType !== fabricTypeFilter) return false
//       if (!term) return true
//       const haystack = [
//         row.task.taskId, row.task.partyName, row.task.FabricType, row.task.BuiltyNo,
//         row.subTask.program, row.subTask.jigarNo, row.subTask.subTaskId,
//       ].filter(Boolean).join(' ').toLowerCase()
//       return haystack.includes(term)
//     })
//   }, [flatRows, searchTerm, statusFilter, fabricTypeFilter])

//   // --- Status counts summary ONLY for warehouse, missing, savedSinkage
//   const summary = useMemo(() => {
//     // always keep total (all subTasks) card
//     const s = { total: flatRows.length, warehouse: 0, missing: 0, savedSinkage: 0 }
//     flatRows.forEach(r => {
//       if (r.status === 'warehouse') s.warehouse += 1
//       else if (r.status === 'missing') s.missing += 1
//       else if (r.status === 'savedSinkage') s.savedSinkage += 1
//     })
//     return s
//   }, [flatRows])

//   const filtersActive = statusFilter !== 'all' || fabricTypeFilter !== 'all' || searchTerm.trim() !== ''
//   function clearFilters() {
//     setStatusFilter('all')
//     setFabricTypeFilter('all')
//     setSearchTerm('')
//   }

//   function closeSubmissionModal() {
//     setShowSubmissionModal(false)
//     setSelectedSubmissionIndex(null)
//     setExistingChallanPhotoPath('')
//     setError('')
//     setSubmissionForm(initialSubmissionForm)
//     setSelectedTask(null)
//     setSelectedSubTask(null)
//     if (cameFromSubmissionsModal) {
//       setShowSubmissionsModal(true)
//       setCameFromSubmissionsModal(false)
//     }
//   }

//   function openAddModal(task, subTask, fromList = false) {
//     setSelectedTask(task)
//     setSelectedSubTask(subTask)
//     setSelectedSubmissionIndex(null)
//     setExistingChallanPhotoPath('')
//     setError('')
//     setSubmissionForm({ ...initialSubmissionForm, remark: subTask?.remark || '' })
//     setCameFromSubmissionsModal(fromList)
//     if (fromList) setShowSubmissionsModal(false)
//     setShowSubmissionModal(true)
//   }

//   function openEditModal(task, subTask, submissionIndex, subToEdit, fromList = false) {
//     setSelectedTask(task)
//     setSelectedSubTask(subTask)
//     setSelectedSubmissionIndex(submissionIndex)
//     setExistingChallanPhotoPath(subToEdit?.challanPhotoPath || '')
//     setError('')
//     setSubmissionForm({
//       fabricPartyName: subToEdit?.fabricPartyName || '',
//       receiverPartyName: subToEdit?.recieverPartyName || '',
//       submitterName: subToEdit?.submitterName || '',
//       length: subToEdit?.length || '',
//       mtr: subToEdit?.MTR ?? subTask?.mtr ?? '',
//       remark: subTask?.remark || '',
//       challanNo: subToEdit?.challanNo || '',
//       challanPhotoPath: '',
//       locationStatus: subToEdit?.locationStatus || 'warehouse',
//       savedSinkage: (subToEdit?.locationStatus === 'savedSinkage' && (typeof subToEdit?.savedSinkage === 'number' || typeof subToEdit?.savedSinkage === 'string')) 
//         ? subToEdit.savedSinkage : '',
//     })
//     setCameFromSubmissionsModal(fromList)
//     if (fromList) setShowSubmissionsModal(false)
//     setShowSubmissionModal(true)
//   }

//   function handleSubmissionFormChange(e) {
//     const { name, value, type, files } = e.target
//     if (type === 'file' && name === 'challanPhotoPath') {
//       setSubmissionForm(prev => ({ ...prev, challanPhotoPath: files && files[0] ? files[0] : '' }))
//     } else {
//       setSubmissionForm(prev => ({ ...prev, [name]: name === "savedSinkage" ? value.replace(/[^0-9.]/g, "") : value }))
//     }
//   }

//   function canAddSubmission(subTask, taskData, formSubmission, isEdit) {
//     const mtr = Number(formSubmission.mtr)
//     const photoRequired = !isEdit || !existingChallanPhotoPath
//     const hasPhoto = (formSubmission.challanPhotoPath instanceof File) || (!photoRequired)

//     // Validate LocationStatus + (SavedSinkage)
//     if (
//       formSubmission.locationStatus === 'savedSinkage' &&
//       (formSubmission.savedSinkage === '' || isNaN(Number(formSubmission.savedSinkage)) || Number(formSubmission.savedSinkage) < 0)
//     ) {
//       return {
//         valid: false,
//         msg: 'Please enter a valid sinkage percentage (number) for this submission.',
//       }
//     }

//     // Only one missing or savedSinkage per sub-task (besides other validations)
//     const submissions = getSubTaskSubmissionsArray(subTask)
//     const editingIsMissing = isEdit && typeof selectedSubmissionIndex === 'number' && submissions[selectedSubmissionIndex]?.locationStatus === 'missing'
//     const editingIsSavedSinkage = isEdit && typeof selectedSubmissionIndex === 'number' && submissions[selectedSubmissionIndex]?.locationStatus === 'savedSinkage'
//     const otherHasMissing = submissions.some((s, i) =>
//       s.locationStatus === 'missing' && !(isEdit && i === selectedSubmissionIndex)
//     )
//     const otherHasSavedSinkage = submissions.some((s, i) =>
//       s.locationStatus === 'savedSinkage' && !(isEdit && i === selectedSubmissionIndex)
//     )
//     if (formSubmission.locationStatus === 'missing' && otherHasMissing) {
//       return { valid: false, msg: 'Only one submission per sub-task can be marked "Missing".' }
//     }
//     if (formSubmission.locationStatus === 'savedSinkage' && otherHasSavedSinkage) {
//       return { valid: false, msg: 'Only one submission per sub-task can have "Saved Sinkage".' }
//     }
//     if (otherHasMissing && !editingIsMissing) {
//       return { valid: false, msg: 'No more submissions are allowed — one entry for this sub-task is already marked "Missing".' }
//     }
//     if (otherHasSavedSinkage && !editingIsSavedSinkage) {
//       return { valid: false, msg: 'No more submissions are allowed — one entry for this sub-task already uses "Saved Sinkage".' }
//     }

//     if (
//       !formSubmission.fabricPartyName || !formSubmission.receiverPartyName ||
//       !formSubmission.submitterName || !formSubmission.length ||
//       !formSubmission.mtr || !formSubmission.challanNo || !hasPhoto || !formSubmission.locationStatus
//     ) {
//       return {
//         valid: false,
//         msg: photoRequired
//           ? 'Please fill in every field — location status and a challan photo are required too.'
//           : 'Please fill in every field (existing challan photo will be kept if you don\u2019t upload a new one).',
//       }
//     }
//     if (isNaN(mtr) || mtr <= 0) return { valid: false, msg: 'MTR is required and must be greater than 0.' }

//     const editingSubTaskId = subTask?.subTaskId || subTask?._id
//     let editingChallanNo
//     if (isEdit && typeof selectedSubmissionIndex === 'number') {
//       editingChallanNo = getSubTaskSubmissionsArray(subTask)[selectedSubmissionIndex]?.challanNo
//     }
//     const newChallanNoTrimmed = String(formSubmission.challanNo).trim().toLowerCase()
//     const subsOfTask = Array.isArray(taskData?.subTask) ? taskData.subTask : []
//     for (const st of subsOfTask) {
//       for (const sub of getSubTaskSubmissionsArray(st)) {
//         const isSelf =
//           isEdit &&
//           String(sub.challanNo).trim().toLowerCase() === String(editingChallanNo || '').trim().toLowerCase() &&
//           (st.subTaskId || st._id) === editingSubTaskId
//         if (!isSelf && String(sub.challanNo).trim().toLowerCase() === newChallanNoTrimmed) {
//           return { valid: false, msg: `Challan No "${formSubmission.challanNo}" is already used by another submission.` }
//         }
//       }
//     }

//     const filteredForSum = isEdit && typeof selectedSubmissionIndex === 'number'
//       ? submissions.filter((_, i) => i !== selectedSubmissionIndex)
//       : submissions
//     const submissionMTRSum = filteredForSum.reduce((sum, s) => {
//       const mtrVal = Number(s?.MTR)
//       return isNaN(mtrVal) ? sum : sum + mtrVal
//     }, 0)

//     if (typeof subTask.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined') {
//       const subtaskMtrAfterSinkage = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
//       const mtrLeft = subtaskMtrAfterSinkage - submissionMTRSum
//       if (!isNaN(subtaskMtrAfterSinkage) && (submissionMTRSum + mtr > subtaskMtrAfterSinkage + 1e-8)) {
//         return { valid: false, msg: `Only ${mtrLeft >= 0 ? mtrLeft.toFixed(2) : 0} MTR left (after sinkage) for this sub-task.` }
//       }
//       if (mtrLeft === 0) return { valid: false, msg: 'No MTR left to submit for this sub-task.' }
//     }
//     return { valid: true, msg: '' }
//   }

//   async function handleSubmission(e) {
//     e.preventDefault()
//     if (!selectedTask || !selectedSubTask) return
//     setError('')
//     setSubmitting(true)
//     const isEdit = typeof selectedSubmissionIndex === 'number'
//     const validation = canAddSubmission(selectedSubTask, selectedTask, submissionForm, isEdit)
//     if (!validation.valid) {
//       setError(validation.msg)
//       setSubmitting(false)
//       return
//     }
//     try {
//       const subTaskId = selectedSubTask.subTaskId || selectedSubTask._id
//       const taskId = selectedTask.taskId
//       let url, method
//       if (!isEdit) {
//         url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`
//         method = 'post'
//       } else {
//         url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission?submissionIndex=${selectedSubmissionIndex}`
//         method = 'put'
//       }
//       const formData = new FormData()
//       formData.append('fabricPartyName', submissionForm.fabricPartyName)
//       formData.append('recieverPartyName', submissionForm.receiverPartyName)
//       formData.append('submitterName', submissionForm.submitterName)
//       formData.append('length', submissionForm.length)
//       formData.append('MTR', submissionForm.mtr)
//       formData.append('challanNo', submissionForm.challanNo)
//       if (submissionForm.remark !== undefined) formData.append('remark', submissionForm.remark)
//       formData.append('locationStatus', submissionForm.locationStatus || 'warehouse')
//       if (submissionForm.locationStatus === 'savedSinkage' && submissionForm.savedSinkage !== '' && !isNaN(Number(submissionForm.savedSinkage))) {
//         formData.append('savedSinkage', Number(submissionForm.savedSinkage))
//       }
//       if (submissionForm.challanPhotoPath instanceof File) {
//         formData.append('challanPhotoUpload', submissionForm.challanPhotoPath)
//       } else if (isEdit && existingChallanPhotoPath) {
//         formData.append('challanPhotoUpload', existingChallanPhotoPath)
//       }

//       if (method === 'post') {
//         await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
//       } else {
//         await axios.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
//       }
//       toast.success(isEdit ? 'Submission updated' : 'Submission added')
//       const updatedTask = await refreshOneTask(taskId)
//       if (cameFromSubmissionsModal) syncSubmissionsContext(updatedTask, subTaskId)
//       closeSubmissionModal()
//     } catch (err) {
//       const serverMsg = err?.response?.data?.message
//       setError(serverMsg || 'Submission failed. Please try again.')
//       toast.error(serverMsg || 'Submission failed')
//     }
//     setSubmitting(false)
//   }

//   async function handleSubmissionDelete(task, subTask, submissionIndex, keepListModalOpen = false) {
//     const msg = 'Delete this submission? This cannot be undone.'
//     if (!window.confirm(msg)) return
//     setDeletingIndex(submissionIndex)
//     const subTaskId = subTask.subTaskId || subTask._id
//     try {
//       let url = `${API_BASE_URL}/tasks/${task.taskId}/subtasks/${subTaskId}/submission`
//       if (typeof submissionIndex === 'number') url += `?submissionIndex=${submissionIndex}`
//       await axios.delete(url)
//       toast('Submission deleted', { icon: '🗑️' })
//       const updatedTask = await refreshOneTask(task.taskId)
//       if (keepListModalOpen) {
//         syncSubmissionsContext(updatedTask, subTaskId)
//       } else {
//         closeSubmissionsModal()
//       }
//       setShowSubmissionModal(false)
//     } catch {
//       toast.error('Failed to delete submission')
//     }
//     setDeletingIndex(null)
//   }

//   const renderChallanPhotoLink = (path, altLabel) => {
//     if (!path) return <span className="text-gray-400 text-xs">No photo</span>
//     let fullUrl = path
//     if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
//     return (
//       <button
//         type="button"
//         className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs"
//         style={{ background: 'none', border: 'none', cursor: 'pointer' }}
//         onClick={() => challanPreview.open(fullUrl, altLabel || 'Challan photo')}
//         title="Preview image"
//       >
//         View photo
//       </button>
//     )
//   }

//   let mtrInputValue = submissionForm.mtr
//   let submissionLengthValue = (typeof submissionForm.length !== 'undefined' && submissionForm.length !== null) ? submissionForm.length : ''
//   let mtrL100Value = '-'
//   if (
//     mtrInputValue !== undefined && mtrInputValue !== '' && !isNaN(Number(mtrInputValue)) &&
//     submissionLengthValue !== undefined && submissionLengthValue !== '' && !isNaN(Number(submissionLengthValue))
//   ) {
//     mtrL100Value = computeSubmissionMtrL100(mtrInputValue, submissionLengthValue)
//   }
//   let mtrL100Numeric = (typeof mtrL100Value === "string" ? parseFloat(mtrL100Value) : mtrL100Value)
//   if (isNaN(mtrL100Numeric)) mtrL100Numeric = 0

//   let mtrAfterSinkageValue = '-'
//   let currentSinkage = selectedTask?.sinkage
//   if (selectedTask && selectedSubTask && selectedSubTask.mtr &&
//       (currentSinkage !== undefined && currentSinkage !== null)
//   ) {
//     mtrAfterSinkageValue = computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, currentSinkage)
//   }

//   let alreadySubmittedL100 = selectedSubTask ? getSubmittedMtrL100Sum(selectedSubTask) : 0
//   let alreadySubmittedL100Display = (alreadySubmittedL100 && !isNaN(alreadySubmittedL100)) ? alreadySubmittedL100.toFixed(2) : '-'

//   let remainingAfterL100 = '-'
//   if (
//     selectedTask && selectedSubTask &&
//     mtrAfterSinkageValue !== '-' && !isNaN(Number(mtrAfterSinkageValue)) &&
//     (!isNaN(alreadySubmittedL100) || !isNaN(mtrL100Numeric))
//   ) {
//     remainingAfterL100 = (Number(mtrAfterSinkageValue) - alreadySubmittedL100 - mtrL100Numeric).toFixed(2)
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <WorkflowHeader
//         activeStep="submission"
//         topLabel="Fabric Task Workflow"
//         title="All Sub-Tasks"
//         subtitle="Every sub-task across every task, with full task context. Click a row to view or add submissions."
//       />

//       <div className="max-w-7xl mx-auto px-2 md:px-6 sm:px-10 pb-10">

//         {/* Summary strip */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//           <SummaryCard label="Total Sub-Tasks" value={summary.total} accent="border-gray-200 text-gray-700" onClick={() => setStatusFilter('all')} active={statusFilter === 'all'} />
//           <SummaryCard label="Warehouse" value={summary.warehouse} accent="border-green-200 text-green-700" onClick={() => setStatusFilter('warehouse')} active={statusFilter === 'warehouse'} />
//           <SummaryCard label="Missing" value={summary.missing} accent="border-red-200 text-red-700" onClick={() => setStatusFilter('missing')} active={statusFilter === 'missing'} />
//           <SummaryCard label="Saved Sinkage" value={summary.savedSinkage} accent="border-blue-200 text-blue-700" onClick={() => setStatusFilter('savedSinkage')} active={statusFilter === 'savedSinkage'} />
//         </div>

//         {/* Filter bar */}
//         <div className="flex flex-wrap items-center gap-3 mb-5 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3">
//           <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
//             <RiSearchLine className="text-gray-400" size={16} />
//             <input
//               type="text"
//               placeholder="Search Task ID, Party, Program, Jigar No..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
//             />
//             {searchTerm && (
//               <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
//                 <RiCloseLine size={14} />
//               </button>
//             )}
//           </div>

//           <select
//             value={fabricTypeFilter}
//             onChange={e => setFabricTypeFilter(e.target.value)}
//             className="rounded-full border border-gray-200 bg-gray-50 text-sm px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
//           >
//             <option value="all">All Fabric Types</option>
//             {fabricTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
//           </select>

//           {filtersActive && (
//             <button
//               type="button"
//               onClick={clearFilters}
//               className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-2 transition"
//             >
//               <RiCloseLine size={13} />
//               Clear filters
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={fetchAllTasks}
//             className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 transition ml-auto"
//           >
//             <RiRefreshLine size={15} className={loading ? 'animate-spin' : ''} />
//             Refresh
//           </button>
//         </div>

//         {loadError && (
//           <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium flex items-center justify-between gap-3">
//             <span>{loadError}</span>
//             <button type="button" onClick={fetchAllTasks} className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-1.5 transition whitespace-nowrap">
//               Try again
//             </button>
//           </div>
//         )}

//         {/* Main table */}
//         <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="py-16 text-center text-orange-500 text-sm font-medium animate-pulse">Loading sub-tasks...</div>
//           ) : filteredRows.length === 0 ? (
//             <div className="py-10">
//               <EmptyState
//                 icon="🧵"
//                 text={flatRows.length === 0 ? 'No sub-tasks exist yet.' : 'No sub-tasks match your filters.'}
//               />
//               {filtersActive && flatRows.length > 0 && (
//                 <div className="text-center mt-3">
//                   <button type="button" onClick={clearFilters} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
//                     Clear filters
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1360px] text-sm">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     <Th>Task ID</Th>
//                     <Th>Party Name</Th>
//                     <Th>Fabric Type</Th>
//                     <Th>SubTask ID</Th>
//                     <Th>Program</Th>
//                     <Th>Jigar No</Th>
//                     <Th>Length</Th>
//                     <Th>Sub MTR</Th>
//                     <Th>MTR After Sinkage</Th>
//                     <Th>Remark</Th>
//                     <Th>Submissions</Th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRows.map(({ task, subTask, subTaskIndex, status }) => {
//                     const submissions = getSubTaskSubmissionsArray(subTask)
//                     const rowKey = `${task.taskId}-${subTask.subTaskId || subTask._id || subTaskIndex}`
//                     const st = STATUS_STYLES[status]
//                     const hasSavedSinkage =
//                       submissions.some((ss) => ss.locationStatus === 'savedSinkage')
//                     return (
//                       <tr
//                         key={rowKey}
//                         onClick={() => openSubmissionsModal(task, subTask)}
//                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSubmissionsModal(task, subTask) } }}
//                         role="button"
//                         tabIndex={0}
//                         className={`border-t border-gray-100 transition-colors cursor-pointer focus:outline-none focus:bg-orange-50 ${
//                           status === 'missing'
//                             ? 'bg-red-50/60 hover:bg-red-100/70'
//                             : status === 'savedSinkage'
//                               ? 'bg-blue-50/60 hover:bg-blue-100/70'
//                               : 'hover:bg-orange-50/50'
//                         }`}
//                         title="Click to view or manage submissions for this sub-task"
//                       >
//                         <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold">
//                           <span className="inline-flex items-center gap-1">
//                             {task.taskId}
//                             <button
//                               type="button"
//                               aria-label="Copy Task ID"
//                               className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]"
//                               onClick={(e) => { e.stopPropagation(); copyToClipboard(task.taskId) }}
//                             >Copy</button>
//                           </span>
//                         </td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-800">{task.partyName || '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-700">{task.FabricType || '-'}</td>
//                         <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
//                           <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{subTask.subTaskId ?? subTask._id ?? '-'}</span>
//                           {/* {hasSavedSinkage &&
//                             <span className="ml-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold" title="Submissions use Saved Sinkage">
//                               Saved Sinkage submission
//                             </span>
//                           } */}
//                         </td>
//                         <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{subTask.program ?? '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-700">{subTask.jigarNo ?? '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">{task.Length ?? '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">{subTask.mtr ?? '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">
//                           {computeSubTaskMtrAfterSinkage(
//                             subTask.mtr,
//                             task.sinkage
//                           )}
//                         </td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-600 max-w-[160px] truncate" title={subTask.remark ?? ''}>{subTask.remark ?? '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">
//                           <button
//                             type="button"
//                             onClick={(e) => { e.stopPropagation(); openSubmissionsModal(task, subTask) }}
//                             className={
//                               'flex items-center gap-1.5 rounded-full font-semibold text-xs px-4 py-1.5 transition border ' +
//                               (
//                                 submissions.length === 0
//                                   ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
//                                   : status === 'missing'
//                                     ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
//                                     : status === 'savedSinkage'
//                                       ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
//                                       : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
//                               )
//                             }
//                           >
//                             {submissions.length === 0 ? (
//                               <><RiAddLine size={14} /> Submit</>
//                             ) : (
//                               <>{submissions.length} Submission{submissions.length > 1 ? 's' : ''} · View</>
//                             )}
//                           </button>
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         <div className="mt-3 text-xs text-gray-400 text-right">
//           Showing {filteredRows.length} of {flatRows.length} sub-tasks
//         </div>
//       </div>

//       {/* Add / Edit Submission Modal */}
//       {/* (Component unchanged, but available locationStatus values are: warehouse, missing, savedSinkage) */}
//       <Modal
//         open={showSubmissionModal}
//         onClose={closeSubmissionModal}
//         width={520}
//         title={typeof selectedSubmissionIndex === 'number' ? 'Edit Submission' : 'Add Submission'}
//         showClose
//       >
//         {selectedSubTask && selectedTask && (
//           // ... unchanged content here, omitted for brevity ...
//           // See your original code for Add/Edit Modal
//           <form className="flex flex-col gap-6 py-1 px-1" onSubmit={handleSubmission} autoComplete="off">
//             <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="text-xs space-y-2">
//                 <div>
//                   <span className="font-bold text-gray-500">Task ID:</span>{' '}
//                   <span className="font-mono text-gray-800">{selectedTask.taskId}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Party Name:</span>{' '}
//                   <span className="text-gray-800">{selectedTask.partyName ?? '-'}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">SubTask ID:</span>{' '}
//                   <span className="font-mono text-gray-800">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span>
//                   {/* Show Saved Sinkage badge only if existing submission has savedSinkage, NOT if subTask.savedSinkage is present */}
//                   {/* {getSubTaskSubmissionsArray(selectedSubTask).some(ss => ss.locationStatus === 'savedSinkage') &&
//                     <span className="ml-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold" title="A submission uses Saved Sinkage">
//                       Saved Sinkage submission
//                     </span>
//                   } */}
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Program:</span>{' '}
//                   <span className="text-gray-800">{selectedSubTask.program ?? '-'}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Jigar No:</span>{' '}
//                   <span className="text-gray-800">{selectedSubTask.jigarNo ?? '-'}</span>
//                 </div>
//               </div>
//               <div className="text-xs space-y-2">
//                 <div>
//                   <span className="font-bold text-gray-500">MTR:</span>{' '}
//                   <span className="text-gray-800">{selectedSubTask.mtr ?? '-'}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Length:</span>{' '}
//                   <span className="text-gray-800">{selectedTask.Length ?? '-'}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">MTR After Sinkage:</span>{' '}
//                   <span className="text-gray-800">
//                     {mtrAfterSinkageValue}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <MtrProgress subTask={selectedSubTask} task={selectedTask} />

//             <div className="flex flex-col gap-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Fabric Party Name<span className="text-red-500 font-bold ml-1">*</span></label>
//                   <select name="fabricPartyName" value={submissionForm.fabricPartyName} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
//                     <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Party Name'}</option>
//                     {dropdownOptions.fabricPartyNames.map((name, i) => <option key={name || i} value={name}>{name}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Receiver Party Name<span className="text-red-500 font-bold ml-1">*</span></label>
//                   <select name="receiverPartyName" value={submissionForm.receiverPartyName} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
//                     <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Receiver Name'}</option>
//                     {dropdownOptions.receiverPartyNames.map((name, i) => <option key={name || i} value={name}>{name}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Submitter Name<span className="text-red-500 font-bold ml-1">*</span></label>
//                   <input name="submitterName" type="text" placeholder="Submitter Name" value={submissionForm.submitterName} onChange={handleSubmissionFormChange} className={pillInput} required />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Length<span className="text-red-500 font-bold ml-1">*</span></label>
//                   <select name="length" value={submissionForm.length} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
//                     <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Length'}</option>
//                     {dropdownOptions.length.map((len, i) => <option key={len || i} value={len}>{len}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>
//                     MTR
//                     {submissionForm.length
//                       ? <span className="ml-1 text-gray-500 font-normal">(L{submissionForm.length})</span>
//                       : null}
//                     <span className="text-red-500 font-bold ml-1">*</span>
//                   </label>
//                   <input name="mtr" type="number" min={0} step="0.01" placeholder="MTR" value={submissionForm.mtr} onChange={handleSubmissionFormChange} className={pillInput} required />
//                 </div>

//                 <div className="flex flex-col">
//                   <label className={labelClass}>Submitted MTR (L100)</label>
//                   <input
//                     type="text"
//                     value={mtrL100Value !== undefined ? mtrL100Value : ''}
//                     className={pillInput + " bg-gray-50 text-gray-600"}
//                     disabled
//                     readOnly
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label className={labelClass}>Location Status<span className="text-red-500 font-bold ml-1">*</span></label>
//                 <div className="flex items-center gap-3 flex-wrap">
//                   <button
//                     type="button"
//                     className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'warehouse' ? 'bg-green-500 text-white border-green-600 shadow' : 'bg-white text-green-600 border-green-300 hover:bg-green-50')}
//                     aria-pressed={submissionForm.locationStatus === 'warehouse'}
//                     onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'warehouse', savedSinkage: '' }))}
//                   >
//                     Warehouse
//                   </button>
//                   <button
//                     type="button"
//                     className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'missing' ? 'bg-red-500 text-white border-red-600 shadow' : 'bg-white text-red-600 border-red-300 hover:bg-red-50')}
//                     aria-pressed={submissionForm.locationStatus === 'missing'}
//                     onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'missing', savedSinkage: '' }))}
//                   >
//                     Missing
//                   </button>
//                   <button
//                     type="button"
//                     className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'savedSinkage' ? 'bg-blue-500 text-white border-blue-600 shadow' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50')}
//                     aria-pressed={submissionForm.locationStatus === 'savedSinkage'}
//                     onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'savedSinkage' }))}
//                     style={{ minWidth: 120 }}
//                   >
//                     Saved Sinkage
//                   </button>
//                   <span className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 text-xs font-semibold text-yellow-800 whitespace-nowrap flex items-center">
//                     Remaining MTR (L100): <span className="ml-1 font-mono text-yellow-900">{remainingAfterL100 !== null && remainingAfterL100 !== undefined ? remainingAfterL100 : '-'}</span>
//                   </span>
//                 </div>
//                 {submissionForm.locationStatus === 'savedSinkage' && (
//                   <div className="mt-3 flex flex-col">
//                     <label className={labelClass}>
//                       Enter saved sinkage (%) <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       min={0}
//                       step="0.01"
//                       name="savedSinkage"
//                       placeholder="e.g. 5.5"
//                       value={submissionForm.savedSinkage}
//                       className={pillInput}
//                       onChange={handleSubmissionFormChange}
//                       required={submissionForm.locationStatus === 'savedSinkage'}
//                     />
//                   </div>
//                 )}
//               </div>
              
//               {(() => {
//                 const { hasMissing, hasSavedSinkage, mtrLeft } = canAddSubmissionToSubTask(selectedSubTask, selectedTask)
//                 const isEditingMissing = typeof selectedSubmissionIndex === 'number' &&
//                   getSubTaskSubmissionsArray(selectedSubTask)[selectedSubmissionIndex]?.locationStatus === 'missing'
//                 const isEditingSavedSinkage = typeof selectedSubmissionIndex === 'number' &&
//                   getSubTaskSubmissionsArray(selectedSubTask)[selectedSubmissionIndex]?.locationStatus === 'savedSinkage'
//                 if (hasMissing && !isEditingMissing) {
//                   return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-xs font-semibold">One submission is marked Missing — no further submissions are allowed for this sub-task.</div>
//                 }
//                 if (hasSavedSinkage && !isEditingSavedSinkage) {
//                   return <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-blue-800 text-xs font-semibold">One submission uses Saved Sinkage — no further submissions are allowed for this sub-task.</div>
//                 }
//                 if (mtrLeft === 0 && typeof selectedSubmissionIndex !== 'number') {
//                   return <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-yellow-800 text-xs font-semibold">This sub-task is fully submitted — no MTR left after sinkage.</div>
//                 }
//                 return null
//               })()}

//               <div className="flex flex-row gap-4">
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Challan No<span className="text-red-500 font-bold ml-1">*</span></label>
//                   <input name="challanNo" type="text" placeholder="Challan No" value={submissionForm.challanNo} onChange={handleSubmissionFormChange} className={pillInput} required />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>
//                     Challan Photo
//                     <span className={`text-red-500 font-bold ml-1${existingChallanPhotoPath ? ' opacity-60' : ''}`}>*</span>
//                     {existingChallanPhotoPath && <span className="ml-1 text-gray-400 font-normal normal-case">(optional — existing kept if blank)</span>}
//                   </label>
//                   {existingChallanPhotoPath && (
//                     <div className="mb-1 flex items-center gap-2 text-xs">
//                       <span className="text-gray-500">Current:</span>
//                       {renderChallanPhotoLink(existingChallanPhotoPath, 'Existing Challan Photo')}
//                     </div>
//                   )}
//                   <input name="challanPhotoPath" type="file" accept="image/*" onChange={handleSubmissionFormChange} className={fileInput} required={!existingChallanPhotoPath} />
//                   {submissionForm.challanPhotoPath instanceof File && (
//                     <span className="text-xs text-orange-600 font-medium mt-1">New file: {submissionForm.challanPhotoPath.name}</span>
//                   )}
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label className={labelClass}>Remark <span className="text-gray-400 font-normal normal-case">(sub-task note, optional)</span></label>
//                 <textarea name="remark" rows={2} placeholder="Any note for this sub-task..." value={submissionForm.remark} onChange={handleSubmissionFormChange} className={softInput} />
//               </div>
//             </div>

//             {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>}

//             <div className="flex items-center justify-end gap-3 pt-2">
//               <button type="button" className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition" onClick={closeSubmissionModal} disabled={submitting}>
//                 <RiCloseLine size={16} />
//                 Cancel
//               </button>
//               <button
//                 className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
//                 type="submit"
//                 disabled={submitting || (typeof selectedSubmissionIndex !== 'number' && canAddSubmissionToSubTask(selectedSubTask, selectedTask).isAddDisabled)}
//               >
//                 <RiCheckLine size={17} />
//                 {submitting ? 'Saving…' : (typeof selectedSubmissionIndex === 'number' ? 'Update Submission' : 'Add Submission')}
//               </button>
//             </div>
//           </form>
//         )}
//       </Modal>

//       {/* Submissions List Modal — opens on row click, shows every submission for that sub-task */}
//       <Modal
//         open={showSubmissionsModal}
//         onClose={closeSubmissionsModal}
//         width={640}
//         title="Submissions"
//         showClose
//       >
//         {submissionsContext ? (() => {
//           const { task, subTask } = submissionsContext
//           const submissions = getSubTaskSubmissionsArray(subTask)
//           const missingStats = getSubTaskMissingStats(subTask, task)
//           const { isAddDisabled } = canAddSubmissionToSubTask(subTask, task)
//           const rowStatus = getRowStatus(subTask, task)
//           const stStyle = STATUS_STYLES[rowStatus]

//           const subTaskMTR_L100 = computeSubTaskMtrAfterSinkage(subTask.mtr, task.sinkage)
//           const submittedMTR_L100 = getSubmittedMtrL100Sum(subTask)
//           const submittedMTR_L100_display = (submittedMTR_L100 && !isNaN(submittedMTR_L100)) ? submittedMTR_L100.toFixed(2) : '-'

//           return (
//             <div className="py-1">
//               {/* Context header */}
//               <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 mb-5">
//                 <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <span className="font-bold text-gray-900 text-base">{subTask.program || 'Sub-Task'}</span>
//                     <span className={`rounded-full border text-[11px] font-bold px-3 py-1 ${stStyle.cls}`}>{stStyle.label}</span>
//                   </div>
//                   <span className="font-mono text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
//                     SubTask {subTask.subTaskId ?? subTask._id ?? '-'}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
//                   <div>
//                     <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Task ID</div>
//                     <div className="font-mono font-bold text-gray-800 flex items-center gap-1">
//                       {task.taskId}
//                       <button type="button" className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]" onClick={() => copyToClipboard(task.taskId)}>Copy</button>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Party</div>
//                     <div className="font-semibold text-gray-800">{task.partyName ?? '-'}</div>
//                   </div>
//                   <div>
//                     <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Jigar No</div>
//                     <div className="font-semibold text-gray-800">{subTask.jigarNo ?? '-'}</div>
//                   </div>
//                   <div>
//                     <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Sub MTR</div>
//                     <div className="font-semibold text-gray-800">{subTask.mtr ?? '-'}</div>
//                   </div>
//                 </div>
//                 {subTask.remark && (
//                   <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
//                     <span className="font-semibold text-gray-500">Remark: </span>{subTask.remark}
//                   </div>
//                 )}
//                 <div className="mt-3 pt-3 border-t border-gray-200">
//                   <MtrProgress subTask={subTask} task={task} compact />
//                 </div>
//               </div>

//               {/* Add button */}
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-sm font-bold text-gray-800">
//                   {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
//                 </span>
//                 <button
//                   type="button"
//                   className="flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2 transition disabled:bg-gray-300"
//                   onClick={() => openAddModal(task, subTask, true)}
//                   disabled={isAddDisabled}
//                   title={isAddDisabled ? (rowStatus === 'missing' ? 'Marked Missing — no further submissions allowed' : rowStatus === "savedSinkage" ? 'Marked Saved Sinkage — no further submissions allowed' : 'No MTR left') : ''}
//                 >
//                   <RiAddLine size={15} />
//                   Add Submission
//                 </button>
//               </div>
//               {isAddDisabled && (
//                 <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-amber-800 text-xs font-semibold">
//                   {rowStatus === 'missing'
//                     ? 'No further submissions allowed — one entry is marked Missing for this sub-task.'
//                     : rowStatus === 'savedSinkage'
//                       ? 'No further submissions allowed — one entry uses Saved Sinkage for this sub-task.'
//                       : 'Fully submitted — MTR after sinkage has been reached.'}
//                 </div>
//               )}

//               {/* Submission cards */}
//               {submissions.length === 0 ? (
//                 <div className="py-8">
//                   <EmptyState icon="📭" text="No submissions yet for this sub-task. Click \u201CAdd Submission\u201D to get started." />
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
//                   {submissions.map((sub, subIdx) => (
//                     <div
//                       key={sub._id || subIdx}
//                       className={`rounded-2xl border px-4 py-3.5 ${
//                         sub.locationStatus === 'missing'
//                           ? 'border-red-200 bg-red-50/60'
//                           : sub.locationStatus === 'savedSinkage'
//                             ? 'border-blue-200 bg-blue-50/60'
//                             : 'border-green-200 bg-green-50/60'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between mb-2.5">
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs font-bold text-gray-400">#{subIdx + 1}</span>
//                           <span className={
//                             'rounded-full text-[11px] px-2.5 py-0.5 font-bold border ' +
//                             (sub.locationStatus === 'missing'
//                               ? 'bg-red-100 text-red-700 border-red-300'
//                               : sub.locationStatus === 'savedSinkage'
//                                 ? 'bg-blue-100 text-blue-700 border-blue-200'
//                                 : 'bg-green-100 text-green-700 border-green-200')
//                           }>
//                             {sub.locationStatus === 'missing' ? 'Missing'
//                               : sub.locationStatus === 'savedSinkage' ? 'Saved Sinkage'
//                               : 'Warehouse'
//                             }
//                           </span>
//                           {(typeof sub.savedSinkage !== "undefined" && sub.savedSinkage !== null && !isNaN(Number(sub.savedSinkage)) && sub.locationStatus === 'savedSinkage') &&
//                             <span className="ml-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold" title={`Saved Sinkage: ${sub.savedSinkage}%`}>
//                               Saved Sinkage: {sub.savedSinkage}
//                             </span>
//                           }
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             type="button"
//                             className="flex items-center gap-1 rounded-full border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 text-[11px] font-semibold px-3 py-1 transition"
//                             onClick={() => openEditModal(task, subTask, subIdx, sub, true)}
//                           >
//                             <RiPencilLine size={12} />
//                             Edit
//                           </button>
//                           <button
//                             type="button"
//                             className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition disabled:opacity-50"
//                             title="Delete submission"
//                             onClick={() => handleSubmissionDelete(task, subTask, subIdx, true)}
//                             disabled={deletingIndex === subIdx}
//                           >
//                             <RiDeleteBin5Line size={13} />
//                           </button>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
//                         <Field label="Fabric Party" value={sub.fabricPartyName} />
//                         <Field label="Receiver Party" value={sub.recieverPartyName} />
//                         <Field label="Submitter" value={sub.submitterName} />
//                         <Field label="Length" value={sub.length} />
//                         <Field label="MTR" value={sub.MTR} />
//                         <Field label="Challan No" value={sub.challanNo} />
//                         <Field
//                           label="MTR (L100)"
//                           value={computeSubmissionMtrL100(sub.MTR, sub.length)}
//                         />
//                         <Field
//                           label="Challan Photo"
//                           value={renderChallanPhotoLink(sub.challanPhotoPath, `Challan #${sub.challanNo ?? ''}`)}
//                         />
//                         {(typeof sub.savedSinkage !== "undefined" && sub.savedSinkage !== null && !isNaN(Number(sub.savedSinkage)) && sub.locationStatus === 'savedSinkage') &&
//                           <Field label="Saved Sinkage" value={`${sub.savedSinkage}`} />
//                         }
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="flex justify-end mt-6">
//                 <button
//                   type="button"
//                   className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//                   onClick={closeSubmissionsModal}
//                 >
//                   <RiCloseLine size={16} />
//                   Close
//                 </button>
//               </div>
//             </div>
//           )
//         })() : (
//           <EmptyState icon="📭" text="No sub-task selected." />
//         )}
//       </Modal>

//       {challanPreview.ModalPreview && <challanPreview.ModalPreview />}
//     </div>
//   )
// }

// const Th = ({ children }) => (
//   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap text-left">{children}</th>
// )

// const SummaryCard = ({ label, value, accent, onClick, active }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`text-left rounded-2xl border bg-white px-4 py-3 shadow-sm transition ${accent} ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'} ${active ? 'ring-2 ring-orange-300' : ''}`}
//   >
//     <div className="text-2xl font-extrabold">{value}</div>
//     <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
//   </button>
// )

// const Field = ({ label, value }) => (
//   <div>
//     <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">{label}</div>
//     <div className="text-gray-800 font-medium flex items-center gap-1">{(value ?? '') === '' ? '-' : value}</div>
//   </div>
// )

// const MtrProgress = ({ subTask, task, compact = false }) => {
//   let allowedMtr = Number(computeSubTaskMtrAfterSinkage(
//     subTask.mtr,
//     task.sinkage
//   ))
//   if (isNaN(allowedMtr)) allowedMtr = null
//   let submittedL100 = getSubmittedMtrL100Sum(subTask)
//   const mtrLeft = allowedMtr !== null && !isNaN(submittedL100) ? Math.max(allowedMtr - submittedL100, 0) : null
//   const hasMissing = getSubTaskSubmissionsArray(subTask).some(s => s.locationStatus === 'missing')
//   const hasSavedSinkage = getSubTaskSubmissionsArray(subTask).some(s => s.locationStatus === 'savedSinkage')
//   const pct = allowedMtr > 0 && !isNaN(submittedL100) ? Math.min(100, Math.round((submittedL100 / allowedMtr) * 100)) : 0

//   if (allowedMtr === null) {
//     return (
//       <div className="text-xs text-gray-400 font-medium">MTR tracking unavailable — task is missing sinkage data.</div>
//     )
//   }
//   return (
//     <div className={compact ? '' : 'rounded-2xl border border-orange-100 bg-orange-50/40 px-5 py-4'}>
//       <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
//         <span className="text-orange-800">MTR (L100) submitted: {submittedL100.toFixed(2)} / {allowedMtr.toFixed(2)}</span>
//         <span className="text-orange-500">{mtrLeft !== null ? `${mtrLeft.toFixed(2)} left` : '-'}</span>
//       </div>
//       <div className="h-2 w-full rounded-full bg-orange-100 overflow-hidden">
//         <div
//           className={`h-full rounded-full transition-all ${
//             hasMissing
//               ? 'bg-red-400'
//               : hasSavedSinkage
//                 ? 'bg-blue-400'
//                 : pct >= 100
//                   ? 'bg-green-500'
//                   : 'bg-orange-400'
//           }`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   )
// }

// export default AllSubTasksTable

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  RiCheckLine, RiCloseLine, RiDeleteBin5Line, RiSearchLine,
  RiFilter3Line, RiRefreshLine, RiAddLine, RiPencilLine, RiInboxArchiveLine,
  RiArrowLeftSLine, RiArrowRightSLine,
} from 'react-icons/ri'
import WorkflowHeader from '../../components/common/WorkflowHeader'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubmissionForm = {
  fabricPartyName: '',
  receiverPartyName: '',
  submitterName: '',
  length: '',
  mtr: '',
  remark: '',
  challanNo: '',
  challanPhotoPath: '',
  locationStatus: 'warehouse',
  savedSinkage: '',
}

// --- Server-side task filters (matches fetchTasksController query params) ---
const initialTaskFilters = {
  dateFrom: '',
  dateTo: '',
  partyName: '',
  transportName: '',
  receiverName: '',
  fabricType: '',
  taskId: '',
  // Added for dropdown filter functionality
  program: '',
  jigarNo: '',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/* ---------------------------------------------------------------- */
/*  Calculation helpers                                             */
/* ---------------------------------------------------------------- */
/**
 * Compute MTR after sinkage: (MTR - (MTR * sinkage / 100))
 * Always use task.sinkage, ignore savedSinkage for all calculations.
 */
function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage, _savedSinkage) {
  if (
    subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage))
  ) return '-'
  return (Number(subTaskMtr) - (Number(subTaskMtr) * Number(sinkage) / 100)).toFixed(2)
}

function computeSubmissionMtrL100(mtr, length) {
  if (
    mtr === undefined || mtr === null || isNaN(Number(mtr)) ||
    length === undefined || length === null || isNaN(Number(length))
  ) return '-'
  return (Number(mtr) * (Number(length) / 100)).toFixed(2)
}

function getSubmittedMtrL100Sum(subTask) {
  const subs = getSubTaskSubmissionsArray(subTask)
  let total = 0
  for (const s of subs) {
    const mtr = Number(s?.MTR)
    const len = Number(s?.length)
    if (!isNaN(mtr) && !isNaN(len)) {
      total += mtr * (len / 100)
    }
  }
  return total
}

function computeRemainingMtrL100(subTask, task, currentMtrL100) {
  const afterSink = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, task.sinkage))
  if (isNaN(afterSink)) return '-'
  let sumL100 = getSubmittedMtrL100Sum(subTask)
  if (typeof currentMtrL100 === 'number') {
    sumL100 += currentMtrL100
  }
  const remaining = afterSink - sumL100
  return remaining.toFixed(2)
}

function getSubTaskSubmissionsArray(subTask) {
  if (!subTask) return []
  if (Array.isArray(subTask.submissions)) return subTask.submissions
  if (Array.isArray(subTask.submission)) return subTask.submission
  if (subTask.submission) return [subTask.submission]
  return []
}

function canAddSubmissionToSubTask(subTask, taskData) {
  if (!subTask || !taskData) return { isAddDisabled: false, hasMissing: false, hasSavedSinkage: false, mtrLeft: null, allowedMtr: null }
  let subtaskMtrAfterSinkage
  if (typeof subTask.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined') {
    subtaskMtrAfterSinkage = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
  }
  const submissions = getSubTaskSubmissionsArray(subTask)
  const submissionMtrSum = submissions.reduce((sum, s) => {
    const mtrVal = Number(s?.MTR)
    return isNaN(mtrVal) ? sum : sum + mtrVal
  }, 0)
  const mtrLeft = (subtaskMtrAfterSinkage !== undefined && !isNaN(subtaskMtrAfterSinkage))
    ? Math.max(subtaskMtrAfterSinkage - submissionMtrSum, 0)
    : null
  const hasMissing = submissions.some(x => x.locationStatus === 'missing')
  const hasSavedSinkage = submissions.some(x => x.locationStatus === 'savedSinkage')
  const isAddDisabled = (mtrLeft === 0) || hasMissing || hasSavedSinkage
  return {
    isAddDisabled,
    hasMissing,
    hasSavedSinkage,
    mtrLeft,
    allowedMtr: (subtaskMtrAfterSinkage !== undefined && !isNaN(subtaskMtrAfterSinkage)) ? subtaskMtrAfterSinkage : null,
    submittedMtr: submissionMtrSum,
  }
}

function getSubTaskMissingStats(subTask, taskData) {
  const submissions = getSubTaskSubmissionsArray(subTask)
  const sumAllMTR = submissions.reduce((sum, s) => {
    const mtr = Number(s?.MTR)
    return isNaN(mtr) ? sum : sum + mtr
  }, 0)
  const subTaskMtrAfterSinkageRaw =
    typeof subTask.mtr !== 'undefined' &&
    typeof taskData?.sinkage !== 'undefined'
      ? Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
      : undefined
  const hasMissing = submissions.some(x => x.locationStatus === 'missing')
  const hasSavedSinkage = submissions.some(x => x.locationStatus === 'savedSinkage')
  let missingMTRAfterSinkage = null
  if (hasMissing || hasSavedSinkage) {
    missingMTRAfterSinkage =
      (isNaN(subTaskMtrAfterSinkageRaw) || isNaN(sumAllMTR))
        ? null
        : Math.max(subTaskMtrAfterSinkageRaw - sumAllMTR, 0)
  }
  return { hasMissing, hasSavedSinkage, missingMTR: missingMTRAfterSinkage, warehouseSum: sumAllMTR }
}

// -- Only these three statuses now: warehouse, missing, savedSinkage --
// Row status is one of: warehouse, missing, savedSinkage
function getRowStatus(subTask, taskData) {
  const submissions = getSubTaskSubmissionsArray(subTask)
  // SavedSinkage overrides
  if (submissions.some((x) => x.locationStatus === 'savedSinkage')) return "savedSinkage"
  if (submissions.some((x) => x.locationStatus === 'missing')) return "missing"
  // If there is at least one warehouse submission, call it warehouse. If none at all, it's still warehouse by default.
  if (submissions.length === 0) return "warehouse"
  // If all have warehouse status
  if (submissions.every(x => x.locationStatus === "warehouse")) return "warehouse"
  // Fallback (shouldn't happen, but for completeness)
  return "warehouse"
}

// Proper styles for these three statuses
const STATUS_STYLES = {
  warehouse: { label: 'Warehouse', cls: 'bg-green-100 text-green-700 border-green-200' },
  missing: { label: 'Missing', cls: 'bg-red-100 text-red-700 border-red-300' },
  savedSinkage: { label: 'Saved Sinkage', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
}

const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const softInput =
  'w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400 resize-none'
const fileInput =
  'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'
const filterPill =
  'rounded-full border border-gray-200 bg-gray-50 text-sm px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400'

const copyToClipboard = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied')
  } catch {
    toast.error('Failed to copy')
  }
}

function usePreviewImageModal() {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewAlt, setPreviewAlt] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloading, setDownloading] = useState(false)

  function open(url, alt = '') {
    setPreviewUrl(url)
    setPreviewAlt(alt)
    setShowPreview(true)
    setDownloadError('')
  }
  function close() {
    setShowPreview(false)
    setPreviewUrl(null)
    setPreviewAlt('')
    setDownloadError('')
  }

  const handleDownload = async () => {
    if (!previewUrl) return
    setDownloadError('')
    setDownloading(true)
    try {
      const response = await fetch(previewUrl, { credentials: 'same-origin', mode: 'cors' })
      if (!response.ok) throw new Error('Image download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fname = decodeURIComponent(previewUrl.split('/').pop() || 'challan_image.png')
      link.download = fname
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch {
      setDownloadError('Download failed — the file may not be accessible right now. Try again in a moment.')
    }
    setDownloading(false)
  }

  const ModalPreview = ({ width = 480 }) =>
    <Modal open={showPreview} onClose={close} width={width} showClose title="Challan Photo">
      {previewUrl ? (
        <div className="p-4 flex flex-col items-center gap-4">
          <img
            src={previewUrl}
            alt={previewAlt || 'Challan photo'}
            className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
            style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
          />
          <button
            type="button"
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2 transition disabled:bg-gray-300"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          {downloadError && <div className="text-center text-xs text-red-500">{downloadError}</div>}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
      )}
    </Modal>
  return { open, close, ModalPreview }
}

/* ---------------------------------------------------------------- */
/*  Main component                                                   */
/* ---------------------------------------------------------------- */
const AllSubTasksTable = () => {
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // --- Server-side filters (sent to /tasks) ---
  const [filterDraft, setFilterDraft] = useState(initialTaskFilters) // what's in the inputs
  const [appliedFilters, setAppliedFilters] = useState(initialTaskFilters) // what's actually been fetched

  // --- Dropdown state for sub-task specific fields ---
  const [programOptions, setProgramOptions] = useState([])
  const [jigarNoOptions, setJigarNoOptions] = useState([])

  // --- Dropdown state for task-filter fields
  const [partyNamesOptions, setPartyNamesOptions] = useState([])
  const [transportNamesOptions, setTransportNamesOptions] = useState([])
  const [receiverNamesOptions, setReceiverNamesOptions] = useState([])

  // --- Pagination (server-side) ---
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalTasks, setTotalTasks] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // --- Client-side (within currently loaded page) ---
  const [searchTerm, setSearchTerm] = useState('') // quick filter: program / jigarNo / subTaskId
  const [statusFilter, setStatusFilter] = useState('all') // warehouse / missing / savedSinkage — not server supported

  // submission form / modal state
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedSubTask, setSelectedSubTask] = useState(null)
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)
  const [existingChallanPhotoPath, setExistingChallanPhotoPath] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState(null)
  const [error, setError] = useState('')

  // Submissions modal — opens when a sub-task row is selected/clicked
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [submissionsContext, setSubmissionsContext] = useState(null)
  const [cameFromSubmissionsModal, setCameFromSubmissionsModal] = useState(false)

  const [dropdownOptions, setDropdownOptions] = useState({ fabricPartyNames: [], receiverPartyNames: [], length: [], fabricTypes: [] })
  const [dropdownLoading, setDropdownLoading] = useState(false)

  const challanPreview = usePreviewImageModal()

  /* ---------------- load dropdown options for sub-task program/jigarNo ---------------- */
  useEffect(() => {
    // Generate unique program and jigarNo options from allTasks.subTask
    let programSet = new Set()
    let jigarNoSet = new Set()
    allTasks.forEach(task => {
      if (Array.isArray(task.subTask)) {
        task.subTask.forEach(st => {
          if (st.program) programSet.add(st.program)
          if (st.jigarNo) jigarNoSet.add(st.jigarNo)
        })
      }
    })
    setProgramOptions([...programSet].sort())
    setJigarNoOptions([...jigarNoSet].sort())
  }, [allTasks])

  /* ---------------- data loading (server-side filtered + paginated) ---------------- */
  const fetchAllTasks = useCallback(async (overrides = {}) => {
    setLoading(true)
    setLoadError('')
    const p = {
      ...appliedFilters,
      page,
      pageSize,
      ...overrides,
    }
    // Strip empty values so we don't send blank query params
    const params = Object.fromEntries(
      Object.entries(p).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks`, { params })
      const body = res.data
      if (body?.success) {
        setAllTasks(Array.isArray(body.data) ? body.data : [])
        setTotalTasks(typeof body.total === 'number' ? body.total : 0)
        setTotalPages(typeof body.totalPages === 'number' ? body.totalPages : 1)
        setPage(typeof body.page === 'number' ? body.page : (params.page || 1))
      } else {
        setAllTasks([])
        setLoadError(body?.message || 'Failed to load tasks.')
      }
    } catch {
      setLoadError('Could not load tasks. Check your connection and try refreshing.')
      setAllTasks([])
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, page, pageSize])

  // Refetch whenever applied filters, page, or pageSize change
  useEffect(() => {
    fetchAllTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, page, pageSize])

  useEffect(() => {
    let isSubscribed = true;
    setDropdownLoading(true);
    axios.get(`${API_BASE_URL}/tasks/dropdowns`)
      .then(res => {
        if (!isSubscribed) return;
        const data = res.data?.data || {};

        setDropdownOptions({
          fabricPartyNames: Array.isArray(data.FabricPartyName) ? data.FabricPartyName : [],
          receiverPartyNames: Array.isArray(data.recieverPartyName) ? data.recieverPartyName : [],
          length: Array.isArray(data.length) ? data.length : [],
          fabricTypes: Array.isArray(data.fabricType) ? data.fabricType : [],
          sinkages: Array.isArray(data.sinkage) ? data.sinkage : [],
          programNames: Array.isArray(data.programName) ? data.programName : [],
          jigars: Array.isArray(data.jigars) ? data.jigars : [],
        });

        setPartyNamesOptions(Array.isArray(data.partyName) ? data.partyName : []);
        setTransportNamesOptions(Array.isArray(data.transportName) ? data.transportName : []);
        setReceiverNamesOptions(Array.isArray(data.recieverName) ? data.recieverName : []);
      })
      .catch(() => {})
      .finally(() => { if (isSubscribed) setDropdownLoading(false); });
    return () => { isSubscribed = false; };
  }, []);

  async function refreshOneTask(taskId) {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId } })
      if (res.data?.data) {
        setAllTasks(prev => prev.map(t => (t.taskId === taskId ? res.data.data : t)))
        return res.data.data
      }
    } catch {
      await fetchAllTasks()
    }
    return null
  }

  // --- Filter bar handlers (MODIFIED FOR AUTO-APPLY) ---
  function handleFilterDraftChange(e) {
    const { name, value } = e.target
    setFilterDraft(prev => {
      const newDraft = { ...prev, [name]: value }
      setAppliedFilters(newDraft)
      setPage(1)
      return newDraft
    })
  }

  // REMOVED: applyFilters() and the "Apply" button. They are no longer needed.

  function clearFilters() {
    setFilterDraft(initialTaskFilters)
    setAppliedFilters(initialTaskFilters)
    setSearchTerm('')
    setStatusFilter('all')
    setPage(1)
  }

  const serverFiltersActive = Object.values(appliedFilters).some(v => v !== '')
  const filtersActive = serverFiltersActive || statusFilter !== 'all' || searchTerm.trim() !== ''
  // const filterDraftDirty = JSON.stringify(filterDraft) !== JSON.stringify(appliedFilters) // NO LONGER USED

  // --- Pagination handlers ---
  function goToPage(n) {
    const clamped = Math.max(1, Math.min(totalPages || 1, n))
    if (clamped !== page) setPage(clamped)
  }
  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value))
    setPage(1)
  }

  function openSubmissionsModal(task, subTask) {
    setSubmissionsContext({ task, subTask })
    setShowSubmissionsModal(true)
  }

  function closeSubmissionsModal() {
    setShowSubmissionsModal(false)
    setSubmissionsContext(null)
  }

  function syncSubmissionsContext(updatedTask, subTaskId) {
    if (!updatedTask) return
    const freshSubTask = (Array.isArray(updatedTask.subTask) ? updatedTask.subTask : [])
      .find(st => (st.subTaskId || st._id) === subTaskId)
    if (freshSubTask) {
      setSubmissionsContext({ task: updatedTask, subTask: freshSubTask })
    }
  }

  const flatRows = useMemo(() => {
    const rows = []
    allTasks.forEach(task => {
      const subs = Array.isArray(task.subTask) ? task.subTask : []
      subs.forEach((st, idx) => {
        rows.push({ task, subTask: st, subTaskIndex: idx, status: getRowStatus(st, task) })
      })
    })
    return rows
  }, [allTasks])

  const fabricTypeSelectOptions = useMemo(() => {
    if (dropdownOptions.fabricTypes.length > 0) return dropdownOptions.fabricTypes
    const set = new Set()
    allTasks.forEach(t => { if (t.FabricType) set.add(t.FabricType) })
    return Array.from(set)
  }, [dropdownOptions.fabricTypes, allTasks])

  // --- New for program/jigarNo dropdowns in filter ---
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return flatRows.filter(row => {
      // Apply subtask program/jigarNo filters (if active)
      if (appliedFilters.program && String(row.subTask.program) !== String(appliedFilters.program)) return false
      if (appliedFilters.jigarNo && String(row.subTask.jigarNo) !== String(appliedFilters.jigarNo)) return false
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!term) return true
      const haystack = [
        row.task.taskId, row.task.partyName, row.task.FabricType, row.task.BuiltyNo,
        row.subTask.program, row.subTask.jigarNo, row.subTask.subTaskId,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [flatRows, searchTerm, statusFilter, appliedFilters.program, appliedFilters.jigarNo])

  // --- Status counts summary — ONLY reflects the currently loaded page ---
  const summary = useMemo(() => {
    const s = { total: flatRows.length, warehouse: 0, missing: 0, savedSinkage: 0 }
    flatRows.forEach(r => {
      if (r.status === 'warehouse') s.warehouse += 1
      else if (r.status === 'missing') s.missing += 1
      else if (r.status === 'savedSinkage') s.savedSinkage += 1
    })
    return s
  }, [flatRows])

  function closeSubmissionModal() {
    setShowSubmissionModal(false)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setError('')
    setSubmissionForm(initialSubmissionForm)
    setSelectedTask(null)
    setSelectedSubTask(null)
    if (cameFromSubmissionsModal) {
      setShowSubmissionsModal(true)
      setCameFromSubmissionsModal(false)
    }
  }

  function openAddModal(task, subTask, fromList = false) {
    setSelectedTask(task)
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setError('')
    setSubmissionForm({ ...initialSubmissionForm, remark: subTask?.remark || '' })
    setCameFromSubmissionsModal(fromList)
    if (fromList) setShowSubmissionsModal(false)
    setShowSubmissionModal(true)
  }

  function openEditModal(task, subTask, submissionIndex, subToEdit, fromList = false) {
    setSelectedTask(task)
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(submissionIndex)
    setExistingChallanPhotoPath(subToEdit?.challanPhotoPath || '')
    setError('')
    setSubmissionForm({
      fabricPartyName: subToEdit?.fabricPartyName || '',
      receiverPartyName: subToEdit?.recieverPartyName || '',
      submitterName: subToEdit?.submitterName || '',
      length: subToEdit?.length || '',
      mtr: subToEdit?.MTR ?? subTask?.mtr ?? '',
      remark: subTask?.remark || '',
      challanNo: subToEdit?.challanNo || '',
      challanPhotoPath: '',
      locationStatus: subToEdit?.locationStatus || 'warehouse',
      savedSinkage: (subToEdit?.locationStatus === 'savedSinkage' && (typeof subToEdit?.savedSinkage === 'number' || typeof subToEdit?.savedSinkage === 'string')) 
        ? subToEdit.savedSinkage : '',
    })
    setCameFromSubmissionsModal(fromList)
    if (fromList) setShowSubmissionsModal(false)
    setShowSubmissionModal(true)
  }

  function handleSubmissionFormChange(e) {
    const { name, value, type, files } = e.target
    if (type === 'file' && name === 'challanPhotoPath') {
      setSubmissionForm(prev => ({ ...prev, challanPhotoPath: files && files[0] ? files[0] : '' }))
    } else {
      setSubmissionForm(prev => ({ ...prev, [name]: name === "savedSinkage" ? value.replace(/[^0-9.]/g, "") : value }))
    }
  }

  function canAddSubmission(subTask, taskData, formSubmission, isEdit) {
    const mtr = Number(formSubmission.mtr)
    const photoRequired = !isEdit || !existingChallanPhotoPath
    const hasPhoto = (formSubmission.challanPhotoPath instanceof File) || (!photoRequired)

    // Validate LocationStatus + (SavedSinkage)
    if (
      formSubmission.locationStatus === 'savedSinkage' &&
      (formSubmission.savedSinkage === '' || isNaN(Number(formSubmission.savedSinkage)) || Number(formSubmission.savedSinkage) < 0)
    ) {
      return {
        valid: false,
        msg: 'Please enter a valid sinkage percentage (number) for this submission.',
      }
    }

    // Only one missing or savedSinkage per sub-task (besides other validations)
    const submissions = getSubTaskSubmissionsArray(subTask)
    const editingIsMissing = isEdit && typeof selectedSubmissionIndex === 'number' && submissions[selectedSubmissionIndex]?.locationStatus === 'missing'
    const editingIsSavedSinkage = isEdit && typeof selectedSubmissionIndex === 'number' && submissions[selectedSubmissionIndex]?.locationStatus === 'savedSinkage'
    const otherHasMissing = submissions.some((s, i) =>
      s.locationStatus === 'missing' && !(isEdit && i === selectedSubmissionIndex)
    )
    const otherHasSavedSinkage = submissions.some((s, i) =>
      s.locationStatus === 'savedSinkage' && !(isEdit && i === selectedSubmissionIndex)
    )
    if (formSubmission.locationStatus === 'missing' && otherHasMissing) {
      return { valid: false, msg: 'Only one submission per sub-task can be marked "Missing".' }
    }
    if (formSubmission.locationStatus === 'savedSinkage' && otherHasSavedSinkage) {
      return { valid: false, msg: 'Only one submission per sub-task can have "Saved Sinkage".' }
    }
    if (otherHasMissing && !editingIsMissing) {
      return { valid: false, msg: 'No more submissions are allowed — one entry for this sub-task is already marked "Missing".' }
    }
    if (otherHasSavedSinkage && !editingIsSavedSinkage) {
      return { valid: false, msg: 'No more submissions are allowed — one entry for this sub-task already uses "Saved Sinkage".' }
    }

    if (
      !formSubmission.fabricPartyName || !formSubmission.receiverPartyName ||
      !formSubmission.submitterName || !formSubmission.length ||
      !formSubmission.mtr || !formSubmission.challanNo || !hasPhoto || !formSubmission.locationStatus
    ) {
      return {
        valid: false,
        msg: photoRequired
          ? 'Please fill in every field — location status and a challan photo are required too.'
          : 'Please fill in every field (existing challan photo will be kept if you don\u2019t upload a new one).',
      }
    }
    if (isNaN(mtr) || mtr <= 0) return { valid: false, msg: 'MTR is required and must be greater than 0.' }

    const editingSubTaskId = subTask?.subTaskId || subTask?._id
    let editingChallanNo
    if (isEdit && typeof selectedSubmissionIndex === 'number') {
      editingChallanNo = getSubTaskSubmissionsArray(subTask)[selectedSubmissionIndex]?.challanNo
    }
    const newChallanNoTrimmed = String(formSubmission.challanNo).trim().toLowerCase()
    const subsOfTask = Array.isArray(taskData?.subTask) ? taskData.subTask : []
    for (const st of subsOfTask) {
      for (const sub of getSubTaskSubmissionsArray(st)) {
        const isSelf =
          isEdit &&
          String(sub.challanNo).trim().toLowerCase() === String(editingChallanNo || '').trim().toLowerCase() &&
          (st.subTaskId || st._id) === editingSubTaskId
        if (!isSelf && String(sub.challanNo).trim().toLowerCase() === newChallanNoTrimmed) {
          return { valid: false, msg: `Challan No "${formSubmission.challanNo}" is already used by another submission.` }
        }
      }
    }

    const filteredForSum = isEdit && typeof selectedSubmissionIndex === 'number'
      ? submissions.filter((_, i) => i !== selectedSubmissionIndex)
      : submissions
    const submissionMTRSum = filteredForSum.reduce((sum, s) => {
      const mtrVal = Number(s?.MTR)
      return isNaN(mtrVal) ? sum : sum + mtrVal
    }, 0)

    if (typeof subTask.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined') {
      const subtaskMtrAfterSinkage = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, taskData.sinkage))
      const mtrLeft = subtaskMtrAfterSinkage - submissionMTRSum
      if (!isNaN(subtaskMtrAfterSinkage) && (submissionMTRSum + mtr > subtaskMtrAfterSinkage + 1e-8)) {
        return { valid: false, msg: `Only ${mtrLeft >= 0 ? mtrLeft.toFixed(2) : 0} MTR left (after sinkage) for this sub-task.` }
      }
      if (mtrLeft === 0) return { valid: false, msg: 'No MTR left to submit for this sub-task.' }
    }
    return { valid: true, msg: '' }
  }

  async function handleSubmission(e) {
    e.preventDefault()
    if (!selectedTask || !selectedSubTask) return
    setError('')
    setSubmitting(true)
    const isEdit = typeof selectedSubmissionIndex === 'number'
    const validation = canAddSubmission(selectedSubTask, selectedTask, submissionForm, isEdit)
    if (!validation.valid) {
      setError(validation.msg)
      setSubmitting(false)
      return
    }
    try {
      const subTaskId = selectedSubTask.subTaskId || selectedSubTask._id
      const taskId = selectedTask.taskId
      let url, method
      if (!isEdit) {
        url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`
        method = 'post'
      } else {
        url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission?submissionIndex=${selectedSubmissionIndex}`
        method = 'put'
      }
      const formData = new FormData()
      formData.append('fabricPartyName', submissionForm.fabricPartyName)
      formData.append('recieverPartyName', submissionForm.receiverPartyName)
      formData.append('submitterName', submissionForm.submitterName)
      formData.append('length', submissionForm.length)
      formData.append('MTR', submissionForm.mtr)
      formData.append('challanNo', submissionForm.challanNo)
      if (submissionForm.remark !== undefined) formData.append('remark', submissionForm.remark)
      formData.append('locationStatus', submissionForm.locationStatus || 'warehouse')
      if (submissionForm.locationStatus === 'savedSinkage' && submissionForm.savedSinkage !== '' && !isNaN(Number(submissionForm.savedSinkage))) {
        formData.append('savedSinkage', Number(submissionForm.savedSinkage))
      }
      if (submissionForm.challanPhotoPath instanceof File) {
        formData.append('challanPhotoUpload', submissionForm.challanPhotoPath)
      } else if (isEdit && existingChallanPhotoPath) {
        formData.append('challanPhotoUpload', existingChallanPhotoPath)
      }

      if (method === 'post') {
        await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await axios.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success(isEdit ? 'Submission updated' : 'Submission added')
      const updatedTask = await refreshOneTask(taskId)
      if (cameFromSubmissionsModal) syncSubmissionsContext(updatedTask, subTaskId)
      closeSubmissionModal()
    } catch (err) {
      const serverMsg = err?.response?.data?.message
      setError(serverMsg || 'Submission failed. Please try again.')
      toast.error(serverMsg || 'Submission failed')
    }
    setSubmitting(false)
  }

  async function handleSubmissionDelete(task, subTask, submissionIndex, keepListModalOpen = false) {
    const msg = 'Delete this submission? This cannot be undone.'
    if (!window.confirm(msg)) return
    setDeletingIndex(submissionIndex)
    const subTaskId = subTask.subTaskId || subTask._id
    try {
      let url = `${API_BASE_URL}/tasks/${task.taskId}/subtasks/${subTaskId}/submission`
      if (typeof submissionIndex === 'number') url += `?submissionIndex=${submissionIndex}`
      await axios.delete(url)
      toast('Submission deleted', { icon: '🗑️' })
      const updatedTask = await refreshOneTask(task.taskId)
      if (keepListModalOpen) {
        syncSubmissionsContext(updatedTask, subTaskId)
      } else {
        closeSubmissionsModal()
      }
      setShowSubmissionModal(false)
    } catch {
      toast.error('Failed to delete submission')
    }
    setDeletingIndex(null)
  }

  const renderChallanPhotoLink = (path, altLabel) => {
    if (!path) return <span className="text-gray-400 text-xs">No photo</span>
    let fullUrl = path
    if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
    return (
      <button
        type="button"
        className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => challanPreview.open(fullUrl, altLabel || 'Challan photo')}
        title="Preview image"
      >
        View photo
      </button>
    )
  }

  let mtrInputValue = submissionForm.mtr
  let submissionLengthValue = (typeof submissionForm.length !== 'undefined' && submissionForm.length !== null) ? submissionForm.length : ''
  let mtrL100Value = '-'
  if (
    mtrInputValue !== undefined && mtrInputValue !== '' && !isNaN(Number(mtrInputValue)) &&
    submissionLengthValue !== undefined && submissionLengthValue !== '' && !isNaN(Number(submissionLengthValue))
  ) {
    mtrL100Value = computeSubmissionMtrL100(mtrInputValue, submissionLengthValue)
  }
  let mtrL100Numeric = (typeof mtrL100Value === "string" ? parseFloat(mtrL100Value) : mtrL100Value)
  if (isNaN(mtrL100Numeric)) mtrL100Numeric = 0

  let mtrAfterSinkageValue = '-'
  let currentSinkage = selectedTask?.sinkage
  if (selectedTask && selectedSubTask && selectedSubTask.mtr &&
      (currentSinkage !== undefined && currentSinkage !== null)
  ) {
    mtrAfterSinkageValue = computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, currentSinkage)
  }

  let alreadySubmittedL100 = selectedSubTask ? getSubmittedMtrL100Sum(selectedSubTask) : 0
  let alreadySubmittedL100Display = (alreadySubmittedL100 && !isNaN(alreadySubmittedL100)) ? alreadySubmittedL100.toFixed(2) : '-'

  let remainingAfterL100 = '-'
  if (
    selectedTask && selectedSubTask &&
    mtrAfterSinkageValue !== '-' && !isNaN(Number(mtrAfterSinkageValue)) &&
    (!isNaN(alreadySubmittedL100) || !isNaN(mtrL100Numeric))
  ) {
    remainingAfterL100 = (Number(mtrAfterSinkageValue) - alreadySubmittedL100 - mtrL100Numeric).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-white">
      <WorkflowHeader
        activeStep="submission"
        topLabel="Fabric Task Workflow"
        title="All Sub-Tasks"
        subtitle="Every sub-task across every task, with full task context. Click a row to view or add submissions."
      />

      <div className="max-w-7xl mx-auto px-2 md:px-6 sm:px-10 pb-10">

        {/* Summary strip — reflects the currently loaded page only */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryCard label="Sub-Tasks (this page)" value={summary.total} accent="border-gray-200 text-gray-700" onClick={() => setStatusFilter('all')} active={statusFilter === 'all'} />
          <SummaryCard label="Warehouse" value={summary.warehouse} accent="border-green-200 text-green-700" onClick={() => setStatusFilter('warehouse')} active={statusFilter === 'warehouse'} />
          <SummaryCard label="Missing" value={summary.missing} accent="border-red-200 text-red-700" onClick={() => setStatusFilter('missing')} active={statusFilter === 'missing'} />
          <SummaryCard label="Saved Sinkage" value={summary.savedSinkage} accent="border-blue-200 text-blue-700" onClick={() => setStatusFilter('savedSinkage')} active={statusFilter === 'savedSinkage'} />
        </div>

        {/* Server-side filter bar */}
        <div className="flex flex-col gap-3 mb-4 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
            <RiFilter3Line size={14} />
            Filters
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">From</label>
              <input
                type="date"
                name="dateFrom"
                value={filterDraft.dateFrom}
                onChange={handleFilterDraftChange}
                max={filterDraft.dateTo || undefined}
                className={filterPill}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">To</label>
              <input
                type="date"
                name="dateTo"
                value={filterDraft.dateTo}
                onChange={handleFilterDraftChange}
                min={filterDraft.dateFrom || undefined}
                className={filterPill}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Task ID</label>
              <input
                type="text"
                name="taskId"
                placeholder="Task ID"
                value={filterDraft.taskId}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-36'}
              />
            </div>

            {/* DROPDOWN: Party Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Party Name</label>
              <select
                name="partyName"
                value={filterDraft.partyName}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-40'}
                disabled={dropdownLoading}
              >
                <option value="">All Party Names</option>
                {partyNamesOptions.map((p, i) => (<option key={p || i} value={p}>{p}</option>))}
              </select>
            </div>

            {/* DROPDOWN: Transport Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Transport Name</label>
              <select
                name="transportName"
                value={filterDraft.transportName}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-40'}
                disabled={dropdownLoading}
              >
                <option value="">All Transport Names</option>
                {transportNamesOptions.map((tr, i) => (<option key={tr || i} value={tr}>{tr}</option>))}
              </select>
            </div>

            {/* DROPDOWN: Receiver Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Receiver Name</label>
              <select
                name="receiverName"
                value={filterDraft.receiverName}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-40'}
                disabled={dropdownLoading}
              >
                <option value="">All Receiver Names</option>
                {receiverNamesOptions.map((r, i) => (<option key={r || i} value={r}>{r}</option>))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Fabric Type</label>
              <select
                name="fabricType"
                value={filterDraft.fabricType}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-40'}
                disabled={dropdownLoading}
              >
                <option value="">All Fabric Types</option>
                {fabricTypeSelectOptions.map(ft => <option key={ft} value={ft}>{ft}</option>)}
              </select>
            </div>

            {/* DROPDOWN: Program filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Program</label>
              <select
                name="program"
                value={filterDraft.program}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-36'}
              >
                <option value="">All Programs</option>
                {programOptions.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            {/* DROPDOWN: Jigar No filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-semibold">Jigar No</label>
              <select
                name="jigarNo"
                value={filterDraft.jigarNo}
                onChange={handleFilterDraftChange}
                className={filterPill + ' w-32'}
              >
                <option value="">All Jigar No</option>
                {jigarNoOptions.map((jno) => (
                  <option key={jno} value={jno}>{jno}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              {/* Removed Apply button */}
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-2 transition"
                >
                  <RiCloseLine size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick in-page search + refresh */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
              <RiSearchLine className="text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Quick search on this page (Program, Jigar No, SubTask ID...)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
                  <RiCloseLine size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => fetchAllTasks()}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 transition ml-auto"
            >
              <RiRefreshLine size={15} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium flex items-center justify-between gap-3">
            <span>{loadError}</span>
            <button type="button" onClick={() => fetchAllTasks()} className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-1.5 transition whitespace-nowrap">
              Try again
            </button>
          </div>
        )}

        {/* Main table */}
        {/* ... (UNCHANGED main table and modals code: omitted for brevity) ... */}

        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-orange-500 text-sm font-medium animate-pulse">Loading sub-tasks...</div>
          ) : filteredRows.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon="🧵"
                text={flatRows.length === 0 ? 'No sub-tasks match the current filters.' : 'No sub-tasks match your quick search.'}
              />
              {filtersActive && (
                <div className="text-center mt-3">
                  <button type="button" onClick={clearFilters} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1360px] text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <Th>Task ID</Th>
                    <Th>Party Name</Th>
                    <Th>Fabric Type</Th>
                    <Th>SubTask ID</Th>
                    <Th>Program</Th>
                    <Th>Jigar No</Th>
                    <Th>Length</Th>
                    <Th>Sub MTR</Th>
                    <Th>MTR After Sinkage</Th>
                    <Th>Remark</Th>
                    <Th>Submissions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(({ task, subTask, subTaskIndex, status }) => {
                    const submissions = getSubTaskSubmissionsArray(subTask)
                    const rowKey = `${task.taskId}-${subTask.subTaskId || subTask._id || subTaskIndex}`
                    const st = STATUS_STYLES[status]
                    const hasSavedSinkage =
                      submissions.some((ss) => ss.locationStatus === 'savedSinkage')
                    return (
                      <tr
                        key={rowKey}
                        onClick={() => openSubmissionsModal(task, subTask)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSubmissionsModal(task, subTask) } }}
                        role="button"
                        tabIndex={0}
                        className={`border-t border-gray-100 transition-colors cursor-pointer focus:outline-none focus:bg-orange-50 ${
                          status === 'missing'
                            ? 'bg-red-50/60 hover:bg-red-100/70'
                            : status === 'savedSinkage'
                              ? 'bg-blue-50/60 hover:bg-blue-100/70'
                              : 'hover:bg-orange-50/50'
                        }`}
                        title="Click to view or manage submissions for this sub-task"
                      >
                        <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold">
                          <span className="inline-flex items-center gap-1">
                            {task.taskId}
                            <button
                              type="button"
                              aria-label="Copy Task ID"
                              className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]"
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(task.taskId) }}
                            >Copy</button>
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-800">{task.partyName || '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700">{task.FabricType || '-'}</td>
                        <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                          <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{subTask.subTaskId ?? subTask._id ?? '-'}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{subTask.program ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700">{subTask.jigarNo ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{task.Length ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{subTask.mtr ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {computeSubTaskMtrAfterSinkage(
                            subTask.mtr,
                            task.sinkage
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-600 max-w-[160px] truncate" title={subTask.remark ?? ''}>{subTask.remark ?? '-'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openSubmissionsModal(task, subTask) }}
                            className={
                              'flex items-center gap-1.5 rounded-full font-semibold text-xs px-4 py-1.5 transition border ' +
                              (
                                submissions.length === 0
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                                  : status === 'missing'
                                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                                    : status === 'savedSinkage'
                                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                              )
                            }
                          >
                            {submissions.length === 0 ? (
                              <><RiAddLine size={14} /> Submit</>
                            ) : (
                              <>{submissions.length} Submission{submissions.length > 1 ? 's' : ''} · View</>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ... rest of the pagination and modals code, unmodified ... */}

        {/* Pagination controls */}
        {/* ... same as before ... */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            {loading
              ? 'Loading…'
              : `Showing ${filteredRows.length} of ${flatRows.length} sub-tasks on this page · ${totalTasks} task${totalTasks !== 1 ? 's' : ''} total`}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={loading}
                className="rounded-full border border-gray-200 bg-gray-50 text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {PAGE_SIZE_OPTIONS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={loading || page <= 1}
                className="flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-8 h-8 transition"
                aria-label="Previous page"
              >
                <RiArrowLeftSLine size={16} />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                Page {page} of {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={loading || page >= (totalPages || 1)}
                className="flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-8 h-8 transition"
                aria-label="Next page"
              >
                <RiArrowRightSLine size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Submission Modal */}
      {/* (Component unchanged, but available locationStatus values are: warehouse, missing, savedSinkage) */}
      <Modal
        open={showSubmissionModal}
        onClose={closeSubmissionModal}
        width={520}
        title={typeof selectedSubmissionIndex === 'number' ? 'Edit Submission' : 'Add Submission'}
        showClose
      >
        {selectedSubTask && selectedTask && (
          <form className="flex flex-col gap-6 py-1 px-1" onSubmit={handleSubmission} autoComplete="off">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-500">Task ID:</span>{' '}
                  <span className="font-mono text-gray-800">{selectedTask.taskId}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Party Name:</span>{' '}
                  <span className="text-gray-800">{selectedTask.partyName ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">SubTask ID:</span>{' '}
                  <span className="font-mono text-gray-800">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Program:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.program ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Jigar No:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.jigarNo ?? '-'}</span>
                </div>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-500">MTR:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.mtr ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Length:</span>{' '}
                  <span className="text-gray-800">{selectedTask.Length ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">MTR After Sinkage:</span>{' '}
                  <span className="text-gray-800">
                    {mtrAfterSinkageValue}
                  </span>
                </div>
              </div>
            </div>

            <MtrProgress subTask={selectedSubTask} task={selectedTask} />

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Fabric Party Name<span className="text-red-500 font-bold ml-1">*</span></label>
                  <select name="fabricPartyName" value={submissionForm.fabricPartyName} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Party Name'}</option>
                    {dropdownOptions.fabricPartyNames.map((name, i) => <option key={name || i} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Receiver Party Name<span className="text-red-500 font-bold ml-1">*</span></label>
                  <select name="receiverPartyName" value={submissionForm.receiverPartyName} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Receiver Name'}</option>
                    {dropdownOptions.receiverPartyNames.map((name, i) => <option key={name || i} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Submitter Name<span className="text-red-500 font-bold ml-1">*</span></label>
                  <input name="submitterName" type="text" placeholder="Submitter Name" value={submissionForm.submitterName} onChange={handleSubmissionFormChange} className={pillInput} required />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Length<span className="text-red-500 font-bold ml-1">*</span></label>
                  <select name="length" value={submissionForm.length} onChange={handleSubmissionFormChange} className={pillInput} required disabled={dropdownLoading}>
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Length'}</option>
                    {dropdownOptions.length.map((len, i) => <option key={len || i} value={len}>{len}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    MTR
                    {submissionForm.length
                      ? <span className="ml-1 text-gray-500 font-normal">(L{submissionForm.length})</span>
                      : null}
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <input name="mtr" type="number" min={0} step="0.01" placeholder="MTR" value={submissionForm.mtr} onChange={handleSubmissionFormChange} className={pillInput} required />
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>Submitted MTR (L100)</label>
                  <input
                    type="text"
                    value={mtrL100Value !== undefined ? mtrL100Value : ''}
                    className={pillInput + " bg-gray-50 text-gray-600"}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>Location Status<span className="text-red-500 font-bold ml-1">*</span></label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'warehouse' ? 'bg-green-500 text-white border-green-600 shadow' : 'bg-white text-green-600 border-green-300 hover:bg-green-50')}
                    aria-pressed={submissionForm.locationStatus === 'warehouse'}
                    onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'warehouse', savedSinkage: '' }))}
                  >
                    Warehouse
                  </button>
                  <button
                    type="button"
                    className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'missing' ? 'bg-red-500 text-white border-red-600 shadow' : 'bg-white text-red-600 border-red-300 hover:bg-red-50')}
                    aria-pressed={submissionForm.locationStatus === 'missing'}
                    onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'missing', savedSinkage: '' }))}
                  >
                    Missing
                  </button>
                  <button
                    type="button"
                    className={'rounded-full px-6 py-2 font-bold border transition text-xs ' + (submissionForm.locationStatus === 'savedSinkage' ? 'bg-blue-500 text-white border-blue-600 shadow' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50')}
                    aria-pressed={submissionForm.locationStatus === 'savedSinkage'}
                    onClick={() => setSubmissionForm(prev => ({ ...prev, locationStatus: 'savedSinkage' }))}
                    style={{ minWidth: 120 }}
                  >
                    Saved Sinkage
                  </button>
                  <span className="bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5 text-xs font-semibold text-yellow-800 whitespace-nowrap flex items-center">
                    Remaining MTR (L100): <span className="ml-1 font-mono text-yellow-900">{remainingAfterL100 !== null && remainingAfterL100 !== undefined ? remainingAfterL100 : '-'}</span>
                  </span>
                </div>
                {submissionForm.locationStatus === 'savedSinkage' && (
                  <div className="mt-3 flex flex-col">
                    <label className={labelClass}>
                      Enter saved sinkage (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      name="savedSinkage"
                      placeholder="e.g. 5.5"
                      value={submissionForm.savedSinkage}
                      className={pillInput}
                      onChange={handleSubmissionFormChange}
                      required={submissionForm.locationStatus === 'savedSinkage'}
                    />
                  </div>
                )}
              </div>
              
              {(() => {
                const { hasMissing, hasSavedSinkage, mtrLeft } = canAddSubmissionToSubTask(selectedSubTask, selectedTask)
                const isEditingMissing = typeof selectedSubmissionIndex === 'number' &&
                  getSubTaskSubmissionsArray(selectedSubTask)[selectedSubmissionIndex]?.locationStatus === 'missing'
                const isEditingSavedSinkage = typeof selectedSubmissionIndex === 'number' &&
                  getSubTaskSubmissionsArray(selectedSubTask)[selectedSubmissionIndex]?.locationStatus === 'savedSinkage'
                if (hasMissing && !isEditingMissing) {
                  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-xs font-semibold">One submission is marked Missing — no further submissions are allowed for this sub-task.</div>
                }
                if (hasSavedSinkage && !isEditingSavedSinkage) {
                  return <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-blue-800 text-xs font-semibold">One submission uses Saved Sinkage — no further submissions are allowed for this sub-task.</div>
                }
                if (mtrLeft === 0 && typeof selectedSubmissionIndex !== 'number') {
                  return <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-yellow-800 text-xs font-semibold">This sub-task is fully submitted — no MTR left after sinkage.</div>
                }
                return null
              })()}

              <div className="flex flex-row gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Challan No<span className="text-red-500 font-bold ml-1">*</span></label>
                  <input name="challanNo" type="text" placeholder="Challan No" value={submissionForm.challanNo} onChange={handleSubmissionFormChange} className={pillInput} required />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Challan Photo
                    <span className={`text-red-500 font-bold ml-1${existingChallanPhotoPath ? ' opacity-60' : ''}`}>*</span>
                    {existingChallanPhotoPath && <span className="ml-1 text-gray-400 font-normal normal-case">(optional — existing kept if blank)</span>}
                  </label>
                  {existingChallanPhotoPath && (
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Current:</span>
                      {renderChallanPhotoLink(existingChallanPhotoPath, 'Existing Challan Photo')}
                    </div>
                  )}
                  <input name="challanPhotoPath" type="file" accept="image/*" onChange={handleSubmissionFormChange} className={fileInput} required={!existingChallanPhotoPath} />
                  {submissionForm.challanPhotoPath instanceof File && (
                    <span className="text-xs text-orange-600 font-medium mt-1">New file: {submissionForm.challanPhotoPath.name}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className={labelClass}>Remark <span className="text-gray-400 font-normal normal-case">(sub-task note, optional)</span></label>
                <textarea name="remark" rows={2} placeholder="Any note for this sub-task..." value={submissionForm.remark} onChange={handleSubmissionFormChange} className={softInput} />
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition" onClick={closeSubmissionModal} disabled={submitting}>
                <RiCloseLine size={16} />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
                type="submit"
                disabled={submitting || (typeof selectedSubmissionIndex !== 'number' && canAddSubmissionToSubTask(selectedSubTask, selectedTask).isAddDisabled)}
              >
                <RiCheckLine size={17} />
                {submitting ? 'Saving…' : (typeof selectedSubmissionIndex === 'number' ? 'Update Submission' : 'Add Submission')}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Submissions List Modal — opens on row click, shows every submission for that sub-task */}
      <Modal
        open={showSubmissionsModal}
        onClose={closeSubmissionsModal}
        width={640}
        title="Submissions"
        showClose
      >
        {submissionsContext ? (() => {
          const { task, subTask } = submissionsContext
          const submissions = getSubTaskSubmissionsArray(subTask)
          const missingStats = getSubTaskMissingStats(subTask, task)
          const { isAddDisabled } = canAddSubmissionToSubTask(subTask, task)
          const rowStatus = getRowStatus(subTask, task)
          const stStyle = STATUS_STYLES[rowStatus]

          const subTaskMTR_L100 = computeSubTaskMtrAfterSinkage(subTask.mtr, task.sinkage)
          const submittedMTR_L100 = getSubmittedMtrL100Sum(subTask)
          const submittedMTR_L100_display = (submittedMTR_L100 && !isNaN(submittedMTR_L100)) ? submittedMTR_L100.toFixed(2) : '-'

          return (
            <div className="py-1">
              {/* Context header */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 mb-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">{subTask.program || 'Sub-Task'}</span>
                    <span className={`rounded-full border text-[11px] font-bold px-3 py-1 ${stStyle.cls}`}>{stStyle.label}</span>
                  </div>
                  <span className="font-mono text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                    SubTask {subTask.subTaskId ?? subTask._id ?? '-'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Task ID</div>
                    <div className="font-mono font-bold text-gray-800 flex items-center gap-1">
                      {task.taskId}
                      <button type="button" className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]" onClick={() => copyToClipboard(task.taskId)}>Copy</button>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Party</div>
                    <div className="font-semibold text-gray-800">{task.partyName ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Jigar No</div>
                    <div className="font-semibold text-gray-800">{subTask.jigarNo ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Sub MTR</div>
                    <div className="font-semibold text-gray-800">{subTask.mtr ?? '-'}</div>
                  </div>
                </div>
                {subTask.remark && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                    <span className="font-semibold text-gray-500">Remark: </span>{subTask.remark}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <MtrProgress subTask={subTask} task={task} compact />
                </div>
              </div>

              {/* Add button */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-800">
                  {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2 transition disabled:bg-gray-300"
                  onClick={() => openAddModal(task, subTask, true)}
                  disabled={isAddDisabled}
                  title={isAddDisabled ? (rowStatus === 'missing' ? 'Marked Missing — no further submissions allowed' : rowStatus === "savedSinkage" ? 'Marked Saved Sinkage — no further submissions allowed' : 'No MTR left') : ''}
                >
                  <RiAddLine size={15} />
                  Add Submission
                </button>
              </div>
              {isAddDisabled && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-amber-800 text-xs font-semibold">
                  {rowStatus === 'missing'
                    ? 'No further submissions allowed — one entry is marked Missing for this sub-task.'
                    : rowStatus === 'savedSinkage'
                      ? 'No further submissions allowed — one entry uses Saved Sinkage for this sub-task.'
                      : 'Fully submitted — MTR after sinkage has been reached.'}
                </div>
              )}

              {/* Submission cards */}
              {submissions.length === 0 ? (
                <div className="py-8">
                  <EmptyState icon="📭" text="No submissions yet for this sub-task. Click \u201CAdd Submission\u201D to get started." />
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {submissions.map((sub, subIdx) => (
                    <div
                      key={sub._id || subIdx}
                      className={`rounded-2xl border px-4 py-3.5 ${
                        sub.locationStatus === 'missing'
                          ? 'border-red-200 bg-red-50/60'
                          : sub.locationStatus === 'savedSinkage'
                            ? 'border-blue-200 bg-blue-50/60'
                            : 'border-green-200 bg-green-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">#{subIdx + 1}</span>
                          <span className={
                            'rounded-full text-[11px] px-2.5 py-0.5 font-bold border ' +
                            (sub.locationStatus === 'missing'
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : sub.locationStatus === 'savedSinkage'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-green-100 text-green-700 border-green-200')
                          }>
                            {sub.locationStatus === 'missing' ? 'Missing'
                              : sub.locationStatus === 'savedSinkage' ? 'Saved Sinkage'
                              : 'Warehouse'
                            }
                          </span>
                          {(typeof sub.savedSinkage !== "undefined" && sub.savedSinkage !== null && !isNaN(Number(sub.savedSinkage)) && sub.locationStatus === 'savedSinkage') &&
                            <span className="ml-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold" title={`Saved Sinkage: ${sub.savedSinkage}%`}>
                              Saved Sinkage: {sub.savedSinkage}
                            </span>
                          }
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="flex items-center gap-1 rounded-full border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 text-[11px] font-semibold px-3 py-1 transition"
                            onClick={() => openEditModal(task, subTask, subIdx, sub, true)}
                          >
                            <RiPencilLine size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition disabled:opacity-50"
                            title="Delete submission"
                            onClick={() => handleSubmissionDelete(task, subTask, subIdx, true)}
                            disabled={deletingIndex === subIdx}
                          >
                            <RiDeleteBin5Line size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                        <Field label="Fabric Party" value={sub.fabricPartyName} />
                        <Field label="Receiver Party" value={sub.recieverPartyName} />
                        <Field label="Submitter" value={sub.submitterName} />
                        <Field label="Length" value={sub.length} />
                        <Field label="MTR" value={sub.MTR} />
                        <Field label="Challan No" value={sub.challanNo} />
                        <Field
                          label="MTR (L100)"
                          value={computeSubmissionMtrL100(sub.MTR, sub.length)}
                        />
                        <Field
                          label="Challan Photo"
                          value={renderChallanPhotoLink(sub.challanPhotoPath, `Challan #${sub.challanNo ?? ''}`)}
                        />
                        {(typeof sub.savedSinkage !== "undefined" && sub.savedSinkage !== null && !isNaN(Number(sub.savedSinkage)) && sub.locationStatus === 'savedSinkage') &&
                          <Field label="Saved Sinkage" value={`${sub.savedSinkage}`} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                  onClick={closeSubmissionsModal}
                >
                  <RiCloseLine size={16} />
                  Close
                </button>
              </div>
            </div>
          )
        })() : (
          <EmptyState icon="📭" text="No sub-task selected." />
        )}
      </Modal>

      {challanPreview.ModalPreview && <challanPreview.ModalPreview />}
    </div>
  )
}

const Th = ({ children }) => (
  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap text-left">{children}</th>
)

const SummaryCard = ({ label, value, accent, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-2xl border bg-white px-4 py-3 shadow-sm transition ${accent} ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'} ${active ? 'ring-2 ring-orange-300' : ''}`}
  >
    <div className="text-2xl font-extrabold">{value}</div>
    <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
  </button>
)

const Field = ({ label, value }) => (
  <div>
    <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">{label}</div>
    <div className="text-gray-800 font-medium flex items-center gap-1">{(value ?? '') === '' ? '-' : value}</div>
  </div>
)

const MtrProgress = ({ subTask, task, compact = false }) => {
  let allowedMtr = Number(computeSubTaskMtrAfterSinkage(
    subTask.mtr,
    task.sinkage
  ))
  if (isNaN(allowedMtr)) allowedMtr = null
  let submittedL100 = getSubmittedMtrL100Sum(subTask)
  const mtrLeft = allowedMtr !== null && !isNaN(submittedL100) ? Math.max(allowedMtr - submittedL100, 0) : null
  const hasMissing = getSubTaskSubmissionsArray(subTask).some(s => s.locationStatus === 'missing')
  const hasSavedSinkage = getSubTaskSubmissionsArray(subTask).some(s => s.locationStatus === 'savedSinkage')
  const pct = allowedMtr > 0 && !isNaN(submittedL100) ? Math.min(100, Math.round((submittedL100 / allowedMtr) * 100)) : 0

  if (allowedMtr === null) {
    return (
      <div className="text-xs text-gray-400 font-medium">MTR tracking unavailable — task is missing sinkage data.</div>
    )
  }
  return (
    <div className={compact ? '' : 'rounded-2xl border border-orange-100 bg-orange-50/40 px-5 py-4'}>
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
        <span className="text-orange-800">MTR (L100) submitted: {submittedL100.toFixed(2)} / {allowedMtr.toFixed(2)}</span>
        <span className="text-orange-500">{mtrLeft !== null ? `${mtrLeft.toFixed(2)} left` : '-'}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-orange-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            hasMissing
              ? 'bg-red-400'
              : hasSavedSinkage
                ? 'bg-blue-400'
                : pct >= 100
                  ? 'bg-green-500'
                  : 'bg-orange-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default AllSubTasksTable