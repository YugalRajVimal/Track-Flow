
// import React, { useState, useEffect } from 'react'
// import toast from 'react-hot-toast'
// import axios from 'axios'

// import { RiCheckLine, RiCloseLine, RiDeleteBin5Line } from 'react-icons/ri'
// import WorkflowHeader from '../../components/common/WorkflowHeader'

// import StatusBadgeTask from '../../components/common/StatusBadgeTask'
// import EmptyState from '../../components/common/EmptyState'
// import NextStepBanner from '../../components/common/NextStepBanner'
// import Modal from '../../components/common/Modal'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const initialSubmissionForm = {
//   fabricPartyName: '',
//   receiverPartyName: '',
//   submitterName: '',
//   length: '',
//   mtr: '',
//   payment: '',
//   remark: '',
//   challanNo: '',
//   challanPhotoPath: ''
// }

// function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage) {
//   if (
//     subTaskMtr === undefined ||
//     subTaskMtr === null ||
//     isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined ||
//     sinkage === null ||
//     isNaN(Number(sinkage))
//   ) {
//     return '-'
//   }
//   return (Number(subTaskMtr) - (Number(subTaskMtr) * Number(sinkage) / 100)).toFixed(2)
// }

// function computeSubTaskMtrAfterLengthSinkage(subTaskMtr, sinkage, length) {
//   if (
//     subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
//     length === undefined || length === null || isNaN(Number(length))
//   ) {
//     return '-'
//   }
//   const mtr = Number(subTaskMtr)
//   const sinkagePercent = Number(sinkage)
//   const lengthPercent = Number(length)
//   const lengthLossPercent = 100 - lengthPercent
//   const totalPercent = sinkagePercent + lengthLossPercent
//   const afterSinkage = mtr - (mtr * totalPercent / 100)
//   return afterSinkage.toFixed(2)
// }

// const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
// const pillInput =
//   'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
// const fileInput =
//   'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

// // ----- Helpers for multiple submissions per SubTask -----

// function sumSubmissionMTRs(submissions) {
//   if (!Array.isArray(submissions)) return 0
//   return submissions.reduce((sum, s) => {
//     let mtr = Number(s?.MTR)
//     if (isNaN(mtr)) return sum
//     return sum + mtr
//   }, 0)
// }

// function sumSubmissionMTRAfterSinkage(submissions, sinkage, length) {
//   if (!Array.isArray(submissions)) return 0
//   return submissions.reduce((sum, s) => {
//     const mtr = Number(s?.MTR)
//     if (isNaN(mtr)) return sum

//     let afterSinkage
//     if (length !== undefined && length !== null && !isNaN(Number(length))) {
//       afterSinkage = Number(computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, length))
//     } else {
//       afterSinkage = Number(computeSubTaskMtrAfterSinkage(mtr, sinkage))
//     }
//     if (isNaN(afterSinkage)) return sum
//     return sum + afterSinkage
//   }, 0)
// }

// // For backward compatibility with older data, conversions
// function getSubTaskSubmissionsArray(subTask) {
//   // New structure: subTask.submissions is array, fallback: subTask.submission is array or object or undefined.
//   if (Array.isArray(subTask.submissions)) return subTask.submissions
//   if (Array.isArray(subTask.submission)) return subTask.submission
//   if (subTask.submission) return [subTask.submission]
//   return []
// }

// // ----- Main component -----
// const SubmissionManagement = () => {
//   const [tasksWithPendingSubtasks, setTasksWithPendingSubtasks] = useState([])
//   const [loadingTasksList, setLoadingTasksList] = useState(true)
//   const [selectedPendingTaskId, setSelectedPendingTaskId] = useState(null)

//   const [inputTaskId, setInputTaskId] = useState('')
//   const [taskId, setTaskId] = useState('')
//   const [taskData, setTaskData] = useState(null)
//   const [subTasks, setSubTasks] = useState([])
//   const [selectedSubTask, setSelectedSubTask] = useState(null)
//   const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)
//   const [submitting, setSubmitting] = useState(false)
//   const [fetching, setFetching] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [showSubmissionModal, setShowSubmissionModal] = useState(false)
//   const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)

//   const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
//   const [subTaskForSubmissionDetails, setSubTaskForSubmissionDetails] = useState(null)

//   const [showAllSubmissions, setShowAllSubmissions] = useState(false)

//   const [dropdownOptions, setDropdownOptions] = useState({
//     fabricPartyNames: [],
//     receiverPartyNames: [],
//     length: []
//   })
//   const [dropdownLoading, setDropdownLoading] = useState(false)
//   const [dropdownError, setDropdownError] = useState('')

//   const [deleting, setDeleting] = useState(false)

//   useEffect(() => {
//     let isSubscribed = true;
//     setDropdownLoading(true);

//     const fetchDropdowns = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`);
//         if (!isSubscribed) return;
//         const fabricPartyNames = Array.isArray(res.data?.data?.FabricPartyName) ? res.data.data?.FabricPartyName : [];
//         const receiverPartyNames = Array.isArray(res.data?.data?.recieverPartyName) ? res.data.data?.recieverPartyName : [];
//         const length = Array.isArray(res.data?.data?.length) ? res.data.data?.length : [];

//         setDropdownOptions({
//           fabricPartyNames,
//           receiverPartyNames,
//           length
//         });
//         setDropdownError('');
//       } catch {
//         setDropdownError('Failed to load dropdown data');
//       } finally {
//         if (isSubscribed) setDropdownLoading(false);
//       }
//     };

//     fetchDropdowns();
//     return () => {
//       isSubscribed = false;
//     };
//   }, []);

//   useEffect(() => {
//     const fetchTasksList = async () => {
//       setLoadingTasksList(true)
//       try {
//         const res = await axios.get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
//         if (res.data?.success && Array.isArray(res.data.data)) {
//           setTasksWithPendingSubtasks(res.data.data)
//         } else {
//           setTasksWithPendingSubtasks([])
//         }
//       } catch {
//         setTasksWithPendingSubtasks([])
//       }
//       setLoadingTasksList(false)
//     }
//     fetchTasksList()
//   }, [])

//   async function handleTaskFetch(e, manualId = null) {
//     if (e) e.preventDefault()
//     setError('')
//     setSuccess('')
//     setTaskId('')
//     setTaskData(null)
//     setSubTasks([])
//     setSelectedSubTask(null)
//     setSelectedSubmissionIndex(null)
//     setSubmissionForm(initialSubmissionForm)
//     const taskIdValue = manualId || inputTaskId

//     if (!taskIdValue || !taskIdValue.trim()) {
//       setError('Please enter a valid Task ID')
//       return
//     }
//     setFetching(true)
//     try {
//       const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
//         params: { taskId: taskIdValue.trim() }
//       })
//       if (res.data?.data) {
//         setTaskId(res.data.data.taskId || taskIdValue.trim())
//         setTaskData(res.data.data)
//         // Fallback for array of subTasks
//         setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
//         setError('')
//         setSuccess('')
//       } else {
//         setError('Task not found')
//       }
//     } catch {
//       setError('Task load failed')
//     }
//     setFetching(false)
//   }

//   function handleSelectPendingTask(taskRow) {
//     setInputTaskId(taskRow.taskId)
//     handleTaskFetch(null, taskRow.taskId)
//     setSelectedPendingTaskId(taskRow.taskId)
//     setError('')
//     setSuccess('')
//   }

//   // ---- Find all submissions for a subtask ----
//   function getSubmissionsForSubTask(subTask) {
//     return getSubTaskSubmissionsArray(subTask)
//   }

//   // --- For backward-compatibility when opening submission modal: always pick first (old: single) or last ---
//   function getEditableSubmission(subTask) {
//     const subs = getSubmissionsForSubTask(subTask)
//     if (subs.length === 0) return undefined
//     return subs.at(-1)
//   }

//   // Helper: For editing, get the editable submission's index (last index)
//   function getEditableSubmissionIndex(subTask) {
//     const subs = getSubmissionsForSubTask(subTask)
//     if (subs.length === 0) return null
//     return subs.length - 1
//   }

//   function handleSubTaskSelect(subTask) {
//     setSelectedSubTask(subTask)
//     setSuccess('')
//     setError('')
//     // Prefill with last submission (if any), else current subtask defaults
//     const lastSubmission = getEditableSubmission(subTask)
//     const lastSubmissionIndex = getEditableSubmissionIndex(subTask)
//     setSelectedSubmissionIndex(lastSubmissionIndex)

//     setSubmissionForm({
//       ...initialSubmissionForm,
//       fabricPartyName: lastSubmission?.fabricPartyName || '',
//       receiverPartyName: lastSubmission?.recieverPartyName || '',
//       submitterName: lastSubmission?.submitterName || '',
//       length: lastSubmission?.length || '',
//       mtr: lastSubmission?.MTR ?? subTask?.mtr ?? '',
//       payment: lastSubmission?.Payment || '',
//       remark: subTask?.remark || '',
//       challanNo: lastSubmission?.challanNo || '',
//       challanPhotoPath: ''
//     })

//     setShowSubmissionModal(true)
//   }

