import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

// -- Modern DataTable with inline Tailwind (fully reimagined) --
function DataTable({
  columns,
  data,
  loading,
  emptyText = "No data found.",
  rowKey = "id",
  editRowId,
  editRowRender,
  striped = true,
  autoHeight = false,
}) {
  return (
    <div
      className={`relative w-full rounded-xl bg-white shadow-md border border-gray-200 ${
        autoHeight ? "" : "overflow-x-auto"
      }`}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.accessor || col.key || col.title}
                className={`px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap ${col.className || ""}`}
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
                className="py-10 text-center text-blue-400 font-medium"
              >
                Loading...
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-300 italic"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) =>
              editRowId && editRowId === (row[rowKey] ?? row.id) ? (
                <tr key={row[rowKey] ?? row.id ?? idx} className="bg-yellow-50">
                  {editRowRender(row)}
                </tr>
              ) : (
                <tr
                  key={row[rowKey] ?? row.id ?? idx}
                  className={`${striped && idx % 2 === 1 ? "bg-gray-50" : ""} transition-colors`}
                >
                  {columns.map((col, cidx) => (
                    <td
                      key={col.accessor || col.key || cidx}
                      className={`px-4 py-2 border-t border-gray-100 align-middle ${col.cellClassName || ""}`}
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
  mtrAfterSinkage: "",
  totalRolls: "",
  taskStatus: "pending",
};

const TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "done", label: "Done" },
  { value: "partiallyDone", label: "Partially Done" },
];

const calculateMtrAfterSinkage = (MTR, sinkage) => {
  const mtrNum = parseFloat(MTR);
  const sinkageNum = parseFloat(sinkage);
  if (isNaN(mtrNum) || isNaN(sinkageNum)) return "";
  const result = mtrNum - (mtrNum * sinkageNum) / 100;
  return result === 0 ? "" : Number(result.toFixed(2));
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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTaskData, setEditTaskData] = useState(null);
  const [message, setMessage] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchDropdownsAndTasks();
    // eslint-disable-next-line
  }, []);

  const fetchDropdownsAndTasks = async () => {
    setDropdownsLoading(true);
    setFetching(true);
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
        "Failed to load dropdowns/tasks: " +
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
    setFetching(false);
  };

  const fetchTasks = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(res.data.data || []);
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

  const handleTaskDetailChange = (idx, e) => {
    const { name, value } = e.target;
    setTaskDetails((prev) => {
      const updated = [...prev];
      let newTask = { ...updated[idx], [name]: value };
      if (name === "MTR" || name === "sinkage") {
        newTask.mtrAfterSinkage = calculateMtrAfterSinkage(
          newTask.MTR,
          newTask.sinkage
        );
      }
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
      const cleanedTaskDetails = taskDetails.filter((t) =>
        Object.values(t).some(
          (v) => v !== "" && v !== null && v !== undefined
        )
      );
      const mappedTaskDetails = cleanedTaskDetails.map((t) => ({
        ...t,
        taskStatus: t.taskStatus || "pending",
        mtrAfterSinkage: calculateMtrAfterSinkage(t.MTR, t.sinkage),
      }));
      await axios.post(`${API_BASE_URL}/tasks`, {
        groupData,
        taskDetails: mappedTaskDetails,
      });
      setMessage("Tasks created successfully!");
      setGroupData(initialGroupData);
      setTaskDetails([{ ...initialTaskDetail }]);
      fetchTasks();
      fetchDropdownsAndTasks();
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
      fetchTasks();
      fetchDropdownsAndTasks();
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
      mtrAfterSinkage: calculateMtrAfterSinkage(task.MTR, task.sinkage),
      totalRolls: task.totalRolls || "",
      taskStatus: task.taskStatus || "pending",
    });
  };

  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "MTR" || name === "sinkage") {
        next.mtrAfterSinkage = calculateMtrAfterSinkage(
          next.MTR,
          next.sinkage
        );
      }
      return next;
    });
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    try {
      const editPayload = {
        ...editTaskData,
        mtrAfterSinkage: calculateMtrAfterSinkage(
          editTaskData.MTR,
          editTaskData.sinkage
        ),
        taskStatus: editTaskData.taskStatus || "pending",
      };
      await axios.put(`${API_BASE_URL}/tasks/${editId}`, editPayload);
      setMessage("Task updated!");
      setEditId(null);
      setEditTaskData(null);
      fetchTasks();
      fetchDropdownsAndTasks();
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
  };

  // --- Columns for DataTable (with classes for improved design) ---
  const columns = useMemo(
    () => [
      {
        title: "Task ID",
        accessor: "taskId",
        className: "font-bold",
        cellClassName: "text-indigo-600 font-semibold",
      },
      { title: "Challan No", accessor: "challanNo" },
      { title: "Party Name", accessor: "partyName" },
      { title: "Transport Name", accessor: "transportName" },
      { title: "Receiver Name", accessor: "receiverName" },
      { title: "Fabric Type", accessor: "FabricType" },
      { title: "Length", accessor: "Length" },
      { title: "Builty No", accessor: "BuiltyNo" },
      { title: "MTR", accessor: "MTR" },
      { title: "Sinkage", accessor: "sinkage" },
      {
        title: "MTR After Sinkage",
        render: (row) => calculateMtrAfterSinkage(row.MTR, row.sinkage),
        cellClassName: "text-sky-600 font-semibold",
      },
      { title: "Total Rolls", accessor: "totalRolls" },
      {
        title: "Task Status",
        render: (row) =>
          TASK_STATUS_OPTIONS.find((opt) => opt.value === row.taskStatus)
            ?.label ?? row.taskStatus,
        cellClassName: "capitalize font-medium",
      },
      { title: "Remark", accessor: "remark" },
      {
        title: "Actions",
        key: "actions",
        render: (row) => (
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition
              bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0`}
              disabled={editId === row.taskId}
              style={{ minWidth: 0 }}
              onClick={() => startEditTask(row)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 rounded text-xs font-semibold border border-red-500 text-red-600 hover:bg-red-50 transition flex-shrink-0"
              style={{ minWidth: 0 }}
              onClick={() => handleDeleteTask(row.taskId)}
            >
              Delete
            </button>
          </div>
        ),
        cellClassName: "whitespace-nowrap",
      },
    ],
    [editId, tasks]
  );

  // -- Inline Edit Row UI --
  const renderEditRow = useCallback(
    (row) => [
      <td key="taskId" className="px-4 py-2 font-bold text-indigo-900">{row.taskId}</td>,
      <td className="px-4 py-2">{row.challanNo}</td>,
      <td className="px-4 py-2">{row.partyName}</td>,
      <td className="px-4 py-2">{row.transportName}</td>,
      <td className="px-4 py-2">{row.receiverName}</td>,
      <td className="px-4 py-2">
        <select
          name="FabricType"
          value={editTaskData.FabricType}
          onChange={handleEditTaskChange}
          className="w-24 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
          disabled={dropdownsLoading}
        >
          <option value="">-- Fabric Type --</option>
          {dropdowns.fabricType.map((ft) => (
            <option key={ft} value={ft}>{ft}</option>
          ))}
        </select>
      </td>,
      <td className="px-4 py-2">
        <select
          name="Length"
          value={editTaskData.Length}
          onChange={handleEditTaskChange}
          className="w-16 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
          disabled={dropdownsLoading}
        >
          <option value="">-- Length --</option>
          {dropdowns.length.map((len) => (
            <option key={len} value={len}>{len}</option>
          ))}
        </select>
      </td>,
      <td className="px-4 py-2">
        <input
          name="BuiltyNo"
          value={editTaskData.BuiltyNo}
          onChange={handleEditTaskChange}
          className="w-20 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
        />
      </td>,
      <td className="px-4 py-2">
        <input
          name="MTR"
          type="number"
          value={editTaskData.MTR}
          onChange={handleEditTaskChange}
          className="w-16 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
        />
      </td>,
      <td className="px-4 py-2">
        <select
          name="sinkage"
          value={editTaskData.sinkage}
          onChange={handleEditTaskChange}
          className="w-14 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
          disabled={dropdownsLoading}
        >
          <option value="">-- Sinkage --</option>
          {dropdowns.sinkage.map((sk) => (
            <option key={sk} value={sk}>{sk}</option>
          ))}
        </select>
      </td>,
      <td className="px-4 py-2">
        <input
          name="mtrAfterSinkage"
          value={calculateMtrAfterSinkage(
            editTaskData.MTR,
            editTaskData.sinkage
          )}
          readOnly
          className="w-20 px-1 py-0.5 border border-gray-200 rounded bg-gray-100 text-sm"
        />
      </td>,
      <td className="px-4 py-2">
        <input
          name="totalRolls"
          type="number"
          value={editTaskData.totalRolls}
          onChange={handleEditTaskChange}
          className="w-16 px-1 py-0.5 border border-gray-300 rounded bg-white text-sm"
        />
      </td>,
      <td className="px-4 py-2">
        <select
          name="taskStatus"
          value={editTaskData.taskStatus || "pending"}
          onChange={handleEditTaskChange}
          className="w-28 px-1 py-0.5 border border-gray-300 rounded text-sm"
        >
          {TASK_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>,
      <td className="px-4 py-2">{tasks.find((t) => t.taskId === editId)?.remark}</td>,
      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded text-xs font-semibold bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSaveEdit}
            type="button"
          >
            Save
          </button>
          <button
            className="px-3 py-1 rounded text-xs border border-gray-300 text-gray-800 hover:bg-gray-100"
            onClick={handleCancelEdit}
            type="button"
          >
            Cancel
          </button>
        </div>
      </td>,
    ],
    [editTaskData, editId, dropdowns, dropdownsLoading, tasks]
  );

  // ---- Render page ----

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full">
            <div className="w-full bg-white rounded-2xl shadow-lg mb-10 border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                  Task Group Details
                </h2>
                <button
                  type="button"
                  className="text-indigo-600 text-sm border border-indigo-100 rounded px-4 py-1 transition hover:bg-indigo-50 font-medium"
                  onClick={() => setShowGroupForm((v) => !v)}
                  aria-label={showGroupForm ? "Hide" : "Show"}
                >
                  {showGroupForm ? "Hide ▲" : "Show ▼"}
                </button>
              </div>
              {showGroupForm && (
                <form onSubmit={handleCreateTasks} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Challan No *</label>
                      <input
                        name="challanNo"
                        type="text"
                        required
                        value={groupData.challanNo}
                        onChange={handleGroupDataChange}
                        className="block w-full p-2 rounded-lg border border-gray-300 focus:ring-indigo-300 focus:border-indigo-400 text-base"
                        placeholder="Challan No"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Party Name *</label>
                      <select
                        name="partyName"
                        value={groupData.partyName}
                        onChange={handleGroupDataChange}
                        required
                        className="block w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-indigo-300 focus:border-indigo-400 text-base"
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">Transport Name *</label>
                      <select
                        name="transportName"
                        value={groupData.transportName}
                        onChange={handleGroupDataChange}
                        required
                        className="block w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-indigo-300 focus:border-indigo-400 text-base"
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">Receiver Name *</label>
                      <select
                        name="receiverName"
                        value={groupData.receiverName}
                        onChange={handleGroupDataChange}
                        required
                        className="block w-full p-2 rounded-lg border border-gray-300 bg-white focus:ring-indigo-300 focus:border-indigo-400 text-base"
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">Remark</label>
                      <input
                        name="remark"
                        value={groupData.remark}
                        onChange={handleGroupDataChange}
                        className="block w-full p-2 rounded-lg border border-gray-300 focus:ring-indigo-300 focus:border-indigo-400 text-base"
                        placeholder="Remark"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Challan Photo Path</label>
                      <input
                        name="challanPhotoPath"
                        value={groupData.challanPhotoPath}
                        onChange={handleGroupDataChange}
                        className="block w-full p-2 rounded-lg border border-gray-300 focus:ring-indigo-300 focus:border-indigo-400 text-base"
                        placeholder="Challan Photo Path"
                      />
                    </div>
                  </div>

                  <div className="pt-5 mb-2">
                    <h3 className="text-lg font-semibold text-blue-800 mb-1">
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
                        className="relative bg-blue-50/40 border border-blue-100 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-sky-600 font-bold">
                            #{idx + 1}
                          </span>
                          {taskDetails.length > 1 && (
                            <button
                              type="button"
                              className="text-xs text-red-600 px-2 py-0.5 hover:bg-red-100 rounded font-medium"
                              onClick={() => removeTaskDetail(idx)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          <select
                            name="FabricType"
                            value={task.FabricType}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            required
                            className="p-2 rounded-md border border-gray-300 bg-white text-base"
                            disabled={dropdownsLoading}
                          >
                            <option value="">-- Fabric Type --</option>
                            {dropdowns.fabricType.map((ft) => (
                              <option key={ft} value={ft}>
                                {ft}
                              </option>
                            ))}
                          </select>
                          <select
                            name="Length"
                            value={task.Length}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            required
                            className="p-2 rounded-md border border-gray-300 bg-white text-base"
                            disabled={dropdownsLoading}
                          >
                            <option value="">-- Length --</option>
                            {dropdowns.length.map((len) => (
                              <option key={len} value={len}>
                                {len}
                              </option>
                            ))}
                          </select>
                          <input
                            name="BuiltyNo"
                            value={task.BuiltyNo}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="Builty No"
                            className="p-2 rounded-md border border-gray-300 text-base"
                          />
                          <input
                            name="MTR"
                            type="number"
                            value={task.MTR}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="MTR"
                            className="p-2 rounded-md border border-gray-300 text-base"
                          />
                          <select
                            name="sinkage"
                            value={task.sinkage}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            className="p-2 rounded-md border border-gray-300 bg-white text-base"
                            disabled={dropdownsLoading}
                          >
                            <option value="">-- Sinkage (%) --</option>
                            {dropdowns.sinkage.map((sk) => (
                              <option key={sk} value={sk}>
                                {sk}
                              </option>
                            ))}
                          </select>
                          <input
                            name="mtrAfterSinkage"
                            value={task.mtrAfterSinkage}
                            readOnly
                            title="Calculated: MTR - (MTR × Sinkage % / 100)"
                            className="p-2 rounded-md border border-gray-200 bg-gray-100 text-base"
                            placeholder="MTR After Sinkage"
                          />
                          <input
                            name="totalRolls"
                            type="number"
                            value={task.totalRolls}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            placeholder="Total Rolls"
                            className="p-2 rounded-md border border-gray-300 text-base"
                          />
                          <select
                            name="taskStatus"
                            value={task.taskStatus || "pending"}
                            onChange={(e) => handleTaskDetailChange(idx, e)}
                            required
                            className="p-2 rounded-md border border-gray-300 bg-white text-base"
                          >
                            {TASK_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-1 text-xs text-gray-400 pl-1">
                          <em>
                            MTR After Sinkage = MTR - (MTR &times; Sinkage&nbsp;% / 100)
                          </em>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      className="bg-blue-600 text-white font-semibold rounded-md px-4 py-1.5 hover:bg-blue-700 shadow-sm text-sm transition"
                      onClick={addTaskDetail}
                    >
                      + Add another row
                    </button>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="mt-7 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-7 py-2 rounded-lg shadow hover:from-indigo-800 hover:to-blue-700 font-bold text-base transition"
                      disabled={loading || dropdownsLoading}
                    >
                      {loading ? "Creating..." : "Create Task Group"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-blue-900 tracking-tight">
                  All Tasks
                </h2>
                <div>
                  {fetching && (
                    <span className="text-sm text-gray-400 font-medium">
                      Loading tasks...
                    </span>
                  )}
                </div>
              </div>
              {message && (
                <div
                  className={`mb-6 px-4 py-3 rounded text-sm font-semibold border ${
                    message.startsWith("Failed")
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-green-50 text-green-800 border-green-200"
                  }`}
                >
                  {message}
                </div>
              )}
              <DataTable
                columns={columns}
                data={tasks}
                loading={fetching}
                rowKey="taskId"
                editRowId={editId}
                editRowRender={renderEditRow}
                striped={true}
                autoHeight={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationAndManagement;