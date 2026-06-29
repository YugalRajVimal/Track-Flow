import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

import { RiCheckLine, RiCloseLine, RiDeleteBin5Line } from 'react-icons/ri'
import WorkflowHeader from '../../components/common/WorkflowHeader'
import StatusBadgeTask from '../../components/common/StatusBadgeTask'
import EmptyState from '../../components/common/EmptyState'

import Modal from '../../components/common/Modal'
import NextStepBanner from '../../components/common/NextStepBanner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubmissionForm = {
  fabricPartyName: '',
  receiverPartyName: '',
  submitterName: '',
  length: '',
  mtr: '',
  // payment: '', // REMOVED
  remark: '',
  challanNo: '',
  challanPhotoPath: '',
  locationStatus: '', // No default (must be explicitly selected)
}

// Standard sinkage
function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage) {
  if (
    subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage))
  ) return '-'
  return (Number(subTaskMtr) - (Number(subTaskMtr) * Number(sinkage) / 100)).toFixed(2)
}

function computeSubTaskMtrAfterLengthSinkage(subTaskMtr, sinkage, length) {
  if (
    subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
    length === undefined || length === null || isNaN(Number(length))
  ) return '-'
  const mtr = Number(subTaskMtr)
  const sinkagePercent = Number(sinkage)
  const lengthPercent = Number(length)
  const lengthLossPercent = 100 - lengthPercent
  const totalPercent = sinkagePercent + lengthLossPercent
  return (mtr - (mtr * totalPercent / 100)).toFixed(2)
}

// NEW PARTY SINKAGE CALC
/**
 * For submission:
 * - if submission length == taskLength: only sinkage % applies (sinkage is %)
 * - if submission length > taskLength: sinkage + (submissionLen - taskLen)%
 * - if submission length < taskLength: sinkage + (submissionLen - taskLen)% (so sinkage - diff%)
 * Note: Never negative sinkage; if total percent < 0, treat as 0% only.
 */
function computeSubTaskMtrAfterPartySinkage(subTaskMtr, sinkage, taskLength, submissionLength) {
  if (
    subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
    taskLength === undefined || taskLength === null || isNaN(Number(taskLength)) ||
    submissionLength === undefined || submissionLength === null || isNaN(Number(submissionLength))
  ) return '-'
  const mtr = Number(subTaskMtr)
  const sinkagePercent = Number(sinkage)
  const taskLenNum = Number(taskLength)
  const subLenNum = Number(submissionLength)
  let totalPercent = sinkagePercent + (subLenNum - taskLenNum)
  if (totalPercent < 0) totalPercent = 0
  return (mtr - mtr * totalPercent / 100).toFixed(2)
}

const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const fileInput =
  'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

// ---- copy-to-clipboard helper ----
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied Task ID');
  } catch (err) {
    toast.error('Failed to copy');
  }
}

function sumSubmissionMTRs(submissions, onlyWarehouse = false) {
  if (!Array.isArray(submissions)) return 0
  return submissions.reduce((sum, s) => {
    if (onlyWarehouse && s?.locationStatus === "missing") return sum
    const mtr = Number(s?.MTR)
    return isNaN(mtr) ? sum : sum + mtr
  }, 0)
}

// For MTR after length sinkage: sum all submissions as "MTR" directly.
function computeSubTaskTotalMtrAfterLengthSinkage(subTask, taskData) {
  if (
    !subTask || typeof subTask.mtr === 'undefined' ||
    typeof taskData?.sinkage === 'undefined' ||
    typeof taskData?.Length === 'undefined'
  ) {
    return '-'
  }
  return computeSubTaskMtrAfterLengthSinkage(subTask.mtr, taskData.sinkage, taskData.Length)
}

function sumSubmissionMTRsOfSubTask(subTask) {
  const arr = getSubTaskSubmissionsArray(subTask)
  if (!Array.isArray(arr)) return 0
  return arr.reduce((sum, s) => {
    const mtr = Number(s?.MTR)
    return isNaN(mtr) ? sum : sum + mtr
  }, 0)
}

function sumSubmissionMTRsForLengthSinkage(subTask) {
  return sumSubmissionMTRsOfSubTask(subTask)
}

function getSubTaskSubmissionsArray(subTask) {
  if (Array.isArray(subTask.submissions)) return subTask.submissions
  if (Array.isArray(subTask.submission)) return subTask.submission
  if (subTask.submission) return [subTask.submission]
  return []
}

function getSubTaskMissingStats(subTask, taskData) {
  const submissions = getSubTaskSubmissionsArray(subTask)
  const sumAllMTR = sumSubmissionMTRs(submissions, false)
  const subTaskMtrAfterLengthSinkageRaw =
    typeof subTask.mtr !== 'undefined' &&
    typeof taskData?.sinkage !== 'undefined' &&
    typeof taskData?.Length !== 'undefined'
      ? Number(computeSubTaskMtrAfterLengthSinkage(subTask.mtr, taskData.sinkage, taskData.Length))
      : undefined;

  const submissionMTRSum = sumSubmissionMTRsOfSubTask(subTask)
  const hasMissing = submissions.some(x => x.locationStatus === 'missing');
  let missingMTRAfterLengthSinkage = null;
  if (hasMissing) {
    missingMTRAfterLengthSinkage =
      (isNaN(subTaskMtrAfterLengthSinkageRaw) || isNaN(submissionMTRSum))
        ? null
        : Math.max(subTaskMtrAfterLengthSinkageRaw - submissionMTRSum, 0);
  }
  return {
    hasMissing,
    missingMTR: missingMTRAfterLengthSinkage,
    missingAfterSinkage: null,
    warehouseSum: sumAllMTR,
    warehouseSumSinkage: null,
  }
}