//   function handleSubmissionFormChange(e) {
//     const { name, value, type, files } = e.target
//     if (type === "file" && name === "challanPhotoPath") {
//       setSubmissionForm(prev => ({
//         ...prev,
//         challanPhotoPath: files && files[0] ? files[0] : ''
//       }))
//     } else {
//       setSubmissionForm(prev => ({
//         ...prev,
//         [name]: value
//       }))
//     }
//   }

//   // Enforce submission MTR/AfterSinkage sum validation, uniqueness and required fields
//   function canAddSubmission(subTask, formSubmission, isEdit = false) {
//     const mtr = Number(formSubmission.mtr)
//     const lengthVal = formSubmission.length
//     const sinkage = taskData?.sinkage

//     // All fields mandatory (fabricPartyName, receiverPartyName, submitterName, length, mtr, payment, challanNo, challanPhotoPath)
//     if (
//       !formSubmission.fabricPartyName ||
//       !formSubmission.receiverPartyName ||
//       !formSubmission.submitterName ||
//       !formSubmission.length ||
//       !formSubmission.mtr ||
//       !formSubmission.payment ||
//       !formSubmission.challanNo ||
//       !formSubmission.challanPhotoPath
//     ) {
//       return { valid: false, msg: "All fields are mandatory, including submitter name and challan photo." }
//     }

//     if (isNaN(mtr) || mtr <= 0) return { valid: false, msg: "MTR is required and must be > 0" }

//     // Check challanNo uniqueness (across all submissions in all subtasks in this task)
//     const allSubmissions = []
//     for (const s of subTasks) {
//       for (const sub of getSubTaskSubmissionsArray(s)) {
//         allSubmissions.push({
//           ...sub,
//           subTask: s
//         })
//       }
//     }
//     // If edit, allow same challanNo as the one being edited. Otherwise, disallow any duplicate.
//     const editingSubTaskId = selectedSubTask?.subTaskId || selectedSubTask?._id
//     let editingSubmissionChallanNo = undefined
//     if (isEdit && typeof selectedSubmissionIndex === "number") {
//       const editingSubmissions = getSubTaskSubmissionsArray(selectedSubTask)
//       if (editingSubmissions[selectedSubmissionIndex]) {
//         editingSubmissionChallanNo = editingSubmissions[selectedSubmissionIndex]?.challanNo
//       }
//     }
//     const newChallanNoTrimmed = String(formSubmission.challanNo).trim().toLowerCase()
//     const duplicate = allSubmissions.find((sub) => {
//       if (
//         String(sub.challanNo).trim().toLowerCase() === newChallanNoTrimmed &&
//         (
//           !isEdit ||
//           typeof selectedSubmissionIndex !== "number" ||
//           sub.challanNo !== editingSubmissionChallanNo ||
//           (subTask?.subTaskId || subTask?._id) !== editingSubTaskId
//         )
//       ) {
//         return true
//       }
//       return false
//     })
//     if (duplicate) {
//       return { valid: false, msg: `Challan No "${formSubmission.challanNo}" already exists in other submissions.` }
//     }

//     // Existing submissions for this sub-task
//     const subTaskSubmissions = getSubmissionsForSubTask(subTask) || []
//     let filteredSubmissions
//     if (isEdit && subTaskSubmissions.length > 0) {
//       filteredSubmissions = subTaskSubmissions.slice(0, -1)
//     } else {
//       filteredSubmissions = subTaskSubmissions
//     }

//     // 1. Total intended MTR sum of submissions including this form
//     const mtrSumExisting = sumSubmissionMTRs(filteredSubmissions)
//     const totalMtrAfterAdd = mtrSumExisting + mtr
//     const subtaskMTRval = Number(subTask.mtr)
//     if (!isNaN(subtaskMTRval) && totalMtrAfterAdd > subtaskMTRval + 1e-8) {
//       const mtrLeft = subtaskMTRval - mtrSumExisting
//       return {
//         valid: false,
//         msg: `Only ${mtrLeft >= 0 ? mtrLeft.toFixed(2) : 0} MTR left in inventory/warehouse for this SubTask.`
//       }
//     }

//     // 2. After sinkage/length sinkage
//     let formSubmissionAfterSinkage
//     const effectiveLength = lengthVal !== "" && lengthVal !== undefined && lengthVal !== null && !isNaN(Number(lengthVal))
//       ? lengthVal
//       : (subTask.length !== undefined && !isNaN(Number(subTask.length)) ? subTask.length : undefined)
//     if (effectiveLength && typeof sinkage !== 'undefined') {
//       formSubmissionAfterSinkage = Number(computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, effectiveLength))
//     } else {
//       formSubmissionAfterSinkage = Number(computeSubTaskMtrAfterSinkage(mtr, sinkage))
//     }

//     const sumAfterSinkageExisting = sumSubmissionMTRAfterSinkage(filteredSubmissions, sinkage, effectiveLength)
//     const totalMtrAfterSinkageAdd = sumAfterSinkageExisting + formSubmissionAfterSinkage

//     // Respect a small tolerance for float math
//     let subtaskMTRAfterSinkage
//     if (effectiveLength && typeof sinkage !== 'undefined') {
//       subtaskMTRAfterSinkage = Number(computeSubTaskMtrAfterLengthSinkage(subTask.mtr, sinkage, effectiveLength))
//     } else {
//       subtaskMTRAfterSinkage = Number(computeSubTaskMtrAfterSinkage(subTask.mtr, sinkage))
//     }

//     if (!isNaN(subtaskMTRAfterSinkage) && totalMtrAfterSinkageAdd > subtaskMTRAfterSinkage + 1e-8) {
//       return { valid: false, msg: "Sum of MTR After Sinkage of all submissions exceeds the allowed limit for this SubTask." }
//     }

//     return { valid: true, msg: "" }
//   }

//   // --- MODIFIED FUNCTION: handleSubmission ---
//   async function handleSubmission(e) {
//     e.preventDefault()
//     if (!taskData || !selectedSubTask) return
//     setError('')
//     setSuccess('')
//     setSubmitting(true)

//     // Validate all fields required
//     if (!submissionForm.fabricPartyName ||
//       !submissionForm.receiverPartyName ||
//       !submissionForm.submitterName ||
//       !submissionForm.length ||
//       !submissionForm.mtr ||
//       !submissionForm.payment ||
//       !submissionForm.challanNo ||
//       !submissionForm.challanPhotoPath) {
//       setError('All fields are mandatory, including submitter name and challan photo.')
//       setSubmitting(false)
//       return
//     }

//     // Validate MTR/sinkage total for all submissions
//     const isEdit = selectedSubmissionIndex !== null && typeof selectedSubmissionIndex === 'number'
//     const editableIndex = selectedSubmissionIndex
//     const validation = canAddSubmission(selectedSubTask, submissionForm, isEdit)
//     if (!validation.valid) {
//       setError(validation.msg)
//       setSubmitting(false)
//       return
//     }

//     try {
//       const subTaskId = selectedSubTask.subTaskId || selectedSubTask._id
//       let url
//       let method
//       if (!isEdit) {
//         // ADD Submission - USE POST (NO submissionIndex)
//         url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`;
//         method = 'post'
//       } else {
//         // EDIT Submission - use PUT as before
//         url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission?submissionIndex=${editableIndex}`;
//         method = 'put'
//       }

//       const formData = new FormData();
//       formData.append('fabricPartyName', submissionForm.fabricPartyName)
//       formData.append('recieverPartyName', submissionForm.receiverPartyName)
//       formData.append('submitterName', submissionForm.submitterName)
//       formData.append('length', submissionForm.length)
//       formData.append('MTR', submissionForm.mtr)
//       formData.append('Payment', submissionForm.payment)
//       formData.append('challanNo', submissionForm.challanNo)
//       if ('remark' in submissionForm) {
//         formData.append('remark', submissionForm.remark)
//       }
//       if (submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File) {
//         formData.append('file', submissionForm.challanPhotoPath)
//       }

//       if (method === 'post') {
//         await axios.post(url, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         })
//       } else {
//         await axios.put(url, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         })
//       }

//       setSuccess('Submission saved')
//       toast.success('Submission saved')
//       setShowSubmissionModal(false)

//       if (taskId) {
//         setFetching(true)
//         try {
//           const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
//             params: { taskId }
//           })
//           if (res.data?.data) {
//             setTaskData(res.data.data)
//             setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
//           }
//         } finally {
//           setFetching(false)
//         }
//       }
//       setSubmissionForm(initialSubmissionForm)
//       setSelectedSubmissionIndex(null)
//     } catch (ex) {
//       setError('Submission failed')
//       toast.error('Submission failed')
//     }
//     setSubmitting(false)
//   }

//   async function handleSubmissionDelete(subTask, submissionIndex = null) {
//     let msg =
//       "Delete submission for this sub-task? This cannot be undone."
//     if (Array.isArray(getSubTaskSubmissionsArray(subTask)) && getSubTaskSubmissionsArray(subTask).length > 1 && submissionIndex !== null) {
//       msg = "Delete this submission entry for this sub-task? This cannot be undone."
//     }

//     if (!window.confirm(msg)) return

//     setDeleting(true)
//     setError('')
//     setSuccess('')
//     const subTaskId = subTask.subTaskId || subTask._id
//     try {
//       let url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`
//       if (submissionIndex !== null && typeof submissionIndex === "number") {
//         url += `?submissionIndex=${submissionIndex}`
//       }
//       await axios.delete(url);
//       toast('Submission deleted', { icon: '🗑️' })
//       setSuccess('Submission deleted')

