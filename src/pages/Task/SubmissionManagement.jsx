import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Modal from '../../components/common/Modal'
import { RiCheckLine, RiCloseLine } from 'react-icons/ri'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubmissionForm = {
  fabricPartyName: '',
  receiverPartyName: '',
  length: '',
  mtr: '',
  payment: '',
  paymentStatus: 'pending',
  remark: ''
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', text: 'Pending' },
  { value: 'paid', text: 'Paid' },
  { value: 'partial', text: 'Partial' },
  { value: 'unpaid', text: 'Unpaid' },
]

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

  // New modal for viewing submission details
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false)
  const [subTaskForSubmissionDetails, setSubTaskForSubmissionDetails] = useState(null)

  const [dropdownOptions, setDropdownOptions] = useState({
    fabricPartyNames: [],
    receiverPartyNames: []
  })
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [dropdownError, setDropdownError] = useState('')

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

  function handleSubTaskSelect(subTask) {
    setSelectedSubTask(subTask)
    setSuccess('')
    setError('')
    setSubmissionForm({
      ...initialSubmissionForm,
      payment: subTask?.submission?.payment || ''
    })
    setShowSubmissionModal(true)
  }

  function handleSubmissionFormChange(e) {
    const { name, value } = e.target
    setSubmissionForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmission(e) {
    e.preventDefault()
    if (!taskData || !selectedSubTask) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    if (!submissionForm.fabricPartyName || !submissionForm.receiverPartyName) {
      setError('Party names are required')
      setSubmitting(false)
      return
    }
    try {
      const url = `${API_BASE_URL}/tasks/${taskId}/subtasks/${selectedSubTask.subTaskId || selectedSubTask._id}/submission`;
      const payload = {
        fabricPartyName: submissionForm.fabricPartyName,
        recieverPartyName: submissionForm.receiverPartyName,
        length: submissionForm.length,
        MTR: submissionForm.mtr,
        Payment: submissionForm.payment,
        paymentStatus: submissionForm.paymentStatus,
      };

      await axios.post(url, payload);
      setSuccess('Submission updated')
      toast.success('Submission updated')
      setShowSubmissionModal(false)
      setSubmissionForm(initialSubmissionForm)
    } catch (ex) {
      setError('Submission failed')
      toast.error('Submission failed')
    }
    setSubmitting(false)
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

  return (
    <div className="px-2 py-6 sm:p-7 max-w-6xl mx-auto bg-gradient-to-t from-white via-blue-50/30 to-white rounded-3xl shadow-lg">
      <h2 className="font-extrabold text-3xl text-blue-900 tracking-wide mb-8 text-center">
        SubTask Submission
      </h2>
      <form
        className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-7 bg-white py-3 px-4 rounded-2xl shadow transition justify-center"
        onSubmit={handleTaskFetch}
        style={{ maxWidth: 680, margin: '0 auto' }}
      >
        <label htmlFor="taskIdInput" className="font-medium text-gray-700 mr-2 min-w-max">
          Enter Task ID:
        </label>
        <input
          id="taskIdInput"
          name="taskIdInput"
          type="text"
          placeholder="e.g. 2"
          value={inputTaskId}
          onChange={e => setInputTaskId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder:text-gray-400 w-48 transition"
          autoComplete="off"
        />
        <button
          type="submit"
          className="py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition"
          disabled={fetching}
        >
          Load Task
        </button>
        {fetching && <span className="ml-2 text-gray-500 text-sm">Loading...</span>}
      </form>
      {error && <div className="mb-3 text-red-600 font-semibold text-center">{error}</div>}
      {success && <div className="mb-3 text-green-600 font-semibold text-center">{success}</div>}
      {dropdownError && (
        <div className="mb-3 text-red-500 text-center text-sm">{dropdownError}</div>
      )}
      {/* Task info and sub tasks */}
      {taskData && (
        <div className="mb-7">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-white shadow flex flex-wrap gap-6 px-7 py-6 mb-4 justify-between">
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs uppercase font-bold text-gray-500">Task ID</span>
              <span className="text-base font-bold text-blue-900">{taskData.taskId || taskId}</span>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs uppercase font-bold text-gray-500">Fabric Type</span>
              <span className="text-base font-semibold text-gray-800">{taskData.FabricType}</span>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs uppercase font-bold text-gray-500">Total MTR</span>
              <span className="text-base font-semibold text-blue-700">{taskData.MTR}</span>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs uppercase font-bold text-gray-500">Party Name</span>
              <span className="text-base font-semibold text-gray-800">{taskData.partyName}</span>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs uppercase font-bold text-gray-500">Builty No</span>
              <span className="text-base font-semibold text-gray-800">{taskData.BuiltyNo}</span>
            </div>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">Sinkage %</span>
              <span className="text-base font-semibold text-pink-700">{taskData.sinkage ?? '-'}</span>
            </div>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">MTR after Sinkage</span>
              <span className="text-base font-semibold text-indigo-700">{taskData.mtrAfterSinkage ?? '-'}</span>
            </div>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">Total Rolls</span>
              <span className="text-base font-semibold text-indigo-700">{taskData.totalRolls ?? '-'}</span>
            </div>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">Receiver Name</span>
              <span className="text-base font-semibold text-indigo-700">{taskData.receiverName ?? '-'}</span>
            </div>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">Remark</span>
              <span className="text-base font-semibold text-indigo-700">{taskData.remark ?? '-'}</span>
            </div>
            {/* Add challanNo */}
            <div className="flex flex-col min-w-[130px]">
              <span className="text-xs uppercase font-bold text-gray-500">Challan No</span>
              <span className="text-base font-semibold text-indigo-700">{taskData.challanNo ?? '-'}</span>
            </div>
          </div>

          {/* SubTask List */}
          <div className="rounded-xl w-full border border-gray-200 bg-white p-4 shadow">
            <h4 className="font-bold text-blue-900 mb-2">Select SubTask for Submission:</h4>
            {subTasks.length === 0 && <div className="text-gray-400 text-center py-8">No sub-tasks found</div>}
            {subTasks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm border border-gray-100">
                  <thead className="bg-blue-50 font-semibold text-gray-700">
                    <tr>
                      <th className="px-3 py-2 whitespace-nowrap">SubTask ID</th>
                      <th className="px-3 py-2 whitespace-nowrap">Program</th>
                      <th className="px-3 py-2 whitespace-nowrap">Jigar No</th>
                      <th className="px-3 py-2 whitespace-nowrap">MTR</th>
                      <th className="px-3 py-2 whitespace-nowrap">MTR After Sinkage</th>
                      <th className="px-3 py-2 whitespace-nowrap">Status</th>
                      <th className="px-3 py-2 whitespace-nowrap">Submission Details</th>
                      <th className="px-3 py-2 whitespace-nowrap">Remark</th>
                      <th className="px-3 py-2 whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subTasks.map((st, idx) => (
                      <tr
                        key={st.subTaskId || st._id || idx}
                        className="border-t border-gray-50 hover:bg-blue-50 transition"
                      >
                        <td className="px-3 py-2 font-mono whitespace-nowrap">{st.subTaskId ?? st._id ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{st.program ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{st.jigarNo ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{st.mtr ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {
                            computeSubTaskMtrAfterSinkage(
                              st.mtr,
                              taskData?.sinkage
                            )
                          }
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{st.status ?? '-'}</td>
                        {/* Submission Details column */}
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {st.submission ? (
                            <button
                              className="py-1 px-4 bg-indigo-100 hover:bg-indigo-200 rounded text-blue-800 font-semibold text-xs border border-indigo-300 transition"
                              onClick={() => handleShowSubmissionDetails(st)}
                              type="button"
                            >
                              View
                            </button>
                          ) : (
                            <span className="italic text-gray-400">No submission</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{st.remark ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            className="py-1.5 px-4 bg-blue-600 hover:bg-blue-800 rounded text-white font-bold text-xs transition"
                            onClick={() => handleSubTaskSelect(st)}
                          >
                            Submit
                          </button>
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
            className="flex flex-col gap-7 py-1 px-1"
            onSubmit={handleSubmission}
            autoComplete="off"
          >
            <div className="grid grid-cols-2 gap-5">
              <div className="text-xs space-y-2">
                <div><span className="font-bold text-gray-600">Task ID:</span> <span className="font-mono">{taskData.taskId || taskId}</span></div>
                <div><span className="font-bold text-gray-600">SubTask ID:</span> <span className="font-mono">{selectedSubTask.subTaskId ?? selectedSubTask._id ?? '-'}</span></div>
                <div><span className="font-bold text-gray-600">Program:</span> <span>{selectedSubTask.program ?? '-'}</span></div>
                <div><span className="font-bold text-gray-600">Jigar No:</span> <span>{selectedSubTask.jigarNo ?? '-'}</span></div>
                <div><span className="font-bold text-gray-600">Status:</span> <span>{selectedSubTask.status ?? '-'}</span></div>
              </div>
              <div className="text-xs space-y-2">
                <div><span className="font-bold text-gray-600">MTR:</span> <span>{selectedSubTask.mtr ?? '-'}</span></div>
                <div><span className="font-bold text-gray-600">MTR After Sinkage:</span> <span>
                  {computeSubTaskMtrAfterSinkage(selectedSubTask.mtr, taskData?.sinkage)}
                </span></div>
                <div><span className="font-bold text-gray-600">Payment Status:</span> <span>{selectedSubTask.submission?.paymentStatus ?? '-'}</span></div>
                <div><span className="font-bold text-gray-600">Remark:</span> <span>{selectedSubTask.remark ?? '-'}</span></div>
                {/* Show all submission details in modal for info */}
                {selectedSubTask.submission && (
                  <div className="pt-2">
                    <div className="bg-gray-50 border border-blue-100 rounded-md px-3 py-2">
                      <div className="font-bold text-blue-700 mb-1 text-xs">Submission Details</div>
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <div>
                          <span className="font-semibold">Fabric Party:</span>{" "}
                          <span>{selectedSubTask.submission.fabricPartyName ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Receiver Party:</span>{" "}
                          <span>{selectedSubTask.submission.recieverPartyName ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Length:</span>{" "}
                          <span>{selectedSubTask.submission.length ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">MTR:</span>{" "}
                          <span>{selectedSubTask.submission.MTR ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Payment:</span>{" "}
                          <span>{selectedSubTask.submission.Payment ?? '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{" "}
                          <span>{selectedSubTask.submission.paymentStatus ?? '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex gap-6">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">Fabric Party Name</label>
                  <select
                    name="fabricPartyName"
                    value={submissionForm.fabricPartyName}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
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
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">Receiver Party Name</label>
                  <select
                    name="receiverPartyName"
                    value={submissionForm.receiverPartyName}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
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
              <div className="flex gap-6">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">Length</label>
                  <input
                    name="length"
                    type="number"
                    min={0}
                    placeholder="Length"
                    value={submissionForm.length}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">MTR</label>
                  <input
                    name="mtr"
                    type="number"
                    min={0}
                    placeholder="MTR"
                    value={submissionForm.mtr}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">Payment</label>
                  <input
                    name="payment"
                    type="number"
                    min={0}
                    placeholder="Payment Amount"
                    value={submissionForm.payment}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-bold text-blue-600 mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={submissionForm.paymentStatus}
                    onChange={handleSubmissionFormChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  >
                    {PAYMENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {error &&
              <div className="text-red-600 text-xs pt-2 font-semibold">{error}</div>
            }
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                className="flex items-center px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-semibold shadow"
                onClick={() => { setShowSubmissionModal(false); setError(''); setSuccess(''); }}
                disabled={submitting}
              >
                <RiCloseLine size={16} className="mr-2" />
                Cancel
              </button>
              <button
                className="flex items-center px-7 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition"
                type="submit"
                disabled={submitting}
              >
                <RiCheckLine size={18} className="mr-2" />
                Submit
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
          <div className="py-2">
            <div className="font-bold text-blue-900 mb-2 text-base text-center">
              SubTask: <span className="font-mono">{subTaskForSubmissionDetails.subTaskId ?? subTaskForSubmissionDetails._id ?? '-'}</span>
            </div>
            <div className="rounded-lg border border-blue-100 px-4 py-3 bg-blue-50/50 flex flex-col gap-2 text-sm">
              <div>
                <span className="font-bold text-gray-700">Fabric Party: </span>
                <span>{subTaskForSubmissionDetails.submission.fabricPartyName ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Receiver Party: </span>
                <span>{subTaskForSubmissionDetails.submission.recieverPartyName ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Length: </span>
                <span>{subTaskForSubmissionDetails.submission.length ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">MTR: </span>
                <span>{subTaskForSubmissionDetails.submission.MTR ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Payment: </span>
                <span>{subTaskForSubmissionDetails.submission.Payment ?? '-'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Status: </span>
                <span>{subTaskForSubmissionDetails.submission.paymentStatus ?? '-'}</span>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="flex items-center px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-semibold shadow"
                onClick={handleCloseSubmissionDetails}
              >
                <RiCloseLine size={16} className="mr-2" />
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 italic">No submission data found.</div>
        )}
      </Modal>
    </div>
  )
}

export default SubmissionManagement