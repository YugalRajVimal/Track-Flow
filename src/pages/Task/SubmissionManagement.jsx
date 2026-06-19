// import React, { useState, useEffect } from 'react'
// import toast from 'react-hot-toast'
// import axios from 'axios'
// import Modal from '../../components/common/Modal'
// import { RiCheckLine, RiCloseLine, RiDeleteBin5Line } from 'react-icons/ri'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// const initialSubmissionForm = {
//   fabricPartyName: '',
//   receiverPartyName: '',
//   length: '',
//   mtr: '',
//   payment: '',
//   paymentStatus: 'pending',
//   remark: '',
//   challanNo: '',
//   challanPhotoPath: ''
// }

// const PAYMENT_STATUS_OPTIONS = [
//   { value: 'pending', text: 'Pending' },
//   { value: 'paid', text: 'Paid' },
//   { value: 'partial', text: 'Partial' },
//   { value: 'unpaid', text: 'Unpaid' },
// ]

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
//   return (Number(subTaskMtr) - Number(sinkage)).toFixed(2)
// }

// const SubmissionManagement = () => {
//   const [inputTaskId, setInputTaskId] = useState('')
//   const [taskId, setTaskId] = useState('')
//   const [taskData, setTaskData] = useState(null)
//   const [subTasks, setSubTasks] = useState([])
//   const [selectedSubTask, setSelectedSubTask] = useState(null)
//   const [submitting, setSubmitting] = useState(false)
//   const [fetching, setFetching] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [showSubmissionModal, setShowSubmissionModal] = useState(false)
//   const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)

//   // Modal for viewing submission details
//   const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
//   const [subTaskForSubmissionDetails, setSubTaskForSubmissionDetails] = useState(null)

//   const [dropdownOptions, setDropdownOptions] = useState({
//     fabricPartyNames: [],
//     receiverPartyNames: []
//   })
//   const [dropdownLoading, setDropdownLoading] = useState(false)
//   const [dropdownError, setDropdownError] = useState('')

//   // Delete confirmation state
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
//         setDropdownOptions({
//           fabricPartyNames,
//           receiverPartyNames
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

//   // --- TASK FETCH ---
//   async function handleTaskFetch(e) {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     setTaskId('')
//     setTaskData(null)
//     setSubTasks([])
//     setSelectedSubTask(null)
//     setSubmissionForm(initialSubmissionForm)
//     if (!inputTaskId || !inputTaskId.trim()) {
//       setError('Please enter a valid Task ID')
//       return
//     }
//     setFetching(true)
//     try {
//       const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
//         params: { taskId: inputTaskId.trim() }
//       })
//       if (res.data?.data) {
//         setTaskId(res.data.data.taskId || inputTaskId.trim())
//         setTaskData(res.data.data)
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

//   // --- SUBMIT: open submission modal, prefill if editing ---
//   function handleSubTaskSelect(subTask) {
//     setSelectedSubTask(subTask)
//     setSuccess('')
//     setError('')

//     setSubmissionForm({
//       ...initialSubmissionForm,
//       fabricPartyName: subTask?.submission?.fabricPartyName || '',
//       receiverPartyName: subTask?.submission?.recieverPartyName || '',
//       length: subTask?.submission?.length || '',
//       mtr: subTask?.submission?.MTR ?? subTask?.mtr ?? '',
//       payment: subTask?.submission?.Payment || '',
//       paymentStatus: subTask?.submission?.paymentStatus || 'pending',
//       remark: subTask?.remark || '',
//       challanNo: subTask?.submission?.challanNo || '',
//       challanPhotoPath: ''
//     })

//     setShowSubmissionModal(true)
//   }

//   // --- SUBMISSION FORM HANDLER ---
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

//   // --- EDIT/UPDATE or ADD SUBMISSION ---
//   async function handleSubmission(e) {
//     e.preventDefault()
//     if (!taskData || !selectedSubTask) return
//     setError('')
//     setSuccess('')
//     setSubmitting(true)
//     // Validate party names
//     if (!submissionForm.fabricPartyName || !submissionForm.receiverPartyName) {
//       setError('Party names are required')
//       setSubmitting(false)
//       return
//     }

//     try {
//       const url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${selectedSubTask.subTaskId || selectedSubTask._id}/submission`;

//       // Always use FormData so it works with or without photo upload
//       const formData = new FormData();
//       formData.append('fabricPartyName', submissionForm.fabricPartyName);
//       formData.append('recieverPartyName', submissionForm.receiverPartyName);
//       formData.append('length', submissionForm.length);
//       formData.append('MTR', submissionForm.mtr);
//       formData.append('Payment', submissionForm.payment);
//       formData.append('paymentStatus', submissionForm.paymentStatus);
//       formData.append('challanNo', submissionForm.challanNo);

//       // Optionally support remark field
//       if ('remark' in submissionForm) {
//         formData.append('remark', submissionForm.remark);
//       }

//       // Only append file if adding or updating
//       if (submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File) {
//         formData.append('file', submissionForm.challanPhotoPath);
//       }

