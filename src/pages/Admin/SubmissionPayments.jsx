// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import toast from 'react-hot-toast'
// import { RiCloseLine } from 'react-icons/ri'
// import WorkflowHeader from '../../components/common/WorkflowHeader'
// import Modal from '../../components/common/Modal'
// import EmptyState from '../../components/common/EmptyState'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// // Helpers for sinkage calculations (only for viewing)
// function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage) {
//   if (
//     subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined || sinkage === null || isNaN(Number(sinkage))
//   ) return '-'
//   return (Number(subTaskMtr) - (Number(subTaskMtr) * Number(sinkage) / 100)).toFixed(2)
// }

// function computeSubTaskMtrAfterLengthSinkage(subTaskMtr, sinkage, length) {
//   if (
//     subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
//     length === undefined || length === null || isNaN(Number(length))
//   ) return '-'
//   const mtr = Number(subTaskMtr)
//   const sinkagePercent = Number(sinkage)
//   const lengthPercent = Number(length)
//   const lengthLossPercent = 100 - lengthPercent
//   const totalPercent = sinkagePercent + lengthLossPercent
//   return (mtr - (mtr * totalPercent / 100)).toFixed(2)
// }

// function computeSubTaskMtrAfterPartySinkage(subTaskMtr, sinkage, taskLength, submissionLength) {
//   if (
//     subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
//     sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
//     taskLength === undefined || taskLength === null || isNaN(Number(taskLength)) ||
//     submissionLength === undefined || submissionLength === null || isNaN(Number(submissionLength))
//   ) return '-'
//   const mtr = Number(subTaskMtr)
//   const sinkagePercent = Number(sinkage)
//   const taskLenNum = Number(taskLength)
//   const subLenNum = Number(submissionLength)
//   let totalPercent = sinkagePercent + (subLenNum - taskLenNum)
//   if (totalPercent < 0) totalPercent = 0
//   return (mtr - mtr * totalPercent / 100).toFixed(2)
// }

// const copyToClipboard = async (text) => {
//   try {
//     await navigator.clipboard.writeText(text)
//     toast.success('Copied Task ID')
//   } catch (err) {
//     toast.error('Failed to copy')
//   }
// }

// // Get submissions as array
// function getSubTaskSubmissionsArray(subTask) {
//   if (Array.isArray(subTask.submissions)) return subTask.submissions
//   if (Array.isArray(subTask.submission)) return subTask.submission
//   if (subTask.submission) return [subTask.submission]
//   return []
// }

// // Fetch Submission Payment Rate given subTask & taskData
// async function fetchSubmissionPaymentRate(subTask, taskData) {
//   // Pull programName from subTask (st.program || st.Program), partyName & fabricType from taskData
//   if (!subTask || !taskData) {
//     console.log('No subTask or taskData provided for rate fetch')
//     return
//   }
//   const programName = subTask.program || subTask.Program
//   const partyName = taskData.partyName || taskData.PartyName
//   const fabricType = taskData.FabricType || taskData.fabricType
//   if (
//     typeof programName !== 'string' ||
//     typeof partyName !== 'string' ||
//     typeof fabricType !== 'string' ||
//     !programName.trim() ||
//     !partyName.trim() ||
//     !fabricType.trim()
//   ) {
//     console.log('Missing or invalid params for rate fetch', { programName, partyName, fabricType })
//     return
//   }

//   try {
//     // GET /api/v1/submission-payment-data/rate?programName=&partyName=&fabricType=
//     const res = await axios.get(`${API_BASE_URL}/submission-payment-data/rate`, {
//       params: {
//         programName: programName.trim(),
//         partyName: partyName.trim(),
//         fabricType: fabricType.trim(),
//       },
//     })
//     if (res.data && res.data.success && res.data.data) {
//       console.log('Fetched Rate:', res.data.data)
//       return res.data.data
//     } else {
//       console.log('Rate not found', res.data)
//       return null
//     }
//   } catch (e) {
//     console.log('Error fetching rate:', e)
//     return null
//   }
// }

// function SubmissionPayments() {
//   // -- Task selection
//   const [tasksWithPendingSubtasks, setTasksWithPendingSubtasks] = useState([])
//   const [loadingTasksList, setLoadingTasksList] = useState(true)
//   const [selectedPendingTaskId, setSelectedPendingTaskId] = useState(null)

//   // -- Manual Task Load
//   const [inputTaskId, setInputTaskId] = useState('')
//   const [fetchingTask, setFetchingTask] = useState(false)
//   const [taskError, setTaskError] = useState('')
//   const [taskSuccess, setTaskSuccess] = useState('')

//   // -- Loaded task & subTasks
//   const [taskData, setTaskData] = useState(null)
//   const [subTasks, setSubTasks] = useState([])

//   // -- SubTask selection
//   const [selectedSubTask, setSelectedSubTask] = useState(null)

//   // Amount rate for MTR computations (per selected subTask)
//   const [paymentRate, setPaymentRate] = useState(null)

//   // -- Modals
//   const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
//   const [detailModalSubmission, setDetailModalSubmission] = useState(null)
//   const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)

//   // -- Preview modal for challan photo
//   const [previewImageModal, setPreviewImageModal] = useState({ open: false, url: '', alt: '' })

//   // --- Load table for selection
//   useEffect(() => {
//     let isActive = true
//     setLoadingTasksList(true)
//     axios
//       .get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
//       .then(res => {
//         if (!isActive) return
//         setTasksWithPendingSubtasks(res.data?.success && Array.isArray(res.data.data) ? res.data.data : [])
//         setLoadingTasksList(false)
//       })
//       .catch(() => {
//         if (isActive) setLoadingTasksList(false)
//       })
//     return () => {
//       isActive = false
//     }
//   }, [])

//   // --- Load task by manual input or by table
//   async function loadTaskById(id) {
//     setTaskError('')
//     setTaskSuccess('')
//     setTaskData(null)
//     setSubTasks([])
//     setSelectedSubTask(null)
//     setDetailModalSubmission(null)
//     setSelectedSubmissionIndex(null)
//     setPaymentRate(null)
//     if (!id || !`${id}`.trim()) {
//       setTaskError('Please enter a valid Task ID')
//       return
//     }
//     setFetchingTask(true)
//     try {
//       const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId: id.trim() } })
//       if (res.data?.data) {
//         setTaskData(res.data.data)
//         setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
//         setTaskSuccess('Task loaded')
//       } else {
//         setTaskError('Task not found')
//       }
//     } catch {
//       setTaskError('Task load failed')
//     }
//     setFetchingTask(false)
//   }

//   function handleTaskFetch(e) {
//     e.preventDefault()
//     loadTaskById(inputTaskId)
//     setSelectedPendingTaskId(null)
//   }

//   function handleSelectTaskFromTable(row) {
//     setSelectedPendingTaskId(row.taskId)
//     setInputTaskId(row.taskId || '')
//     loadTaskById(row.taskId)
//   }

//   // --- On subtask select, also get the payment rate via backend API
//   async function handleSelectSubTask(st) {
//     setSelectedSubTask(st)
//     setSelectedSubmissionIndex(null)
//     setPaymentRate(null)
//     // Fetch submission payment rate and log
//     if (st && taskData) {
//       const rateObj = await fetchSubmissionPaymentRate(st, taskData)
//       if (rateObj && typeof rateObj.rate === 'number') setPaymentRate(rateObj.rate)
//       else setPaymentRate(null)
//     }
//   }