//       if (taskId) {
//         setFetching(true)
//         try {
//           const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
//             params: { taskId }
//           })
//           if (res.data?.data) {
//             setTaskData(res.data.data)
//             setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
//           }
//         } finally {
//           setFetching(false)
//         }
//       }
//       setShowSubmissionModal(false)
//       setShowSubmissionDetailModal(false)
//       setShowAllSubmissions(false)
//     } catch (ex) {
//       setError('Failed to delete submission')
//       toast.error('Failed to delete submission')
//     }
//     setDeleting(false)
//   }

//   function handleShowSubmissionDetails(subTask) {
//     setSubTaskForSubmissionDetails(subTask)
//     setShowSubmissionDetailModal(true)
//   }

//   function handleCloseSubmissionDetails() {
//     setShowSubmissionDetailModal(false)
//     setSubTaskForSubmissionDetails(null)
//   }

//   const renderChallanPhotoLink = (path) => {
//     if (!path) return <span>-</span>
//     if (path.startsWith('/uploads/')) {
//       return (
//         <a
//           href={API_BASE_URL ? `${API_BASE_URL}${path}` : path}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium"
//         >
//           View Photo
//         </a>
//       )
//     }
//     return <span className="text-xs text-gray-400">{path}</span>
//   }

//   function getSubTaskAfterLengthSinkage(st, sinkageFromTask) {
//     const mtr = st.mtr
//     const sinkage = sinkageFromTask
//     let lengthVal = st.length
//     if (
//       lengthVal === undefined ||
//       lengthVal === null ||
//       isNaN(Number(lengthVal)) ||
//       Number(lengthVal) === 0
//     ) {
//       lengthVal = (
//         (Array.isArray(st.submissions) && st.submissions.length > 0 && st.submissions[0].length !== undefined && st.submissions[0].length !== null)
//           ? st.submissions[0].length
//           : (st.submission && st.submission.length)
//             ? st.submission.length
//             : undefined
//       )
//     }
//     return computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, lengthVal)
//   }

//   // --- Helper to aggregate all submissions from all subtasks ---
//   function getAllSubmissionsForTask() {
//     if (!taskData || !Array.isArray(subTasks)) return []
//     let allRows = []
//     subTasks.forEach((subTask) => {
//       const subs = getSubTaskSubmissionsArray(subTask)
//       if (!Array.isArray(subs)) return
//       subs.forEach((submission, idx) => {
//         allRows.push({
//           subTask,
//           submission,
//           subTaskIndex: subTasks.indexOf(subTask),
//           submissionIndex: idx
//         })
//       })
//     })
//     return allRows
//   }

//   // ---- RENDER ----
//   return (
//     <div className="min-h-screen bg-white">
//       <WorkflowHeader
//         activeStep="submission"
//         topLabel="Fabric Task Workflow"
//         title="Submission"
//         subtitle="Load a task, then submit fabric and payment details for each of its sub-tasks."
//       />

//       <div className="max-w-6xl mx-auto px-2 md:px-6 sm:px-10 pb-6">
//         {/* Pending Tasks Table for Selection */}
//         <div className="mb-8">
//           <h3 className="font-bold text-gray-900 text-lg mb-2 flex gap-2 items-center">
//             Tasks with Pending SubTasks
//             {loadingTasksList && <span className="text-xs text-orange-600 ml-2 animate-pulse">Loading...</span>}
//           </h3>
//           <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white mb-2">
//             {tasksWithPendingSubtasks.length === 0 ? (
//               <div className="py-8">
//                 <EmptyState
//                   icon="🗂️"
//                   text={loadingTasksList ? "Loading..." : "No tasks with pending subtasks found"}
//                 />
//               </div>
//             ) : (
//               <table className="min-w-[650px] w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200">
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Task ID</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Type</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Party Name</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Total MTR</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Rolls</th>
//                     <th className="px-3 py-3"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tasksWithPendingSubtasks.map(t => (
//                     <tr
//                       key={t.taskId}
//                       className={`${selectedPendingTaskId === t.taskId ? "bg-orange-50/60" : ""} hover:bg-orange-50/30 text-center border-t border-gray-100 transition-colors`}
//                     >
//                       <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold">{t.taskId}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.FabricType || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.partyName || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.MTR || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.totalRolls ?? '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">
//                         <button
//                           className={`rounded-full font-semibold text-xs px-5 py-1.5 transition ${
//                             selectedPendingTaskId === t.taskId
//                               ? "bg-orange-500 text-white"
//                               : "bg-orange-100 text-orange-700 hover:bg-orange-200"
//                           }`}
//                           onClick={() => handleSelectPendingTask(t)}
//                           disabled={fetching && selectedPendingTaskId === t.taskId}
//                         >
//                           Select
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         <form
//           className="flex flex-wrap items-center gap-3 mb-7 bg-white py-2 px-2 rounded-full border border-gray-200 shadow-sm max-w-xl"
//           onSubmit={handleTaskFetch}
//         >
//           <label htmlFor="taskIdInput" className="font-semibold text-gray-500 text-sm pl-3 whitespace-nowrap">
//             Task ID
//           </label>
//           <input
//             id="taskIdInput"
//             name="taskIdInput"
//             type="text"
//             placeholder="e.g. 2"
//             value={inputTaskId}
//             onChange={e => setInputTaskId(e.target.value)}
//             className="flex-1 px-2 py-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none min-w-0"
//             autoComplete="off"
//           />
//           <button
//             type="submit"
//             className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition flex-shrink-0"
//             disabled={fetching}
//           >
//             Load Task
//           </button>
//         </form>
//         {fetching && <div className="mb-3 text-orange-500 text-sm font-medium text-center">Loading...</div>}
//         {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">{error}</div>}
//         {success && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium text-center">{success}</div>}
//         {dropdownError && (
//           <div className="mb-4 text-red-500 text-center text-sm">{dropdownError}</div>
//         )}

//         {!taskData && !fetching && (
//           <div className="rounded-3xl border border-gray-200 bg-white">
//             <EmptyState icon="🔎" text="Enter or select a Task ID above to load its sub-tasks." />
//           </div>
//         )}

//         {/* Task info and sub tasks */}
//         {taskData && (
//           <div className="mb-7">
//             <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-6 px-7 py-6 mb-6 justify-between">
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Task ID</span>
//                 <span className="text-base font-bold text-gray-900">{taskData.taskId || taskId}</span>
//               </div>
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Fabric Type</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.FabricType}</span>
//               </div>
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Total MTR</span>
//                 <span className="text-base font-semibold text-orange-600">{taskData.MTR}</span>
//               </div>
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Total Length</span>
//                 <span className="text-base font-semibold text-orange-600">{taskData.Length ?? '-'}</span>
//               </div>
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Party Name</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.partyName}</span>
//               </div>
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Builty No</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.BuiltyNo}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Sinkage %</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.sinkage ?? '-'}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">MTR after Sinkage</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.mtrAfterSinkage ?? (taskData.MTR && taskData.sinkage ? computeSubTaskMtrAfterSinkage(taskData.MTR, taskData.sinkage) : '-')}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">MTR after Length Sinkage</span>
//                 <span className="text-base font-semibold text-gray-800">
//                   {
//                     typeof taskData.MTR !== 'undefined' && typeof taskData.sinkage !== 'undefined' && typeof taskData.Length !== 'undefined'
//                       ? computeSubTaskMtrAfterLengthSinkage(taskData.MTR, taskData.sinkage, taskData.Length)
//                       : '-'
//                   }
//                 </span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Total Rolls</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.totalRolls ?? '-'}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Receiver Name</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.receiverName ?? '-'}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Remark</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.remark ?? '-'}</span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Challan No</span>
//                 <span className="text-base font-semibold text-gray-800">{taskData.challanNo ?? '-'}</span>
//               </div>
//             </div>

