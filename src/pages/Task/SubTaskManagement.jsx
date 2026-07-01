
import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { RiAddCircleLine, RiEdit2Line, RiDeleteBinLine, RiCloseLine, RiCheckLine, RiFileCopy2Line, RiFilterLine } from 'react-icons/ri'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import axios from 'axios'
import WorkflowHeader from '../../components/common/WorkflowHeader'
import NextStepBanner from '../../components/common/NextStepBanner'
// import StatusBadgeTask from '../../components/common/StatusBadgeTask'
import EmptyState from '../../components/common/EmptyState'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const initialSubTask = {
  program: '',
  jigarNo: '',
  mtr: '',
  mtrShort: '',
  // status: 'pending', // Removed
  remark: ''
}

// --- Copy to clipboard utility using toast alerts ---
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied Task ID');
  } catch (err) {
    toast.error('Failed to copy');
  }
}

const labelClass = 'block text-xs font-bold uppercase tracking-wide text-gray-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const pillInputSm =
  'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition'

// Helper to calculate MTR ( L100 ) based on rule
function calculateTotalMTR(rawMTR, length) {
  if (rawMTR === undefined || rawMTR === null || length === undefined || length === null) return 0;
  const numMTR = Number(rawMTR);
  const numLength = Number(length);
  if (isNaN(numMTR) || isNaN(numLength)) return 0;
  const total = numMTR - ((100 - numLength) / 100) * numMTR;
  return Number.isFinite(total) ? total : 0;
}

// Helper to sum all subTask MTR+MTRShort, optionally skipping an index (for edit)
function sumSubTaskMTRPlusShort(subTasks, skipIdx = null) {
  return subTasks.reduce((sum, subTask, idx) => {
    if (skipIdx !== null && idx === skipIdx) return sum
    const mtr = subTask.mtr !== undefined && subTask.mtr !== '' ? Number(subTask.mtr) : 0;
    const mtrShort = subTask.mtrShort !== undefined && subTask.mtrShort !== '' ? Number(subTask.mtrShort) : 0;
    return sum + mtr + mtrShort;
  }, 0);
}

const defaultPendingTasksFilter = {
  fromDate: '',
  toDate: '',
  partyName: '',
  transportName: '',
  receiverName: '',
  fabricType: '',
  programName: '',
  jigarNo: '',
  page: 1,
  pageSize: 20,
};