//   // -- Detail modal
//   function handleShowSubmissionDetails(subTask, submission, idx) {
//     setShowSubmissionDetailModal(true)
//     setDetailModalSubmission({ subTask, submission, submissionIndex: idx })
//   }

//   function handlePreviewImage(path, alt) {
//     let fullUrl = path
//     if (!path) return
//     if (path.startsWith('/uploads/')) {
//       fullUrl = `${API_BASE_URL}${path}`
//     }
//     setPreviewImageModal({ open: true, url: fullUrl, alt })
//   }

//   function handleClosePreviewImage() {
//     setPreviewImageModal({ open: false, url: '', alt: '' })
//   }

//   function renderChallanPhotoLink(path, altLabel) {
//     if (!path) return <span className="text-gray-400 text-xs">-</span>
//     let fullUrl = path
//     if (path.startsWith('/uploads/')) {
//       fullUrl = `${API_BASE_URL}${path}`
//     }
//     return (
//       <button
//         type="button"
//         className="text-orange-600 underline underline-offset-2 font-medium text-xs px-0.5 hover:text-orange-700"
//         style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
//         onClick={() => handlePreviewImage(fullUrl, altLabel || "Challan photo")}
//         title="Preview Image"
//       >
//         Preview
//       </button>
//     )
//   }

//   // Utility to compute MTR after Sinkage and Party Sinkage (returns numbers, or null)
//   function getMtrAfterSinkage(submission, sinkage) {
//     const mtr = submission?.MTR
//     if (typeof mtr === 'undefined' || mtr === null || isNaN(Number(mtr)) ||
//         typeof sinkage === 'undefined' || sinkage === null || isNaN(Number(sinkage))) return null
//     return Number((Number(mtr) - (Number(mtr) * Number(sinkage) / 100)).toFixed(2))
//   }

//   function getMtrAfterPartySinkage(submission, subTask, taskData) {
//     const mtr = submission?.MTR
//     const sinkage = taskData?.sinkage
//     // Here, party sinkage is: st.MTR - (st.MTR * (sinkage + (subLen - taskLen)) / 100)
//     let taskLength = taskData?.Length
//     let subLen = submission?.length ?? subTask.length ?? taskLength
//     if (
//       typeof mtr === 'undefined' || mtr === null || isNaN(Number(mtr)) ||
//       typeof sinkage === 'undefined' || sinkage === null || isNaN(Number(sinkage)) ||
//       typeof taskLength === 'undefined' || taskLength === null || isNaN(Number(taskLength)) ||
//       typeof subLen === 'undefined' || subLen === null || isNaN(Number(subLen))
//     ) return null
//     const mtrN = Number(mtr)
//     const sinkagePercent = Number(sinkage)
//     const taskLenNum = Number(taskLength)
//     const subLenNum = Number(subLen)
//     let totalPercent = sinkagePercent + (subLenNum - taskLenNum)
//     if (totalPercent < 0) totalPercent = 0
//     return Number((mtrN - mtrN * totalPercent / 100).toFixed(2))
//   }

//   // Render helper for main SubTask table
//   function MainSubTasksTable({ subTasks, taskData, selectedSubTask, onSelectSubTask }) {
//     if (!Array.isArray(subTasks) || subTasks.length === 0) {
//       return <EmptyState icon="🧵" text="No sub-tasks found for this task" />
//     }
//     return (
//       <div className="overflow-x-auto rounded-2xl border border-gray-100">
//         <table className="w-full min-w-[900px] text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage<br /><span className="text-[10px] font-medium text-orange-900">(Sinkage % shown)</span></th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage<br /><span className="text-[10px] font-medium text-orange-900">(Sinkage % &amp; Length Loss % shown)</span></th>
//               <th className="px-3 py-3"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {subTasks.map((st, idx) => (
//               <tr
//                 key={st.subTaskId || st._id || idx}
//                 className={`
//                   border-t border-gray-100 hover:bg-orange-50/40 transition-colors
//                   ${selectedSubTask === st ? 'bg-orange-100' : ''}
//                 `}
//               >
//                 <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
//                   <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
//                     {st.subTaskId ?? st._id ?? '-'}
//                   </span>
//                 </td>
//                 <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{st.program ?? '-'}</td>
//                 <td className="px-3 py-3 whitespace-nowrap">{st.jigarNo ?? '-'}</td>
//                 <td className="px-3 py-3 whitespace-nowrap">{st.mtr ?? '-'}</td>
//                 <td className="px-3 py-3 whitespace-nowrap">{taskData?.Length ?? '-'}</td>
//                 <td className="px-3 py-3 whitespace-nowrap">
//                   {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
//                   {/* Always show Sinkage % here */}
//                   {typeof taskData?.sinkage !== 'undefined' && taskData?.sinkage !== null && (
//                     <span className="ml-2 text-xs text-orange-700 font-semibold">
//                       [Sinkage: {taskData.sinkage}%]
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-3 py-3 whitespace-nowrap">
//                   {computeSubTaskMtrAfterLengthSinkage(st.mtr, taskData?.sinkage, taskData?.Length)}
//                   {(typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') ? 
//                     (<span className="ml-2 text-xs text-orange-700 font-semibold">
//                       [Sinkage: {taskData?.sinkage ?? '-'}%, Length Loss: {100-(Number(taskData?.Length) || 0)}%, Total: {(Number(taskData?.sinkage)+ (100-Number(taskData?.Length)))}%]
//                     </span>) : null}
//                 </td>
//                 <td className="px-3 py-3 whitespace-nowrap">
//                   <button
//                     className={`rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-1.5 transition`}
//                     onClick={() => onSelectSubTask(st)}
//                   >
//                     View Submissions
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )
//   }