//             {/* View All Submissions Button & Modal */}
//             <div className="mb-6">
//               <button
//                 className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-7 py-2 transition"
//                 onClick={() => setShowAllSubmissions(true)}
//                 disabled={subTasks.length === 0}
//                 type="button"
//               >
//                 View All Submissions
//               </button>
//             </div>
//             {/* SubTask List */}
//             <div className="rounded-3xl w-full border border-gray-200 bg-white shadow-sm p-5">
//               <h4 className="font-bold text-gray-900 mb-4 text-lg">Select a SubTask to submit</h4>
//               {subTasks.length === 0 ? (
//                 <EmptyState icon="🧵" text="No sub-tasks found for this task" />
//               ) : (
//                 <div className="overflow-x-auto rounded-2xl border border-gray-100">
//                   <table className="w-full min-w-[900px] text-sm">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Status</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submissions</th>
//                         <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Remark</th>
//                         <th className="px-3 py-3"></th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {subTasks.map((st, idx) => {
//                         // Gather all submissions for each subTask
//                         const submissions = getSubmissionsForSubTask(st)
//                         const alreadySubmitted = submissions.length > 0
//                         return (
//                           <tr
//                             key={st.subTaskId || st._id || idx}
//                             className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors"
//                           >
//                             <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
//                               <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{st.subTaskId ?? st._id ?? '-'}</span>
//                             </td>
//                             <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{st.program ?? '-'}</td>
//                             <td className="px-3 py-3 whitespace-nowrap text-gray-700">{st.jigarNo ?? '-'}</td>
//                             <td className="px-3 py-3 whitespace-nowrap">{st.mtr ?? '-'}</td>
//                             <td className="px-3 py-3 whitespace-nowrap">
//                               {st.length ?? (Array.isArray(st.submissions) && st.submissions[0]?.length ? st.submissions[0].length : (st.submission?.length ?? '-'))}
//                             </td>
//                             <td className="px-3 py-3 whitespace-nowrap">
//                               {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
//                             </td>
//                             <td className="px-3 py-3 whitespace-nowrap">
//                               {getSubTaskAfterLengthSinkage(st, taskData?.sinkage)}
//                             </td>
//                             <td className="px-3 py-3 whitespace-nowrap">{st.status ?? '-'}</td>
//                             <td className="px-3 py-3 whitespace-nowrap text-gray-700">
//                               {submissions.length === 0
//                                 ? <span className="italic text-gray-400 text-xs font-semibold">N/A</span>
//                                 : (
//                                   <div className="flex flex-col gap-1">
//                                     {submissions.map((sub, subIdx) => (
//                                       <div
//                                         key={sub._id || subIdx}
//                                         className="flex items-center gap-2"
//                                       >
//                                         <button
//                                           type="button"
//                                           className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
//                                           onClick={() => {
//                                             setSubTaskForSubmissionDetails({ ...st, submission: sub, submissionIndex: subIdx });
//                                             setShowSubmissionDetailModal(true);
//                                           }}
//                                         >
//                                           View #{subIdx + 1}
//                                         </button>
//                                         <button
//                                           type="button"
//                                           className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
//                                           title="Delete submission"
//                                           onClick={() => handleSubmissionDelete(st, subIdx)}
//                                           disabled={deleting}
//                                         >
//                                           <RiDeleteBin5Line size={14} />
//                                         </button>
//                                         <button
//                                           type="button"
//                                           className="rounded-full border border-orange-500 text-orange-700 bg-orange-100 hover:bg-orange-200 text-xs px-3 py-1.5 font-semibold transition"
//                                           style={{ marginLeft: 3 }}
//                                           onClick={() => {
//                                             setSelectedSubTask(st);
//                                             setSelectedSubmissionIndex(subIdx);
//                                             const subToEdit = sub;
//                                             setSubmissionForm({
//                                               ...initialSubmissionForm,
//                                               fabricPartyName: subToEdit?.fabricPartyName || '',
//                                               receiverPartyName: subToEdit?.recieverPartyName || '',
//                                               submitterName: subToEdit?.submitterName || '',
//                                               length: subToEdit?.length || '',
//                                               mtr: subToEdit?.MTR ?? st?.mtr ?? '',
//                                               payment: subToEdit?.Payment || '',
//                                               remark: st?.remark || '',
//                                               challanNo: subToEdit?.challanNo || '',
//                                               challanPhotoPath: ''
//                                             });
//                                             setShowSubmissionModal(true);
//                                           }}
//                                         >
//                                           Edit
//                                         </button>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )
//                               }
//                             </td>
//                             <td className="px-3 py-3 whitespace-nowrap text-gray-600">{st.remark ?? '-'}</td>
//                             <td className="px-3 py-3 whitespace-nowrap">
//                               <div className="flex items-center gap-2">
//                                 <button
//                                   className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-1.5 transition"
//                                   onClick={() => {
//                                     setSelectedSubTask(st)
//                                     setSelectedSubmissionIndex(null)
//                                     const lastSubmission = getEditableSubmission(st)
//                                     setSubmissionForm({
//                                       ...initialSubmissionForm,
//                                       fabricPartyName: lastSubmission?.fabricPartyName || '',
//                                       receiverPartyName: lastSubmission?.recieverPartyName || '',
//                                       submitterName: lastSubmission?.submitterName || '',
//                                       length: lastSubmission?.length || '',
//                                       mtr: lastSubmission?.MTR ?? st?.mtr ?? '',
//                                       payment: lastSubmission?.Payment || '',
//                                       remark: st?.remark || '',
//                                       challanNo: lastSubmission?.challanNo || '',
//                                       challanPhotoPath: ''
//                                     })
//                                     setShowSubmissionModal(true)
//                                   }}
//                                 >
//                                   {alreadySubmitted ? "Add" : "Submit"}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <NextStepBanner
//           text="All submissions logged for this task? Start a fresh task group whenever you're ready."
//           ctaLabel="Create New Task"
//           href="/task"
//         />
//       </div>

//       {/* SUBMISSION MODAL */}
//       <Modal
//         open={showSubmissionModal}
//         onClose={() => { setShowSubmissionModal(false); setSelectedSubmissionIndex(null); }}
//         width={520}
//         title="Submit SubTask"
//         showClose
//       >
//         {selectedSubTask &&
//           <form
//             className="flex flex-col gap-6 py-1 px-1"
//             onSubmit={handleSubmission}
//             autoComplete="off"
//           >
//             <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-2 gap-4">
//               <div className="text-xs space-y-2">
//                 <div><span className="font-bold text-gray-500">Task ID:</span> <span className="font-mono text-gray-800">{taskData.taskId || taskId}</span></div>
//                 <div><span className="font-bold text-gray-500">SubTask ID:</span> <span className="font-mono text-gray-800">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Program:</span> <span className="text-gray-800">{selectedSubTask.program ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Jigar No:</span> <span className="text-gray-800">{selectedSubTask.jigarNo ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Status:</span> <span className="text-gray-800">{selectedSubTask.status ?? '-'}</span></div>
//               </div>
//               <div className="text-xs space-y-2">
//                 <div><span className="font-bold text-gray-500">MTR:</span> <span className="text-gray-800">{selectedSubTask.mtr ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Length:</span> <span className="text-gray-800">{selectedSubTask.length ?? getEditableSubmission(selectedSubTask)?.length ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">MTR After Sinkage:</span> <span className="text-gray-800">
//                   {computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, taskData?.sinkage)}
//                 </span></div>
//                 <div><span className="font-bold text-gray-500">MTR After Length Sinkage:</span> <span className="text-gray-800">
//                   {
//                     getSubTaskAfterLengthSinkage(selectedSubTask, taskData?.sinkage)
//                   }
//                 </span>
//                 </div>
//                 <div><span className="font-bold text-gray-500">Remark:</span> <span className="text-gray-800">{selectedSubTask.remark ?? '-'}</span></div>
//               </div>
//             </div>
//             {/* List existing submissions */}
//             {getSubmissionsForSubTask(selectedSubTask).length > 0 &&
//               <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-5 py-4">
//                 <div className="font-bold text-orange-700 mb-2 text-xs uppercase tracking-wide">Current Submissions</div>
//                 <div className="flex flex-col gap-2 text-xs text-gray-700">
//                   {getSubmissionsForSubTask(selectedSubTask).map((submission, idx) => (
//                     <div key={submission._id || idx} className="py-1 border-b border-orange-100 last:border-b-0">
//                       <span className="font-semibold">#{idx + 1}</span>{" "}
//                       <span>Party: {submission.fabricPartyName ?? '-'}</span>
//                       , <span>Recv: {submission.recieverPartyName ?? '-'}</span>
//                       , Submitter: {submission.submitterName ?? '-'}
//                       , Length: {submission.length ?? '-'}
//                       , MTR: {submission.MTR ?? '-'}
//                       , Payment: {submission.Payment ?? '-'}
//                       , Challan: {submission.challanNo ?? '-'}
//                       , {renderChallanPhotoLink(submission.challanPhotoPath)}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             }
//             <div className="flex flex-col gap-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Fabric Party Name</label>
//                   <select
//                     name="fabricPartyName"
//                     value={submissionForm.fabricPartyName}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                     disabled={dropdownLoading}
//                   >
//                     <option value="" disabled>
//                       {dropdownLoading ? "Loading..." : "Select Party Name"}
//                     </option>
//                     {dropdownOptions.fabricPartyNames.map((name, i) => (
//                       <option key={name || i} value={name}>{name}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Receiver Party Name</label>
//                   <select
//                     name="receiverPartyName"
//                     value={submissionForm.receiverPartyName}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                     disabled={dropdownLoading}
//                   >
//                     <option value="" disabled>
//                       {dropdownLoading ? "Loading..." : "Select Receiver Name"}
//                     </option>
//                     {dropdownOptions.receiverPartyNames.map((name, i) => (
//                       <option key={name || i} value={name}>{name}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Submitter Name</label>
//                   <input
//                     name="submitterName"
//                     type="text"
//                     placeholder="Submitter Name"
//                     value={submissionForm.submitterName}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Length</label>
//                   <select
//                     name="length"
//                     value={submissionForm.length}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                     disabled={dropdownLoading}
//                   >
//                     <option value="" disabled>
//                       {dropdownLoading ? "Loading..." : "Select Length"}
//                     </option>
//                     {dropdownOptions.length && dropdownOptions.length.map((len, i) => (
//                       <option key={len || i} value={len}>{len}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex flex-col">
//                   <label className={labelClass}>MTR</label>
//                   <input
//                     name="mtr"
//                     type="number"
//                     min={0}
//                     placeholder="MTR"
//                     value={submissionForm.mtr}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Payment</label>
//                   <input
//                     name="payment"
//                     type="number"
//                     min={0}
//                     placeholder="Payment Amount"
//                     value={submissionForm.payment}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Challan No</label>
//                   <input
//                     name="challanNo"
//                     type="text"
//                     placeholder="Challan No"
//                     value={submissionForm.challanNo}
//                     onChange={handleSubmissionFormChange}
//                     className={pillInput}
//                     required
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className={labelClass}>Challan Photo</label>
//                   <input
//                     name="challanPhotoPath"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleSubmissionFormChange}
//                     className={fileInput}
//                     required
//                   />
//                   {submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File && (
//                     <span className="text-xs text-orange-600 font-medium mt-1">{submissionForm.challanPhotoPath.name}</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {error &&
//               <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>
//             }
//             <div className="flex items-center justify-end gap-3 pt-2">
//               {/* No delete for add/edit - instead, user deletes from list */}
//               <button
//                 type="button"
//                 className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//                 onClick={() => { setShowSubmissionModal(false); setError(''); setSuccess(''); setSelectedSubmissionIndex(null); }}
//                 disabled={submitting}
//               >
//                 <RiCloseLine size={16} />
//                 Cancel
//               </button>
//               <button
//                 className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
//                 type="submit"
//                 disabled={submitting}
//               >
//                 <RiCheckLine size={17} />
//                 {selectedSubmissionIndex !== null ? "Update Submission" : "Add Submission"}
//               </button>
//             </div>
//           </form>
//         }
//       </Modal>

