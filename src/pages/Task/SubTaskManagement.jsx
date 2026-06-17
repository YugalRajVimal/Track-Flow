import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { RiAddCircleLine, RiEdit2Line, RiDeleteBinLine, RiCloseLine } from 'react-icons/ri'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubTask = {
  program: '',
  jigarNo: '',
  mtr: '',
  mtrShort: '',
  status: 'pending',
  remark: ''
}

const SUBTASK_STATUS_OPTIONS = [
  { value: 'pending', text: 'Pending' },
  { value: 'processing', text: 'Processing' },
  { value: 'done', text: 'Done' },
  { value: 'partiallyDone', text: 'Partially Done' },
]

const SubTaskManagement = () => {
  const [inputTaskId, setInputTaskId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [taskMeta, setTaskMeta] = useState({
    FabricType: '',
    partyName: '',
    BuiltyNo: '',
    TotalMTR:'',
  })
  const [subTasks, setSubTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialSubTask)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, idx: null })
  const [editIdx, setEditIdx] = useState(null)
  const [error, setError] = useState('')
  const [dropdownPrograms, setDropdownPrograms] = useState([])
  const [dropdownJigarNos, setDropdownJigarNos] = useState([])
  const [fetchingTask, setFetchingTask] = useState(false)
  const formRef = useRef(null)

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`)
        if (res.data?.success && res.data.data) {
          setDropdownPrograms(res.data.data.programName || [])
          setDropdownJigarNos(res.data.data.jigars || [])
        } else {
          setDropdownPrograms([])
          setDropdownJigarNos([])
        }
      } catch {
        setDropdownPrograms([])
        setDropdownJigarNos([])
      }
    }
    fetchDropdowns()
  }, [])

  // Fetch Task Meta + Subtasks
  useEffect(() => {
    if (!taskId) return
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const taskRes = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, {
          params: { taskId }
        })
        if (taskRes.data?.success && taskRes.data?.data) {
          const t = taskRes.data.data
          setTaskMeta({
            FabricType: t.FabricType || '',
            partyName: t.partyName || '',
            BuiltyNo: t.BuiltyNo || '',
            TotalMTR: t.MTR,
          })

          const subTasksArr = Array.isArray(t.subTask) ? t.subTask : []
          setSubTasks(subTasksArr)
          setPagination(pg => ({
            ...pg,
            total: subTasksArr.length
          }))
        } else {
          setTaskMeta({
            FabricType: '',
            partyName: '',
            BuiltyNo: ''
          })
          setSubTasks([])
          setPagination(pg => ({ ...pg, total: 0 }))
        }
      } catch (error) {
        setError('Failed to fetch task or sub-tasks')
        setTaskMeta({
          FabricType: '',
          partyName: '',
          BuiltyNo: ''
        })
        setSubTasks([])
        setPagination(pg => ({ ...pg, total: 0 }))
      }
      setLoading(false)
    })()
  }, [taskId])

  // Input changes for form
  const handleFormChange = e => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Open modal for Add
  const openAddModal = () => {
    setForm(initialSubTask)
    setEditIdx(null)
    setError('')
    setModalOpen(true)
    setTimeout(() => {
      if (formRef.current) formRef.current.focus()
    }, 200)
  }

  // Open modal for Edit
  const openEditModal = idx => {
    const subTask = subTasks[idx]
    setForm({
      program: subTask.program || '',
      jigarNo: subTask.jigarNo || '',
      mtr: subTask.mtr !== undefined ? String(subTask.mtr) : '',
      mtrShort: subTask.mtrShort !== undefined ? String(subTask.mtrShort) : '',
      status: subTask.status || 'pending',
      remark: subTask.remark || ''
    })
    setEditIdx(idx)
    setError('')
    setModalOpen(true)
    setTimeout(() => {
      if (formRef.current) formRef.current.focus()
    }, 200)
  }

  // Form submit: Add/Edit
  const handleSubmit = async e => {
    if (e) e.preventDefault()
    setError('')
    if (!taskId) {
      setError('Please enter a valid Task ID first.')
      return
    }
    if (!form.program || !form.jigarNo) {
      setError('Please fill required fields (Program/Jigar).')
      return
    }
    const formMtr = form.mtr !== '' ? Number(form.mtr) : 0
    const totalMTR = taskMeta.TotalMTR !== undefined && taskMeta.TotalMTR !== '' ? Number(taskMeta.TotalMTR) : 0
    const sumOtherSubTaskMTR = subTasks.reduce((sum, subTask, idx) => {
      if (editIdx !== null && idx === editIdx) return sum
      const val = subTask.mtr !== undefined && subTask.mtr !== '' ? Number(subTask.mtr) : 0
      return sum + val
    }, 0)
    const totalAfterThis = sumOtherSubTaskMTR + formMtr
    if (totalAfterThis > totalMTR) {
      setError(`Sum of all SubTask MTR (${totalAfterThis}) cannot be greater than TotalMTR (${totalMTR}).`)
      return
    }

    const payload = {
      ...form,
      mtr: form.mtr !== '' ? Number(form.mtr) : '',
      mtrShort: form.mtrShort !== '' ? Number(form.mtrShort) : '',
    }
    try {
      if (editIdx !== null) {
        await axios.put(`${API_BASE_URL}/tasks/${taskId}/subtasks/${editIdx}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/tasks/${taskId}/subtasks`, payload)
      }
      const taskRes = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId } })
      const t = taskRes.data?.data || {}
      const subTaskArr = Array.isArray(t.subTask) ? t.subTask : []
      setSubTasks(subTaskArr)
      setPagination(pg => ({
        ...pg,
        total: subTaskArr.length
      }))
      setModalOpen(false)
      setEditIdx(null)
      setError('')
      toast.success(editIdx !== null ? 'SubTask Updated' : 'SubTask Added')
    } catch {
      setError('Operation failed')
      toast.error('Failed to add/update subtask')
    }
  }

  const handleDelete = idx => {
    setConfirmDialog({
      open: true,
      idx,
    })
  }

  const handleConfirmDelete = async () => {
    if (confirmDialog.idx === null) return
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}/subtasks/${confirmDialog.idx}`)
      const taskRes = await axios.get(`${API_BASE_URL}/tasks/by-task-id`, { params: { taskId } })
      const t = taskRes.data?.data || {}
      const subTaskArr = Array.isArray(t.subTask) ? t.subTask : []
      setSubTasks(subTaskArr)
      setPagination(pg => ({
        ...pg,
        total: subTaskArr.length
      }))
      setConfirmDialog({ open: false, idx: null })
      toast.success('SubTask deleted')
    } catch {
      toast.error('Failed to delete subtask')
      setConfirmDialog({ open: false, idx: null })
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditIdx(null)
    setError('')
  }

  const handleTaskIdSubmit = async e => {
    e.preventDefault()
    if (!inputTaskId || !inputTaskId.trim()) {
      setError('Please enter a Task ID.')
      return
    }
    setError('')
    setFetchingTask(true)
    setTaskId(inputTaskId.trim())
    setFetchingTask(false)
    setEditIdx(null)
    setForm(initialSubTask)
    setSubTasks([])
    setTaskMeta({ FabricType: '', partyName: '', BuiltyNo: '' })
    setPagination({ page: 1, pageSize: 20, total: 0 })
  }

  function SubTaskTable({ columns, data, loading, striped, className }) {
    return (
      <div className={`relative overflow-x-auto ${className || ''}`}>
        <table className="w-full min-w-[980px] border border-gray-200 rounded-t-xl overflow-hidden shadow-sm">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3 border-b border-gray-150 font-semibold text-sm text-gray-700 bg-gradient-to-b from-blue-50 to-blue-100 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.noWrap ? 'whitespace-nowrap' : ''}`}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  No sub-tasks found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  className={`${striped && idx % 2 === 1 ? 'bg-blue-50/70' : 'bg-white'} border-b border-gray-100 transition-colors duration-150 hover:bg-blue-100/50`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`px-4 py-3 align-middle text-sm ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.noWrap ? 'whitespace-nowrap' : ''}`}
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : row[col.key] !== undefined
                          ? row[col.key]
                          : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const CustomPagination = ({ pagination, onChange, className }) => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1
    const handlePrev = () => {
      if (pagination.page > 1) onChange({ ...pagination, page: pagination.page - 1 })
    }
    const handleNext = () => {
      if (pagination.page < totalPages) onChange({ ...pagination, page: pagination.page + 1 })
    }
    return (
      <div className={`flex gap-2 items-center justify-end ${className || ''} mt-4`}>
        <button
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition disabled:opacity-50"
          onClick={handlePrev}
          disabled={pagination.page === 1}
          type="button"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">
          Page <span className="font-semibold">{pagination.page}</span> /{' '}
          <span className="font-semibold">{totalPages}</span>
        </span>
        <button
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition disabled:opacity-50"
          onClick={handleNext}
          disabled={pagination.page >= totalPages}
          type="button"
        >
          Next
        </button>
      </div>
    )
  }

  const columns = [

    // --- Add subTaskId column here ---
    {
      title: 'SubTask ID',
      key: 'subTaskId',
      render: row => (
        <span className="font-mono text-gray-900 text-xs bg-gray-100 rounded px-2 py-1">{row.subTaskId || row._id || '-'}</span>
      ),
      width: 130,
      noWrap: true
    },
    {
      title: 'Program',
      key: 'program',
      render: row => <span className="font-medium text-blue-700">{row.program}</span>,
      width: 130
    },
    {
      title: 'Jigar No',
      key: 'jigarNo',
      render: row => <span className="text-blue-600">{row.jigarNo}</span>,
      width: 120
    },
    {
      title: 'MTR',
      key: 'mtr',
      render: row => <span className="">{row.mtr}</span>,
      width: 80
    },
    {
      title: 'MTR Short',
      key: 'mtrShort',
      render: row => <span className="">{row.mtrShort}</span>,
      width: 100
    },
    {
      title: 'Status',
      key: 'status',
      render: row => (
        <span className={
          row.status === 'done'
            ? 'text-green-600 font-semibold'
            : row.status === 'processing'
              ? 'text-blue-600 font-semibold'
              : row.status === 'partiallyDone'
                ? 'text-orange-500 font-semibold'
                : 'text-gray-500 font-semibold'
        }>
          {SUBTASK_STATUS_OPTIONS.find(s => s.value === row.status)?.text || row.status}
        </span>
      ),
      width: 110
    },
    {
      title: 'Remark',
      key: 'remark',
      render: row => <span className="text-gray-700">{row.remark}</span>,
      width: 160
    },
    {
      title: 'Action',
      render: (_row, idx) => (
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 transition"
            onClick={() => openEditModal(idx)}
            title="Edit"
          >
            <RiEdit2Line size={17} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-600 p-2 transition"
            onClick={() => handleDelete(idx)}
            title="Delete"
          >
            <RiDeleteBinLine size={17} />
          </button>
        </div>
      ),
      width: 90,
      align: 'center'
    }
  ]


  return (
    <div className="px-2 py-6 sm:p-7 max-w-6xl mx-auto bg-gradient-to-t from-white via-blue-50/30 to-white rounded-3xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-7 gap-4">
        <h2 className="font-extrabold text-3xl text-blue-900 tracking-wide">SubTask Management</h2>
        <button
          className="flex items-center gap-2 py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-md transition disabled:bg-gray-300 disabled:text-gray-500"
          onClick={openAddModal}
          disabled={!taskId}
        >
          <RiAddCircleLine size={22} />
          <span>Add SubTask</span>
        </button>
      </div>

      <form
        className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-7 bg-white py-3 px-4 rounded-2xl shadow transition"
        onSubmit={handleTaskIdSubmit}
        style={{ maxWidth: 680 }}
      >
        <label htmlFor="taskIdInput" className="font-medium text-gray-700 mr-2 min-w-max">
          Enter Task ID:
        </label>
        <input
          id="taskIdInput"
          name="taskIdInput"
          type="text"
          placeholder="e.g. TASK0012"
          value={inputTaskId}
          onChange={e => setInputTaskId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-sm text-gray-900 placeholder:text-gray-400 w-48 transition"
          autoComplete="off"
        />
        <button
          type="submit"
          className="py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition"
        >
          Load Task
        </button>
        {fetchingTask && <span className="ml-2 text-gray-500 text-sm">Loading...</span>}
      </form>
      {error && <div className="mb-3 text-red-600 font-semibold text-center">{error}</div>}

      {!taskId &&
        <div className="text-gray-500 pt-8 px-2 text-center text-lg">Please enter a Task ID to manage its sub-tasks.</div>
      }

      {taskId && (
        <div className="mt-2">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-white shadow flex flex-wrap gap-5 px-7 py-6 mb-6 justify-between">
            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs uppercase font-bold text-gray-500">Fabric Type</span>
              <span className="text-base font-semibold text-gray-800">{taskMeta.FabricType}</span>
            </div>
            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs uppercase font-bold text-gray-500">Party Name</span>
              <span className="text-base font-semibold text-gray-800">{taskMeta.partyName}</span>
            </div>
            <div className="flex flex-col min-w-[100px]">
              <span className="text-xs uppercase font-bold text-gray-500">Builty No</span>
              <span className="text-base font-semibold text-gray-800">{taskMeta.BuiltyNo}</span>
            </div>
            <div className="flex flex-col min-w-[100px]">
              <span className="text-xs uppercase font-bold text-gray-500">Total MTR</span>
              <span className="text-base font-extrabold text-blue-900">{taskMeta.TotalMTR}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-x-auto shadow">
            <SubTaskTable
              columns={columns}
              data={subTasks.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)}
              loading={loading}
              striped={true}
              className="min-h-[200px]"
            />
            <div className="py-2 px-2 sm:p-4">
              <CustomPagination
                pagination={pagination}
                onChange={pg => setPagination(pg)}
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        width={520}
        title={editIdx !== null ? 'Edit SubTask' : 'Add New SubTask'}
        showClose
      >
        <form
          className="flex flex-col gap-7 py-1 px-1"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col min-w-[9rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">Program</label>
                <select
                  name="program"
                  value={form.program}
                  onChange={handleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  ref={formRef}
                  required
                >
                  <option value="">Select</option>
                  {dropdownPrograms.map((pr) => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[9rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">Jigar No</label>
                <select
                  name="jigarNo"
                  value={form.jigarNo}
                  onChange={handleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                  required
                >
                  <option value="">Select</option>
                  {dropdownJigarNos.map(jg => (
                    <option key={jg} value={jg}>{jg}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[7rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">MTR</label>
                <input
                  name="mtr"
                  type="number"
                  placeholder="MTR"
                  value={form.mtr}
                  onChange={handleFormChange}
                  min={0}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                />
              </div>
              <div className="flex flex-col min-w-[7rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">MTR Short</label>
                <input
                  name="mtrShort"
                  type="number"
                  placeholder="MTR Short"
                  value={form.mtrShort}
                  onChange={handleFormChange}
                  min={0}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                />
              </div>
              <div className="flex flex-col min-w-[10rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                >
                  {SUBTASK_STATUS_OPTIONS.map(opt =>
                    <option value={opt.value} key={opt.value}>{opt.text}</option>
                  )}
                </select>
              </div>
              <div className="flex flex-col flex-1 min-w-[11rem]">
                <label className="text-xs font-bold text-blue-600 mb-1">Remark</label>
                <input
                  name="remark"
                  type="text"
                  placeholder="Remark"
                  value={form.remark}
                  onChange={handleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 font-semibold"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-xs pt-2 font-semibold">{error}</div>
            )}
          </div>
          <div className="flex gap-5 items-center justify-end pt-4">
            <button
              type="button"
              className="flex items-center px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-semibold shadow"
              onClick={handleCloseModal}
            >
              <RiCloseLine size={16} className="mr-2" />
              Cancel
            </button>
            <button
              className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition"
              type="submit"
            >
              {editIdx !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, idx: null })}
        onConfirm={handleConfirmDelete}
        okText="Delete"
        cancelText="Cancel"
        confirmClass="btn-danger"
        title="Delete SubTask?"
      >
        <span className="block p-2 text-center text-red-700 text-base font-semibold">
          Are you sure you want to delete this SubTask? <br /> <span className="font-bold">This action cannot be undone.</span>
        </span>
      </ConfirmDialog>
    </div>
  )
}

export default SubTaskManagement