//       // ***** Use PUT for update/add to match backend REST style *****
//       await axios.put(url, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       setSuccess('Submission saved')
//       toast.success('Submission saved')
//       setShowSubmissionModal(false)

//       // Refresh taskData/subTasks to reflect update
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
//     } catch (ex) {
//       setError('Submission failed')
//       toast.error('Submission failed')
//     }
//     setSubmitting(false)
//   }

//   // --- DELETE SUBMISSION for SubTask ---
//   async function handleSubmissionDelete(subTask) {
//     // Confirm dialog
//     if (!window.confirm('Delete submission for this sub-task? This cannot be undone.')) return

//     setDeleting(true)
//     setError('')
//     setSuccess('')
//     const subTaskId = subTask.subTaskId || subTask._id
//     try {
//       await axios.delete(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`);
//       toast('Submission deleted', { icon: '🗑️' })
//       setSuccess('Submission deleted')

//       // Update subTasks and taskData to reflect change
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
//     } catch (ex) {
//       setError('Failed to delete submission')
//       toast.error('Failed to delete submission')
//     }
//     setDeleting(false)
//   }

//   // Show Submission Details modal handler
//   function handleShowSubmissionDetails(subTask) {
//     setSubTaskForSubmissionDetails(subTask)
//     setShowSubmissionDetailModal(true)
//   }

//   function handleCloseSubmissionDetails() {
//     setShowSubmissionDetailModal(false)
//     setSubTaskForSubmissionDetails(null)
//   }

//   return (
//     <div className="px-2 py-6 sm:p-7 max-w-6xl mx-auto bg-gradient-to-t from-white via-blue-50/30 to-white rounded-3xl shadow-lg">
//       <h2 className="font-extrabold text-3xl text-blue-900 tracking-wide mb-8 text-center">
//         SubTask Submission
//       </h2>
//       <form
//         className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-7 bg-white py-3 px-4 rounded-2xl shadow transition justify-center"
//         onSubmit={handleTaskFetch}
//         style={{ maxWidth: 680, margin: '0 auto' }}
//       >
//         <label htmlFor="taskIdInput" className="font-medium text-gray-700 mr-2 min-w-max">
//           Enter Task ID:
//         </label>
//         <input
//           id="taskIdInput"
//           name="taskIdInput"
//           type="text"
//           placeholder="e.g. 2"
//           value={inputTaskId}
//           onChange={e => setInputTaskId(e.target.value)}
//           className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder:text-gray-400 w-48 transition"
//           autoComplete="off"
//         />
//         <button
//           type="submit"
//           className="py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition"
//           disabled={fetching}
//         >
//           Load Task
//         </button>
//         {fetching && <span className="ml-2 text-gray-500 text-sm">Loading...</span>}
//       </form>
//       {error && <div className="mb-3 text-red-600 font-semibold text-center">{error}</div>}
//       {success && <div className="mb-3 text-green-600 font-semibold text-center">{success}</div>}
//       {dropdownError && (
//         <div className="mb-3 text-red-500 text-center text-sm">{dropdownError}</div>
//       )}
//       {/* Task info and sub tasks */}
//       {taskData && (
//         <div className="mb-7">
//           <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-white shadow flex flex-wrap gap-6 px-7 py-6 mb-4 justify-between">
//             <div className="flex flex-col min-w-[140px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Task ID</span>
//               <span className="text-base font-bold text-blue-900">{taskData.taskId || taskId}</span>
//             </div>
//             <div className="flex flex-col min-w-[140px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Fabric Type</span>
//               <span className="text-base font-semibold text-gray-800">{taskData.FabricType}</span>
//             </div>
//             <div className="flex flex-col min-w-[140px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Total MTR</span>
//               <span className="text-base font-semibold text-blue-700">{taskData.MTR}</span>
//             </div>
//             <div className="flex flex-col min-w-[140px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Party Name</span>
//               <span className="text-base font-semibold text-gray-800">{taskData.partyName}</span>
//             </div>
//             <div className="flex flex-col min-w-[140px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Builty No</span>
//               <span className="text-base font-semibold text-gray-800">{taskData.BuiltyNo}</span>
//             </div>
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Sinkage %</span>
//               <span className="text-base font-semibold text-pink-700">{taskData.sinkage ?? '-'}</span>
//             </div>
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">MTR after Sinkage</span>
//               <span className="text-base font-semibold text-indigo-700">{taskData.mtrAfterSinkage ?? '-'}</span>
//             </div>
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Total Rolls</span>
//               <span className="text-base font-semibold text-indigo-700">{taskData.totalRolls ?? '-'}</span>
//             </div>
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Receiver Name</span>
//               <span className="text-base font-semibold text-indigo-700">{taskData.receiverName ?? '-'}</span>
//             </div>
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Remark</span>
//               <span className="text-base font-semibold text-indigo-700">{taskData.remark ?? '-'}</span>
//             </div>
//             {/* Add challanNo */}
//             <div className="flex flex-col min-w-[130px]">
//               <span className="text-xs uppercase font-bold text-gray-500">Challan No</span>
//               <span className="text-base font-semibold text-indigo-700">{taskData.challanNo ?? '-'}</span>
//             </div>
//           </div>