const SubTaskManagement = () => {
  const [taskId, setTaskId] = useState('')
  const [taskMeta, setTaskMeta] = useState({
    FabricType: '',
    partyName: '',
    BuiltyNo: '',
    TotalMTR: '',
    Length: '', // Added Length here for calculation
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
  // Filter and pagination for tasks with pending subtasks
  const [tasksWithPendingSubtasks, setTasksWithPendingSubtasks] = useState([])
  const [tasksWithPendingSubtasksPagination, setTasksWithPendingSubtasksPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [pendingTasksFilter, setPendingTasksFilter] = useState({ ...defaultPendingTasksFilter })
  const [loadingTasksList, setLoadingTasksList] = useState(true)
  const [availableTaskFilters, setAvailableTaskFilters] = useState({
    partyNames: [],
    transportNames: [],
    receiverNames: [],
    fabricTypes: [],
    programNames: [],
    jigarNos: [],
  });
  const formRef = useRef(null)

  // Fetch dropdowns for subtasks modal (programs + jigars)
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`)
        if (res.data?.success && res.data.data) {
          setDropdownPrograms(res.data.data.programName || [])
          setDropdownJigarNos(res.data.data.jigars || [])
          // Collect filter dropdown values here for main filter bar:
          setAvailableTaskFilters(filterState => ({
            ...filterState,
            partyNames: res.data.data.partyName,
            transportNames: res.data.data.transportName,
            receiverNames: res.data.data.recieverName,
            fabricTypes: res.data.data.fabricType,
            programNames: res.data.data.programName || [],
            jigarNos: res.data.data.jigars || []
          }))
        } else {
          setDropdownPrograms([])
          setDropdownJigarNos([])
          setAvailableTaskFilters(filterState => ({
            ...filterState,
            programNames: [],
            jigarNos: []
          }))
        }
      } catch {
        setDropdownPrograms([])
        setDropdownJigarNos([])
        setAvailableTaskFilters(filterState => ({
          ...filterState,
          programNames: [],
          jigarNos: []
        }))
      }
    }
    fetchDropdowns()
  }, [])

  // Fetch unique filter values (for main tasks filter bar)
  useEffect(() => {
    const fetchOtherDropdownFilters = async () => {
      try {
        // A new BE endpoint could expose all the relevant fields as flat arrays; fallback to /tasks/filters if not available
        const res = await axios.get(`${API_BASE_URL}/tasks/filters`)
        if (res.data?.success && res.data.data) {
          setAvailableTaskFilters(filterState => ({
            ...filterState,
            partyNames: res.data.data.partyNames || [],
            transportNames: res.data.data.transportNames || [],
            receiverNames: res.data.data.receiverNames || [],
            fabricTypes: res.data.data.fabricTypes || [],
            // programNames, jigarNos included in dropdowns useEffect above
          }))
        }
      } catch {
        setAvailableTaskFilters(f => ({
          ...f,
          partyNames: [],
          transportNames: [],
          receiverNames: [],
          fabricTypes: [],
        }))
      }
    }
    fetchOtherDropdownFilters()
  }, [])

  // Fetch list of Tasks with pending subtasks (with filters & pagination)
  useEffect(() => {
    const fetchTasksList = async () => {
      setLoadingTasksList(true)
      try {
        // Prepare filter params
        const params = {
          ...pendingTasksFilter,
          page: pendingTasksFilter.page || 1,
          pageSize: pendingTasksFilter.pageSize || 20,
        }
        // Remove empty string filters
        Object.keys(params).forEach(k => {
          if (params[k] === '') delete params[k]
        });
        const res = await axios.get(`${API_BASE_URL}/tasks/with-pending-subtasks`, { params });
        console.log(res.data)

        // Accepts format: { success: true, data: [...], total, page, pageSize, totalPages }
        if (res.data?.success && Array.isArray(res.data.data)) {
          setTasksWithPendingSubtasks(res.data.data)
          setTasksWithPendingSubtasksPagination({
            page: res.data.page || 1,
            pageSize: res.data.pageSize || 20,
            total: res.data.total || res.data.data.length || 0,
            totalPages: res.data.totalPages || 1,
          })
        } else {
          setTasksWithPendingSubtasks([])
          setTasksWithPendingSubtasksPagination({ page: 1, pageSize: 20, total: 0, totalPages: 1 })
        }
      } catch {
        setTasksWithPendingSubtasks([])
        setTasksWithPendingSubtasksPagination({ page: 1, pageSize: 20, total: 0, totalPages: 1 })
      }
      setLoadingTasksList(false)
    }
    fetchTasksList()
    // eslint-disable-next-line
  }, [
    pendingTasksFilter.page,
    pendingTasksFilter.pageSize,
    pendingTasksFilter.fromDate,
    pendingTasksFilter.toDate,
    pendingTasksFilter.partyName,
    pendingTasksFilter.transportName,
    pendingTasksFilter.receiverName,
    pendingTasksFilter.fabricType,
    pendingTasksFilter.programName,
    pendingTasksFilter.jigarNo
  ])

  // Fetch Task + Subtasks by taskId
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
            Length: t.Length !== undefined && t.Length !== null ? t.Length : '',
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
            BuiltyNo: '',
            TotalMTR: '',
            Length: ''
          })
          setSubTasks([])
          setPagination(pg => ({ ...pg, total: 0 }))
        }
      } catch (error) {
        setError('Failed to fetch task or sub-tasks')
        setTaskMeta({
          FabricType: '',
          partyName: '',
          BuiltyNo: '',
          TotalMTR: '',
          Length: ''
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
      // status: subTask.status || 'pending', // Removed
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
      setError('Please select a Task first.')
      return
    }
    if (!form.program || !form.jigarNo) {
      setError('Please fill required fields (Program/Jigar).')
      return
    }

    const rawMTR = form.mtr !== '' ? Number(form.mtr) : 0;
    const rawMTRShort = form.mtrShort !== '' ? Number(form.mtrShort) : 0;
    const taskLength = (taskMeta.Length !== undefined && taskMeta.Length !== '') ? Number(taskMeta.Length) : 100;
    const totalMTR_L100 = calculateTotalMTR(
      (taskMeta.TotalMTR !== undefined && taskMeta.TotalMTR !== '') ? taskMeta.TotalMTR : 0,
      taskLength
    );

    // For validation: sum of (mtr+mtrShort) for other subTasks (ignoring editing subtask if editing)
    const sumOtherSubTaskMTRPlusShort = sumSubTaskMTRPlusShort(subTasks, editIdx);

    const totalAfterThis = sumOtherSubTaskMTRPlusShort + rawMTR + rawMTRShort;
    const remainingMTR = +(totalMTR_L100 - sumOtherSubTaskMTRPlusShort).toFixed(2)

    if (totalAfterThis > totalMTR_L100) {
      setError(`Remaining MTR (L100) is ${remainingMTR < 0 ? 0 : remainingMTR}. Entry exceeds allowed limit.`)
      return
    }

    const payload = {
      ...form,
      mtr: form.mtr !== '' ? Number(form.mtr) : '',
      mtrShort: form.mtrShort !== '' ? Number(form.mtrShort) : '',
    }
    // Remove status if present on payload to align with BE
    delete payload.status

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

  // Handle selection from pending task "table"
  const handleSelectTaskFromTable = (selectedTask) => {
    setTaskId(selectedTask.taskId)
    setEditIdx(null)
    setForm(initialSubTask)
    setError('')
    setSubTasks([])
    setTaskMeta({ FabricType: '', partyName: '', BuiltyNo: '', TotalMTR: '', Length: '' })
    setPagination({ page: 1, pageSize: 20, total: 0 })
  }

  // Legacy manual Task ID input (keep for backup only)
  const [inputTaskId, setInputTaskId] = useState('');
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
    setTaskMeta({ FabricType: '', partyName: '', BuiltyNo: '', TotalMTR: '', Length: '' })
    setPagination({ page: 1, pageSize: 20, total: 0 })
  }

  function SubTaskTable({ columns, data, loading, striped, className }) {
    // Calculate remaining MTR (L100) for showing
    const totalMTR_L100 = calculateTotalMTR(
      (taskMeta.TotalMTR !== undefined && taskMeta.TotalMTR !== '') ? taskMeta.TotalMTR : 0,
      (taskMeta.Length !== undefined && taskMeta.Length !== '') ? taskMeta.Length : 100
    );
    const sumSubTasksMTRPlusShort = sumSubTaskMTRPlusShort(subTasks, null);
    const remainingMTR_L100 = +(totalMTR_L100 - sumSubTasksMTRPlusShort).toFixed(2);

    return (
      <div className={`relative overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm ${className || ''}`}>
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 py-3 font-bold text-xs uppercase tracking-wide text-gray-500 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.noWrap ? 'whitespace-nowrap' : ''}`}
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
                <td colSpan={columns.length} className="px-4 py-14 text-center text-orange-400 font-medium">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState icon="🧵" text="No sub-tasks found for this task yet" />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  className={`${striped && idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'} border-b border-gray-100 transition-colors hover:bg-orange-50/40`}
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
    const totalPages = Math.ceil((pagination?.total ?? 0) / (pagination?.pageSize ?? 20)) || 1
    const handlePrev = () => {
      if (pagination.page > 1) onChange({ ...pagination, page: pagination.page - 1 })
    }
    const handleNext = () => {
      if (pagination.page < totalPages) onChange({ ...pagination, page: pagination.page + 1 })
    }
    return (
      <div className={`flex gap-2 items-center justify-end ${className || ''} mt-4`}>
        <button
          className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:border-orange-300 hover:text-orange-600 text-gray-600 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={pagination.page === 1}
          type="button"
        >
          Prev
        </button>
        <span className="text-sm text-gray-500">
          Page <span className="font-semibold text-gray-900">{pagination.page}</span> /{' '}
          <span className="font-semibold text-gray-900">{totalPages}</span>
        </span>
        <button
          className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:border-orange-300 hover:text-orange-600 text-gray-600 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={pagination.page >= totalPages}
          type="button"
        >
          Next
        </button>
      </div>
    )
  }

  // Columns: Remove Status column for subTask grid
  const columns = [
    {
      title: 'SubTask ID',
      key: 'subTaskId',
      render: row => (
        <span className="font-mono text-gray-700 text-xs bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{row.subTaskId || row._id || '-'}</span>
      ),
      width: 130,
      noWrap: true
    },
    {
      title: 'Program',
      key: 'program',
      render: row => <span className="font-medium text-gray-900">{row.program}</span>,
      width: 130
    },
    {
      title: 'Jigar No',
      key: 'jigarNo',
      render: row => <span className="text-gray-700">{row.jigarNo}</span>,
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
    // Status column removed
    {
      title: 'Remark',
      key: 'remark',
      render: row => <span className="text-gray-600">{row.remark}</span>,
      width: 160
    },
    {
      title: 'Action',
      render: (_row, idx) => (
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-orange-300 hover:text-orange-600 p-2 transition"
            onClick={() => openEditModal(idx)}
            title="Edit"
          >
            <RiEdit2Line size={16} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-2 transition"
            onClick={() => handleDelete(idx)}
            title="Delete"
          >
            <RiDeleteBinLine size={16} />
          </button>
        </div>
      ),
      width: 100,
      align: 'center'
    }
  ]

  // CLIPBOARD BUTTON: For taskId and subTaskId copy 
  const CopyButton = ({ label = 'Copy', value }) => (
    <button
      className="ml-2 inline-flex items-center justify-center rounded-full border border-orange-200 text-orange-600 hover:bg-orange-50 active:bg-orange-100 p-1 transition"
      title={`Copy ${label}`}
      type="button"
      onClick={e => {
        e.stopPropagation();
        copyToClipboard(value)
      }}
      style={{ lineHeight: 1 }}
      tabIndex={0}
    >
      <RiFileCopy2Line size={15} />
    </button>
  );

  // Modified TaskMetaInfo to show Remaining MTR ( L100 )
  function TaskMetaInfo({ taskMeta, subTasks }) {
    // Calculate Total MTR L100 and Remaining MTR L100
    const totalMTR_L100 =
      taskMeta && taskMeta.TotalMTR !== undefined && taskMeta.Length !== undefined && taskMeta.Length !== ''
        ? calculateTotalMTR(Number(taskMeta.TotalMTR), Number(taskMeta.Length))
        : 0;

    const totalSubTasksMTRSum = sumSubTaskMTRPlusShort(subTasks || [], null);
    const remainingMTR_L100 = +(totalMTR_L100 - totalSubTasksMTRSum).toFixed(2);

    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 flex flex-col gap-2 px-6 py-4 mb-5">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-400">Fabric Type</span>
          <span className="text-sm font-semibold text-gray-800">{taskMeta.FabricType}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-400">Party Name</span>
          <span className="text-sm font-semibold text-gray-800">{taskMeta.partyName}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-400">Builty No</span>
          <span className="text-sm font-semibold text-gray-800">{taskMeta.BuiltyNo}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-400">MTR ( L100 )</span>
          <span className="text-sm font-extrabold text-orange-600">
            {totalMTR_L100}
            {taskMeta.Length !== '' && (
              <span className="ml-2 text-xs font-normal text-gray-500">(Calculated&nbsp;from&nbsp;MTR&nbsp;and&nbsp;Length)</span>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-gray-400">Length</span>
          <span className="text-sm font-semibold text-gray-800">{taskMeta.Length}</span>
        </div>
        <div className="flex flex-col mt-2">
          <span className="text-xs uppercase font-bold text-green-600">
            Remaining MTR ( L100 ):
          </span>
          <span className={`text-sm font-bold ${remainingMTR_L100 < 0 ? 'text-red-500' : 'text-green-700'}` }>
            {remainingMTR_L100 < 0 ? 0 : remainingMTR_L100}
          </span>
        </div>
      </div>
    )
  }

  // Pending Tasks Filters UI
  function PendingTasksFiltersBar({ filter, setFilter, available }) {
    function handleInputChange(e) {
      const { name, value } = e.target;
      setFilter(prev => ({
        ...prev,
        [name]: value,
        page: 1, // reset to first page on filter change
      }));
    }
    // Optional: Quick clear filter handler
    function clearFilters() {
      setFilter({ ...defaultPendingTasksFilter, pageSize: filter.pageSize });
    }
    return (
      <div className="flex flex-wrap items-end gap-y-2 gap-x-4 mb-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1 mb-0.5">
          <RiFilterLine size={18} className="text-orange-400"/> 
          <span className="font-semibold text-gray-600">Filter Tasks:</span>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">From Date</label>
          <input
            type="date"
            name="fromDate"
            value={filter.fromDate}
            onChange={handleInputChange}
            className={pillInputSm}
            max={filter.toDate}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">To Date</label>
          <input
            type="date"
            name="toDate"
            value={filter.toDate}
            onChange={handleInputChange}
            min={filter.fromDate}
            className={pillInputSm}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Party Name</label>
          <select name="partyName" value={filter.partyName} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.partyNames.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Transport Name</label>
          <select name="transportName" value={filter.transportName} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.transportNames.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Receiver Name</label>
          <select name="receiverName" value={filter.receiverName} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.receiverNames.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Fabric Type</label>
          <select name="fabricType" value={filter.fabricType} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.fabricTypes.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Program</label>
          <select name="programName" value={filter.programName} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.programNames.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Jigar No</label>
          <select name="jigarNo" value={filter.jigarNo} onChange={handleInputChange} className={pillInputSm}>
            <option value="">All</option>
            {available.jigarNos.map((val) => (
              <option value={val} key={val}>{val}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 font-semibold mb-1">Page Size</label>
          <select
            name="pageSize"
            value={filter.pageSize}
            onChange={e => {
              setFilter(prev => ({
                ...prev,
                pageSize: parseInt(e.target.value, 10),
                page: 1,
              }));
            }}
            className={pillInputSm}
          >
            {[10, 20, 30, 40, 50, 100].map(size => (
              <option value={size} key={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-end">
          <button
            type="button"
            className="px-3 py-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-semibold text-xs ml-3"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    )
  }

  // Pending Tasks Table with filter and pagination
  function PendingTasksTable({ tasks, loading, selectedTaskId, onSelect, pagination, onPageChange }) {
    return (
      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm my-3">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Task ID</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Fabric Type</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Party Name</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Transport Name</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Receiver Name</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Builty No</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">MTR</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">MTR ( L100 )</th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-orange-400 font-medium">Loading...</td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState icon="🧵" text="No tasks with pending subtasks found." />
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr
                  key={task.taskId}
                  className={`border-b border-gray-100 text-center cursor-pointer ${
                    selectedTaskId === task.taskId
                      ? 'bg-orange-50/40'
                      : 'hover:bg-orange-100/50 transition'
                  }`}
                >
                  <td className="px-4 py-2 font-mono text-base font-semibold text-gray-800 whitespace-nowrap flex items-center justify-center">
                    {task.taskId}
                    <CopyButton value={task.taskId} label="Task ID" />
                  </td>
                  <td className="px-4 py-2">{task.FabricType || '-'}</td>
                  <td className="px-4 py-2">{task.partyName || '-'}</td>
                  <td className="px-4 py-2">{task.transportName || '-'}</td>
                  <td className="px-4 py-2">{task.receiverName || '-'}</td>
                  <td className="px-4 py-2">{task.BuiltyNo || '-'}</td>
                  <td className="px-4 py-2">{task.MTR || '-'}</td>
                  <td className="px-4 py-2">{calculateTotalMTR(Number(task.MTR), Number(task.Length)) || '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      className={`rounded-full font-semibold text-xs px-5 py-1.5 transition ${
                        selectedTaskId === task.taskId
                          ? "bg-orange-500 text-white"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      }`}
                      onClick={() => onSelect(task)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* PAGINATION controls */}
        <div className="p-3">
          <CustomPagination
            pagination={pagination}
            onChange={onPageChange}
          />
        </div>
      </div>
    )
  }

  // Add Clipboard Button to the top "meta" pane, near the current TaskId
  const TaskIdDisplayWithCopy = ({ taskId }) => {
    if (!taskId) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-white mb-2">
        <span className="font-mono font-bold text-base text-orange-700">Task ID:</span>
        <span className="font-mono text-base text-gray-800">{taskId}</span>
        <CopyButton value={taskId} label="Task ID" />
      </div>
    )
  }

  // Expose subTasks in window for Modal info rendering (hack for Modal, not ideal but works in this layout)
  window.__SUBTASKS_REF = subTasks;

  return (
    <div className="min-h-screen bg-white">
      <WorkflowHeader
        activeStep="subtask"
        topLabel="Fabric Task Workflow"
        title="SubTask Management"
        subtitle="Select a Task with pending SubTasks to view and manage its sub-tasks."
      />

      <div className="max-w-6xl mx-auto px-2 md:px-6 sm:px-10 pb-6">
        <div className="flex flex-col gap-3 mb-7">

          {/* Filters for pending tasks (new UI) */}
          <PendingTasksFiltersBar
            filter={pendingTasksFilter}
            setFilter={setPendingTasksFilter}
            available={availableTaskFilters}
          />

          {/* New Pending Tasks Table */}
          <label className="font-semibold text-gray-500 text-sm pl-1 whitespace-nowrap mb-1">
            Tasks with Pending SubTasks
          </label>
          <PendingTasksTable
            tasks={tasksWithPendingSubtasks}
            loading={loadingTasksList}
            selectedTaskId={taskId}
            onSelect={handleSelectTaskFromTable}
            pagination={tasksWithPendingSubtasksPagination}
            onPageChange={pg => setPendingTasksFilter(f => ({ ...f, ...pg }))}
          />

          {/* Fallback/manual task ID input (still keep) */}
          <form
            className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white py-2 px-2 rounded-full border border-gray-200 shadow-sm flex-1 max-w-xl"
            onSubmit={handleTaskIdSubmit}
          >
            <label htmlFor="taskIdInput" className="font-semibold text-gray-500 text-sm pl-3 whitespace-nowrap">
              OR Enter Task ID
            </label>
            <input
              id="taskIdInput"
              name="taskIdInput"
              type="text"
              placeholder="e.g. TASK0012"
              value={inputTaskId}
              onChange={e => setInputTaskId(e.target.value)}
              className="flex-1 px-2 py-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none min-w-0"
              autoComplete="off"
            />
            <button
              type="submit"
              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition flex-shrink-0"
            >
              Load Task
            </button>
          </form>

          <button
            className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 shadow-sm transition disabled:bg-gray-200 disabled:text-gray-400 self-end"
            onClick={openAddModal}
            disabled={!taskId}
          >
            <RiAddCircleLine size={18} />
            <span>Add SubTask</span>
          </button>
        </div>

        <TaskIdDisplayWithCopy taskId={taskId} />

        {fetchingTask && <div className="mb-3 text-orange-500 text-sm font-medium text-center">Loading...</div>}
        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium text-center">{error}</div>}

        {!taskId && (
          <div className="rounded-3xl border border-gray-200 bg-white">
            <EmptyState icon="🔎" text="Select a Task with pending subtasks above, or enter ID." />
          </div>
        )}

        {taskId && (
          <div className="mt-2">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-wrap gap-5 px-7 py-6 mb-6 justify-between">
              {/* "Task ID" display with copy button at the top */}
              <div className="flex flex-col min-w-[150px]">
                <span className="text-xs uppercase font-bold text-gray-400">Task ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-orange-700">{taskId}</span>
                  <CopyButton value={taskId} label="Task ID" />
                </div>
              </div>
              <div className="flex flex-col min-w-[150px]">
                <span className="text-xs uppercase font-bold text-gray-400">Fabric Type</span>
                <span className="text-base font-semibold text-gray-900">{taskMeta.FabricType}</span>
              </div>
              <div className="flex flex-col min-w-[150px]">
                <span className="text-xs uppercase font-bold text-gray-400">Party Name</span>
                <span className="text-base font-semibold text-gray-900">{taskMeta.partyName}</span>
              </div>
              <div className="flex flex-col min-w-[100px]">
                <span className="text-xs uppercase font-bold text-gray-400">Builty No</span>
                <span className="text-base font-semibold text-gray-900">{taskMeta.BuiltyNo}</span>
              </div>
              <div className="flex flex-col min-w-[100px]">
                <span className="text-xs uppercase font-bold text-gray-400">MTR ( L100 )</span>
                <span className="text-base font-extrabold text-orange-600">
                  {/* Show MTR ( L100 ) as per formula */}
                  {(() => {
                    const raw = taskMeta.TotalMTR !== undefined && taskMeta.TotalMTR !== '' ? Number(taskMeta.TotalMTR) : 0;
                    const len = taskMeta.Length !== undefined && taskMeta.Length !== '' ? Number(taskMeta.Length) : 100;
                    const total = calculateTotalMTR(raw, len);
                    return !isNaN(total) ? total : '';
                  })()}
                  {taskMeta.Length !== '' && (
                    <span className="ml-2 text-xs font-normal text-gray-500">(Calculated)</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col min-w-[100px]">
                <span className="text-xs uppercase font-bold text-gray-400">Length</span>
                <span className="text-base font-semibold text-gray-900">{taskMeta.Length}</span>
              </div>
              {/* Show the Remaining MTR ( L100 ) in Task ID details (here) */}
              <div className="flex flex-col min-w-[130px]">
                <span className="text-xs uppercase font-bold text-green-600">Remaining MTR ( L100 )</span>
                <span className="text-base font-bold text-green-700">
                  {(() => {
                    const totalMTR_L100 = taskMeta && taskMeta.TotalMTR !== undefined && taskMeta.Length !== undefined && taskMeta.Length !== ''
                      ? calculateTotalMTR(Number(taskMeta.TotalMTR), Number(taskMeta.Length))
                      : 0;
                    const sumSubTasksMTRPlusShort = sumSubTaskMTRPlusShort(subTasks, null);
                    const remaining = +(totalMTR_L100 - sumSubTasksMTRPlusShort).toFixed(2);
                    return remaining < 0 ? 0 : remaining;
                  })()}
                </span>
              </div>
            </div>
            <SubTaskTable
              columns={[
                // Copy-paste with custom SubTask column:
                {
                  ...columns[0],
                  render: row => (
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-gray-700 text-xs bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                        {row.subTaskId || row._id || '-'}
                      </span>
                      {!!row.subTaskId && (
                        <CopyButton value={row.subTaskId} label="SubTask ID" />
                      )}
                    </span>
                  ),
                },
                ...columns.slice(1)
              ]}
              data={subTasks.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)}
              loading={loading}
              striped={true}
            />
            <div className="py-2 px-2 sm:p-4">
              <CustomPagination
                pagination={pagination}
                onChange={pg => setPagination(pg)}
              />
            </div>
          </div>
        )}

        <NextStepBanner
          text="SubTasks ready? Submit fabric and payment details for each line item next."
          ctaLabel="Go to Submission"
          href="/sub-task-submission"
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        width={520}
        title={editIdx !== null ? 'Edit SubTask' : 'Add New SubTask'}
        showClose
      >
        <>
          {/* 
            For the Modal's info panel, show sum of all SubTask MTR + MTR Short and show Remaining MTR (L100),
            NOT just the current one being added/edited, but sum of all subTasks for info.
          */}
          <TaskMetaInfo taskMeta={taskMeta} subTasks={subTasks} />

          {/* Show sum of all SubTask MTR + MTR Short in modal */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 mb-3 text-blue-900 text-xs font-semibold flex justify-between">
            <span>
              Total of all SubTasks (MTR + MTR Short):&nbsp;
              <span className="font-bold text-sm">
                {sumSubTaskMTRPlusShort(subTasks, null)}
              </span>
            </span>
          </div>

          <form
            className="flex flex-col gap-6 py-1 px-1"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className={labelClass}>Program</label>
                  <select
                    name="program"
                    value={form.program}
                    onChange={handleFormChange}
                    className={pillInput}
                    ref={formRef}
                    required
                  >
                    <option value="">Select</option>
                    {dropdownPrograms.map((pr) => (
                      <option key={pr} value={pr}>{pr}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Jigar No</label>
                  <select
                    name="jigarNo"
                    value={form.jigarNo}
                    onChange={handleFormChange}
                    className={pillInput}
                    required
                  >
                    <option value="">Select</option>
                    {dropdownJigarNos.map(jg => (
                      <option key={jg} value={jg}>{jg}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>MTR</label>
                  <input
                    name="mtr"
                    type="number"
                    placeholder="MTR"
                    value={form.mtr}
                    onChange={handleFormChange}
                    min={0}
                    className={pillInput}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>MTR Short</label>
                  <input
                    name="mtrShort"
                    type="number"
                    placeholder="MTR Short"
                    value={form.mtrShort}
                    onChange={handleFormChange}
                    min={0}
                    className={pillInput}
                  />
                </div>
                {/* Status removed */}
                <div className="flex flex-col">
                  <label className={labelClass}>Remark</label>
                  <input
                    name="remark"
                    type="text"
                    placeholder="Remark"
                    value={form.remark}
                    onChange={handleFormChange}
                    className={pillInput}
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>
              )}

            </div>
            <div className="flex gap-3 items-center justify-end pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 text-sm font-semibold transition"
                onClick={handleCloseModal}
              >
                <RiCloseLine size={16} />
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 text-sm font-semibold shadow-sm transition"
                type="submit"
              >
                <RiCheckLine size={16} />
                {editIdx !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </>
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
        <span className="block p-2 text-center text-red-600 text-base font-semibold">
          Are you sure you want to delete this SubTask? <br /> <span className="font-bold">This action cannot be undone.</span>
        </span>
      </ConfirmDialog>
    </div>
  )
}

export default SubTaskManagement