//   // Render helper for submissions under selected SubTask
//   function SubTaskSubmissionsTable({ subTask, taskData }) {
//     const submissions = getSubTaskSubmissionsArray(subTask)
//     if (!submissions || !submissions.length) {
//       return <EmptyState icon="📭" text="No submissions found for this sub-task." />
//     }
//     return (
//       <div className="overflow-x-auto rounded-2xl border border-orange-100 mt-4">
//         <table className="w-full min-w-[600px] text-sm">
//           <thead>
//             <tr className="bg-orange-50 border-b border-orange-100">
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">#</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Party</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Receiver Party</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submitter</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Amount (Sinkage * Rate)</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Party Sinkage</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Amount (Party Sinkage * Rate)</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan No</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan Photo</th>
//               <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Status</th>
//               <th className="px-3 py-3"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {submissions.map((submission, idx) => {
//               const mtrAfterSinkage = getMtrAfterSinkage(submission, taskData?.sinkage)
//               const mtrAfterPartySinkage = getMtrAfterPartySinkage(submission, subTask, taskData)
//               const amountSinkage = paymentRate && mtrAfterSinkage && !isNaN(paymentRate) && !isNaN(mtrAfterSinkage)
//                 ? (Number(mtrAfterSinkage) * Number(paymentRate)).toFixed(2)
//                 : '-'
//               const amountPartySinkage = paymentRate && mtrAfterPartySinkage && !isNaN(paymentRate) && !isNaN(mtrAfterPartySinkage)
//                 ? (Number(mtrAfterPartySinkage) * Number(paymentRate)).toFixed(2)
//                 : '-'
//               return (
//                 <tr key={submission._id || idx} className="border-t border-orange-100 hover:bg-orange-100 transition">
//                   <td className="px-3 py-2 font-mono text-xs text-gray-600">{idx + 1}</td>
//                   <td className="px-3 py-2">{submission.fabricPartyName ?? '-'}</td>
//                   <td className="px-3 py-2">{submission.recieverPartyName ?? '-'}</td>
//                   <td className="px-3 py-2">{submission.submitterName ?? '-'}</td>
//                   <td className="px-3 py-2">{submission.length ?? '-'}</td>
//                   <td className="px-3 py-2">{submission.MTR ?? '-'}</td>
//                   <td className="px-3 py-2">{typeof mtrAfterSinkage === 'number' ? mtrAfterSinkage : '-'}</td>
//                   <td className="px-3 py-2">{amountSinkage !== '-' ? <>₹ {amountSinkage}</> : '-'}</td>
//                   <td className="px-3 py-2">{typeof mtrAfterPartySinkage === 'number' ? mtrAfterPartySinkage : '-'}</td>
//                   <td className="px-3 py-2">{amountPartySinkage !== '-' ? <>₹ {amountPartySinkage}</> : '-'}</td>
//                   <td className="px-3 py-2">{submission.challanNo ?? '-'}</td>
//                   <td className="px-3 py-2">
//                     {renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ""}`)}
//                   </td>
//                   <td className="px-3 py-2">
//                     <span className={
//                       "rounded-lg text-xs px-2 py-0.5 font-bold " +
//                       (submission.locationStatus === "missing"
//                         ? "bg-red-300 text-red-900 border border-red-400"
//                         : "bg-green-100 text-green-700 border border-green-200"
//                       )
//                     }>
//                       {submission.locationStatus === "missing" ? "Missing" : (submission.locationStatus || "Warehouse")}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2">
//                     <button
//                       className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
//                       onClick={() => handleShowSubmissionDetails(subTask, submission, idx)}
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//         <div className="mt-2 text-xs text-gray-600">
//           {paymentRate !== null && !isNaN(paymentRate) && (
//             <>Current Rate: <span className="font-bold text-orange-800">₹ {paymentRate}</span> per MTR</>
//           )}
//         </div>
//       </div>
//     )
//   }

//   // Main return
//   return (
//     <div className="min-h-screen bg-white">
//       <WorkflowHeader
//         activeStep="submission"
//         topLabel="Fabric Task Workflow"
//         title="View Submissions"
//         subtitle="Load a task and view submissions per sub-task."
//       />

//       <div className="max-w-6xl mx-auto px-2 md:px-6 sm:px-10 pb-6">
//         {/* Pending Tasks Table */}
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
//                   text={loadingTasksList ? 'Loading...' : 'No tasks with pending subtasks found'}
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
//                       className={`${selectedPendingTaskId === t.taskId ? 'bg-orange-50/60' : ''} hover:bg-orange-50/30 text-center border-t border-gray-100 transition-colors`}
//                     >
//                       <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold flex items-center gap-1 justify-center">
//                         {t.taskId}
//                         <button
//                           type="button"
//                           aria-label="Copy Task ID"
//                           className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1 py-0.5 border border-orange-200 bg-orange-50"
//                           style={{ fontSize: '0.87em', lineHeight: '1' }}
//                           onClick={() => copyToClipboard(t.taskId)}
//                         >Copy</button>
//                       </td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.FabricType || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.partyName || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.MTR || '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">{t.totalRolls ?? '-'}</td>
//                       <td className="px-3 py-3 whitespace-nowrap">
//                         <button
//                           className={`rounded-full font-semibold text-xs px-5 py-1.5 transition ${
//                             selectedPendingTaskId === t.taskId
//                               ? 'bg-orange-500 text-white'
//                               : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
//                           }`}
//                           onClick={() => handleSelectTaskFromTable(t)}
//                           disabled={fetchingTask && selectedPendingTaskId === t.taskId}
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

//         {/* Manual Task ID input */}
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
//           {inputTaskId && (
//             <button
//               type="button"
//               aria-label="Copy Task ID"
//               className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-1 border border-orange-200 bg-orange-50 text-xs"
//               onClick={() => copyToClipboard(inputTaskId)}
//             >Copy</button>
//           )}
//           <button
//             type="submit"
//             className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition flex-shrink-0"
//             disabled={fetchingTask}
//           >
//             Load Task
//           </button>
//         </form>

//         {fetchingTask && <div className="mb-3 text-orange-500 text-sm font-medium text-center">Loading...</div>}
//         {taskError && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">{taskError}</div>}
//         {taskSuccess && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium text-center">{taskSuccess}</div>}

//         {/* No task loaded */}
//         {!taskData && !fetchingTask && (
//           <div className="rounded-3xl border border-gray-200 bg-white">
//             <EmptyState icon="🔎" text="Enter or select a Task ID above to load its sub-tasks." />
//           </div>
//         )}

//         {/* Show loaded task info, then SubTask table, then sub-task selection to show submissions for that sub-task */}
//         {taskData && (
//           <div className="mb-7">
//             {/* --- Task info --- */}
//             <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-6 px-7 py-6 mb-6">
//               <div className="flex flex-col min-w-[140px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">Task ID</span>
//                 <span className="text-base font-bold text-gray-900 flex items-center gap-1">
//                   {taskData.taskId}
//                   <button
//                     type="button"
//                     aria-label="Copy Task ID"
//                     className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-0.5 border border-orange-200 bg-orange-50 text-xs"
//                     onClick={() => copyToClipboard(taskData.taskId)}
//                   >Copy</button>
//                 </span>
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
//                 <span className="text-base font-semibold text-gray-800">
//                   {taskData.MTR && taskData.sinkage ? (
//                     <>
//                       {computeSubTaskMtrAfterSinkage(taskData.MTR, taskData.sinkage)}
//                       <span className="ml-2 text-orange-900 text-xs font-bold">[Sinkage: {taskData.sinkage}%]</span>
//                     </>
//                   ) : '-'}
//                 </span>
//               </div>
//               <div className="flex flex-col min-w-[130px]">
//                 <span className="text-xs uppercase font-bold text-gray-400">MTR after Length Sinkage</span>
//                 <span className="text-base font-semibold text-gray-800">
//                   {typeof taskData.MTR !== 'undefined' && typeof taskData.sinkage !== 'undefined' && typeof taskData.Length !== 'undefined'
//                     ? (
//                       <>
//                         {computeSubTaskMtrAfterLengthSinkage(taskData.MTR, taskData.sinkage, taskData.Length)}
//                         <span className="ml-2 text-orange-900 text-xs font-bold">
//                           [Sinkage: {taskData.sinkage ?? '-'}%, Length Loss: {100-(Number(taskData?.Length) || 0)}%, Total: {(Number(taskData?.sinkage)+ (100-Number(taskData?.Length)))}%]
//                         </span>
//                       </>
//                     )
//                     : '-'}
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

//             {/* SubTask Table (Selection) */}
//             <h4 className="font-bold text-gray-900 mb-4 text-lg">Select a SubTask to view submissions</h4>
//             <MainSubTasksTable
//               subTasks={subTasks}
//               taskData={taskData}
//               selectedSubTask={selectedSubTask}
//               onSelectSubTask={handleSelectSubTask}
//             />