//           {/* SubTask List */}
//           <div className="rounded-xl w-full border border-gray-200 bg-white p-4 shadow">
//             <h4 className="font-bold text-blue-900 mb-2">Select SubTask for Submission:</h4>
//             {subTasks.length === 0 && <div className="text-gray-400 text-center py-8">No sub-tasks found</div>}
//             {subTasks.length > 0 && (
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[600px] text-sm border border-gray-100">
//                   <thead className="bg-blue-50 font-semibold text-gray-700">
//                     <tr>
//                       <th className="px-3 py-2 whitespace-nowrap">SubTask ID</th>
//                       <th className="px-3 py-2 whitespace-nowrap">Program</th>
//                       <th className="px-3 py-2 whitespace-nowrap">Jigar No</th>
//                       <th className="px-3 py-2 whitespace-nowrap">MTR</th>
//                       <th className="px-3 py-2 whitespace-nowrap">MTR After Sinkage</th>
//                       <th className="px-3 py-2 whitespace-nowrap">Status</th>
//                       <th className="px-3 py-2 whitespace-nowrap">Submission Details</th>
//                       <th className="px-3 py-2 whitespace-nowrap">Remark</th>
//                       <th className="px-3 py-2 whitespace-nowrap"></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {subTasks.map((st, idx) => (
//                       <tr
//                         key={st.subTaskId || st._id || idx}
//                         className="border-t border-gray-50 hover:bg-blue-50 transition"
//                       >
//                         <td className="px-3 py-2 font-mono whitespace-nowrap">{st.subTaskId ?? st._id ?? '-'}</td>
//                         <td className="px-3 py-2 whitespace-nowrap">{st.program ?? '-'}</td>
//                         <td className="px-3 py-2 whitespace-nowrap">{st.jigarNo ?? '-'}</td>
//                         <td className="px-3 py-2 whitespace-nowrap">{st.mtr ?? '-'}</td>
//                         <td className="px-3 py-2 whitespace-nowrap">
//                           {
//                             computeSubTaskMtrAfterSinkage(
//                               st.mtr,
//                               taskData?.sinkage
//                             )
//                           }
//                         </td>
//                         <td className="px-3 py-2 whitespace-nowrap">{st.status ?? '-'}</td>
//                         {/* Submission Details column */}
//                         <td className="px-3 py-2 text-center whitespace-nowrap">
//                           {st.submission ? (
//                             <button
//                               className="py-1 px-4 bg-indigo-100 hover:bg-indigo-200 rounded text-blue-800 font-semibold text-xs border border-indigo-300 transition"
//                               onClick={() => handleShowSubmissionDetails(st)}
//                               type="button"
//                             >
//                               View
//                             </button>
//                           ) : (
//                             <span className="italic text-gray-400">No submission</span>
//                           )}
//                         </td>
//                         <td className="px-3 py-2 whitespace-nowrap">{st.remark ?? '-'}</td>
//                         <td className="px-3 py-2 whitespace-nowrap">
//                           <button
//                             className="py-1.5 px-4 bg-blue-600 hover:bg-blue-800 rounded text-white font-bold text-xs transition"
//                             onClick={() => handleSubTaskSelect(st)}
//                           >
//                             {st.submission ? "Edit" : "Submit"}
//                           </button>
//                           {/* Only show delete button if submission exists */}
//                           {st.submission && (
//                             <button
//                               className="ml-2 py-1.5 px-2 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs font-bold border border-red-200 transition"
//                               title="Delete submission"
//                               onClick={() => handleSubmissionDelete(st)}
//                               type="button"
//                               disabled={deleting}
//                             >
//                               <RiDeleteBin5Line size={15} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* SUBMISSION MODAL */}
//       <Modal
//         open={showSubmissionModal}
//         onClose={() => setShowSubmissionModal(false)}
//         width={520}
//         title="Submit SubTask"
//         showClose
//       >
//         {selectedSubTask &&
//           <form
//             className="flex flex-col gap-7 py-1 px-1"
//             onSubmit={handleSubmission}
//             autoComplete="off"
//           >
//             <div className="grid grid-cols-2 gap-5">
//               <div className="text-xs space-y-2">
//                 <div><span className="font-bold text-gray-600">Task ID:</span> <span className="font-mono">{taskData.taskId || taskId}</span></div>
//                 <div><span className="font-bold text-gray-600">SubTask ID:</span> <span className="font-mono">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-600">Program:</span> <span>{selectedSubTask.program ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-600">Jigar No:</span> <span>{selectedSubTask.jigarNo ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-600">Status:</span> <span>{selectedSubTask.status ?? '-'}</span></div>
//               </div>
//               <div className="text-xs space-y-2">
//                 <div><span className="font-bold text-gray-600">MTR:</span> <span>{selectedSubTask.mtr ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-600">MTR After Sinkage:</span> <span>
//                   {computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, taskData?.sinkage)}
//                 </span></div>
//                 <div><span className="font-bold text-gray-600">Payment Status:</span> <span>{selectedSubTask.submission?.paymentStatus ?? '-'}</span></div>
//                 <div><span className="font-bold text-gray-600">Remark:</span> <span>{selectedSubTask.remark ?? '-'}</span></div>
//               </div>
//             </div>
//             {/* Show all submission details in modal for info */}
//             {selectedSubTask.submission && (
//               <div className="pt-2 ">
//                 <div className="bg-gray-50 border border-blue-100 rounded-md px-3 py-2">
//                   <div className="font-bold text-blue-700 mb-1 text-xs">Submission Details</div>
//                   <div className="flex flex-col gap-1 text-xs text-gray-600">
//                     <div>
//                       <span className="font-semibold">Fabric Party:</span>{" "}
//                       <span>{selectedSubTask.submission.fabricPartyName ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">Receiver Party:</span>{" "}
//                       <span>{selectedSubTask.submission.recieverPartyName ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">Length:</span>{" "}
//                       <span>{selectedSubTask.submission.length ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">MTR:</span>{" "}
//                       <span>{selectedSubTask.submission.MTR ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">Payment:</span>{" "}
//                       <span>{selectedSubTask.submission.Payment ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">Status:</span>{" "}
//                       <span>{selectedSubTask.submission.paymentStatus ?? '-'}</span>
//                     </div>
//                     {/* Add challanNo and challanPhotoPath to modal view */}
//                     <div>
//                       <span className="font-semibold">Challan No:</span>{" "}
//                       <span>{selectedSubTask.submission.challanNo ?? '-'}</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold">Challan Photo:</span>{" "}
//                       {selectedSubTask.submission.challanPhotoPath
//                         ? (
//                           <a
//                             href={selectedSubTask.submission.challanPhotoPath}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-500 underline"
//                           >
//                             View Photo
//                           </a>
//                         )
//                         : (<span>-</span>)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div className="bg-blue-50/50 p-4 rounded-lg flex flex-col gap-4">
//               <div className="flex gap-6">
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Fabric Party Name</label>
//                   <select
//                     name="fabricPartyName"
//                     value={submissionForm.fabricPartyName}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
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
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Receiver Party Name</label>
//                   <select
//                     name="receiverPartyName"
//                     value={submissionForm.receiverPartyName}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
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
//               </div>
//               <div className="flex gap-6">
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Length</label>
//                   <input
//                     name="length"
//                     type="number"
//                     min={0}
//                     placeholder="Length"
//                     value={submissionForm.length}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   />
//                 </div>
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">MTR</label>
//                   <input
//                     name="mtr"
//                     type="number"
//                     min={0}
//                     placeholder="MTR"
//                     value={submissionForm.mtr}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-6">
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Payment</label>
//                   <input
//                     name="payment"
//                     type="number"
//                     min={0}
//                     placeholder="Payment Amount"
//                     value={submissionForm.payment}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   />
//                 </div>
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Payment Status</label>
//                   <select
//                     name="paymentStatus"
//                     value={submissionForm.paymentStatus}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   >
//                     {PAYMENT_STATUS_OPTIONS.map(opt => (
//                       <option key={opt.value} value={opt.value}>{opt.text}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="flex gap-6">
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Challan No</label>
//                   <input
//                     name="challanNo"
//                     type="text"
//                     placeholder="Challan No"
//                     value={submissionForm.challanNo}
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   />
//                 </div>
//                 <div className="flex flex-col flex-1">
//                   <label className="text-xs font-bold text-blue-600 mb-1">Challan Photo</label>
//                   <input
//                     name="challanPhotoPath"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleSubmissionFormChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
//                   />
//                   {submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File && (
//                     <span className="text-xs text-gray-600 mt-1">{submissionForm.challanPhotoPath.name}</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {error &&
//               <div className="text-red-600 text-xs pt-2 font-semibold">{error}</div>
//             }
//             <div className="flex items-center justify-end gap-3 pt-3">
//               {/* Only show delete on populated submission */}
//               {selectedSubTask.submission &&
//                 <button
//                   type="button"
//                   className="flex items-center px-5 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition text-red-900 font-semibold shadow"
//                   onClick={() => handleSubmissionDelete(selectedSubTask)}
//                   disabled={deleting}
//                   title="Delete submission"
//                 >
//                   <RiDeleteBin5Line size={16} className="mr-2" />
//                   Delete Submission
//                 </button>
//               }
//               <button
//                 type="button"
//                 className="flex items-center px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-semibold shadow"
//                 onClick={() => { setShowSubmissionModal(false); setError(''); setSuccess(''); }}
//                 disabled={submitting}
//               >
//                 <RiCloseLine size={16} className="mr-2" />
//                 Cancel
//               </button>
//               <button
//                 className="flex items-center px-7 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition"
//                 type="submit"
//                 disabled={submitting}
//               >
//                 <RiCheckLine size={18} className="mr-2" />
//                 {selectedSubTask.submission ? "Update" : "Submit"}
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
//           <div className="py-2">
//             <div className="font-bold text-blue-900 mb-2 text-base text-center">
//               SubTask: <span className="font-mono">{subTaskForSubmissionDetails.subTaskId ?? subTaskForSubmissionDetails._id ?? '-'}</span>
//             </div>
//             <div className="rounded-lg border border-blue-100 px-4 py-3 bg-blue-50/50 flex flex-col gap-2 text-sm">
//               <div>
//                 <span className="font-bold text-gray-700">Fabric Party: </span>
//                 <span>{subTaskForSubmissionDetails.submission.fabricPartyName ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">Receiver Party: </span>
//                 <span>{subTaskForSubmissionDetails.submission.recieverPartyName ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">Length: </span>
//                 <span>{subTaskForSubmissionDetails.submission.length ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">MTR: </span>
//                 <span>{subTaskForSubmissionDetails.submission.MTR ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">Payment: </span>
//                 <span>{subTaskForSubmissionDetails.submission.Payment ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">Status: </span>
//                 <span>{subTaskForSubmissionDetails.submission.paymentStatus ?? '-'}</span>
//               </div>
//               <div>
//                 <span className="font-bold text-gray-700">Challan No: </span>
//                 <span>{subTaskForSubmissionDetails.submission.challanNo ?? '-'}</span>
//               </div>
//               {/* @TaskCreationANdManagement.jsx (418-422) */}
//               <div>
//                 <span className="font-bold text-gray-700">Challan Photo: </span>
//                 {subTaskForSubmissionDetails.submission.challanPhotoPath ? (
//                   subTaskForSubmissionDetails.submission.challanPhotoPath.startsWith("/uploads/") ? (
//                     <a
//                       href={
//                         API_BASE_URL
//                           ? `${API_BASE_URL}${subTaskForSubmissionDetails.submission.challanPhotoPath}`
//                           : subTaskForSubmissionDetails.submission.challanPhotoPath
//                       }
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-500 underline"
//                     >
//                       View Photo
//                     </a>
//                   ) : (
//                     <span className="text-xs text-gray-400">{subTaskForSubmissionDetails.submission.challanPhotoPath}</span>
//                   )
//                 ) : (
//                   <span>-</span>
//                 )}
//               </div>
         