//       {/* SUBMISSION DETAILS VIEW MODAL */}
//       <Modal
//         open={showSubmissionDetailModal}
//         onClose={handleCloseSubmissionDetails}
//         width={430}
//         title="Submission Details"
//         showClose
//       >
//         {subTaskForSubmissionDetails && subTaskForSubmissionDetails.submission ? (
//           <div className="py-1">
//             <div className="font-bold text-gray-900 mb-4 text-base text-center">
//               SubTask <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">{subTaskForSubmissionDetails.subTaskId ?? subTaskForSubmissionDetails._id ?? '-'}</span>
//               {typeof subTaskForSubmissionDetails.submissionIndex === "number" && (
//                 <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">Submission #{subTaskForSubmissionDetails.submissionIndex + 1}</span>
//               )}
//             </div>
//             <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
//               <div>
//                 <span className="font-bold text-gray-500">Fabric Party: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.fabricPartyName ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Receiver Party: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.recieverPartyName ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Submitter Name: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.submitterName ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Length: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.length ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">MTR: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.MTR ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">MTR After Sinkage: </span>
//                 <span className="text-gray-800">
//                   {computeSubTaskMtrAfterSinkage(subTaskForSubmissionDetails.submission.MTR, taskData?.sinkage)}
//                 </span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">MTR After Length Sinkage: </span>
//                 <span className="text-gray-800">
//                   {computeSubTaskMtrAfterLengthSinkage(
//                     subTaskForSubmissionDetails.submission.MTR,
//                     taskData?.sinkage,
//                     (
//                       typeof subTaskForSubmissionDetails.submission.length !== 'undefined'
//                         ? subTaskForSubmissionDetails.submission.length
//                         : typeof subTaskForSubmissionDetails.length !== 'undefined'
//                           ? subTaskForSubmissionDetails.length
//                           : typeof taskData?.Length !== 'undefined'
//                             ? taskData?.Length
//                             : undefined
//                     )
//                   )}
//                 </span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Payment: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.Payment ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Challan No: </span>
//                 <span className="text-gray-800">{subTaskForSubmissionDetails.submission.challanNo ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-500">Challan Photo: </span>
//                 {renderChallanPhotoLink(subTaskForSubmissionDetails.submission.challanPhotoPath)}
//               </div>
//             </div>
//             <div className="flex justify-end mt-6 gap-3">
//               <button
//                 type="button"
//                 className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2.5 text-red-600 font-semibold text-sm transition"
//                 onClick={() => handleSubmissionDelete(
//                   subTaskForSubmissionDetails,
//                   typeof subTaskForSubmissionDetails.submissionIndex === "number"
//                     ? subTaskForSubmissionDetails.submissionIndex
//                     : null
//                 )}
//                 disabled={deleting}
//                 title="Delete submission"
//               >
//                 <RiDeleteBin5Line size={16} />
//                 Delete
//               </button>
//               <button
//                 type="button"
//                 className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//                 onClick={handleCloseSubmissionDetails}
//               >
//                 <RiCloseLine size={16} />
//                 Close
//               </button>
//             </div>
//           </div>
//         ) : (
//           <EmptyState icon="📭" text="No submission data found." />
//         )}
//       </Modal>

//       {/* VIEW ALL SUBMISSIONS MODAL */}
//       <Modal
//         open={showAllSubmissions}
//         onClose={() => setShowAllSubmissions(false)}
//         title="All Submissions for this Task"
//         showClose
//         maxWidth = 'max-w-5xl'
//       >
//         <div className="p-2">
//           {getAllSubmissionsForTask().length === 0 ? (
//             <EmptyState icon="📭" text="No submissions found for any sub-task." />
//           ) : (
//             <div className="overflow-x-auto rounded-2xl border border-orange-100">
//               <table className="w-full min-w-[900px] text-sm">
//                 <thead>
//                   <tr className="bg-orange-50 border-b border-orange-100">
//                   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Idx</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Party</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Receiver Party</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submitter Name</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Payment</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan No</th>
//                     <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan Photo</th>
//                     <th className="px-3 py-3"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {getAllSubmissionsForTask().map(({ subTask, submission, subTaskIndex, submissionIndex }, idx) => (
//                     <tr key={`${subTask.subTaskId || subTask._id || subTaskIndex}-${submissionIndex}`} className="border-t border-orange-100">
//                        <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
//                         <div className="font-mono text-[10px] text-gray-400 block">#{submissionIndex + 1}</div>
//                       </td>
//                       <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
//                         <span className="bg-orange-50 border border-orange-100 rounded-full px-3 py-1">{subTask.subTaskId ?? subTask._id ?? '-'}</span>
//                       </td>
//                       <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{subTask.program ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap text-gray-700">{subTask.jigarNo ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.length ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.MTR ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{computeSubTaskMtrAfterSinkage(submission.MTR, taskData?.sinkage)}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">
//                         {computeSubTaskMtrAfterLengthSinkage(
//                           submission.MTR,
//                           taskData?.sinkage,
//                           (
//                             typeof submission.length !== 'undefined'
//                               ? submission.length
//                               : typeof subTask.length !== 'undefined'
//                                 ? subTask.length
//                                 : typeof taskData?.Length !== 'undefined'
//                                   ? taskData?.Length
//                                   : undefined
//                           )
//                         )}
//                       </td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.fabricPartyName ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.recieverPartyName ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.submitterName ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.Payment ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{submission.challanNo ?? '-'}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">{renderChallanPhotoLink(submission.challanPhotoPath)}</td>
//                       <td className="px-3 py-2 whitespace-nowrap">
//                         <button
//                           type="button"
//                           className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
//                           onClick={() => {
//                             setShowAllSubmissions(false);
//                             setSubTaskForSubmissionDetails({ ...subTask, submission, submissionIndex });
//                             setShowSubmissionDetailModal(true);
//                           }}
//                         >
//                           View
//                         </button>
//                         <button
//                           type="button"
//                           className="ml-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
//                           title="Delete submission"
//                           onClick={() => handleSubmissionDelete(subTask, submissionIndex)}
//                           disabled={deleting}
//                         >
//                           <RiDeleteBin5Line size={14} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//           <div className="flex justify-end mt-6 gap-3">
//             <button
//               type="button"
//               className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//               onClick={() => setShowAllSubmissions(false)}
//             >
//               <RiCloseLine size={16} />
//               Close
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }

// export default SubmissionManagement

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
  payment: '',
  remark: '',
  challanNo: '',
  challanPhotoPath: '',
  locationStatus: '', // Default to warehouse
}

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

const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const fileInput =
  'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

function sumSubmissionMTRs(submissions, onlyWarehouse = false) {
  if (!Array.isArray(submissions)) return 0
  return submissions.reduce((sum, s) => {
    if (onlyWarehouse && s?.locationStatus === "missing") return sum
    const mtr = Number(s?.MTR)
    return isNaN(mtr) ? sum : sum + mtr
  }, 0)
}

function sumSubmissionMTRAfterSinkage(submissions, sinkage, length, onlyWarehouse = false) {
  if (!Array.isArray(submissions)) return 0
  return submissions.reduce((sum, s) => {
    if (onlyWarehouse && s?.locationStatus === "missing") return sum
    const mtr = Number(s?.MTR)
    if (isNaN(mtr)) return sum
    let afterSinkage
    if (length !== undefined && length !== null && !isNaN(Number(length))) {
      afterSinkage = Number(computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, length))
    } else {
      afterSinkage = Number(computeSubTaskMtrAfterSinkage(mtr, sinkage))
    }
    return isNaN(afterSinkage) ? sum : sum + afterSinkage
  }, 0)
}