//             {selectedSubTask && (
//               <>
//                 <div className="my-6 flex justify-between items-center">
//                   <div>
//                     <span className="font-bold text-orange-800">SubTask: </span>
//                     <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 font-mono text-sm">
//                       {selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}
//                     </span>
//                   </div>
//                   <button
//                     className="rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-1.5 text-gray-700 font-semibold text-sm transition"
//                     onClick={() => setSelectedSubTask(null)}
//                   >
//                     Deselect
//                   </button>
//                 </div>
//                 <SubTaskSubmissionsTable subTask={selectedSubTask} taskData={taskData} />
//               </>
//             )}
//           </div>
//         )}

//         {/* Submission Details Modal */}
//         <Modal
//           open={showSubmissionDetailModal}
//           onClose={() => setShowSubmissionDetailModal(false)}
//           width={430}
//           title="Submission Details"
//           showClose
//         >
//           {detailModalSubmission && detailModalSubmission.submission ? (
//             <div className="py-1">
//               <div className="font-bold text-gray-900 mb-4 text-base text-center">
//                 SubTask{' '}
//                 <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">
//                   {detailModalSubmission.subTask.subTaskId ?? detailModalSubmission.subTask._id ?? '-'}
//                 </span>
//                 {typeof detailModalSubmission.submissionIndex === 'number' && (
//                   <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">
//                     Submission #{detailModalSubmission.submissionIndex + 1}
//                   </span>
//                 )}
//               </div>
//               <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
//                 <div>
//                   <span className="font-bold text-gray-500">Location Status: </span>
//                   <span className={
//                     detailModalSubmission.submission.locationStatus === "missing"
//                     ? "text-red-700 font-bold"
//                     : "text-green-700 font-bold"
//                   }>
//                     {detailModalSubmission.submission.locationStatus === "missing"
//                       ? "Missing"
//                       : (detailModalSubmission.submission.locationStatus || "Warehouse")
//                     }
//                   </span>
//                 </div>
//                 <div><span className="font-bold text-gray-500">Fabric Party: </span><span className="text-gray-800">{detailModalSubmission.submission.fabricPartyName ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Receiver Party: </span><span className="text-gray-800">{detailModalSubmission.submission.recieverPartyName ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Submitter Name: </span><span className="text-gray-800">{detailModalSubmission.submission.submitterName ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-500">Length: </span><span className="text-gray-800">{detailModalSubmission.submission.length ?? '-'}</span></div>
//                 <div>
//                   <span className="font-bold text-gray-500">MTR: </span>
//                   <span className="text-gray-800">{detailModalSubmission.submission.MTR ?? '-'}</span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">MTR After Sinkage: </span>
//                   <span className="text-gray-800">
//                     {
//                       (() => {
//                         const mtrAfterSinkage = getMtrAfterSinkage(detailModalSubmission.submission, taskData?.sinkage)
//                         if (typeof mtrAfterSinkage === 'number') {
//                           return <>
//                             {mtrAfterSinkage}
//                             {typeof paymentRate === 'number' && !isNaN(paymentRate) && (
//                               <span className="ml-2 text-orange-800 font-semibold inline-block">
//                                 (Amount: ₹ {(mtrAfterSinkage * paymentRate).toFixed(2)})
//                               </span>
//                             )}
//                           </>
//                         }
//                         return '-'
//                       })()
//                     }
//                     {typeof taskData?.sinkage !== 'undefined' && taskData?.sinkage !== null && (
//                       <span className="ml-2 text-orange-900 text-xs font-semibold">
//                         [Sinkage: {taskData.sinkage}%]
//                       </span>
//                     )}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">MTR After Party Sinkage: </span>
//                   <span className="text-gray-800">
//                     {
//                       (() => {
//                         const mtrAfterPartySinkage = getMtrAfterPartySinkage(
//                           detailModalSubmission.submission,
//                           detailModalSubmission.subTask,
//                           taskData
//                         )
//                         if (typeof mtrAfterPartySinkage === 'number') {
//                           return <>
//                             {mtrAfterPartySinkage}
//                             {typeof paymentRate === 'number' && !isNaN(paymentRate) && (
//                               <span className="ml-2 text-orange-800 font-semibold inline-block">
//                                 (Amount: ₹ {(mtrAfterPartySinkage * paymentRate).toFixed(2)})
//                               </span>
//                             )}
//                           </>
//                         }
//                         return '-'
//                       })()
//                     }
//                     {(typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') ? 
//                       (<span className="ml-2 text-orange-900 text-xs font-semibold">
//                         [Sinkage: {taskData?.sinkage ?? '-'}%, Length Loss: {100-(Number(detailModalSubmission.submission.length ??
//                           detailModalSubmission.subTask.length ??
//                           taskData?.Length) || 0)}%]
//                       </span>) : null}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{detailModalSubmission.submission.challanNo ?? '-'}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="font-bold text-gray-500">Challan Photo: </span>
//                   {renderChallanPhotoLink(detailModalSubmission.submission.challanPhotoPath, "Preview Challan")}
//                 </div>
//                 <div>
//                   <span className="font-bold text-gray-500">Task ID: </span>
//                   <span className="font-mono text-gray-800 flex items-center gap-1">
//                     {taskData?.taskId}
//                     <button
//                       type="button"
//                       aria-label="Copy Task ID"
//                       className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
//                       onClick={() => copyToClipboard(taskData?.taskId)}
//                     >Copy</button>
//                   </span>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6 gap-3">
//                 <button
//                   type="button"
//                   className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
//                   onClick={() => setShowSubmissionDetailModal(false)}
//                 >
//                   <RiCloseLine size={16} />
//                   Close
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <EmptyState icon="📭" text="No submission data found." />
//           )}
//         </Modal>

//         {/* Challan preview modal */}
//         <Modal
//           open={previewImageModal.open}
//           onClose={handleClosePreviewImage}
//           width={480}
//           title="Challan Photo Preview"
//           showClose
//         >
//           <div className="p-4 flex flex-col items-center gap-4">
//             {previewImageModal.url ? (
//               <img
//                 src={previewImageModal.url}
//                 alt={previewImageModal.alt || "Challan photo"}
//                 className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
//                 style={{ objectFit: 'contain', background: "#f9f6f2", width: "100%" }}
//                 crossOrigin="anonymous"
//               />
//             ) : (
//               <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
//             )}
//           </div>
//         </Modal>
//       </div>
//     </div>
//   )
// }

// export default SubmissionPayments

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { RiCloseLine } from 'react-icons/ri'
import WorkflowHeader from '../../components/common/WorkflowHeader'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const PASSCODE_API = API_BASE_URL
  ? `${API_BASE_URL}/users/verify-payment-department-passcode`
  : '/api/v1/verify-payment-department-passcode'

// ─── Helpers ────────────────────────────────────────────────────────────────────
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
  const lengthLossPercent = 100 - Number(length)
  const totalPercent = sinkagePercent + lengthLossPercent
  return (mtr - (mtr * totalPercent / 100)).toFixed(2)
}