//             </div>
//             <div className="flex justify-end mt-5">
//               {/* Show delete control in detail modal if submission exists */}
//               <button
//                 type="button"
//                 className="flex items-center px-5 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition text-red-900 font-semibold shadow mr-3"
//                 onClick={() => handleSubmissionDelete(subTaskForSubmissionDetails)}
//                 disabled={deleting}
//                 title="Delete submission"
//               >
//                 <RiDeleteBin5Line size={16} className="mr-2" />
//                 Delete Submission
//               </button>
//               <button
//                 type="button"
//                 className="flex items-center px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-semibold shadow"
//                 onClick={handleCloseSubmissionDetails}
//               >
//                 <RiCloseLine size={16} className="mr-2" />
//                 Close
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="py-8 text-center text-gray-500 italic">No submission data found.</div>
//         )}
//       </Modal>
//     </div>
//   )
// }

// export default SubmissionManagement

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

import { RiCheckLine, RiCloseLine, RiDeleteBin5Line } from 'react-icons/ri'
import WorkflowHeader from '../../components/common/WorkflowHeader'

import StatusBadgeTask from '../../components/common/StatusBadgeTask'
import EmptyState from '../../components/common/EmptyState'
import NextStepBanner from '../../components/common/NextStepBanner'
import Modal from '../../components/common/Modal'


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubmissionForm = {
  fabricPartyName: '',
  receiverPartyName: '',
  length: '',
  mtr: '',
  payment: '',
  paymentStatus: 'pending',
  remark: '',
  challanNo: '',
  challanPhotoPath: ''
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', text: 'Pending' },
  { value: 'paid', text: 'Paid' },
  { value: 'partial', text: 'Partial' },
  { value: 'unpaid', text: 'Unpaid' },
]