function usePreviewImageModal() {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewAlt, setPreviewAlt] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [downloadError, setDownloadError] = useState('')

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
    if (!previewUrl) return;
    setDownloadError('');
    try {
      let fetchURL = previewUrl;
      const response = await fetch(fetchURL, { credentials: 'same-origin', mode: 'cors' });
      if (!response.ok) throw new Error('Image download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fname = decodeURIComponent(previewUrl.split('/').pop());
      link.download = fname || 'challan_image.png';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      setDownloadError('Download failed: File may not be accessible due to server CORS or auth issue.');
    }
  }

  const ModalPreview = ({ width = 480 }) =>
    <Modal open={showPreview} onClose={close} width={width} showClose title="Challan Photo Preview">
      {previewUrl ? (
        <div className="p-4 flex flex-col items-center gap-4">
          <img
            src={previewUrl}
            alt={previewAlt || "Challan photo"}
            className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
            style={{ objectFit: 'contain', background: "#f9f6f2", width: "100%" }}
            crossOrigin="anonymous"
          />
          <button
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2 transition flex items-center"
            style={{ textDecoration: 'none' }}
            onClick={handleDownload}
          >
            Download
          </button>
          {downloadError && (
            <div className="text-center text-xs text-red-500">{downloadError}</div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
      )}
    </Modal>
  return { open, close, ModalPreview }
}

// === HELPER for Add/Disable logic ===
function canAddSubmissionToSubTask(subTask, taskData) {
  // Return two booleans:
  // 1. isAddDisabled: true if MTR sum equals subtask after length sinkage OR a missing exists
  // 2. hasMissing: true if any submission is marked 'missing'
  // 3. mtrLeft === 0
  if (!subTask || !taskData) return { isAddDisabled: false, hasMissing: false, mtrLeft: null };
  let subtaskMtrAfterLengthSinkage = undefined;
  if (
    typeof subTask.mtr !== 'undefined' &&
    typeof taskData?.sinkage !== 'undefined' &&
    typeof taskData?.Length !== 'undefined'
  ) {
    subtaskMtrAfterLengthSinkage = Number(computeSubTaskMtrAfterLengthSinkage(subTask.mtr, taskData.sinkage, taskData.Length));
  }
  const submissions = getSubTaskSubmissionsArray(subTask);
  const submissionMtrSum = submissions.reduce((sum, s) => {
    const mtrVal = Number(s?.MTR)
    return isNaN(mtrVal) ? sum : sum + mtrVal
  }, 0);
  const mtrLeft = (subtaskMtrAfterLengthSinkage !== undefined && !isNaN(subtaskMtrAfterLengthSinkage))
    ? Math.max(subtaskMtrAfterLengthSinkage - submissionMtrSum, 0)
    : null;
  const hasMissing = submissions.some(x => x.locationStatus === 'missing');
  const isAddDisabled = (mtrLeft === 0) || hasMissing;
  return { isAddDisabled, hasMissing, mtrLeft };
}

const SubmissionManagement = () => {
  const [tasksWithPendingSubtasks, setTasksWithPendingSubtasks] = useState([])
  const [loadingTasksList, setLoadingTasksList] = useState(true)
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState(null)

  const [inputTaskId, setInputTaskId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [taskData, setTaskData] = useState(null)
  const [subTasks, setSubTasks] = useState([])
  const [selectedSubTask, setSelectedSubTask] = useState(null)
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)
  const [existingChallanPhotoPath, setExistingChallanPhotoPath] = useState('')

  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
  const [subTaskForSubmissionDetails, setSubTaskForSubmissionDetails] = useState(null)

  const [showAllSubmissions, setShowAllSubmissions] = useState(false)

  const [dropdownOptions, setDropdownOptions] = useState({
    fabricPartyNames: [],
    receiverPartyNames: [],
    length: []
  })
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [dropdownError, setDropdownError] = useState('')

  const [deleting, setDeleting] = useState(false)

  // NEW: Track error for missing/disable add button reasons
  const [addSubmissionDisabledReason, setAddSubmissionDisabledReason] = useState('');

  // ADD: for challan photo preview modal
  const challanPreview = usePreviewImageModal();

  useEffect(() => {
    let isSubscribed = true
    setDropdownLoading(true)
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`)
        if (!isSubscribed) return
        setDropdownOptions({
          fabricPartyNames: Array.isArray(res.data?.data?.FabricPartyName) ? res.data.data.FabricPartyName : [],
          receiverPartyNames: Array.isArray(res.data?.data?.recieverPartyName) ? res.data.data.recieverPartyName : [],
          length: Array.isArray(res.data?.data?.length) ? res.data.data.length : []
        })
        setDropdownError('')
      } catch {
        setDropdownError('Failed to load dropdown data')
      } finally {
        if (isSubscribed) setDropdownLoading(false)
      }
    }
    fetchDropdowns()
    return () => { isSubscribed = false }
  }, [])

  useEffect(() => {
    const fetchTasksList = async () => {
      setLoadingTasksList(true)
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
        setTasksWithPendingSubtasks(res.data?.success && Array.isArray(res.data.data) ? res.data.data : [])
      } catch {
        setTasksWithPendingSubtasks([])
      }
      setLoadingTasksList(false)
    }
    fetchTasksList()
  }, [])

  async function handleTaskFetch(e, manualId = null) {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')
    setAddSubmissionDisabledReason('')
    setTaskId('')
    setTaskData(null)
    setSubTasks([])
    setSelectedSubTask(null)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setSubmissionForm(initialSubmissionForm)
    const taskIdValue = manualId || inputTaskId
    if (!taskIdValue?.trim()) {
      setError('Please enter a valid Task ID')
      return
    }
    setFetching(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
        params: { taskId: taskIdValue.trim() }
      })
      if (res.data?.data) {
        setTaskId(res.data.data.taskId || taskIdValue.trim())
        setTaskData(res.data.data)
        setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
      } else {
        setError('Task not found')
      }
    } catch {
      setError('Task load failed')
    }
    setFetching(false)
  }

  function handleSelectPendingTask(taskRow) {
    setInputTaskId(taskRow.taskId)
    handleTaskFetch(null, taskRow.taskId)
    setSelectedPendingTaskId(taskRow.taskId)
    setError('')
    setSuccess('')
    setAddSubmissionDisabledReason('')
  }

  async function refreshTaskData() {
    if (!taskId) return
    setFetching(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId } })
      if (res.data?.data) {
        setTaskData(res.data.data)
        setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
      }
    } finally {
      setFetching(false)
    }
  }

  function getSubmissionsForSubTask(subTask) {
    return getSubTaskSubmissionsArray(subTask)
  }

  function getEditableSubmission(subTask) {
    const subs = getSubmissionsForSubTask(subTask)
    return subs.length === 0 ? undefined : subs.at(-1)
  }

  function getEditableSubmissionIndex(subTask) {
    const subs = getSubmissionsForSubTask(subTask)
    return subs.length === 0 ? null : subs.length - 1
  }

  function closeSubmissionModal() {
    setShowSubmissionModal(false)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setError('')
    setAddSubmissionDisabledReason('')
    setSuccess('')
    setSubmissionForm(initialSubmissionForm)
  }

  // handleSubTaskSelect: When "Add Submission" is clicked, all fields should be empty (per instruction).
  function handleSubTaskSelect(subTask) {
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setSuccess('')
    setError('')
    setAddSubmissionDisabledReason('')
    setSubmissionForm({
      ...initialSubmissionForm
      // All fields empty, nothing pre-filled
    })
    setShowSubmissionModal(true)
  }

  function openEditModal(subTask, submissionIndex, subToEdit) {
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(submissionIndex)
    setExistingChallanPhotoPath(subToEdit?.challanPhotoPath || '')
    setError('')
    setSuccess('')
    setAddSubmissionDisabledReason('')
    setSubmissionForm({
      ...initialSubmissionForm,
      fabricPartyName: subToEdit?.fabricPartyName || '',
      receiverPartyName: subToEdit?.recieverPartyName || '',
      submitterName: subToEdit?.submitterName || '',
      length: subToEdit?.length || '',
      mtr: subToEdit?.MTR ?? subTask?.mtr ?? '',
      // payment: subToEdit?.Payment || '', // REMOVED
      remark: subTask?.remark || '',
      challanNo: subToEdit?.challanNo || '',
      challanPhotoPath: '',
      locationStatus: subToEdit?.locationStatus || ''
    })
    setShowSubmissionModal(true)
  }

  function handleSubmissionFormChange(e) {
    const { name, value, type, files } = e.target
    if (type === 'file' && name === 'challanPhotoPath') {
      setSubmissionForm(prev => ({
        ...prev,
        challanPhotoPath: files && files[0] ? files[0] : ''
      }))
    } else {
      setSubmissionForm(prev => ({ ...prev, [name]: value }))
    }
  }

  function formatNumberOrDash(val) {
    if (typeof val === 'number') return isNaN(val) ? '-' : val.toFixed(2)
    if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return Number(val).toFixed(2)
    return '-'
  }

  // --- MODIFIED: canAddSubmission disables add if mtrSum==allowed or missing exists and blocks multiple missing
  function canAddSubmission(subTask, formSubmission, isEdit = false) {
    const mtr = Number(formSubmission.mtr)
    const lengthVal = formSubmission.length
    const sinkage = taskData?.sinkage
    const photoRequired = !isEdit || !existingChallanPhotoPath
    const hasPhoto = (formSubmission.challanPhotoPath instanceof File) || (!photoRequired)
    if (
      !formSubmission.fabricPartyName ||
      !formSubmission.receiverPartyName ||
      !formSubmission.submitterName ||
      !formSubmission.length ||
      !formSubmission.mtr ||
      !formSubmission.challanNo ||
      !hasPhoto
    ) {
      return {
        valid: false,
        msg: photoRequired
          ? 'All fields are mandatory, including submitter name and challan photo.'
          : 'All fields are mandatory except challan photo (existing photo will be kept).'
      }
    }
    if (isNaN(mtr) || mtr <= 0) return { valid: false, msg: 'MTR is required and must be > 0' }
    const editingSubTaskId = selectedSubTask?.subTaskId || selectedSubTask?._id
    let editingChallanNo
    if (isEdit && typeof selectedSubmissionIndex === 'number') {
      const editingSubs = getSubTaskSubmissionsArray(selectedSubTask)
      editingChallanNo = editingSubs[selectedSubmissionIndex]?.challanNo
    }
    const newChallanNoTrimmed = String(formSubmission.challanNo).trim().toLowerCase()
    for (const st of subTasks) {
      for (const sub of getSubTaskSubmissionsArray(st)) {
        const isSelf =
          isEdit &&
          String(sub.challanNo).trim().toLowerCase() === editingChallanNo?.trim().toLowerCase() &&
          (st.subTaskId || st._id) === editingSubTaskId
        if (!isSelf && String(sub.challanNo).trim().toLowerCase() === newChallanNoTrimmed) {
          return { valid: false, msg: `Challan No "${formSubmission.challanNo}" already exists in another submission.` }
        }
      }
    }

    // === DISABLE add if ANY marking as missing again, or already missing exists ===
    const submissions = getSubTaskSubmissionsArray(subTask) || []
    const alreadyHasMissing = submissions.some(s => s.locationStatus === 'missing')
    if (alreadyHasMissing && formSubmission.locationStatus === 'missing' && !(isEdit && typeof selectedSubmissionIndex === 'number' && submissions[selectedSubmissionIndex]?.locationStatus === 'missing')) {
      return { valid: false, msg: "Multiple submissions cannot be marked 'Missing' for this SubTask." }
    }

    // Use only as much as sum of MTRs of all (other) submissions + new submission MTR <= Subtask MTR after Length Sinkage
    const filteredForSum = isEdit && typeof selectedSubmissionIndex === 'number'
      ? submissions.filter((_, i) => i !== selectedSubmissionIndex)
      : submissions
    const submissionMTRSum = filteredForSum.reduce((sum, s) => {
      const mtrVal = Number(s?.MTR)
      return isNaN(mtrVal) ? sum : sum + mtrVal
    }, 0)
    let subtaskMtrAfterLengthSinkage = null;
    let mtrLeft = null
    if (typeof subTask.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') {
      subtaskMtrAfterLengthSinkage = Number(computeSubTaskMtrAfterLengthSinkage(subTask.mtr, taskData.sinkage, taskData.Length))
      mtrLeft = subtaskMtrAfterLengthSinkage - submissionMTRSum
      if (!isNaN(subtaskMtrAfterLengthSinkage) && (submissionMTRSum + mtr > subtaskMtrAfterLengthSinkage + 1e-8)) {
        return {
          valid: false,
          msg: `Only ${mtrLeft >= 0 ? mtrLeft.toFixed(2) : 0} MTR left (by MTR after Length Sinkage) for this SubTask.`
        }
      }
      if (mtrLeft === 0) {
        return { valid: false, msg: 'No MTR left to submit for this SubTask.' }
      }
    }
    if (alreadyHasMissing && (!isEdit || (isEdit && submissions[selectedSubmissionIndex]?.locationStatus !== 'missing'))) {
      // Already missing, can't add normal even
      return { valid: false, msg: 'No more submissions allowed as one is marked "Missing".' }
    }
    return { valid: true, msg: '' }
  }

  async function handleSubmission(e) {
    e.preventDefault()
    if (!taskData || !selectedSubTask) return
    setError('')
    setSuccess('')
    setAddSubmissionDisabledReason('')
    setSubmitting(true)
    const isEdit = typeof selectedSubmissionIndex === 'number'
    const photoRequired = !isEdit || !existingChallanPhotoPath
    const hasPhoto = (submissionForm.challanPhotoPath instanceof File) || !photoRequired
    if (
      !submissionForm.fabricPartyName ||
      !submissionForm.receiverPartyName ||
      !submissionForm.submitterName ||
      !submissionForm.length ||
      !submissionForm.mtr ||
      !submissionForm.challanNo ||
      !hasPhoto
    ) {
      setError(
        photoRequired
          ? 'All fields are mandatory, including submitter name and challan photo.'
          : 'All required fields must be filled (challan photo is optional if one already exists).'
      )
      setSubmitting(false)
      return
    }
    const validation = canAddSubmission(selectedSubTask, submissionForm, isEdit)
    if (!validation.valid) {
      setError(validation.msg)
      setSubmitting(false)
      return
    }
    try {
      const subTaskId = selectedSubTask.subTaskId || selectedSubTask._id
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
      if (submissionForm.remark !== undefined) {
        formData.append('remark', submissionForm.remark)
      }
      formData.append('locationStatus', submissionForm.locationStatus || 'warehouse')
      if (submissionForm.challanPhotoPath instanceof File) {
        formData.append('file', submissionForm.challanPhotoPath)
      } else if (isEdit && existingChallanPhotoPath) {
        formData.append('challanPhotoPath', existingChallanPhotoPath)
      }
      if (method === 'post') {
        await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await axios.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success('Submission saved')
      setSuccess('Submission saved')
      closeSubmissionModal()
      await refreshTaskData()
    } catch {
      setError('Submission failed')
      toast.error('Submission failed')
    }
    setSubmitting(false)
  }

  async function handleSubmissionDelete(subTask, submissionIndex = null) {
    const msg =
      submissionIndex !== null
        ? 'Delete this submission entry? This cannot be undone.'
        : 'Delete submission for this sub-task? This cannot be undone.'
    if (!window.confirm(msg)) return
    setDeleting(true)
    setError('')
    setSuccess('')
    const subTaskId = subTask.subTaskId || subTask._id
    try {
      let url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`
      if (submissionIndex !== null && typeof submissionIndex === 'number') {
        url += `?submissionIndex=${submissionIndex}`
      }
      await axios.delete(url)
      toast('Submission deleted', { icon: '🗑️' })
      setSuccess('Submission deleted')
      await refreshTaskData()
      setShowSubmissionModal(false)
      setShowSubmissionDetailModal(false)
      setShowAllSubmissions(false)
    } catch {
      setError('Failed to delete submission')
      toast.error('Failed to delete submission')
    }
    setDeleting(false)
  }

  function handleShowSubmissionDetails(subTask) {
    setSubTaskForSubmissionDetails(subTask)
    setShowSubmissionDetailModal(true)
  }

  function handleCloseSubmissionDetails() {
    setShowSubmissionDetailModal(false)
    setSubTaskForSubmissionDetails(null)
  }

  const renderChallanPhotoLink = (path, altLabel) => {
    if (!path) return <span className="text-gray-400 text-xs">-</span>
    let fullUrl = path;
    if (path.startsWith('/uploads/')) {
      fullUrl = `${API_BASE_URL}${path}`;
    }
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs px-0.5"
          style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
          onClick={() => challanPreview.open(fullUrl, altLabel || "Challan photo")}
          title="Preview Image"
        >
          Preview
        </button>
      </span>
    );
  }

  function getSubTaskAfterPartySinkage(st, sinkageFromTask, taskLength) {
    const mtr = st.mtr
    const sinkage = sinkageFromTask
    const submissionLength = (typeof st.length !== 'undefined' && st.length !== null ? st.length : taskLength)
    return computeSubTaskMtrAfterPartySinkage(mtr, sinkage, taskLength, submissionLength)
  }

  function getAllSubmissionsForTask() {
    if (!taskData || !Array.isArray(subTasks)) return []
    const allRows = []
    subTasks.forEach((subTask) => {
      getSubTaskSubmissionsArray(subTask).forEach((submission, idx) => {
        allRows.push({ subTask, submission, subTaskIndex: subTasks.indexOf(subTask), submissionIndex: idx })
      })
    })
    return allRows
  }

  // Variables for form summary
  let mtrInputValue = submissionForm.mtr;
  let taskLengthValue = (typeof taskData?.Length !== 'undefined' && taskData?.Length !== null) ? taskData.Length : '';
  let submissionLengthValue = (typeof submissionForm.length !== 'undefined' && submissionForm.length !== null) ? submissionForm.length : '';
  let sinkageInputValue = taskData?.sinkage;
  let mtrAfterSinkage = '-';
  let mtrAfterPartySinkage = '-';

  if (
    mtrInputValue !== undefined &&
    mtrInputValue !== '' &&
    !isNaN(Number(mtrInputValue)) &&
    sinkageInputValue !== undefined &&
    sinkageInputValue !== '' &&
    !isNaN(Number(sinkageInputValue)) &&
    taskLengthValue !== undefined &&
    taskLengthValue !== '' &&
    !isNaN(Number(taskLengthValue)) &&
    submissionLengthValue !== undefined &&
    submissionLengthValue !== '' &&
    !isNaN(Number(submissionLengthValue))
  ) {
    mtrAfterSinkage = computeSubTaskMtrAfterSinkage(mtrInputValue, sinkageInputValue);
    mtrAfterPartySinkage = computeSubTaskMtrAfterPartySinkage(
      mtrInputValue,
      sinkageInputValue,
      Number(taskLengthValue),
      Number(submissionLengthValue)
    );
  }

  function renderSinkagePercent(sinkageVal) {
    return (typeof sinkageVal !== 'undefined' && sinkageVal !== null && !isNaN(Number(sinkageVal)))
      ? <span className="text-xs text-orange-500 ml-1 font-semibold">({sinkageVal}% sinkage)</span>
      : null;
  }

  function renderPartySinkagePercent(sinkage, taskLength, submissionLength) {
    if (
      typeof sinkage !== 'undefined' && sinkage !== null && !isNaN(Number(sinkage)) &&
      typeof taskLength !== 'undefined' && taskLength !== null && !isNaN(Number(taskLength)) &&
      typeof submissionLength !== 'undefined' && submissionLength !== null && !isNaN(Number(submissionLength))
    ) {
      let total = Number(sinkage) + (Number(submissionLength) - Number(taskLength));
      if (total < 0) total = 0;
      return (
        <span className="text-xs text-orange-800 ml-1 font-semibold">{`(${total}% total)`}</span>
      );
    }
    return null;
  }

  function renderLengthSinkagePercent(length) {
    if (typeof length !== 'undefined' && length !== null && !isNaN(Number(length))) {
      const sinkLength = (100 - Number(length));
      return (
        <span className="text-xs text-yellow-500 ml-1 font-semibold">{`(${sinkLength}% length loss)`}</span>
      );
    }
    return null;
  }
  function renderTotalSinkagePercent(sinkage, length) {
    if (
      typeof sinkage !== 'undefined' && sinkage !== null && !isNaN(Number(sinkage)) &&
      typeof length !== 'undefined' && length !== null && !isNaN(Number(length))
    ) {
      let total = Number(sinkage) + (100 - Number(length));
      return (
        <span className="text-xs text-orange-800 ml-1 font-semibold">{`(${total}% total)`}</span>
      );
    }
    return null;
  }

  // --- REMEMBER: For each subtask, Add/Submit button is disabled if sum==max or any missing
  function isAddSubmissionDisabledForSubTask(subTask, taskData) {
    const { isAddDisabled } = canAddSubmissionToSubTask(subTask, taskData);
    return isAddDisabled;
  }
  function getAddSubmissionDisabledReason(subTask, taskData) {
    const { isAddDisabled, hasMissing, mtrLeft } = canAddSubmissionToSubTask(subTask, taskData);
    if (hasMissing) {
      return 'Marked Missing';
    }
    if (mtrLeft === 0) {
      return 'Fabric Left - 0 MTR';
    }
    return '';
  }

  return (
    <div className="min-h-screen bg-white">
      <WorkflowHeader
        activeStep="submission"
        topLabel="Fabric Task Workflow"
        title="Submission"
        subtitle="Load a task, then submit fabric and payment details for each of its sub-tasks."
      />
      <div className="max-w-6xl mx-auto px-2 md:px-6 sm:px-10 pb-6">
        {/* Pending Tasks Table */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 text-lg mb-2 flex gap-2 items-center">
            Tasks with Pending SubTasks
            {loadingTasksList && <span className="text-xs text-orange-600 ml-2 animate-pulse">Loading...</span>}
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white mb-2">
            {tasksWithPendingSubtasks.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  icon="🗂️"
                  text={loadingTasksList ? 'Loading...' : 'No tasks with pending subtasks found'}
                />
              </div>
            ) : (
              <table className="min-w-[650px] w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Task ID</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Type</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Party Name</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Total MTR</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Rolls</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasksWithPendingSubtasks.map(t => (
                    <tr
                      key={t.taskId}
                      className={`${selectedPendingTaskId === t.taskId ? 'bg-orange-50/60' : ''} hover:bg-orange-50/30 text-center border-t border-gray-100 transition-colors`}
                    >
                      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold flex items-center gap-1 justify-center">
                        {t.taskId}
                        <button
                          type="button"
                          aria-label="Copy Task ID"
                          className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1 py-0.5 border border-orange-200 bg-orange-50"
                          style={{fontSize: '0.87em', lineHeight: '1'}}
                          onClick={() => copyToClipboard(t.taskId)}
                        >Copy</button>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.FabricType || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.partyName || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.MTR || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.totalRolls ?? '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          className={`rounded-full font-semibold text-xs px-5 py-1.5 transition ${
                            selectedPendingTaskId === t.taskId
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                          onClick={() => handleSelectPendingTask(t)}
                          disabled={fetching && selectedPendingTaskId === t.taskId}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Manual Task ID input */}
        <form
          className="flex flex-wrap items-center gap-3 mb-7 bg-white py-2 px-2 rounded-full border border-gray-200 shadow-sm max-w-xl"
          onSubmit={handleTaskFetch}
        >
          <label htmlFor="taskIdInput" className="font-semibold text-gray-500 text-sm pl-3 whitespace-nowrap">
            Task ID
          </label>
          <input
            id="taskIdInput"
            name="taskIdInput"
            type="text"
            placeholder="e.g. 2"
            value={inputTaskId}
            onChange={e => setInputTaskId(e.target.value)}
            className="flex-1 px-2 py-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none min-w-0"
            autoComplete="off"
          />
          {inputTaskId && (
            <button
              type="button"
              aria-label="Copy Task ID"
              className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-1 border border-orange-200 bg-orange-50 text-xs"
              onClick={() => copyToClipboard(inputTaskId)}
            >Copy</button>
          )}
          <button
            type="submit"
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition flex-shrink-0"
            disabled={fetching}
          >
            Load Task
          </button>
        </form>

        {fetching && <div className="mb-3 text-orange-500 text-sm font-medium text-center">Loading...</div>}
        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium text-center">{success}</div>}
        {dropdownError && <div className="mb-4 text-red-500 text-center text-sm">{dropdownError}</div>}

        {!taskData && !fetching && (
          <div className="rounded-3xl border border-gray-200 bg-white">
            <EmptyState icon="🔎" text="Enter or select a Task ID above to load its sub-tasks." />
          </div>
        )}

        {/* Task info and sub tasks */}
        {taskData && (
          <div className="mb-7">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-6 px-7 py-6 mb-6 justify-between">
              {/* ... unchanged ... */}
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Task ID</span>
                <span className="text-base font-bold text-gray-900 flex items-center gap-1">
                  {taskData.taskId || taskId}
                  <button
                    type="button"
                    aria-label="Copy Task ID"
                    className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                    onClick={() => copyToClipboard(taskData.taskId || taskId)}
                  >Copy</button>
                </span>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Fabric Type</span>
                <span className="text-base font-semibold text-gray-800">{taskData.FabricType}</span>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Total MTR</span>
                <span className="text-base font-semibold text-orange-600">{taskData.MTR}</span>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Total Length</span>
                <span className="text-base font-semibold text-orange-600">{taskData.Length ?? '-'}</span>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Party Name</span>
                <span className="text-base font-semibold text-gray-800">{taskData.partyName}</span>
              </div>
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Builty No</span>
                <span className="text-base font-semibold text-gray-800">{taskData.BuiltyNo}</span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">Sinkage %</span>
                <span className="text-base font-semibold text-gray-800">{taskData.sinkage ?? '-'}</span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">MTR after Sinkage</span>
                <span className="text-base font-semibold text-gray-800">
                  {(taskData.mtrAfterSinkage ?? (taskData.MTR && taskData.sinkage ? computeSubTaskMtrAfterSinkage(taskData.MTR, taskData.sinkage) : '-'))}
                  {renderSinkagePercent(taskData.sinkage)}
                </span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">MTR after Length Sinkage</span>
                <span className="text-base font-semibold text-gray-800">
                  {typeof taskData.MTR !== 'undefined' && typeof taskData.sinkage !== 'undefined' && typeof taskData.Length !== 'undefined'
                    ? computeSubTaskMtrAfterLengthSinkage(taskData.MTR, taskData.sinkage, taskData.Length)
                    : '-'}
                  {typeof taskData.Length !== 'undefined' && taskData.Length !== null ? renderTotalSinkagePercent(taskData.sinkage, taskData.Length) : null}
                </span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">Total Rolls</span>
                <span className="text-base font-semibold text-gray-800">{taskData.totalRolls ?? '-'}</span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">Receiver Name</span>
                <span className="text-base font-semibold text-gray-800">{taskData.receiverName ?? '-'}</span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">Remark</span>
                <span className="text-base font-semibold text-gray-800">{taskData.remark ?? '-'}</span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">Challan No</span>
                <span className="text-base font-semibold text-gray-800">{taskData.challanNo ?? '-'}</span>
              </div>
            </div>

            {/* View All Submissions */}
            <div className="mb-6">
              <button
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-7 py-2 transition"
                onClick={() => setShowAllSubmissions(true)}
                disabled={subTasks.length === 0}
                type="button"
              >
                View All Submissions
              </button>
            </div>

            {/* SubTask List */}
            <div className="rounded-3xl w-full border border-gray-200 bg-white shadow-sm p-5">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Select a SubTask to submit</h4>
              {subTasks.length === 0 ? (
                <EmptyState icon="🧵" text="No sub-tasks found for this task" />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submissions</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Remark</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subTasks.map((st, idx) => {
                        const submissions = getSubmissionsForSubTask(st)
                        const alreadySubmitted = submissions.length > 0
                        const missingStats = getSubTaskMissingStats(st, taskData)
                        const isMissingRow = missingStats.hasMissing
                        // --- For disabling Add ---
                        const isAddDisabled = isAddSubmissionDisabledForSubTask(st, taskData);
                        const disabledReason = getAddSubmissionDisabledReason(st, taskData);
                        return (
                          <tr
                            key={st.subTaskId || st._id || idx}
                            className={`border-t border-gray-100 hover:bg-orange-50/40 transition-colors ${isMissingRow ? 'bg-red-100 !hover:bg-red-100' : ''}`}
                          >
                            <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                              <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{st.subTaskId ?? st._id ?? '-'}</span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{st.program ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-gray-700">{st.jigarNo ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap">{st.mtr ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {taskData?.Length ?? '-'}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
                              {renderSinkagePercent(taskData?.sinkage)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {
                                computeSubTaskMtrAfterLengthSinkage(
                                  st.mtr,
                                  taskData?.sinkage,
                                  taskData?.Length 
                                )
                              }
                              {renderTotalSinkagePercent(
                                taskData?.sinkage,
                                taskData?.Length
                              )}
                            </td>
                            <td className={`px-3 py-3 whitespace-nowrap text-gray-700`}>
                              {submissions.length === 0
                                ? <span className="italic text-gray-400 text-xs font-semibold">N/A</span>
                                : (
                                  <div className="flex flex-col gap-1">
                                    {submissions.map((sub, subIdx) => (
                                      <div key={sub._id || subIdx} className="flex items-center gap-2">
                                        <span className={
                                          "rounded-lg text-xs px-2 py-0.5 font-bold " +
                                          (sub.locationStatus === "missing"
                                            ? "bg-red-300 text-red-900 border border-red-400"
                                            : "bg-green-100 text-green-700 border border-green-200"
                                          )
                                        }>
                                          {sub.locationStatus === "missing" ? "Missing" : (sub.locationStatus || "Warehouse")}
                                        </span>
                                        <button
                                          type="button"
                                          className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
                                          onClick={() => {
                                            setSubTaskForSubmissionDetails({ ...st, submission: sub, submissionIndex: subIdx })
                                            setShowSubmissionDetailModal(true)
                                          }}
                                        >
                                          View #{subIdx + 1}
                                        </button>
                                        <button
                                          type="button"
                                          className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
                                          title="Delete submission"
                                          onClick={() => handleSubmissionDelete(st, subIdx)}
                                          disabled={deleting}
                                        >
                                          <RiDeleteBin5Line size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          className="rounded-full border border-orange-500 text-orange-700 bg-orange-100 hover:bg-orange-200 text-xs px-3 py-1.5 font-semibold transition"
                                          onClick={() => openEditModal(st, subIdx, sub)}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    ))}
                                    {missingStats.hasMissing &&
                                      <div className="mt-2 text-xs text-red-900 font-bold bg-red-200 rounded px-2 py-1">
                                        Missing MTR: {missingStats.missingMTR ?? "-"}
                                      </div>
                                    }
                                  </div>
                                )
                              }
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">{st.remark ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-1.5 transition disabled:bg-gray-300"
                                onClick={() => handleSubTaskSelect(st)}
                                disabled={isAddDisabled}
                                title={isAddDisabled ? disabledReason : ''}
                              >
                                {alreadySubmitted ? 'Add' : 'Submit'}
                              </button>
                              {isAddDisabled && disabledReason && (
                                <div className="text-xs text-red-500 font-semibold mt-1">{disabledReason}</div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <NextStepBanner
          text="All submissions logged for this task? Start a fresh task group whenever you're ready."
          ctaLabel="Create New Task"
          href="/task"
        />
      </div>
      <Modal
        open={showSubmissionModal}
        onClose={closeSubmissionModal}
        width={520}
        title={typeof selectedSubmissionIndex === 'number' ? 'Edit Submission' : 'Add Submission'}
        showClose
      >
        {selectedSubTask && (
          <form
            className="flex flex-col gap-6 py-1 px-1"
            onSubmit={handleSubmission}
            autoComplete="off"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-2 gap-4">
              {/* ... info header stays ... */}
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-500">Task ID:</span>{' '}
                  <span className="font-mono text-gray-800 flex items-center gap-1">
                    {taskData.taskId || taskId}
                    <button
                      type="button"
                      aria-label="Copy Task ID"
                      className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                      onClick={() => copyToClipboard(taskData.taskId || taskId)}
                    >Copy</button>
                  </span>
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
                <div>
                  <span className="font-bold text-gray-500">Status:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.status ?? '-'}</span>
                </div>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-500">MTR:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.mtr ?? '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Length:</span>{' '}
                  <span className="text-gray-800">
                    {typeof taskData?.Length !== 'undefined' && taskData?.Length !== null ? taskData.Length : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">MTR After Sinkage:</span>{' '}
                  <span className="text-gray-800">
                    {computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, taskData?.sinkage)}
                    {renderSinkagePercent(taskData?.sinkage)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">MTR After Length Sinkage:</span>{' '}
                  <span className="text-gray-800">
                    {computeSubTaskMtrAfterLengthSinkage(selectedSubTask.mtr, taskData?.sinkage, (typeof taskData?.Length !== 'undefined' && taskData?.Length !== null ? taskData.Length : undefined))}
                    {typeof taskData?.Length !== 'undefined' && taskData?.Length !== null ? renderTotalSinkagePercent(taskData?.sinkage, taskData.Length) : null}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Remark:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.remark ?? '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Show MTR Left by MTR After Length Sinkage (no change, still just above form fields) */}
            <div className="px-4 pt-3 pb-0">
              <span className="text-xs font-semibold text-orange-900 bg-orange-100 rounded-full px-3 py-2 block">
                {(() => {
                  let subtaskMtrAfterLengthSinkage = undefined;
                  if (typeof selectedSubTask?.mtr !== 'undefined' && typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') {
                    subtaskMtrAfterLengthSinkage = Number(computeSubTaskMtrAfterLengthSinkage(selectedSubTask.mtr, taskData.sinkage, taskData.Length));
                  }
                  const submissionMtrSum = getSubTaskSubmissionsArray(selectedSubTask).reduce((sum, s) => {
                    const mtrVal = Number(s?.MTR)
                    return isNaN(mtrVal) ? sum : sum + mtrVal
                  }, 0)
                  let mtrLeft = (subtaskMtrAfterLengthSinkage !== undefined && !isNaN(subtaskMtrAfterLengthSinkage))
                    ? Math.max(subtaskMtrAfterLengthSinkage - submissionMtrSum, 0)
                    : null;
                  return (
                    <>
                      <span className="font-semibold">
                        MTR Left (by Length Sinkage):
                      </span>
                      <span className="ml-1 font-mono text-orange-900">
                        {mtrLeft !== null ? mtrLeft.toFixed(2) : "-"}
                      </span>
                      <span className="ml-2 text-xs text-orange-400">
                        (Allowed: {subtaskMtrAfterLengthSinkage !== undefined && !isNaN(subtaskMtrAfterLengthSinkage) ? subtaskMtrAfterLengthSinkage.toFixed(2) : "-"}, Submitted: {submissionMtrSum.toFixed(2)})
                      </span>
                    </>
                  );
                })()}
              </span>
            </div>

            {getSubmissionsForSubTask(selectedSubTask).length > 0 && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-5 py-4">
                <div className="font-bold text-orange-700 mb-2 text-xs uppercase tracking-wide">
                  Current Submissions
                </div>
                <div className="flex flex-col gap-2 text-xs text-gray-700">
                  {getSubmissionsForSubTask(selectedSubTask).map((submission, idx) => (
                    <div
                      key={submission._id || idx}
                      className={`py-1 border-b border-orange-100 last:border-b-0 ${idx === selectedSubmissionIndex ? 'bg-orange-100 rounded px-2' : ''}`}
                    >
                      <span className="font-semibold">#{idx + 1}</span>
                      {idx === selectedSubmissionIndex && (
                        <span className="ml-1 text-orange-600 font-bold">(editing)</span>
                      )}
                      {' '}Party: {submission.fabricPartyName ?? '-'},
                      Recv: {submission.recieverPartyName ?? '-'},
                      Submitter: {submission.submitterName ?? '-'},
                      Length: {submission.length ?? '-'},
                      MTR: {submission.MTR ?? '-'},
                      {/* Payment: {submission.Payment ?? '-'}, */} {/* REMOVED */}
                      Challan: {submission.challanNo ?? '-'},
                      {' '}{renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ""}`)},
                      <span className={
                        "ml-1 px-2 py-0.5 rounded-full inline-block font-bold " +
                        (submission.locationStatus === 'missing'
                          ? "bg-red-300 text-red-900"
                          : "bg-green-100 text-green-700"
                        )
                      }>
                        {submission.locationStatus === 'missing' ? "Missing" : (submission.locationStatus || "Warehouse")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Fabric Party Name
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <select
                    name="fabricPartyName"
                    value={submissionForm.fabricPartyName}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Party Name'}</option>
                    {dropdownOptions.fabricPartyNames.map((name, i) => (
                      <option key={name || i} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Receiver Party Name
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <select
                    name="receiverPartyName"
                    value={submissionForm.receiverPartyName}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Receiver Name'}</option>
                    {dropdownOptions.receiverPartyNames.map((name, i) => (
                      <option key={name || i} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Submitter Name
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <input
                    name="submitterName"
                    type="text"
                    placeholder="Submitter Name"
                    value={submissionForm.submitterName}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Length
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <select
                    name="length"
                    value={submissionForm.length}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="" disabled>{dropdownLoading ? 'Loading...' : 'Select Length'}</option>
                    {dropdownOptions.length.map((len, i) => (
                      <option key={len || i} value={len}>{len}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    MTR
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <input
                    name="mtr"
                    type="number"
                    min={0}
                    placeholder="MTR"
                    value={submissionForm.mtr}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                  />
                </div>
              </div>

              {/* Location Status buttons with MTR Left label beside them */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Location Status
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={
                        "rounded-full px-6 py-2 font-bold border transition text-xs " +
                        (submissionForm.locationStatus === 'warehouse'
                          ? "bg-green-500 text-white border-green-600 shadow"
                          : "bg-white text-green-600 border-green-300 hover:bg-green-50")
                      }
                      aria-pressed={submissionForm.locationStatus === 'warehouse'}
                      onClick={() =>
                        setSubmissionForm(prev =>
                          ({ ...prev, locationStatus: prev.locationStatus === 'warehouse' ? '' : 'warehouse' })
                        )
                      }
                    >
                      Warehouse
                    </button>
                    <button
                      type="button"
                      className={
                        "rounded-full px-6 py-2 font-bold border transition text-xs " +
                        (submissionForm.locationStatus === 'missing'
                          ? "bg-red-500 text-white border-red-600 shadow"
                          : "bg-white text-red-600 border-red-300 hover:bg-red-50")
                      }
                      aria-pressed={submissionForm.locationStatus === 'missing'}
                      onClick={() =>
                        setSubmissionForm(prev =>
                          ({ ...prev, locationStatus: prev.locationStatus === 'missing' ? '' : 'missing' })
                        )
                      }
                    >
                      Missing
                    </button>
                    {/* MTR Left indicator right of the buttons */}
                    <span className="ml-3 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-xs font-semibold text-yellow-800 whitespace-nowrap flex items-center">
                      {(() => {
                        let subtaskMtrAfterLengthSinkage = undefined;
                        if (
                          typeof selectedSubTask?.mtr !== 'undefined' &&
                          typeof taskData?.sinkage !== 'undefined' &&
                          typeof taskData?.Length !== 'undefined'
                        ) {
                          subtaskMtrAfterLengthSinkage = Number(
                            computeSubTaskMtrAfterLengthSinkage(
                              selectedSubTask.mtr,
                              taskData.sinkage,
                              taskData.Length
                            )
                          );
                        }
                        const submissionMtrSum = getSubTaskSubmissionsArray(selectedSubTask).reduce((sum, s) => {
                          const mtrVal = Number(s?.MTR)
                          return isNaN(mtrVal) ? sum : sum + mtrVal
                        }, 0)
                        let mtrLeft =
                          subtaskMtrAfterLengthSinkage !== undefined && !isNaN(subtaskMtrAfterLengthSinkage)
                            ? Math.max(subtaskMtrAfterLengthSinkage - submissionMtrSum, 0)
                            : null
                        return (
                          <>
                            Fabric Left:{' '}
                            <span className="ml-1 font-mono text-yellow-900">
                              {mtrLeft !== null ? mtrLeft.toFixed(2) : "-"} MTR
                            </span>
                          </>
                        )
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error message if multiple missing is selected or disabled */}
              {(() => {
                const { isAddDisabled, hasMissing, mtrLeft } = canAddSubmissionToSubTask(selectedSubTask, taskData)
                if (hasMissing) {
                  return (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-xs font-semibold">
                      Cannot add: one submission is marked Missing and no further submissions are allowed for this SubTask.
                    </div>
                  )
                }
                if (mtrLeft === 0) {
                  return (
                    <div className="rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-yellow-800 text-xs font-semibold">
                      Cannot add: sum of all Submission MTR equals MTR after Length Sinkage for this SubTask.
                    </div>
                  )
                }
                return null;
              })()}

              {/* Summary panel below - uses TASK LENGTH (for party sinkage model) and selected submission length */}
              <div className="mt-4 w-full bg-gradient-to-br from-orange-100 to-yellow-50 border border-orange-200 rounded-2xl px-5 py-4 shadow-lg text-sm">
                <div className="divide-y divide-orange-100">
                  <div className="flex justify-between py-2">
                    <div className="space-x-1">
                      <span className="font-medium text-orange-800">MTR</span>
                      <span className="text-gray-400 font-mono">({mtrInputValue || '-'})</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="space-x-1">
                      <span className="font-medium text-orange-800">
                        After Sinkage
                      </span>
                      <span className="text-gray-400 font-mono">({mtrAfterSinkage || '-'})</span>
                      {renderSinkagePercent(sinkageInputValue)}
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="space-x-1">
                      <span className="font-medium text-orange-800">
                        After Party Sinkage
                      </span>
                      <span className="text-gray-400 font-mono">({mtrAfterPartySinkage || '-'})</span>
                      {renderPartySinkagePercent(sinkageInputValue, taskLengthValue, submissionLengthValue)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Challan No
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </label>
                  <input
                    name="challanNo"
                    type="text"
                    placeholder="Challan No"
                    value={submissionForm.challanNo}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Challan Photo
                    <span className={`text-red-500 font-bold ml-1${existingChallanPhotoPath ? ' opacity-60' : ''}`}>*</span>
                    {existingChallanPhotoPath && (
                      <span className="ml-1 text-gray-400 font-normal normal-case">(optional — existing kept if blank)</span>
                    )}
                  </label>
                  {existingChallanPhotoPath && (
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Current:</span>
                      {renderChallanPhotoLink(existingChallanPhotoPath, "Existing Challan Photo")}
                    </div>
                  )}

                  <input
                    name="challanPhotoPath"
                    type="file"
                    accept="image/*"
                    onChange={handleSubmissionFormChange}
                    className={fileInput}
                    required={!existingChallanPhotoPath}
                  />
                  {submissionForm.challanPhotoPath instanceof File && (
                    <span className="text-xs text-orange-600 font-medium mt-1">
                      New: {submissionForm.challanPhotoPath.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                onClick={closeSubmissionModal}
                disabled={submitting}
              >
                <RiCloseLine size={16} />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
                type="submit"
                disabled={
                  submitting || (
                    typeof selectedSubmissionIndex !== 'number' && 
                    canAddSubmissionToSubTask(selectedSubTask, taskData).isAddDisabled
                  )
                }
              >
                <RiCheckLine size={17} />
                {typeof selectedSubmissionIndex === 'number' ? 'Update Submission' : 'Add Submission'}
              </button>
         
            </div>
          </form>
        )}
      </Modal>
      {/* ...rest of Modals, Unchanged ... */}
      <Modal
        open={showSubmissionDetailModal}
        onClose={handleCloseSubmissionDetails}
        width={430}
        title="Submission Details"
        showClose
      >
        {/* ...no change ... */}
        {subTaskForSubmissionDetails && subTaskForSubmissionDetails.submission ? (
          // ...code remains unchanged...
          <div className="py-1">
            <div className="font-bold text-gray-900 mb-4 text-base text-center">
              SubTask{' '}
              <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">
                {subTaskForSubmissionDetails.subTaskId ?? subTaskForSubmissionDetails._id ?? '-'}
              </span>
              {typeof subTaskForSubmissionDetails.submissionIndex === 'number' && (
                <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">
                  Submission #{subTaskForSubmissionDetails.submissionIndex + 1}
                </span>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
              <div>
                <span className="font-bold text-gray-500">Location Status: </span>
                <span className={
                  subTaskForSubmissionDetails.submission.locationStatus === "missing"
                  ? "text-red-700 font-bold"
                  : "text-green-700 font-bold"
                }>
                  {subTaskForSubmissionDetails.submission.locationStatus === "missing"
                    ? "Missing"
                    : (subTaskForSubmissionDetails.submission.locationStatus || "Warehouse")
                  }
                </span>
              </div>
              <div><span className="font-bold text-gray-500">Fabric Party: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.fabricPartyName ?? '-'}</span></div>
              <div><span className="font-bold text-gray-500">Receiver Party: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.recieverPartyName ?? '-'}</span></div>
              <div><span className="font-bold text-gray-500">Submitter Name: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.submitterName ?? '-'}</span></div>
              <div><span className="font-bold text-gray-500">Length: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.length ?? '-'}</span></div>
              <div>
                <span className="font-bold text-gray-500">MTR: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.MTR ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">MTR After Sinkage: </span>
                <span className="text-gray-800">
                  {computeSubTaskMtrAfterSinkage(subTaskForSubmissionDetails.submission.MTR, taskData?.sinkage)}
                  {renderSinkagePercent(taskData?.sinkage)}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-500">MTR After Party Sinkage: </span>
                <span className="text-gray-800">
                  {computeSubTaskMtrAfterPartySinkage(
                    subTaskForSubmissionDetails.submission.MTR,
                    taskData?.sinkage,
                    taskData?.Length,
                    subTaskForSubmissionDetails.submission.length ??
                      subTaskForSubmissionDetails.length ??
                      taskData?.Length
                  )}
                  {renderPartySinkagePercent(
                    taskData?.sinkage,
                    taskData?.Length,
                    subTaskForSubmissionDetails.submission.length ??
                      subTaskForSubmissionDetails.length ??
                      taskData?.Length
                  )}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.challanNo ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500">Challan Photo: </span>
                {renderChallanPhotoLink(subTaskForSubmissionDetails.submission.challanPhotoPath, "Preview Challan")}
              </div>
              <div>
                <span className="font-bold text-gray-500">Task ID: </span>
                <span className="font-mono text-gray-800 flex items-center gap-1">
                  {taskData?.taskId || taskId}
                  <button
                    type="button"
                    aria-label="Copy Task ID"
                    className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                    onClick={() => copyToClipboard(taskData?.taskId || taskId)}
                  >Copy</button>
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2.5 text-red-600 font-semibold text-sm transition"
                onClick={() => handleSubmissionDelete(
                  subTaskForSubmissionDetails,
                  typeof subTaskForSubmissionDetails.submissionIndex === 'number'
                    ? subTaskForSubmissionDetails.submissionIndex
                    : null
                )}
                disabled={deleting}
              >
                <RiDeleteBin5Line size={16} />
                Delete
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                onClick={handleCloseSubmissionDetails}
              >
                <RiCloseLine size={16} />
                Close
              </button>
            </div>
          </div>
        ) : (
          <EmptyState icon="📭" text="No submission data found." />
        )}
      </Modal>
      {/* ...rest of all submissions modal, unchanged ... */}
      <Modal
        open={showAllSubmissions}
        onClose={() => setShowAllSubmissions(false)}
        title="All Submissions for this Task"
        showClose
        maxWidth="max-w-5xl"
      >
        <div className="p-2">
          {getAllSubmissionsForTask().length === 0 ? (
            <EmptyState icon="📭" text="No submissions found for any sub-task." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-orange-100">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">#</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR<br /><span className="font-normal text-[10px] text-gray-400">(Total)</span></th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage<br /><span className="font-normal text-[10px] text-gray-400">(Total)</span></th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Party Sinkage<br /><span className="font-normal text-[10px] text-gray-400">(Total)</span></th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Party</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Receiver Party</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submitter</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan No</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan Photo</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Location Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {subTasks.map((subTask, subTaskIndex) => {
                    const submissions = getSubTaskSubmissionsArray(subTask)
                    const missingStats = getSubTaskMissingStats(subTask, taskData)
                    const rows = submissions.map((submission, submissionIndex) => {
                      const mtrValue = Number(submission.MTR);
                      const mtrAfterSink = computeSubTaskMtrAfterSinkage(submission.MTR, taskData?.sinkage);
                      const mtrAfterPartySink = computeSubTaskMtrAfterPartySinkage(
                        submission.MTR,
                        taskData?.sinkage,
                        taskData?.Length,
                        submission.length ?? taskData?.Length
                      );
                      const taskLen = taskData?.Length;
                      const submissionLen = submission.length ?? taskData?.Length;
                      return (
                        <tr
                          key={`${subTask.subTaskId || subTask._id || subTaskIndex}-${submissionIndex}`}
                          className={`border-t border-orange-100 ${missingStats.hasMissing ? 'bg-red-100 !hover:bg-red-100' : 'hover:bg-orange-50/30'} transition-colors`}
                        >
                          <td className="px-3 py-2 font-mono text-[10px] text-gray-400 whitespace-nowrap">#{submissionIndex + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                            <span className="bg-orange-50 border border-orange-100 rounded-full px-3 py-1">{subTask.subTaskId ?? subTask._id ?? '-'}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{subTask.program ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-700">{subTask.jigarNo ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.length ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {submission.MTR ?? '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {mtrAfterSink}
                            {renderSinkagePercent(taskData?.sinkage)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {mtrAfterPartySink}
                            {renderPartySinkagePercent(taskData?.sinkage, taskLen, submissionLen)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.fabricPartyName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.recieverPartyName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.submitterName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.challanNo ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ""}`)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={
                              "rounded-lg text-xs px-2 py-0.5 font-bold " +
                              (submission.locationStatus === "missing"
                                ? "bg-red-300 text-red-900 border border-red-400"
                                : "bg-green-100 text-green-700 border border-green-200"
                              )
                            }>
                              {submission.locationStatus === "missing" ? "Missing" : (submission.locationStatus || "Warehouse")}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap flex items-center gap-1">
                            <button
                              type="button"
                              className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
                              onClick={() => {
                                setShowAllSubmissions(false)
                                setSubTaskForSubmissionDetails({ ...subTask, submission, submissionIndex })
                                setShowSubmissionDetailModal(true)
                              }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="ml-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
                              title="Delete submission"
                              onClick={() => handleSubmissionDelete(subTask, submissionIndex)}
                              disabled={deleting}
                            >
                              <RiDeleteBin5Line size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                    if (missingStats.hasMissing) {
                      return (
                        <React.Fragment key={"missing-row-"+(subTask.subTaskId || subTask._id || subTaskIndex)}>
                          {rows}
                          <tr className="bg-red-200">
                            <td colSpan={16} className="py-2 text-red-900 text-xs font-bold text-left pl-4">
                              Missing MTR: {missingStats.missingMTR ?? "-"}
                            </td>
                          </tr>
                        </React.Fragment>
                      )
                    }
                    return rows
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
              onClick={() => setShowAllSubmissions(false)}
            >
              <RiCloseLine size={16} />
              Close
            </button>
          </div>
        </div>
      </Modal>
      {/* Preview Challan Modal: global, use anywhere */}
      {challanPreview.ModalPreview && <challanPreview.ModalPreview />}
    </div>
  )
}

export default SubmissionManagement