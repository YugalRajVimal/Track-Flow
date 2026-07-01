
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  RiAddLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiUploadCloud2Line,
  RiEyeLine,
  RiDownloadLine,
  RiFileCopy2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import WorkflowHeader from "../../components/common/WorkflowHeader";
import NextStepBanner from "../../components/common/NextStepBanner";
import EmptyState from "../../components/common/EmptyState";

// --- Copy to clipboard with toast ---
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied Task ID");
  } catch (err) {
    toast.error("Failed to copy");
  }
};

function DataTable({
  columns,
  data,
  loading,
  emptyText = "No data found.",
  emptyIcon = "📭",
  rowKey = "id",
  editRowId,
  editRowRender,
  striped = true,
  autoHeight = false,
}) {
  return (
    <div
      className={`relative w-full rounded-3xl bg-white border border-gray-200 shadow-sm ${
        autoHeight ? "" : "overflow-x-auto"
      }`}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.accessor || col.key || col.title}
                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap ${
                  col.className || ""
                }`}
                style={col.style}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-14 text-center text-orange-400 font-medium"
              >
                Loading...
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState icon={emptyIcon} text={emptyText} />
              </td>
            </tr>
          ) : (
            data.map((row, idx) =>
              editRowId && editRowId === (row[rowKey] ?? row.id) ? (
                <tr
                  key={row[rowKey] ?? row.id ?? idx}
                  className="bg-orange-50/60"
                >
                  {editRowRender(row)}
                </tr>
              ) : (
                <tr
                  key={row[rowKey] ?? row.id ?? idx}
                  className={`${
                    striped && idx % 2 === 1 ? "bg-gray-50/60" : ""
                  } border-b border-gray-100 hover:bg-orange-50/40 transition-colors`}
                >
                  {columns.map((col, cidx) => (
                    <td
                      key={col.accessor || col.key || cidx}
                      className={`px-4 py-3 align-middle whitespace-nowrap ${
                        col.cellClassName || ""
                      }`}
                      style={col.cellStyle}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : col.accessor
                        ? row[col.accessor]
                        : undefined}
                    </td>
                  ))}
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getChallanImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  let base = (API_BASE_URL || "").replace(/\/$/, "");
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}

const initialGroupData = {
  challanNo: "",
  partyName: "",
  transportName: "",
  receiverName: "",
  remark: "",
  challanPhotoPath: "",
};

const initialTaskDetail = {
  FabricType: "",
  Length: "",
  BuiltyNo: "",
  MTR: "",
  sinkage: "",
  totalRolls: "",
};

const REQUIRED_TASK_FIELDS = [
  "FabricType",
  "Length",
  "BuiltyNo",
  "MTR",
  "sinkage",
  "totalRolls",
];

const calculateMtrL100 = (MTR, Length) => {
  const mtrNum = parseFloat(MTR);
  const lengthNum = parseFloat(Length);
  if (isNaN(mtrNum) || isNaN(lengthNum)) return "";
  const result = mtrNum - (mtrNum * (100 - lengthNum)) / 100;
  return result === 0 ? "" : Number(result.toFixed(2));
};

const labelClass =
  "block text-xs font-bold uppercase tracking-wide text-gray-600 mb-2";
const pillInput =
  "w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400";
const pillInputSm =
  "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition";
const fileInput =
  "block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100";

function ChallanImageModal({ open, onClose, imageUrl }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-2xl max-w-[90vw] max-h-[90vh] p-5 shadow-2xl flex flex-col items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 transition"
          title="Close"
        >
          <RiCloseLine size={28} />
        </button>
        <img
          src={imageUrl}
          alt="Challan"
          className="max-h-[70vh] max-w-full border rounded-xl mb-2"
          crossOrigin="anonymous"
        />
        <button
          type="button"
          className="inline-flex gap-1 items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-xs font-semibold shadow transition mt-2"
          onClick={async () => {
            try {
              const response = await fetch(imageUrl, { mode: "cors" });
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = imageUrl.split("/").pop() || "challan.jpg";
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (error) {
              alert("Failed to download file.");
            }
          }}
        >
          <RiDownloadLine size={15} /> Download
        </button>
      </div>
    </div>
  );
}

const TaskIdWithCopyBtn = ({ taskId }) => (
  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold bg-gray-100 text-gray-700 rounded-full px-3 py-1 border border-gray-200">
    {taskId}
    <button
      type="button"
      title="Copy Task ID"
      onClick={() => copyToClipboard(taskId)}
      className="p-1 ml-1 rounded hover:bg-orange-100 text-gray-500 hover:text-orange-600"
      style={{ lineHeight: 1, verticalAlign: "middle" }}
    >
      <RiFileCopy2Line size={14} />
    </button>
  </span>
);

// Filter and pagination defaults
const defaultFilters = {
  dateFrom: "",
  dateTo: "",
  partyName: "",
  transportName: "",
  receiverName: "",
  fabricType: "",
};
const pageSizeOptions = [5, 10, 20, 50, 100];

const defaultPagination = {
  page: 1,
  pageSize: 10,
};

const TaskCreationAndManagement = () => {
  const [dropdowns, setDropdowns] = useState({
    partyName: [],
    transportName: [],
    fabricType: [],
    length: [],
    sinkage: [],
    recieverName: [],
  });
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [groupData, setGroupData] = useState(initialGroupData);
  const [taskDetails, setTaskDetails] = useState([{ ...initialTaskDetail }]);
  const [tasks, setTasks] = useState([]);
  const [tasksTotal, setTasksTotal] = useState(0); // <--- pagination support
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTaskData, setEditTaskData] = useState(null);
  const [message, setMessage] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(true);
  const [filePreview, setFilePreview] = useState(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState(null);

  const challanFileInputRef = useRef(null);
  const editChallanFileInputRef = useRef(null);
  const [editChallanFile, setEditChallanFile] = useState(null);

  const [filters, setFilters] = useState({ ...defaultFilters });
  const [pagination, setPagination] = useState({ ...defaultPagination });

  // We fetch dropdowns once, but fetchTasks anytime filters/pagination change
  useEffect(() => {
    fetchDropdownsAndTasks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [filters, pagination.page, pagination.pageSize]);

  const fetchDropdownsAndTasks = async () => {
    setDropdownsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/dropdowns`);
      const d = res.data.data || {};
      setDropdowns({
        partyName: d.partyName || [],
        transportName: d.transportName || [],
        fabricType: d.fabricType || [],
        length: d.length || [],
        sinkage: d.sinkage || [],
        recieverName: d.recieverName || [],
      });
    } catch (err) {
      setMessage(
        "Failed to load dropdowns: " +
          (err?.response?.data?.message || err.message)
      );
      setDropdowns({
        partyName: [],
        transportName: [],
        fabricType: [],
        length: [],
        sinkage: [],
        recieverName: [],
      });
    }
    setDropdownsLoading(false);
  };

  const fetchTasks = async () => {
    setFetching(true);
    setMessage("");
    try {
      // Collect filter values for API params
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.partyName && { partyName: filters.partyName }),
        ...(filters.transportName && { transportName: filters.transportName }),
        ...(filters.receiverName && { receiverName: filters.receiverName }),
        ...(filters.fabricType && { fabricType: filters.fabricType }),
      };
      const res = await axios.get(`${API_BASE_URL}/tasks`, { params });
      setTasks(res.data.data || []);
      setTasksTotal(res.data.total || 0);
    } catch (err) {
      setMessage(
        "Failed to fetch tasks: " +
          (err?.response?.data?.message || err.message)
      );
    }
    setFetching(false);
  };

  const handleGroupDataChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupFileChange = (e) => {
    const file = e.target.files[0] || null;
    setGroupData((prev) => ({
      ...prev,
      challanPhotoPath: file ? file.name : "",
    }));
    setFilePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0] || null;
    setEditChallanFile(file);
  };

  const handlePreviewChallanImage = (photoPath) => {
    if (!photoPath) return;
    const imageUrl = getChallanImageUrl(photoPath);
    setImageModalUrl(imageUrl);
    setImageModalOpen(true);
  };

  const handleTaskDetailChange = (idx, e) => {
    const { name, value } = e.target;
    setTaskDetails((prev) => {
      const updated = [...prev];
      let newTask = { ...updated[idx], [name]: value };
      updated[idx] = newTask;
      return updated;
    });
  };

  const addTaskDetail = () => {
    setTaskDetails((prev) => [...prev, { ...initialTaskDetail }]);
  };

  const removeTaskDetail = (idx) => {
    setTaskDetails((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateTasks = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const createFile = challanFileInputRef.current?.files?.[0];

      for (let tIdx = 0; tIdx < taskDetails.length; tIdx++) {
        const t = taskDetails[tIdx];
        for (let field of REQUIRED_TASK_FIELDS) {
          if (
            t[field] === "" ||
            t[field] === null ||
            t[field] === undefined
          ) {
            setMessage(
              `Task Detail #${tIdx + 1}: ${field.replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
              )} is required.`
            );
            setLoading(false);
            return;
          }
        }
      }

      const cleanedTaskDetails = taskDetails.filter((t) =>
        Object.values(t).some(
          (v) => v !== "" && v !== null && v !== undefined
        )
      );
      const mappedTaskDetails = cleanedTaskDetails.map((t) => ({
        ...t,
      }));

      const formData = new FormData();
      formData.append(
        "groupData",
        JSON.stringify({
          ...groupData,
          challanPhotoPath: undefined,
        })
      );
      formData.append("taskDetails", JSON.stringify(mappedTaskDetails));
      if (createFile) {
        formData.append("file", createFile);
      }

      await axios.post(`${API_BASE_URL}/tasks`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Tasks created successfully!");
      setGroupData(initialGroupData);
      setTaskDetails([{ ...initialTaskDetail }]);
      if (challanFileInputRef.current) challanFileInputRef.current.value = "";
      setFilePreview(null);
      // RE-fetch with filters (effect will re-run)
      setPagination({ ...pagination, page: 1 });
    } catch (err) {
      setMessage(
        "Failed to create tasks: " +
          (err?.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete task?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setMessage("Task deleted!");
      setPagination({ ...pagination }); // to force rerender/fetch
    } catch (err) {
      setMessage(
        "Failed to delete: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  const startEditTask = (task) => {
    setEditId(task.taskId);
    setEditTaskData({
      FabricType: task.FabricType || "",
      Length: task.Length || "",
      BuiltyNo: task.BuiltyNo || "",
      MTR: task.MTR || "",
      sinkage: task.sinkage || "",
      totalRolls: task.totalRolls || "",
    });
    setEditChallanFile(null);
    if (editChallanFileInputRef.current)
      editChallanFileInputRef.current.value = "";
  };

  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();

    for (let field of REQUIRED_TASK_FIELDS) {
      if (
        editTaskData[field] === "" ||
        editTaskData[field] === null ||
        editTaskData[field] === undefined
      ) {
        setMessage(
          `${field.replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
          )} is required in editing task.`
        );
        return;
      }
    }

    try {
      const editPayload = {
        ...editTaskData,
      };
      const formData = new FormData();
      formData.append("updateData", JSON.stringify(editPayload));
      if (editChallanFile) {
        formData.append("file", editChallanFile);
      }

      await axios.put(`${API_BASE_URL}/tasks/${editId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Task updated!");
      setEditId(null);
      setEditTaskData(null);
      setEditChallanFile(null);
      if (editChallanFileInputRef.current)
        editChallanFileInputRef.current.value = "";
      setPagination({ ...pagination }); // refetch
    } catch (err) {
      setMessage(
        "Failed to update: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  const handleCancelEdit = (e) => {
    if (e) e.preventDefault();
    setEditId(null);
    setEditTaskData(null);
    setEditChallanFile(null);
    if (editChallanFileInputRef.current)
      editChallanFileInputRef.current.value = "";
  };

  const renderPhotoCell = (path) => {
    if (!path) return <span className="text-gray-300 text-xs">—</span>;
    if (path.startsWith("/uploads/")) {
      const imageUrl = getChallanImageUrl(path);
      return (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handlePreviewChallanImage(path)}
            type="button"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 underline underline-offset-2 text-xs font-medium"
            title="Preview"
          >
            <RiEyeLine size={15} /> View
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 underline underline-offset-2 text-xs font-medium"
            title="Download"
            onClick={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(imageUrl, { mode: "cors" });
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = imageUrl.split("/").pop() || "challan.jpg";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                alert("Failed to download file.");
              }
            }}
          >
            <RiDownloadLine size={13} /> Download
          </button>
        </div>
      );
    }
    return <span className="text-xs text-gray-400">{path}</span>;
  };

  // Columns: Remove "MTR After Sinkage", add "MTR(L100)"
  const columns = useMemo(
    () => [
      {
        title: "Task ID",
        accessor: "taskId",
        render: (row) => <TaskIdWithCopyBtn taskId={row.taskId} />,
      },
      { title: "Challan No", accessor: "challanNo" },
      { title: "Party Name", accessor: "partyName" },
      { title: "Transport Name", accessor: "transportName" },
      { title: "Receiver Name", accessor: "receiverName" },
      {
        title: "Challan Photo",
        accessor: "challanPhotoPath",
        render: (row) => renderPhotoCell(row.challanPhotoPath),
        cellClassName: "whitespace-nowrap",
      },
      { title: "Fabric Type", accessor: "FabricType" },
      { title: "Length", accessor: "Length" },
      { title: "Builty No", accessor: "BuiltyNo" },
      { title: "MTR", accessor: "MTR" },
      { title: "Sinkage", accessor: "sinkage" },
      {
        title: "MTR(L100)",
        render: (row) => calculateMtrL100(row.MTR, row.Length),
        cellClassName: "text-orange-600 font-semibold",
      },
      { title: "Total Rolls", accessor: "totalRolls" },
      { title: "Remark", accessor: "remark" },
      {
        title: "Actions",
        key: "actions",
        render: (row) => (
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 text-gray-700 hover:border-orange-300 hover:text-orange-600 px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={editId === row.taskId}
              onClick={() => startEditTask(row)}
            >
              <RiEdit2Line size={13} /> Edit
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs font-semibold transition"
              onClick={() => handleDeleteTask(row.taskId)}
            >
              <RiDeleteBinLine size={13} /> Delete
            </button>
          </div>
        ),
        cellClassName: "whitespace-nowrap",
      },
    ],
    [editId, tasks]
  );

  const renderEditRow = useCallback(
    (row) => [
      <td key="taskId" className="px-4 py-3">
        <TaskIdWithCopyBtn taskId={row.taskId} />
      </td>,
      <td key="challanNo" className="px-4 py-3">{row.challanNo}</td>,
      <td key="partyName" className="px-4 py-3">{row.partyName}</td>,
      <td key="transportName" className="px-4 py-3">{row.transportName}</td>,
      <td key="receiverName" className="px-4 py-3">{row.receiverName}</td>,
      <td key="challanPhoto" className="px-4 py-3">{renderPhotoCell(row.challanPhotoPath)}</td>,
      <td key="FabricType" className="px-4 py-3">
        <select
          name="FabricType"
          value={editTaskData.FabricType}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          disabled={dropdownsLoading}
          required
        >
          <option value="">-- Fabric Type --</option>
          {dropdowns.fabricType.map((ft) => (
            <option key={ft} value={ft}>{ft}</option>
          ))}
        </select>
      </td>,
      <td key="Length" className="px-4 py-3">
        <select
          name="Length"
          value={editTaskData.Length}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          disabled={dropdownsLoading}
          required
        >
          <option value="">-- Length --</option>
          {dropdowns.length.map((len) => (
            <option key={len} value={len}>{len}</option>
          ))}
        </select>
      </td>,
      <td key="BuiltyNo" className="px-4 py-3">
        <input
          name="BuiltyNo"
          value={editTaskData.BuiltyNo}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          required
        />
      </td>,
      <td key="MTR" className="px-4 py-3">
        <input
          name="MTR"
          type="number"
          value={editTaskData.MTR}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          required
        />
      </td>,
      <td key="sinkage" className="px-4 py-3">
        <select
          name="sinkage"
          value={editTaskData.sinkage}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          disabled={dropdownsLoading}
          required
        >
          <option value="">-- Sinkage --</option>
          {dropdowns.sinkage.map((sk) => (
            <option key={sk} value={sk}>{sk}</option>
          ))}
        </select>
      </td>,
      <td key="mtrL100" className="px-4 py-3">
        <input
          name="mtrL100"
          value={calculateMtrL100(editTaskData.MTR, editTaskData.Length)}
          readOnly
          className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-orange-600 font-semibold"
        />
      </td>,
      <td key="totalRolls" className="px-4 py-3">
        <input
          name="totalRolls"
          type="number"
          value={editTaskData.totalRolls}
          onChange={handleEditTaskChange}
          className={pillInputSm}
          required
        />
      </td>,
      <td key="remark" className="px-4 py-3 text-gray-600">
        {tasks.find((t) => t.taskId === editId)?.remark}
      </td>,
      <td key="rowActions" className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col gap-2 min-w-[160px]">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Challan Photo
            </label>
            <input
              type="file"
              accept="image/*"
              ref={editChallanFileInputRef}
              onChange={handleEditFileChange}
              className={fileInput}
            />
            {editChallanFile && (
              <span className="block text-xs text-orange-600 mt-1 font-medium">
                Selected: {editChallanFile.name}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              className="inline-flex items-center gap-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-xs font-semibold transition"
              onClick={handleSaveEdit}
              type="button"
            >
              <RiCheckLine size={13} /> Save
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-1.5 text-xs font-semibold transition"
              onClick={handleCancelEdit}
              type="button"
            >
              <RiCloseLine size={13} /> Cancel
            </button>
          </div>
        </div>
      </td>,
    ],
    [editTaskData, editId, dropdowns, dropdownsLoading, tasks, editChallanFile]
  );

  // ---- FILTER ROW ----

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage < 1 ? 1 : newPage > Math.max(Math.ceil(tasksTotal / pagination.pageSize), 1) ? Math.max(Math.ceil(tasksTotal / pagination.pageSize), 1) : newPage,
    }));
  };

  const handlePageSizeChange = (e) => {
    setPagination({ ...pagination, pageSize: Number(e.target.value), page: 1 });
  };

  // Date range for filter convenience
  const minDate = useMemo(() => {
    if (!tasks || tasks.length === 0) return "";
    let min = tasks[0]?.createdAt || "";
    tasks.forEach((t) => {
      if (t.createdAt && t.createdAt < min) min = t.createdAt;
    });
    return min.substr(0, 10);
  }, [tasks]);
  const maxDate = useMemo(() => {
    if (!tasks || tasks.length === 0) return "";
    let max = tasks[0]?.createdAt || "";
    tasks.forEach((t) => {
      if (t.createdAt && t.createdAt > max) max = t.createdAt;
    });
    return max.substr(0, 10);
  }, [tasks]);


  return (
    <div className="min-h-screen bg-white">
      <WorkflowHeader
        activeStep="task"
        topLabel="Fabric Task Workflow"
        title="Task Creation"
        subtitle="Create a challan group, then add one or more fabric task line items under it."
      />

      <ChallanImageModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={imageModalUrl}
      />

      <div className="max-w-6xl mx-auto px-2 md:px-6 sm:px-10 pb-6">
        <div className="flex flex-col gap-8">
          {/* Task Group Details card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Task Group Details
              </h2>
              <button
                type="button"
                className="rounded-full border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-1.5 text-sm font-semibold transition"
                onClick={() => setShowGroupForm((v) => !v)}
                aria-label={showGroupForm ? "Hide" : "Show"}
              >
                {showGroupForm ? "Hide ▲" : "Show ▼"}
              </button>
            </div>
            {showGroupForm && (
              <form
                onSubmit={handleCreateTasks}
                className="flex flex-col gap-8"
                encType="multipart/form-data"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>
                      Challan No <span className="text-orange-500">*</span>
                    </label>
                    <input
                      name="challanNo"
                      type="text"
                      required
                      value={groupData.challanNo}
                      onChange={handleGroupDataChange}
                      className={pillInput}
                      placeholder="Challan No"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Party Name <span className="text-orange-500">*</span>
                    </label>
                    <select
                      name="partyName"
                      value={groupData.partyName}
                      onChange={handleGroupDataChange}
                      required
                      className={pillInput}
                      disabled={dropdownsLoading}
                    >
                      <option value="">-- Select Party --</option>
                      {dropdowns.partyName.map((party) => (
                        <option key={party} value={party}>
                          {party}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Transport Name</label>
                    <select
                      name="transportName"
                      value={groupData.transportName}
                      onChange={handleGroupDataChange}
                      className={pillInput}
                      disabled={dropdownsLoading}
                    >
                      <option value="">-- Select Transport --</option>
                      {dropdowns.transportName.map((transport) => (
                        <option key={transport} value={transport}>
                          {transport}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Receiver Name <span className="text-orange-500">*</span>
                    </label>
                    <select
                      name="receiverName"
                      value={groupData.receiverName}
                      onChange={handleGroupDataChange}
                      required
                      className={pillInput}
                      disabled={dropdownsLoading}
                    >
                      <option value="">-- Select Receiver --</option>
                      {dropdowns.recieverName.map((receiver) => (
                        <option key={receiver} value={receiver}>
                          {receiver}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Remark</label>
                    <input
                      name="remark"
                      value={groupData.remark}
                      onChange={handleGroupDataChange}
                      className={pillInput}
                      placeholder="Remark"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Challan Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="file"
                      ref={challanFileInputRef}
                      onChange={handleGroupFileChange}
                      className={fileInput}
                    />
                    {filePreview && (
                      <>
                        <span className="block text-xs text-orange-600 mt-1.5 font-medium">
                          File selected
                        </span>
                        <div className="mt-2">
                          <img
                            src={filePreview}
                            alt="Challan Preview"
                            className="max-h-[120px] rounded-lg border shadow-sm"
                          />
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 mt-2 text-orange-600 hover:text-orange-700 underline text-xs font-medium"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const response = await fetch(filePreview, {
                                  mode: "cors",
                                });
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "challan-preview.jpg";
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                alert("Failed to download preview.");
                              }
                            }}
                          >
                            <RiDownloadLine size={13} /> Download Preview
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Task Details
                  </h3>
                  <span className="text-xs text-gray-400">
                    Add one or more line items for this group.
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {taskDetails.map((task, idx) => (
                    <div
                      key={idx}
                      className="relative bg-gray-50  border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        {taskDetails.length > 1 && (
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-500 px-3 py-1 hover:bg-red-50 rounded-full font-semibold transition"
                            onClick={() => removeTaskDetail(idx)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid  md:grid-cols-4 gap-3">
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            Fabric Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="FabricType"
                            value={task.FabricType}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            required
                            className={pillInputSm}
                            disabled={dropdownsLoading}
                          >
                            <option value="" disabled>
                              Fabric Type
                            </option>
                            {dropdowns.fabricType.map((ft) => (
                              <option key={ft} value={ft}>
                                {ft}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            Length{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="Length"
                            value={task.Length}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            required
                            className={pillInputSm}
                            disabled={dropdownsLoading}
                          >
                            <option value="" disabled>
                              Length
                            </option>
                            {dropdowns.length.map((len) => (
                              <option key={len} value={len}>
                                {len}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            Builty No{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="BuiltyNo"
                            value={task.BuiltyNo}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="Builty No"
                            className={pillInputSm}
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            MTR{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="MTR"
                            type="number"
                            value={task.MTR}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="MTR"
                            className={pillInputSm}
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            Sinkage (%){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="sinkage"
                            value={task.sinkage}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            className={pillInputSm}
                            disabled={dropdownsLoading}
                            required
                          >
                            <option value="" disabled>
                              Sinkage (%)
                            </option>
                            {dropdowns.sinkage.map((sk) => (
                              <option key={sk} value={sk}>
                                {sk}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            MTR(L100)
                          </label>
                          <input
                            name="mtrL100"
                            value={calculateMtrL100(task.MTR, task.Length)}
                            readOnly
                            title="Calculated: MTR - [MTR × (100 - Length)%]"
                            className="rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-orange-600 font-semibold"
                            placeholder="MTR(L100)"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            Total Rolls{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="totalRolls"
                            type="number"
                            value={task.totalRolls}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="Total Rolls"
                            className={pillInputSm}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 pl-1">
                        <em>
                          MTR(L100) = MTR − [MTR × (100 − Length)%]
                        </em>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 text-gray-700 hover:border-orange-300 hover:text-orange-600 px-5 py-2.5 text-sm font-semibold transition"
                    onClick={addTaskDetail}
                  >
                    <RiAddLine size={16} /> Add another row
                  </button>
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 font-semibold text-sm shadow-sm transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={loading || dropdownsLoading}
                  >
                    <RiUploadCloud2Line size={17} />
                    {loading ? "Creating..." : "Create Task Group"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* All Tasks card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                All Tasks
              </h2>
              {fetching && (
                <span className="text-sm text-orange-500 font-medium">
                  Loading tasks...
                </span>
              )}
            </div>
            {/* ------- FILTERS ROW ------- */}
            <div className="mb-6 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">From Date</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                    min={minDate || undefined}
                    max={filters.dateTo || undefined}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">To Date</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                    min={filters.dateFrom || undefined}
                    max={maxDate || undefined}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Party Name</label>
                  <select
                    name="partyName"
                    value={filters.partyName}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                  >
                    <option value="">All Parties</option>
                    {dropdowns.partyName.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">
                    Transport Name
                  </label>
                  <select
                    name="transportName"
                    value={filters.transportName}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                  >
                    <option value="">All Transports</option>
                    {dropdowns.transportName.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">
                    Receiver Name
                  </label>
                  <select
                    name="receiverName"
                    value={filters.receiverName}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                  >
                    <option value="">All Receivers</option>
                    {dropdowns.recieverName.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Fabric Type</label>
                  <select
                    name="fabricType"
                    value={filters.fabricType}
                    onChange={handleFilterChange}
                    className={pillInputSm}
                  >
                    <option value="">All Types</option>
                    {dropdowns.fabricType.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-2xl text-sm font-medium border ${
                  message.startsWith("Failed")
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <DataTable
                columns={columns}
                data={tasks}
                loading={fetching}
                emptyText="No tasks found with current filter"
                rowKey="taskId"
                editRowId={editId}
                editRowRender={renderEditRow}
                striped={true}
                autoHeight={false}
              />
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex flex-wrap items-center justify-between mt-4 gap-3 select-none">
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500">Rows per page:</span>
                <select
                  className="bg-white py-1 px-3 border border-gray-200 rounded"
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  style={{ minWidth: "55px" }}
                >
                  {pageSizeOptions.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-60"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <RiArrowLeftSLine />
                </button>
                <span className="mx-2">
                  Page {pagination.page} of{" "}
                  {Math.max(Math.ceil(tasksTotal / pagination.pageSize), 1)}
                </span>
                <button
                  className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-60"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(tasksTotal / pagination.pageSize)}
                >
                  <RiArrowRightSLine />
                </button>
              </div>
              <div className="text-xs text-gray-500 ml-auto">
                Showing {(tasks.length === 0 || tasksTotal === 0)
                  ? 0
                  : (pagination.page - 1) * pagination.pageSize + 1}
                {tasks.length !== 0 &&
                  "- " + ((pagination.page - 1) * pagination.pageSize + tasks.length)}
                {" "}
                of {tasksTotal} records
              </div>
            </div>
          </div>
        </div>

        <NextStepBanner
          text="Tasks created? Add fabric program line items under each task next."
          ctaLabel="Go to SubTask Management"
          href="/sub-task"
        />
      </div>
    </div>
  );
};

export default TaskCreationAndManagement;