function computeSubTaskMtrAfterPartySinkage(subTaskMtr, sinkage, taskLength, submissionLength) {
  if (
    subTaskMtr === undefined || subTaskMtr === null || isNaN(Number(subTaskMtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
    taskLength === undefined || taskLength === null || isNaN(Number(taskLength)) ||
    submissionLength === undefined || submissionLength === null || isNaN(Number(submissionLength))
  ) return '-'
  const mtr = Number(subTaskMtr)
  const sinkagePercent = Number(sinkage)
  let totalPercent = sinkagePercent + (Number(submissionLength) - Number(taskLength))
  if (totalPercent < 0) totalPercent = 0
  return (mtr - mtr * totalPercent / 100).toFixed(2)
}

function getL100SubmissionPayment(mtr, sinkage, taskLength, submissionLength) {
  if (
    mtr === undefined || mtr === null || isNaN(Number(mtr)) ||
    sinkage === undefined || sinkage === null || isNaN(Number(sinkage)) ||
    taskLength === undefined || taskLength === null || isNaN(Number(taskLength)) ||
    submissionLength === undefined || submissionLength === null || isNaN(Number(submissionLength))
  ) return '-'
  const mtrVal = Number(mtr)
  const sinkagePercent = Number(sinkage)
  const submittedLength = Number(submissionLength)
  const taskLen = Number(taskLength)
  let totalPercent = sinkagePercent + (submittedLength - taskLen)
  if (totalPercent < 0) totalPercent = 0
  return (mtrVal - (mtrVal * totalPercent / 100)).toFixed(2)
}

// Additional helper to match Modal's explicit calculation for L100 Submission Payment
function getL100LengthAndAmount(submission, subTask, taskData, paymentRate) {
  const MTR = Number(submission?.MTR)
  const sinkage = Number(taskData?.sinkage)
  const Length = Number(taskData?.Length)
  // Try submission.length, fallback to subTask.length, fallback to taskData.Length
  const SubmittedLength = 100;
  if (
    isNaN(MTR) ||
    isNaN(sinkage) ||
    isNaN(Length) ||
    isNaN(SubmittedLength) ||
    typeof paymentRate === 'undefined' ||
    paymentRate === null ||
    isNaN(Number(paymentRate))
  )
    return null
  const deduction = sinkage + (SubmittedLength - Length)
  const netLength = MTR - (MTR * (deduction / 100))
  const amount = netLength * Number(paymentRate)
  return {
    netLength: netLength.toFixed(2),
    amount: amount.toFixed(2)
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied Task ID')
  } catch (err) {
    toast.error('Failed to copy')
  }
}

function getSubTaskSubmissionsArray(subTask) {
  if (Array.isArray(subTask.submissions)) return subTask.submissions
  if (Array.isArray(subTask.submission)) return subTask.submission
  if (subTask.submission) return [subTask.submission]
  return []
}

async function fetchSubmissionPaymentRate(subTask, taskData) {
  if (!subTask || !taskData) return
  const programName = subTask.program || subTask.Program
  const partyName = taskData.partyName || taskData.PartyName
  const fabricType = taskData.FabricType || taskData.fabricType
  if (
    typeof programName !== 'string' || typeof partyName !== 'string' || typeof fabricType !== 'string' ||
    !programName.trim() || !partyName.trim() || !fabricType.trim()
  ) return
  try {
    const res = await axios.get(`${API_BASE_URL}/submission-payment-data/rate`, {
      params: { programName: programName.trim(), partyName: partyName.trim(), fabricType: fabricType.trim() },
    })
    if (res.data?.success && res.data.data) return res.data.data
    return null
  } catch (e) {
    return null
  }
}

// ─── Passcode gate ──────────────────────────────────────────────────────────────
function PasscodeGate({ onSuccess }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!passcode.trim()) {
      setError('Enter the passcode to continue.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        PASSCODE_API,
        { passcode: passcode.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      if (res.data?.success) {
        onSuccess()
      } else {
        setError('Incorrect passcode. Try again.')
        setPasscode('')
        inputRef.current?.focus()
      }

    } catch (err) {
      setError(err?.response?.data?.message || 'Incorrect passcode. Try again.')
      setPasscode('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '36px 32px 28px', width: 360,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: '#fff7ed', border: '1px solid #fed7aa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, fontSize: 20,
        }}>
          🔒
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
          Payment Department Access
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>
          Enter the passcode to view submission payments.
        </p>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Passcode
        </label>
        <input
          ref={inputRef}
          type="password"
          value={passcode}
          onChange={(e) => { setPasscode(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter passcode"
          disabled={loading}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            border: error ? '1px solid #fca5a5' : '1px solid #d1d5db',
            fontSize: 14, outline: 'none', boxSizing: 'border-box',
            marginBottom: error ? 8 : 16,
            background: loading ? '#f9fafb' : '#fff',
          }}
        />
        {error && (
          <div style={{
            fontSize: 13, color: '#b91c1c', background: '#fef2f2',
            border: '1px solid #fca5a5', borderRadius: 7,
            padding: '7px 10px', marginBottom: 14,
          }}>
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '9px 0',
            background: loading ? '#fdba74' : '#f58021',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────
function SubmissionPayments() {
  const [authenticated, setAuthenticated] = useState(false)

  const [tasksWithPendingSubtasks, setTasksWithPendingSubtasks] = useState([])
  const [loadingTasksList, setLoadingTasksList] = useState(false)
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState(null)

  const [inputTaskId, setInputTaskId] = useState('')
  const [fetchingTask, setFetchingTask] = useState(false)
  const [taskError, setTaskError] = useState('')
  const [taskSuccess, setTaskSuccess] = useState('')

  const [taskData, setTaskData] = useState(null)
  const [subTasks, setSubTasks] = useState([])
  const [selectedSubTask, setSelectedSubTask] = useState(null)
  const [paymentRate, setPaymentRate] = useState(null)

  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
  const [detailModalSubmission, setDetailModalSubmission] = useState(null)
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null)
  const [previewImageModal, setPreviewImageModal] = useState({ open: false, url: '', alt: '' })

  // Only fetch tasks list after passcode verified
  useEffect(() => {
    if (!authenticated) return
    let isActive = true
    setLoadingTasksList(true)
    axios
      .get(`${API_BASE_URL}/tasks/with-pending-subtasks`)
      .then(res => {
        if (!isActive) return
        setTasksWithPendingSubtasks(res.data?.success && Array.isArray(res.data.data) ? res.data.data : [])
        setLoadingTasksList(false)
      })
      .catch(() => { if (isActive) setLoadingTasksList(false) })
    return () => { isActive = false }
  }, [authenticated])

  async function loadTaskById(id) {
    setTaskError('')
    setTaskSuccess('')
    setTaskData(null)
    setSubTasks([])
    setSelectedSubTask(null)
    setDetailModalSubmission(null)
    setSelectedSubmissionIndex(null)
    setPaymentRate(null)
    if (!id || !`${id}`.trim()) { setTaskError('Please enter a valid Task ID'); return }
    setFetchingTask(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId: id.trim() } })
      if (res.data?.data) {
        setTaskData(res.data.data)
        setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
        setTaskSuccess('Task loaded')
      } else {
        setTaskError('Task not found')
      }
    } catch {
      setTaskError('Task load failed')
    }
    setFetchingTask(false)
  }

  function handleTaskFetch(e) {
    e.preventDefault()
    loadTaskById(inputTaskId)
    setSelectedPendingTaskId(null)
  }

  function handleSelectTaskFromTable(row) {
    setSelectedPendingTaskId(row.taskId)
    setInputTaskId(row.taskId || '')
    loadTaskById(row.taskId)
  }

  async function handleSelectSubTask(st) {
    setSelectedSubTask(st)
    setSelectedSubmissionIndex(null)
    setPaymentRate(null)
    if (st && taskData) {
      const rateObj = await fetchSubmissionPaymentRate(st, taskData)
      if (rateObj && typeof rateObj.rate === 'number') setPaymentRate(rateObj.rate)
      else setPaymentRate(null)
    }
  }

  function handleShowSubmissionDetails(subTask, submission, idx) {
    setShowSubmissionDetailModal(true)
    setDetailModalSubmission({ subTask, submission, submissionIndex: idx })
  }

  function handlePreviewImage(path, alt) {
    if (!path) return
    let fullUrl = path
    if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
    setPreviewImageModal({ open: true, url: fullUrl, alt })
  }

  function handleClosePreviewImage() {
    setPreviewImageModal({ open: false, url: '', alt: '' })
  }

  function renderChallanPhotoLink(path, altLabel) {
    if (!path) return <span className="text-gray-400 text-xs">-</span>
    let fullUrl = path
    if (path.startsWith('/uploads/')) fullUrl = `${API_BASE_URL}${path}`
    return (
      <button
        type="button"
        className="text-orange-600 underline underline-offset-2 font-medium text-xs px-0.5 hover:text-orange-700"
        style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
        onClick={() => handlePreviewImage(fullUrl, altLabel || 'Challan photo')}
        title="Preview Image"
      >
        Preview
      </button>
    )
  }

  function getMtrAfterSinkage(submission, sinkage) {
    const mtr = submission?.MTR
    if (typeof mtr === 'undefined' || mtr === null || isNaN(Number(mtr)) ||
        typeof sinkage === 'undefined' || sinkage === null || isNaN(Number(sinkage))) return null
    return Number((Number(mtr) - (Number(mtr) * Number(sinkage) / 100)).toFixed(2))
  }

  function getMtrAfterPartySinkage(submission, subTask, taskData) {
    const mtr = submission?.MTR
    const sinkage = taskData?.sinkage
    let taskLength = taskData?.Length
    let subLen = submission?.length ?? subTask.length ?? taskLength
    if (
      typeof mtr === 'undefined' || mtr === null || isNaN(Number(mtr)) ||
      typeof sinkage === 'undefined' || sinkage === null || isNaN(Number(sinkage)) ||
      typeof taskLength === 'undefined' || taskLength === null || isNaN(Number(taskLength)) ||
      typeof subLen === 'undefined' || subLen === null || isNaN(Number(subLen))
    ) return null
    const mtrN = Number(mtr)
    let totalPercent = Number(sinkage) + (Number(subLen) - Number(taskLength))
    if (totalPercent < 0) totalPercent = 0
    return Number((mtrN - mtrN * totalPercent / 100).toFixed(2))
  }

  function MainSubTasksTable({ subTasks, taskData, selectedSubTask, onSelectSubTask }) {
    if (!Array.isArray(subTasks) || subTasks.length === 0) {
      return <EmptyState icon="🧵" text="No sub-tasks found for this task" />
    }
    return (
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage<br /><span className="text-[10px] font-medium text-orange-900">(Sinkage % shown)</span></th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Length Sinkage<br /><span className="text-[10px] font-medium text-orange-900">(Sinkage % &amp; Length Loss % shown)</span></th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subTasks.map((st, idx) => (
              <tr key={st.subTaskId || st._id || idx}
                className={`border-t border-gray-100 hover:bg-orange-50/40 transition-colors ${selectedSubTask === st ? 'bg-orange-100' : ''}`}>
                <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                  <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                    {st.subTaskId ?? st._id ?? '-'}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{st.program ?? '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{st.jigarNo ?? '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{st.mtr ?? '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{taskData?.Length ?? '-'}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
                  {typeof taskData?.sinkage !== 'undefined' && taskData?.sinkage !== null && (
                    <span className="ml-2 text-xs text-orange-700 font-semibold">[Sinkage: {taskData.sinkage}%]</span>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {computeSubTaskMtrAfterLengthSinkage(st.mtr, taskData?.sinkage, taskData?.Length)}
                  {(typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') ? (
                    <span className="ml-2 text-xs text-orange-700 font-semibold">
                      [Sinkage: {taskData?.sinkage ?? '-'}%, Length Loss: {100-(Number(taskData?.Length) || 0)}%, Total: {(Number(taskData?.sinkage)+(100-Number(taskData?.Length)))}%]
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <button
                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-1.5 transition"
                    onClick={() => onSelectSubTask(st)}
                  >
                    View Submissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function SubTaskSubmissionsTable({ subTask, taskData }) {
    const submissions = getSubTaskSubmissionsArray(subTask)
    if (!submissions || !submissions.length) {
      return <EmptyState icon="📭" text="No submissions found for this sub-task." />
    }
    return (
      <div className="overflow-x-auto rounded-2xl border border-orange-100 mt-4">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-orange-50 border-b border-orange-100">
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">#</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Fabric Party</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Receiver Party</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submitter</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Length</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Party Sinkage</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Amount (Party Sinkage * Rate)</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-orange-700 whitespace-nowrap">L100 Submission Payment</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan No</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Challan Photo</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, idx) => {
              const mtrAfterSinkage = getMtrAfterSinkage(submission, taskData?.sinkage)
              const mtrAfterPartySinkage = getMtrAfterPartySinkage(submission, subTask, taskData)
              const amountPartySinkage = paymentRate && mtrAfterPartySinkage && !isNaN(paymentRate) && !isNaN(mtrAfterPartySinkage)
                ? (Number(mtrAfterPartySinkage) * Number(paymentRate)).toFixed(2) : '-'
              
              const l100Details = getL100LengthAndAmount(submission, subTask, taskData, paymentRate)
              return (
                <tr key={submission._id || idx} className="border-t border-orange-100 hover:bg-orange-100 transition">
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2">{submission.fabricPartyName ?? '-'}</td>
                  <td className="px-3 py-2">{submission.recieverPartyName ?? '-'}</td>
                  <td className="px-3 py-2">{submission.submitterName ?? '-'}</td>
                  <td className="px-3 py-2">{submission.length ?? '-'}</td>
                  <td className="px-3 py-2">{submission.MTR ?? '-'}</td>
                  <td className="px-3 py-2">{typeof mtrAfterSinkage === 'number' ? mtrAfterSinkage : '-'}</td>
                  <td className="px-3 py-2">{typeof mtrAfterPartySinkage === 'number' ? mtrAfterPartySinkage : '-'}</td>
                  <td className="px-3 py-2">{amountPartySinkage !== '-' ? <>₹ {amountPartySinkage}</> : '-'}</td>
                  <td className="px-3 py-2">
                    {l100Details ? (
                      <div>
                        <span>
                          Length: {l100Details.netLength} <br/>
                          Amount: ₹ {l100Details.amount}
                        </span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{submission.challanNo ?? '-'}</td>
                  <td className="px-3 py-2">{renderChallanPhotoLink(submission.challanPhotoPath, `Challan #${submission.challanNo ?? ''}`)}</td>
                  <td className="px-3 py-2">
                    <span className={'rounded-lg text-xs px-2 py-0.5 font-bold ' + (submission.locationStatus === 'missing' ? 'bg-red-300 text-red-900 border border-red-400' : 'bg-green-100 text-green-700 border border-green-200')}>
                      {submission.locationStatus === 'missing' ? 'Missing' : (submission.locationStatus || 'Warehouse')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
                      onClick={() => handleShowSubmissionDetails(subTask, submission, idx)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-gray-600 px-3 pb-2">
          {paymentRate !== null && !isNaN(paymentRate) && (
            <>Current Rate: <span className="font-bold text-orange-800">₹ {paymentRate}</span> per MTR</>
          )}
        </div>
      </div>
    )
  }

  // Show passcode gate first
  if (!authenticated) {
    return <PasscodeGate onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-white">
      <WorkflowHeader
        activeStep="submission"
        topLabel="Fabric Task Workflow"
        title="View Submissions"
        subtitle="Load a task and view submissions per sub-task."
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
                <EmptyState icon="🗂️" text={loadingTasksList ? 'Loading...' : 'No tasks with pending subtasks found'} />
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
                    <tr key={t.taskId}
                      className={`${selectedPendingTaskId === t.taskId ? 'bg-orange-50/60' : ''} hover:bg-orange-50/30 text-center border-t border-gray-100 transition-colors`}>
                      <td className="px-3 py-3 font-mono text-xs whitespace-nowrap font-bold flex items-center gap-1 justify-center">
                        {t.taskId}
                        <button type="button" aria-label="Copy Task ID"
                          className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1 py-0.5 border border-orange-200 bg-orange-50"
                          style={{ fontSize: '0.87em', lineHeight: '1' }}
                          onClick={() => copyToClipboard(t.taskId)}>Copy</button>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.FabricType || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.partyName || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.MTR || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{t.totalRolls ?? '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          className={`rounded-full font-semibold text-xs px-5 py-1.5 transition ${selectedPendingTaskId === t.taskId ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                          onClick={() => handleSelectTaskFromTable(t)}
                          disabled={fetchingTask && selectedPendingTaskId === t.taskId}
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
        <form className="flex flex-wrap items-center gap-3 mb-7 bg-white py-2 px-2 rounded-full border border-gray-200 shadow-sm max-w-xl" onSubmit={handleTaskFetch}>
          <label htmlFor="taskIdInput" className="font-semibold text-gray-500 text-sm pl-3 whitespace-nowrap">Task ID</label>
          <input id="taskIdInput" name="taskIdInput" type="text" placeholder="e.g. 2"
            value={inputTaskId} onChange={e => setInputTaskId(e.target.value)}
            className="flex-1 px-2 py-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none min-w-0"
            autoComplete="off" />
          {inputTaskId && (
            <button type="button" aria-label="Copy Task ID"
              className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-1 border border-orange-200 bg-orange-50 text-xs"
              onClick={() => copyToClipboard(inputTaskId)}>Copy</button>
          )}
          <button type="submit"
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition flex-shrink-0"
            disabled={fetchingTask}>
            Load Task
          </button>
        </form>

        {fetchingTask && <div className="mb-3 text-orange-500 text-sm font-medium text-center">Loading...</div>}
        {taskError && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">{taskError}</div>}
        {taskSuccess && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium text-center">{taskSuccess}</div>}

        {!taskData && !fetchingTask && (
          <div className="rounded-3xl border border-gray-200 bg-white">
            <EmptyState icon="🔎" text="Enter or select a Task ID above to load its sub-tasks." />
          </div>
        )}

        {taskData && (
          <div className="mb-7">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-6 px-7 py-6 mb-6">
              <div className="flex flex-col min-w-[140px]">
                <span className="text-xs uppercase font-bold text-gray-400">Task ID</span>
                <span className="text-base font-bold text-gray-900 flex items-center gap-1">
                  {taskData.taskId}
                  <button type="button" aria-label="Copy Task ID"
                    className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-2 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                    onClick={() => copyToClipboard(taskData.taskId)}>Copy</button>
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
                  {taskData.MTR && taskData.sinkage ? (
                    <>{computeSubTaskMtrAfterSinkage(taskData.MTR, taskData.sinkage)}<span className="ml-2 text-orange-900 text-xs font-bold">[Sinkage: {taskData.sinkage}%]</span></>
                  ) : '-'}
                </span>
              </div>
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-gray-400">MTR after Length Sinkage</span>
                <span className="text-base font-semibold text-gray-800">
                  {typeof taskData.MTR !== 'undefined' && typeof taskData.sinkage !== 'undefined' && typeof taskData.Length !== 'undefined' ? (
                    <>{computeSubTaskMtrAfterLengthSinkage(taskData.MTR, taskData.sinkage, taskData.Length)}<span className="ml-2 text-orange-900 text-xs font-bold">[Sinkage: {taskData.sinkage ?? '-'}%, Length Loss: {100-(Number(taskData?.Length) || 0)}%, Total: {(Number(taskData?.sinkage)+(100-Number(taskData?.Length)))}%]</span></>
                  ) : '-'}
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

            <h4 className="font-bold text-gray-900 mb-4 text-lg">Select a SubTask to view submissions</h4>
            <MainSubTasksTable subTasks={subTasks} taskData={taskData} selectedSubTask={selectedSubTask} onSelectSubTask={handleSelectSubTask} />

            {selectedSubTask && (
              <>
                <div className="my-6 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-orange-800">SubTask: </span>
                    <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 font-mono text-sm">
                      {selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}
                    </span>
                  </div>
                  <button className="rounded-full border border-gray-300 hover:bg-gray-50 px-4 py-1.5 text-gray-700 font-semibold text-sm transition"
                    onClick={() => setSelectedSubTask(null)}>
                    Deselect
                  </button>
                </div>
                <SubTaskSubmissionsTable subTask={selectedSubTask} taskData={taskData} />
              </>
            )}
          </div>
        )}

        {/* Submission Details Modal */}
        <Modal open={showSubmissionDetailModal} onClose={() => setShowSubmissionDetailModal(false)} width={430} title="Submission Details" showClose>
          {detailModalSubmission && detailModalSubmission.submission ? (
            <div className="py-1">
              <div className="font-bold text-gray-900 mb-4 text-base text-center">
                SubTask{' '}
                <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">
                  {detailModalSubmission.subTask.subTaskId ?? detailModalSubmission.subTask._id ?? '-'}
                </span>
                {typeof detailModalSubmission.submissionIndex === 'number' && (
                  <span className="ml-2 font-mono text-xs bg-orange-50 border border-orange-100 rounded-full px-2">
                    Submission #{detailModalSubmission.submissionIndex + 1}
                  </span>
                )}
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
                <div>
                  <span className="font-bold text-gray-500">Location Status: </span>
                  <span className={detailModalSubmission.submission.locationStatus === 'missing' ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                    {detailModalSubmission.submission.locationStatus === 'missing' ? 'Missing' : (detailModalSubmission.submission.locationStatus || 'Warehouse')}
                  </span>
                </div>
                <div><span className="font-bold text-gray-500">Fabric Party: </span><span className="text-gray-800">{detailModalSubmission.submission.fabricPartyName ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Receiver Party: </span><span className="text-gray-800">{detailModalSubmission.submission.recieverPartyName ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Submitter Name: </span><span className="text-gray-800">{detailModalSubmission.submission.submitterName ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Length: </span><span className="text-gray-800">{detailModalSubmission.submission.length ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">MTR: </span><span className="text-gray-800">{detailModalSubmission.submission.MTR ?? '-'}</span></div>
                <div>
                  <span className="font-bold text-gray-500">MTR After Sinkage: </span>
                  <span className="text-gray-800">
                    {(() => {
                      const v = getMtrAfterSinkage(detailModalSubmission.submission, taskData?.sinkage)
                      if (typeof v === 'number') return <>{v}</>
                      return '-'
                    })()}
                    {typeof taskData?.sinkage !== 'undefined' && taskData?.sinkage !== null && (
                      <span className="ml-2 text-orange-900 text-xs font-semibold">[Sinkage: {taskData.sinkage}%]</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">MTR After Party Sinkage: </span>
                  <span className="text-gray-800">
                    {(() => {
                      const v = getMtrAfterPartySinkage(detailModalSubmission.submission, detailModalSubmission.subTask, taskData)
                      if (typeof v === 'number') return <>{v}{typeof paymentRate === 'number' && !isNaN(paymentRate) && <span className="ml-2 text-orange-800 font-semibold inline-block">(Amount: ₹ {(v * paymentRate).toFixed(2)})</span>}</>
                      return '-'
                    })()}
                    {(typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') ? (
                      <span className="ml-2 text-orange-900 text-xs font-semibold">
                        {(() => {
                          const submittedLength = Number(detailModalSubmission.submission.length ?? detailModalSubmission.subTask.length);
                          const taskLength = Number(taskData?.Length);
                          let lengthLoss = '-';
                          if (!isNaN(submittedLength) && !isNaN(taskLength)) {
                            // Convert to integer, drop decimals
                            lengthLoss = Math.round(submittedLength - taskLength) + '%';
                          }
                          // Sinkage without decimals + '%'
                          let sinkageVal = taskData?.sinkage;
                          if (typeof sinkageVal === 'number') {
                            sinkageVal = Math.round(sinkageVal) + '%';
                          } else {
                            sinkageVal = '-%';
                          }
                          return (
                            <>[Sinkage: {sinkageVal}, Length Sinkage: {lengthLoss}]</>
                          )
                        })()}
                      </span>
                    ) : null}
         
               

                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500">L100 Submission Payment: </span>
                  <span className="text-gray-800">
                    {(() => {
                      // Get values
                      const MTR = Number(detailModalSubmission.submission.MTR);
                      const sinkage = Number(taskData?.sinkage);
                      const Length = Number(taskData?.Length);
                      const SubmittedLength = 100;
                      // Compute net length and Amount: (MTR - ( sinkage + ( SubmittedLength - Length ) ))
                      if (
                        isNaN(MTR) || isNaN(sinkage) || isNaN(Length) || isNaN(SubmittedLength) ||
                        typeof paymentRate === 'undefined' || paymentRate === null || isNaN(Number(paymentRate))
                      ) return '-';
                      const deduction = sinkage + (SubmittedLength - Length);
                      const netLength = MTR - (MTR * deduction / 100);
                 
                      const amount = netLength * Number(paymentRate);
                      return (
                        <>
                          {netLength.toFixed(2)}
                          {typeof paymentRate === 'number' && !isNaN(paymentRate) && (
                            <span className="ml-2 text-orange-800 font-semibold inline-block">
                              (Amount: ₹ {amount.toFixed(2)})
                            </span>
                          )}
                        </>
                      );
                    })()}
                       {(typeof taskData?.sinkage !== 'undefined' && typeof taskData?.Length !== 'undefined') ? (
                      <span className="ml-2 text-orange-900 text-xs font-semibold">
                        {(() => {
                          const submittedLength = Number(detailModalSubmission.submission.length ?? detailModalSubmission.subTask.length);
                          const taskLength = Number(taskData?.Length);
                          let lengthLoss = '-';
                          if (!isNaN(submittedLength) && !isNaN(taskLength)) {
                            // Convert to integer, drop decimals
                            lengthLoss = Math.round(100 - taskLength) + '%';
                          }
                          // Sinkage without decimals + '%'
                          let sinkageVal = taskData?.sinkage;
                          if (typeof sinkageVal === 'number') {
                            sinkageVal = Math.round(sinkageVal) + '%';
                          } else {
                            sinkageVal = '-%';
                          }
                          return (
                            <>[Sinkage: {sinkageVal}, Length Sinkage: {lengthLoss}]</>
                          )
                        })()}
                      </span>
                    ) : null}
         
         
               

                  </span>
                </div>
                {/* <div>
                  <span className="font-bold text-orange-800">L100 Submission Payment: </span>
                  <span className="text-gray-800">
                    {(() => {
                      // Get values
                      const MTR = Number(detailModalSubmission.submission.MTR);
                      const sinkage = Number(taskData?.sinkage);
                      const Length = Number(taskData?.Length);
                      const SubmittedLength =
                        Number(detailModalSubmission.submission.length ?? detailModalSubmission.subTask.length ?? taskData?.Length);
                      // Compute net length and Amount: (MTR - ( sinkage + ( SubmittedLength - Length ) ))
                      if (
                        isNaN(MTR) || isNaN(sinkage) || isNaN(Length) || isNaN(SubmittedLength) ||
                        typeof paymentRate === 'undefined' || paymentRate === null || isNaN(Number(paymentRate))
                      ) return '-';
                      const deduction = sinkage + (SubmittedLength - Length);
                      const netLength = MTR - deduction;
                      const amount = netLength * Number(paymentRate);
                      return (
                        <>
                          Length: {netLength.toFixed(2)}{' '}
                          <span className="mx-2">|</span>
                          Amount: ₹ {amount.toFixed(2)}
                        </>
                      );
                    })()}
                  </span>
                </div> */}
  
  
     
                <div><span className="font-bold text-gray-500">Challan No: </span><span className="text-gray-800">{detailModalSubmission.submission.challanNo ?? '-'}</span></div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500">Challan Photo: </span>
                  {renderChallanPhotoLink(detailModalSubmission.submission.challanPhotoPath, 'Preview Challan')}
                </div>
                <div>
                  <span className="font-bold text-gray-500">Task ID: </span>
                  <span className="font-mono text-gray-800 flex items-center gap-1">
                    {taskData?.taskId}
                    <button type="button" aria-label="Copy Task ID"
                      className="ml-1 text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-xs"
                      onClick={() => copyToClipboard(taskData?.taskId)}>Copy</button>
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6 gap-3">
                <button type="button"
                  className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                  onClick={() => setShowSubmissionDetailModal(false)}>
                  <RiCloseLine size={16} /> Close
                </button>
              </div>
            </div>
          ) : (
            <EmptyState icon="📭" text="No submission data found." />
          )}
        </Modal>

        {/* Challan preview modal */}
        <Modal open={previewImageModal.open} onClose={handleClosePreviewImage} width={480} title="Challan Photo Preview" showClose>
          <div className="p-4 flex flex-col items-center gap-4">
            {previewImageModal.url ? (
              <img src={previewImageModal.url} alt={previewImageModal.alt || 'Challan photo'}
                className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
                style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
                crossOrigin="anonymous" />
            ) : (
              <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default SubmissionPayments