function getSubTaskSubmissionsArray(subTask) {
  if (Array.isArray(subTask.submissions)) return subTask.submissions
  if (Array.isArray(subTask.submission)) return subTask.submission
  if (subTask.submission) return [subTask.submission]
  return []
}

// --- Payment Rate Hook, now "externalized" for on-demand use
// This will not auto-run on render. We'll fetch inside the main component when Task is loaded.
function fetchSubmissionPaymentRate({ programName, partyName, fabricType }) {
  // returns a promise
  return axios
    .get(`${API_BASE_URL}/submission-payment-data/rate`, {
      params: { programName, partyName, fabricType },
    })
    .then(res => res.data?.data?.rate || null)
    .catch(() => { throw new Error('No rate found.') })
}

// Helper to get missing meter stats for a SubTask (MTR, After Sinkage, After Length Sinkage)
function getSubTaskMissingStats(subTask, taskData) {
  const submissions = getSubTaskSubmissionsArray(subTask)
  const sinkage = taskData?.sinkage
  const subTaskLength = subTask.length ?? (
    Array.isArray(subTask.submissions) && subTask.submissions[0]?.length
      ? subTask.submissions[0].length
      : (subTask.submission?.[0]?.length ?? subTask.submission?.length ?? taskData?.Length)
  )
  // Sum of all submission MTRs, regardless of locationStatus
  const sumAllMTR = sumSubmissionMTRs(submissions, false)
  const sumAllAfterSinkage = sumSubmissionMTRAfterSinkage(submissions, sinkage, subTaskLength, false)
  const sumAllAfterLengthSinkage = sumSubmissionMTRAfterSinkage(submissions, sinkage, subTaskLength, false)
  // Sum for "warehouse" only
  const sumWarehouseMTR = sumSubmissionMTRs(submissions, true)
  const sumWarehouseAfterSinkage = sumSubmissionMTRAfterSinkage(submissions, sinkage, subTaskLength, true)
  const sumWarehouseAfterLengthSinkage = sumSubmissionMTRAfterSinkage(submissions, sinkage, subTaskLength, true)
  // Total values:
  const subTaskMTR = Number(subTask.mtr)
  const afterSinkageVal = computeSubTaskMtrAfterSinkage(subTask.mtr, sinkage)
  const afterLenSinkVal = computeSubTaskMtrAfterLengthSinkage(subTask.mtr, sinkage, subTaskLength)
  // If any submission is "missing", calculate missing as total - all used (not just warehouse)
  const hasMissing = submissions.some(x => x.locationStatus === 'missing');
  let missingMTR = null, missingAfterSinkage = null, missingAfterLengthSinkage = null
  if (hasMissing) {
    // The missing part is what is not covered by both warehouse and missing submissions
    missingMTR = (isNaN(subTaskMTR) || isNaN(sumAllMTR)) ? null : Math.max(Number(subTaskMTR) - sumAllMTR, 0);
    missingAfterSinkage = (isNaN(Number(afterSinkageVal)) || isNaN(sumAllAfterSinkage)) ? null : Math.max(Number(afterSinkageVal) - sumAllAfterSinkage, 0);
    missingAfterLengthSinkage = (isNaN(Number(afterLenSinkVal)) || isNaN(sumAllAfterLengthSinkage)) ? null : Math.max(Number(afterLenSinkVal) - sumAllAfterLengthSinkage, 0);
  }
  // Now, warehouseSum should also include "missing" submission MTRs
  // So, warehouseSum = warehouse + missing
  // i.e. warehouseSum = sumSubmissionMTRs with useWarehouseOnly = false
  // To show the UI as described: warehouseSum = sumAllMTR, NOT just warehouse
  // So below, warehouseSum is recalculated as sumAllMTR
  return {
    hasMissing,
    missingMTR,
    missingAfterSinkage,
    missingAfterLengthSinkage,
    warehouseSum: sumAllMTR,
    warehouseSumSinkage: sumAllAfterSinkage,
    warehouseSumLenSinkage: sumAllAfterLengthSinkage
  }
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

  // --- Payment Rate state, now calculated when Task is loaded
  const [rate, setRate] = useState(null)
  const [loadingRate, setLoadingRate] = useState(false)
  const [errorRate, setErrorRate] = useState('')

  // Store these for payment rate API
  const [rateQuery, setRateQuery] = useState({ programName: '', partyName: '', fabricType: '' })

  // Calculate and fetch payment rate when Task gets selected/loaded
  useEffect(() => {
    // Only fetch rate when taskData is loaded
    if (taskData) {
      const programName =
        Array.isArray(taskData.subTask) && taskData.subTask.length > 0
          ? taskData.subTask[0].program || ''
          : ''
      const partyName = taskData.partyName || ''
      const fabricType = taskData.FabricType || ''
      setRateQuery({ programName, partyName, fabricType })

      if (programName && partyName && fabricType) {
        setLoadingRate(true)
        setErrorRate('')
        fetchSubmissionPaymentRate({ programName, partyName, fabricType })
          .then(fetchedRate => {
            setRate(fetchedRate)
            // setErrorRate('')
          })
          .catch(err => {
            setRate(null)
            setErrorRate('No rate found.')
          })
          .finally(() => setLoadingRate(false))
      } else {
        setRate(null)
        setErrorRate('')
      }
    } else {
      setRate(null)
      setErrorRate('')
      setRateQuery({ programName: '', partyName: '', fabricType: '' })
    }
  }, [taskData])

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
    setSuccess('')
    setSubmissionForm(initialSubmissionForm)
  }

  function handleSubTaskSelect(subTask) {
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(null)
    setExistingChallanPhotoPath('')
    setSuccess('')
    setError('')
    const lastSubmission = getEditableSubmission(subTask)
    setSubmissionForm({
      ...initialSubmissionForm,
      fabricPartyName: lastSubmission?.fabricPartyName || '',
      receiverPartyName: lastSubmission?.recieverPartyName || '',
      submitterName: lastSubmission?.submitterName || '',
      length: lastSubmission?.length || '',
      mtr: lastSubmission?.MTR ?? subTask?.mtr ?? '',
      payment: '',
      remark: subTask?.remark || '',
      challanNo: '',
      challanPhotoPath: '',
      locationStatus: 'warehouse'
    })
    setShowSubmissionModal(true)
  }

  function openEditModal(subTask, submissionIndex, subToEdit) {
    setSelectedSubTask(subTask)
    setSelectedSubmissionIndex(submissionIndex)
    setExistingChallanPhotoPath(subToEdit?.challanPhotoPath || '')
    setError('')
    setSuccess('')
    setSubmissionForm({
      ...initialSubmissionForm,
      fabricPartyName: subToEdit?.fabricPartyName || '',
      receiverPartyName: subToEdit?.recieverPartyName || '',
      submitterName: subToEdit?.submitterName || '',
      length: subToEdit?.length || '',
      mtr: subToEdit?.MTR ?? subTask?.mtr ?? '',
      payment: subToEdit?.Payment || '',
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
      !formSubmission.payment ||
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
    const subTaskSubmissions = getSubmissionsForSubTask(subTask) || []
    const filteredForSum = isEdit && typeof selectedSubmissionIndex === 'number'
      ? subTaskSubmissions.filter((_, i) => i !== selectedSubmissionIndex)
      : subTaskSubmissions
    const mtrSumExisting = sumSubmissionMTRs(filteredForSum)
    const totalMtrAfterAdd = mtrSumExisting + mtr
    const subtaskMTRval = Number(subTask.mtr)
    if (!isNaN(subtaskMTRval) && totalMtrAfterAdd > subtaskMTRval + 1e-8) {
      const mtrLeft = subtaskMTRval - mtrSumExisting
      return {
        valid: false,
        msg: `Only ${mtrLeft >= 0 ? mtrLeft.toFixed(2) : 0} MTR left for this SubTask.`
      }
    }
    const effectiveLength =
      lengthVal !== '' && lengthVal !== undefined && lengthVal !== null && !isNaN(Number(lengthVal))
        ? lengthVal
        : (subTask.length !== undefined && !isNaN(Number(subTask.length)) ? subTask.length : undefined)
    const formAfterSinkage = effectiveLength && sinkage !== undefined
      ? Number(computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, effectiveLength))
      : Number(computeSubTaskMtrAfterSinkage(mtr, sinkage))
    const sumAfterSinkageExisting = sumSubmissionMTRAfterSinkage(filteredForSum, sinkage, effectiveLength)
    const totalAfterSinkage = sumAfterSinkageExisting + formAfterSinkage
    const subtaskAfterSinkage = effectiveLength && sinkage !== undefined
      ? Number(computeSubTaskMtrAfterLengthSinkage(subTask.mtr, sinkage, effectiveLength))
      : Number(computeSubTaskMtrAfterSinkage(subTask.mtr, sinkage))
    if (!isNaN(subtaskAfterSinkage) && totalAfterSinkage > subtaskAfterSinkage + 1e-8) {
      return { valid: false, msg: 'Sum of MTR After Sinkage exceeds the allowed limit for this SubTask.' }
    }
    return { valid: true, msg: '' }
  }

  async function handleSubmission(e) {
    e.preventDefault()
    if (!taskData || !selectedSubTask) return
    setError('')
    setSuccess('')
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
      !submissionForm.payment ||
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
      formData.append('Payment', submissionForm.payment)
      formData.append('challanNo', submissionForm.challanNo)
      if (submissionForm.remark !== undefined) {
        formData.append('remark', submissionForm.remark)
      }
      // locationStatus
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

  const renderChallanPhotoLink = (path) => {
    if (!path) return <span className="text-gray-400 text-xs">-</span>
    if (path.startsWith('/uploads/')) {
      return (
        <a
          href={`${API_BASE_URL}${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs"
        >
          View Photo
        </a>
      )
    }
    return <span className="text-xs text-gray-400">{path}</span>
  }

  function getSubTaskAfterLengthSinkage(st, sinkageFromTask) {
    const mtr = st.mtr
    const sinkage = sinkageFromTask
    let lengthVal = st.length
    if (!lengthVal || isNaN(Number(lengthVal)) || Number(lengthVal) === 0) {
      lengthVal =
        (Array.isArray(st.submissions) && st.submissions[0]?.length) ||
        (st.submission && (Array.isArray(st.submission) ? st.submission[0]?.length : st.submission?.length)) ||
        undefined
    }
    return computeSubTaskMtrAfterLengthSinkage(mtr, sinkage, lengthVal)
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

  let mtrInputValue = submissionForm.mtr;
  let lengthInputValue = submissionForm.length;
  let sinkageInputValue = taskData?.sinkage;
  let mtrAfterSinkage = '-';
  let mtrAfterLengthSinkage = '-';
  if (
    mtrInputValue !== undefined &&
    mtrInputValue !== '' &&
    !isNaN(Number(mtrInputValue)) &&
    sinkageInputValue !== undefined &&
    sinkageInputValue !== '' &&
    !isNaN(Number(sinkageInputValue))
  ) {
    mtrAfterSinkage = computeSubTaskMtrAfterSinkage(mtrInputValue, sinkageInputValue);
    if (
      lengthInputValue !== undefined &&
      lengthInputValue !== '' &&
      !isNaN(Number(lengthInputValue))
    ) {
      mtrAfterLengthSinkage = computeSubTaskMtrAfterLengthSinkage(mtrInputValue, sinkageInputValue, lengthInputValue)
    }
  }

  // Helper to show sinkage percentage text
  function renderSinkagePercent(sinkageVal) {
    return (typeof sinkageVal !== 'undefined' && sinkageVal !== null && !isNaN(Number(sinkageVal)))
      ? <span className="text-xs text-orange-500 ml-1 font-semibold">({sinkageVal}% sinkage)</span>
      : null;
  }

  // Helper to compute and show Length Sinkage percent string
  function renderLengthSinkagePercent(length) {
    if (typeof length !== 'undefined' && length !== null && !isNaN(Number(length))) {
      const sinkLength = (100 - Number(length));
      return (
        <span className="text-xs text-yellow-500 ml-1 font-semibold">{`(${sinkLength}% length loss)`}</span>
      );
    }
    return null;
  }

  // Helper to show full % used in After Length Sinkage
  function renderTotalSinkagePercent(sinkage, length) {
    if (
      typeof sinkage !== 'undefined' && sinkage !== null && !isNaN(Number(sinkage)) &&
      typeof length !== 'undefined' && length !== null && !isNaN(Number(length))
    ) {
      const total = Number(sinkage) + (100 - Number(length));
      return (
        <span className="text-xs text-orange-800 ml-1 font-semibold">{`(${total}% total)`}</span>
      );
    }
    return null;
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
        {/* ... no changes ... */}
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
                      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold">{t.taskId}</td>
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
                <span className="text-base font-bold text-gray-900">{taskData.taskId || taskId}</span>
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
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Status</th>
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
                              {st.length ?? (Array.isArray(st.submissions) && st.submissions[0]?.length ? st.submissions[0].length : (st.submission?.[0]?.length ?? st.submission?.length ?? '-'))}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
                              {renderSinkagePercent(taskData?.sinkage)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {getSubTaskAfterLengthSinkage(st, taskData?.sinkage)}
                              {renderTotalSinkagePercent(taskData?.sinkage, st.length ?? (Array.isArray(st.submissions) && st.submissions[0]?.length ? st.submissions[0].length : (st.submission?.[0]?.length ?? st.submission?.length)))}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">{st.status ?? '-'}</td>
                            <td className={`px-3 py-3 whitespace-nowrap text-gray-700`}>
                              {submissions.length === 0
                                ? <span className="italic text-gray-400 text-xs font-semibold">N/A</span>
                                : (
                                  <div className="flex flex-col gap-1">
                                    {submissions.map((sub, subIdx) => (
                                      <div key={sub._id || subIdx} className="flex items-center gap-2">
                                        {/* Show locationStatus label */}
                                        <span className={
                                          "rounded-lg text-xs px-2 py-0.5 font-bold " +
                                          (sub.locationStatus === "missing"
                                            ? "bg-red-300 text-red-900 border border-red-400"
                                            : "bg-green-100 text-green-700 border border-green-200"
                                          )
                                        }>
                                          {sub.locationStatus === "missing" ? "Missing" : (sub.locationStatus || "Warehouse")}
                                        </span>
                                        {/* View button */}
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
                                        {/* Delete button */}
                                        <button
                                          type="button"
                                          className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
                                          title="Delete submission"
                                          onClick={() => handleSubmissionDelete(st, subIdx)}
                                          disabled={deleting}
                                        >
                                          <RiDeleteBin5Line size={14} />
                                        </button>
                                        {/* Edit button — FIX: uses openEditModal helper */}
                                        <button
                                          type="button"
                                          className="rounded-full border border-orange-500 text-orange-700 bg-orange-100 hover:bg-orange-200 text-xs px-3 py-1.5 font-semibold transition"
                                          onClick={() => openEditModal(st, subIdx, sub)}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    ))}
                                    {/* If missing, show summary */}
                                    {missingStats.hasMissing &&
                                      <div className="mt-2 text-xs text-red-900 font-bold bg-red-200 rounded px-2 py-1">
                                        Missing MTR: {missingStats.missingMTR ?? "-"} 
                                        {/* | After Sinkage: {missingStats.missingAfterSinkage ?? "-"} | After Length Sinkage: {missingStats.missingAfterLengthSinkage ?? "-"} */}
                                      </div>
                                    }
                                  </div>
                                )
                              }
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">{st.remark ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {/* Add new submission button */}
                              <button
                                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-1.5 transition"
                                onClick={() => handleSubTaskSelect(st)}
                              >
                                {alreadySubmitted ? 'Add' : 'Submit'}
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
          </div>
        )}

        <NextStepBanner
          text="All submissions logged for this task? Start a fresh task group whenever you're ready."
          ctaLabel="Create New Task"
          href="/task"
        />
      </div>

      {/* ===================== SUBMISSION MODAL ===================== */}
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

            {/* SubTask info summary */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-2 gap-4">
              {/* unchanged */}
              <div className="text-xs space-y-2">
                <div>
                  <span className="font-bold text-gray-500">Task ID:</span>{' '}
                  <span className="font-mono text-gray-800">{taskData.taskId || taskId}</span>
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
                  <span className="text-gray-800">{selectedSubTask.length ?? '-'}</span>
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
                    {getSubTaskAfterLengthSinkage(selectedSubTask, taskData?.sinkage)}
                    {renderTotalSinkagePercent(
                      taskData?.sinkage,
                      selectedSubTask.length
                        ?? (Array.isArray(selectedSubTask.submissions)
                              && selectedSubTask.submissions[0]?.length
                          ? selectedSubTask.submissions[0].length
                          : (selectedSubTask.submission?.[0]?.length
                              ?? selectedSubTask.submission?.length))
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">Remark:</span>{' '}
                  <span className="text-gray-800">{selectedSubTask.remark ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* Existing submissions list */}
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
                      Payment: {submission.Payment ?? '-'},
                      Challan: {submission.challanNo ?? '-'},
                      {' '}{renderChallanPhotoLink(submission.challanPhotoPath)},
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
                  <label className={labelClass}>Fabric Party Name</label>
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
                  <label className={labelClass}>Receiver Party Name</label>
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
                  <label className={labelClass}>Submitter Name</label>
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
                  <label className={labelClass}>Length</label>
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
                  <label className={labelClass}>MTR</label>
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
                
                <div className="flex flex-col">
                  <label className={labelClass}>Payment</label>
                  <input
                    name="payment"
                    type="number"
                    min={0}
                    placeholder="Payment Amount"
                    value={submissionForm.payment}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                    required
                  />
                </div>
              </div>

              {/* Add Location Status Dropdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Location Status</label>
                  <select
                    name="locationStatus"
                    value={submissionForm.locationStatus}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                  >
                    <option value="" disabled>Select Location Status</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="missing">Missing</option>
                  </select>
                </div>
              </div>
         
         

              {/* Display MTR after sinkage and after length sinkage for inputed value */}
              <div className="mt-4 w-full bg-gradient-to-br from-orange-100 to-yellow-50 border border-orange-200 rounded-2xl px-5 py-4 shadow-lg text-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="flex items-center gap-2">
                    <span className="text-orange-700 font-semibold tracking-wide">
                      Payment Rate
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 font-bold text-xs shadow-sm border border-orange-300 ml-1">
                      {loadingRate ? (
                        <span className="italic animate-pulse text-orange-400">...</span>
                      ) : errorRate ? (
                        <span className="text-red-500">{errorRate}</span>
                      ) : rate ? (
                        <span>&#8377;{rate}</span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </span>
                  </span>
                  {/* Optionally detail the units */}
                  <span className="text-gray-400 ml-2 text-xs font-normal">Per MTR</span>
                </div>
                <div className="divide-y divide-orange-100">
                  <div className="flex justify-between py-2">
                    <div className="space-x-1">
                      <span className="font-medium text-orange-800">MTR</span>
                      <span className="text-gray-400 font-mono">({mtrInputValue || '-'})</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-orange-700 font-mono">
                        {mtrInputValue && rate
                          ? `₹${(Number(mtrInputValue) * Number(rate)).toFixed(2)}`
                          : '-'}
                      </span>
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-orange-700 font-mono">
                        {(Number(mtrAfterSinkage) && !isNaN(Number(mtrAfterSinkage)) && rate)
                          ? `₹${(Number(mtrAfterSinkage) * Number(rate)).toFixed(2)}`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div className="space-x-1">
                      <span className="font-medium text-orange-800">
                        After Length Sinkage
                      </span>
                      <span className="text-gray-400 font-mono">({mtrAfterLengthSinkage || '-'})</span>
                      {renderTotalSinkagePercent(sinkageInputValue, lengthInputValue)}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-bold text-orange-700 font-mono">
                        {(Number(mtrAfterLengthSinkage) && !isNaN(Number(mtrAfterLengthSinkage)) && rate)
                          ? `₹${(Number(mtrAfterLengthSinkage) * Number(rate)).toFixed(2)}`
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Challan No</label>
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
                    {existingChallanPhotoPath && (
                      <span className="ml-1 text-gray-400 font-normal normal-case">(optional — existing kept if blank)</span>
                    )}
                  </label>
                  {existingChallanPhotoPath && (
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Current:</span>
                      {renderChallanPhotoLink(existingChallanPhotoPath)}
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
                disabled={submitting}
              >
                <RiCheckLine size={17} />
                {typeof selectedSubmissionIndex === 'number' ? 'Update Submission' : 'Add Submission'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ===================== SUBMISSION DETAILS MODAL ===================== */}
      <Modal
        open={showSubmissionDetailModal}
        onClose={handleCloseSubmissionDetails}
        width={430}
        title="Submission Details"
        showClose
      >
        {subTaskForSubmissionDetails && subTaskForSubmissionDetails.submission ? (
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
            <div className="flex justify-end mb-2">
              <div className="inline-block rounded-lg bg-orange-100 border border-orange-200 px-4 py-1 text-xs font-semibold text-orange-700">
                Rate / m: <span className="font-mono">{typeof rate !== 'undefined' && rate !== null ? `₹${Number(rate).toFixed(2)}` : '-'}</span>
              </div>
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
                <span className="text-xs text-orange-700 font-semibold ml-2">
                  {typeof rate !== "undefined" && !isNaN(Number(subTaskForSubmissionDetails.submission.MTR)) && rate
                    ? `₹${(Number(subTaskForSubmissionDetails.submission.MTR) * Number(rate)).toFixed(2)}`
                    : ""}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-500">MTR After Sinkage: </span>
                <span className="text-gray-800">
                  {computeSubTaskMtrAfterSinkage(subTaskForSubmissionDetails.submission.MTR, taskData?.sinkage)}
                  {renderSinkagePercent(taskData?.sinkage)}
                </span>
                <span className="text-xs text-orange-700 font-semibold ml-2">
                  {(() => {
                    const afterSink = computeSubTaskMtrAfterSinkage(
                      subTaskForSubmissionDetails.submission.MTR,
                      taskData?.sinkage
                    );
                    return typeof rate !== "undefined" && !isNaN(Number(afterSink)) && afterSink && rate
                      ? `₹${(Number(afterSink) * Number(rate)).toFixed(2)}`
                      : "";
                  })()}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-500">MTR After Length Sinkage: </span>
                <span className="text-gray-800">
                  {computeSubTaskMtrAfterLengthSinkage(
                    subTaskForSubmissionDetails.submission.MTR,
                    taskData?.sinkage,
                    subTaskForSubmissionDetails.submission.length ??
                      subTaskForSubmissionDetails.length ??
                      taskData?.Length
                  )}
                  {renderTotalSinkagePercent(
                    taskData?.sinkage,
                    subTaskForSubmissionDetails.submission.length ??
                      subTaskForSubmissionDetails.length ??
                      taskData?.Length
                  )}
                </span>
                <span className="text-xs text-orange-700 font-semibold ml-2">
                  {(() => {
                    const afterLenSink = computeSubTaskMtrAfterLengthSinkage(
                      subTaskForSubmissionDetails.submission.MTR,
                      taskData?.sinkage,
                      subTaskForSubmissionDetails.submission.length ??
                        subTaskForSubmissionDetails.length ??
                        taskData?.Length
                    );
                    return typeof rate !== "undefined" && !isNaN(Number(afterLenSink)) && afterLenSink && rate
                      ? `₹${(Number(afterLenSink) * Number(rate)).toFixed(2)}`
                      : "";
                  })()}
                </span>
              </div>
              <div><span className="font-bold text-gray-500">Payment: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.Payment ?? '-'}</span></div>
              <div><span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{subTaskForSubmissionDetails.submission.challanNo ?? '-'}</span></div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500">Challan Photo: </span>
                {renderChallanPhotoLink(subTaskForSubmissionDetails.submission.challanPhotoPath)}
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

      {/* ===================== VIEW ALL SUBMISSIONS MODAL ===================== */}
      <Modal
        open={showAllSubmissions}
        onClose={() => setShowAllSubmissions(false)}
        title="All Submissions for this Task"
        showClose
        maxWidth="max-w-5xl"
      >
        <div className="p-2">
          {/* Show Rate / mtr at the top for all submissions as well */}
          <div className="flex justify-end mb-2">
            <div className="inline-block rounded-lg bg-orange-100 border border-orange-200 px-4 py-1 text-xs font-semibold text-orange-700">
              Rate / m: <span className="font-mono">{typeof rate !== 'undefined' && rate !== null ? `₹${Number(rate).toFixed(2)}` : '-'}</span>
            </div>
          </div>
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
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage<br /><span className="font-normal text-[10px] text-gray-400">(Total)</span></th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Party</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Receiver Party</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submitter</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Payment</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan No</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan Photo</th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Location Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* subtaskIndex-based grouping for missing highlighting */}
                  {subTasks.map((subTask, subTaskIndex) => {
                    const submissions = getSubTaskSubmissionsArray(subTask)
                    const missingStats = getSubTaskMissingStats(subTask, taskData)
                    const rows = submissions.map((submission, submissionIndex) => {
                      const mtrValue = Number(submission.MTR);
                      const mtrAfterSink = computeSubTaskMtrAfterSinkage(submission.MTR, taskData?.sinkage);
                      const mtrAfterLenSink = computeSubTaskMtrAfterLengthSinkage(
                        submission.MTR,
                        taskData?.sinkage,
                        submission.length ?? subTask.length ?? taskData?.Length
                      );
                      const lengthForPercent = submission.length ?? subTask.length ?? taskData?.Length;
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
                            <br />
                            <span className="text-xs text-orange-700 font-semibold">
                              {typeof rate !== "undefined" && !isNaN(Number(mtrValue)) && rate
                                ? `₹${(Number(mtrValue) * Number(rate)).toFixed(2)}`
                                : ''}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {mtrAfterSink}
                            {renderSinkagePercent(taskData?.sinkage)}
                            <br />
                            <span className="text-xs text-orange-700 font-semibold">
                              {typeof rate !== "undefined" && !isNaN(Number(mtrAfterSink)) && mtrAfterSink && rate
                                ? `₹${(Number(mtrAfterSink) * Number(rate)).toFixed(2)}`
                                : ''}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {mtrAfterLenSink}
                            {renderTotalSinkagePercent(taskData?.sinkage, lengthForPercent)}
                            <br />
                            <span className="text-xs text-orange-700 font-semibold">
                              {typeof rate !== "undefined" && !isNaN(Number(mtrAfterLenSink)) && mtrAfterLenSink && rate
                                ? `₹${(Number(mtrAfterLenSink) * Number(rate)).toFixed(2)}`
                                : ''}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.fabricPartyName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.recieverPartyName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.submitterName ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.Payment ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{submission.challanNo ?? '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{renderChallanPhotoLink(submission.challanPhotoPath)}</td>
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
                    // Insert missing summary only if needed
                    if (missingStats.hasMissing) {
                      return (
                        <React.Fragment key={"missing-row-"+(subTask.subTaskId || subTask._id || subTaskIndex)}>
                          {rows}
                          <tr className="bg-red-200">
                            <td colSpan={16} className="py-2 text-red-900 text-xs font-bold text-left pl-4">
                              Missing MTR: {missingStats.missingMTR ?? "-"} 
                              {/* | After Sinkage: {missingStats.missingAfterSinkage ?? "-"} | After Length Sinkage: {missingStats.missingAfterLengthSinkage ?? "-"} */}
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
    </div>
  )
}

export default SubmissionManagement