const PAYMENT_STATUS_TONE = {
  pending: 'neutral',
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
}

function computeSubTaskMtrAfterSinkage(subTaskMtr, sinkage) {
  if (
    subTaskMtr === undefined ||
    subTaskMtr === null ||
    isNaN(Number(subTaskMtr)) ||
    sinkage === undefined ||
    sinkage === null ||
    isNaN(Number(sinkage))
  ) {
    return '-'
  }
  return (Number(subTaskMtr) - Number(sinkage)).toFixed(2)
}

// -- Shared field styling tokens --
const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const fileInput =
  'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

const SubmissionManagement = () => {
  const [inputTaskId, setInputTaskId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [taskData, setTaskData] = useState(null)
  const [subTasks, setSubTasks] = useState([])
  const [selectedSubTask, setSelectedSubTask] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionForm, setSubmissionForm] = useState(initialSubmissionForm)

  // Modal for viewing submission details
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
  const [subTaskForSubmissionDetails, setSubTaskForSubmissionDetails] = useState(null)

  const [dropdownOptions, setDropdownOptions] = useState({
    fabricPartyNames: [],
    receiverPartyNames: []
  })
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [dropdownError, setDropdownError] = useState('')

  // Delete confirmation state
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let isSubscribed = true;
    setDropdownLoading(true);

    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`);
        if (!isSubscribed) return;
        const fabricPartyNames = Array.isArray(res.data?.data?.FabricPartyName) ? res.data.data?.FabricPartyName : [];
        const receiverPartyNames = Array.isArray(res.data?.data?.recieverPartyName) ? res.data.data?.recieverPartyName : [];
        setDropdownOptions({
          fabricPartyNames,
          receiverPartyNames
        });
        setDropdownError('');
      } catch {
        setDropdownError('Failed to load dropdown data');
      } finally {
        if (isSubscribed) setDropdownLoading(false);
      }
    };

    fetchDropdowns();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // --- TASK FETCH ---
  async function handleTaskFetch(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setTaskId('')
    setTaskData(null)
    setSubTasks([])
    setSelectedSubTask(null)
    setSubmissionForm(initialSubmissionForm)
    if (!inputTaskId || !inputTaskId.trim()) {
      setError('Please enter a valid Task ID')
      return
    }
    setFetching(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
        params: { taskId: inputTaskId.trim() }
      })
      if (res.data?.data) {
        setTaskId(res.data.data.taskId || inputTaskId.trim())
        setTaskData(res.data.data)
        setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
        setError('')
        setSuccess('')
      } else {
        setError('Task not found')
      }
    } catch {
      setError('Task load failed')
    }
    setFetching(false)
  }

  // --- SUBMIT: open submission modal, prefill if editing ---
  function handleSubTaskSelect(subTask) {
    setSelectedSubTask(subTask)
    setSuccess('')
    setError('')

    setSubmissionForm({
      ...initialSubmissionForm,
      fabricPartyName: subTask?.submission?.fabricPartyName || '',
      receiverPartyName: subTask?.submission?.recieverPartyName || '',
      length: subTask?.submission?.length || '',
      mtr: subTask?.submission?.MTR ?? subTask?.mtr ?? '',
      payment: subTask?.submission?.Payment || '',
      paymentStatus: subTask?.submission?.paymentStatus || 'pending',
      remark: subTask?.remark || '',
      challanNo: subTask?.submission?.challanNo || '',
      challanPhotoPath: ''
    })

    setShowSubmissionModal(true)
  }

  // --- SUBMISSION FORM HANDLER ---
  function handleSubmissionFormChange(e) {
    const { name, value, type, files } = e.target
    if (type === "file" && name === "challanPhotoPath") {
      setSubmissionForm(prev => ({
        ...prev,
        challanPhotoPath: files && files[0] ? files[0] : ''
      }))
    } else {
      setSubmissionForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // --- EDIT/UPDATE or ADD SUBMISSION ---
  async function handleSubmission(e) {
    e.preventDefault()
    if (!taskData || !selectedSubTask) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    // Validate party names
    if (!submissionForm.fabricPartyName || !submissionForm.receiverPartyName) {
      setError('Party names are required')
      setSubmitting(false)
      return
    }

    try {
      const url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${selectedSubTask.subTaskId || selectedSubTask._id}/submission`;

      // Always use FormData so it works with or without photo upload
      const formData = new FormData();
      formData.append('fabricPartyName', submissionForm.fabricPartyName);
      formData.append('recieverPartyName', submissionForm.receiverPartyName);
      formData.append('length', submissionForm.length);
      formData.append('MTR', submissionForm.mtr);
      formData.append('Payment', submissionForm.payment);
      formData.append('paymentStatus', submissionForm.paymentStatus);
      formData.append('challanNo', submissionForm.challanNo);

      // Optionally support remark field
      if ('remark' in submissionForm) {
        formData.append('remark', submissionForm.remark);
      }

      // Only append file if adding or updating
      if (submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File) {
        formData.append('file', submissionForm.challanPhotoPath);
      }

      // ***** Use PUT for update/add to match backend REST style *****
      await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Submission saved')
      toast.success('Submission saved')
      setShowSubmissionModal(false)

      // Refresh taskData/subTasks to reflect update
      if (taskId) {
        setFetching(true)
        try {
          const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
            params: { taskId }
          })
          if (res.data?.data) {
            setTaskData(res.data.data)
            setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
          }
        } finally {
          setFetching(false)
        }
      }

      setSubmissionForm(initialSubmissionForm)
    } catch (ex) {
      setError('Submission failed')
      toast.error('Submission failed')
    }
    setSubmitting(false)
  }

  // --- DELETE SUBMISSION for SubTask ---
  async function handleSubmissionDelete(subTask) {
    // Confirm dialog
    if (!window.confirm('Delete submission for this sub-task? This cannot be undone.')) return

    setDeleting(true)
    setError('')
    setSuccess('')
    const subTaskId = subTask.subTaskId || subTask._id
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subTaskId}/submission`);
      toast('Submission deleted', { icon: '🗑️' })
      setSuccess('Submission deleted')

      // Update subTasks and taskData to reflect change
      if (taskId) {
        setFetching(true)
        try {
          const res = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
            params: { taskId }
          })
          if (res.data?.data) {
            setTaskData(res.data.data)
            setSubTasks(Array.isArray(res.data.data.subTask) ? res.data.data.subTask : [])
          }
        } finally {
          setFetching(false)
        }
      }
      setShowSubmissionModal(false)
      setShowSubmissionDetailModal(false)
    } catch (ex) {
      setError('Failed to delete submission')
      toast.error('Failed to delete submission')
    }
    setDeleting(false)
  }

  // Show Submission Details modal handler
  function handleShowSubmissionDetails(subTask) {
    setSubTaskForSubmissionDetails(subTask)
    setShowSubmissionDetailModal(true)
  }

  function handleCloseSubmissionDetails() {
    setShowSubmissionDetailModal(false)
    setSubTaskForSubmissionDetails(null)
  }

  const renderChallanPhotoLink = (path) => {
    if (!path) return <span>-</span>
    if (path.startsWith('/uploads/')) {
      return (
        <a
          href={API_BASE_URL ? `${API_BASE_URL}${path}` : path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium"
        >
          View Photo
        </a>
      )
    }
    return <span className="text-xs text-gray-400">{path}</span>
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
        {dropdownError && (
          <div className="mb-4 text-red-500 text-center text-sm">{dropdownError}</div>
        )}

        {!taskData && !fetching && (
          <div className="rounded-3xl border border-gray-200 bg-white">
            <EmptyState icon="🔎" text="Enter a Task ID above to load its sub-tasks." />
          </div>
        )}

        {/* Task info and sub tasks */}
        {taskData && (
          <div className="mb-7">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-6 px-7 py-6 mb-6 justify-between">
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
                <span className="text-base font-semibold text-gray-800">{taskData.mtrAfterSinkage ?? '-'}</span>
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

            {/* SubTask List */}
            <div className="rounded-3xl w-full border border-gray-200 bg-white shadow-sm p-5">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Select a SubTask to submit</h4>
              {subTasks.length === 0 ? (
                <EmptyState icon="🧵" text="No sub-tasks found for this task" />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">SubTask ID</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Program</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Jigar No</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">MTR After Sinkage</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Status</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Submission</th>
                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">Remark</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subTasks.map((st, idx) => (
                        <tr
                          key={st.subTaskId || st._id || idx}
                          className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors"
                        >
                          <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                            <span className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{st.subTaskId ?? st._id ?? '-'}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">{st.program ?? '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-700">{st.jigarNo ?? '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap">{st.mtr ?? '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {computeSubTaskMtrAfterSinkage(st.mtr, taskData?.sinkage)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">{st.status ?? '-'}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {st.submission ? (
                              <button
                                className="rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-xs px-4 py-1.5 transition"
                                onClick={() => handleShowSubmissionDetails(st)}
                                type="button"
                              >
                                View
                              </button>
                            ) : (
                              <span className="italic text-gray-300 text-xs">No submission</span>
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-600">{st.remark ?? '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-1.5 transition"
                                onClick={() => handleSubTaskSelect(st)}
                              >
                                {st.submission ? "Edit" : "Submit"}
                              </button>
                              {st.submission && (
                                <button
                                  className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition"
                                  title="Delete submission"
                                  onClick={() => handleSubmissionDelete(st)}
                                  type="button"
                                  disabled={deleting}
                                >
                                  <RiDeleteBin5Line size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
          href="/tasks/create"
        />
      </div>

      {/* SUBMISSION MODAL */}
      <Modal
        open={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        width={520}
        title="Submit SubTask"
        showClose
      >
        {selectedSubTask &&
          <form
            className="flex flex-col gap-6 py-1 px-1"
            onSubmit={handleSubmission}
            autoComplete="off"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 grid grid-cols-2 gap-4">
              <div className="text-xs space-y-2">
                <div><span className="font-bold text-gray-500">Task ID:</span> <span className="font-mono text-gray-800">{taskData.taskId || taskId}</span></div>
                <div><span className="font-bold text-gray-500">SubTask ID:</span> <span className="font-mono text-gray-800">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Program:</span> <span className="text-gray-800">{selectedSubTask.program ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Jigar No:</span> <span className="text-gray-800">{selectedSubTask.jigarNo ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Status:</span> <span className="text-gray-800">{selectedSubTask.status ?? '-'}</span></div>
              </div>
              <div className="text-xs space-y-2">
                <div><span className="font-bold text-gray-500">MTR:</span> <span className="text-gray-800">{selectedSubTask.mtr ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">MTR After Sinkage:</span> <span className="text-gray-800">
                  {computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, taskData?.sinkage)}
                </span></div>
                <div><span className="font-bold text-gray-500">Payment Status:</span> <span className="text-gray-800">{selectedSubTask.submission?.paymentStatus ?? '-'}</span></div>
                <div><span className="font-bold text-gray-500">Remark:</span> <span className="text-gray-800">{selectedSubTask.remark ?? '-'}</span></div>
              </div>
            </div>

            {/* Existing submission details, for context while editing */}
            {selectedSubTask.submission && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-5 py-4">
                <div className="font-bold text-orange-700 mb-2 text-xs uppercase tracking-wide">Current Submission</div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-700">
                  <div><span className="font-semibold">Fabric Party:</span> <span>{selectedSubTask.submission.fabricPartyName ?? '-'}</span></div>
                  <div><span className="font-semibold">Receiver Party:</span> <span>{selectedSubTask.submission.recieverPartyName ?? '-'}</span></div>
                  <div><span className="font-semibold">Length:</span> <span>{selectedSubTask.submission.length ?? '-'}</span></div>
                  <div><span className="font-semibold">MTR:</span> <span>{selectedSubTask.submission.MTR ?? '-'}</span></div>
                  <div><span className="font-semibold">Payment:</span> <span>{selectedSubTask.submission.Payment ?? '-'}</span></div>
                  <div><span className="font-semibold">Status:</span> <span>{selectedSubTask.submission.paymentStatus ?? '-'}</span></div>
                  <div><span className="font-semibold">Challan No:</span> <span>{selectedSubTask.submission.challanNo ?? '-'}</span></div>
                  <div>
                    <span className="font-semibold">Challan Photo:</span>{' '}
                    {renderChallanPhotoLink(selectedSubTask.submission.challanPhotoPath)}
                  </div>
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
                    <option value="" disabled>
                      {dropdownLoading ? "Loading..." : "Select Party Name"}
                    </option>
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
                    <option value="" disabled>
                      {dropdownLoading ? "Loading..." : "Select Receiver Name"}
                    </option>
                    {dropdownOptions.receiverPartyNames.map((name, i) => (
                      <option key={name || i} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Length</label>
                  <input
                    name="length"
                    type="number"
                    min={0}
                    placeholder="Length"
                    value={submissionForm.length}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                  />
                </div>
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={submissionForm.paymentStatus}
                    onChange={handleSubmissionFormChange}
                    className={pillInput}
                  >
                    {PAYMENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.text}</option>
                    ))}
                  </select>
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
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Challan Photo</label>
                  <input
                    name="challanPhotoPath"
                    type="file"
                    accept="image/*"
                    onChange={handleSubmissionFormChange}
                    className={fileInput}
                  />
                  {submissionForm.challanPhotoPath && submissionForm.challanPhotoPath instanceof File && (
                    <span className="text-xs text-orange-600 font-medium mt-1">{submissionForm.challanPhotoPath.name}</span>
                  )}
                </div>
              </div>
            </div>
            {error &&
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>
            }
            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedSubTask.submission &&
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2.5 text-red-600 font-semibold text-sm transition"
                  onClick={() => handleSubmissionDelete(selectedSubTask)}
                  disabled={deleting}
                  title="Delete submission"
                >
                  <RiDeleteBin5Line size={16} />
                  Delete
                </button>
              }
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition"
                onClick={() => { setShowSubmissionModal(false); setError(''); setSuccess(''); }}
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
                {selectedSubTask.submission ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        }
      </Modal>

      {/* SUBMISSION DETAILS VIEW MODAL */}
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
              SubTask <span className="font-mono bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm">{subTaskForSubmissionDetails.subTaskId ?? subTaskForSubmissionDetails._id ?? '-'}</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col gap-2.5 text-sm">
              <div>
                <span className="font-bold text-gray-500">Fabric Party: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.fabricPartyName ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Receiver Party: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.recieverPartyName ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Length: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.length ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">MTR: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.MTR ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Payment: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.Payment ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500">Status: </span>
                <StatusBadgeTask
                  label={PAYMENT_STATUS_OPTIONS.find(o => o.value === subTaskForSubmissionDetails.submission.paymentStatus)?.text || subTaskForSubmissionDetails.submission.paymentStatus}
                  tone={PAYMENT_STATUS_TONE[subTaskForSubmissionDetails.submission.paymentStatus] || 'neutral'}
                />
              </div>
              <div>
                <span className="font-bold text-gray-500">Challan No: </span>
                <span className="text-gray-800">{subTaskForSubmissionDetails.submission.challanNo ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Challan Photo: </span>
                {renderChallanPhotoLink(subTaskForSubmissionDetails.submission.challanPhotoPath)}
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-2.5 text-red-600 font-semibold text-sm transition"
                onClick={() => handleSubmissionDelete(subTaskForSubmissionDetails)}
                disabled={deleting}
                title="Delete submission"
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
    </div>
  )
}

export default SubmissionManagement