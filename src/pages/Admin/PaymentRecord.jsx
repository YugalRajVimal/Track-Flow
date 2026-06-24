import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  RiEdit2Line,
  RiDeleteBin6Line,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
} from "react-icons/ri";

// You may adjust orange by project theming standards if needed.
const BRAND_ORANGE = "#f58021";

// Base API endpoint for payment records
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/payment-records`
  : "/api/v1/payment-records";

const PAYMENT_DROPDOWN_API = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/payment-data`
  : "/api/v1/payment-data";

// Only UPI / Cash allowed
const PAYMENT_METHOD_OPTIONS = ["UPI", "Cash"];

const initialFormState = {
  department: "",
  type: "recieve",
  amount: "",
  date: "",
  paymentMethod: "",
  recieverName: "",
  senderName: "",
};

function PaymentRecord() {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Dropdown data state
  const [dropdownOptions, setDropdownOptions] = useState({
    departments: [],
    // No longer use fetched paymentMethods; always use UPI/Cash below
    paymentMethods: [],
    receivers: [],
    senders: [],
  });
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState("");

  // Fetch all payment records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setPaymentRecords(res.data.data || []);
      setApiError("");
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "Failed to load payment records"
      );
    }
    setLoading(false);
  };

  // Fetch dropdown data for department, receiver, sender (NOT payment method)
  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const res = await axios.get(PAYMENT_DROPDOWN_API);
      // Response shape: res.data.data[0] has { receiverName, senderName, department }
      const paymentData = res.data?.data?.[0] || {};
      setDropdownOptions({
        departments: paymentData.department || [],
        paymentMethods: [], // Explicitly empty, so not used in rendering
        receivers: paymentData.receiverName || [],
        senders: paymentData.senderName || [],
      });
      setDropdownError("");
    } catch (err) {
      setDropdownError("Failed to load form dropdown data");
      setDropdownOptions({
        departments: [],
        paymentMethods: [],
        receivers: [],
        senders: [],
      });
    }
    setDropdownLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    fetchDropdownData();
    // eslint-disable-next-line
  }, []);

  // Handle input changes for add/edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form validation (simple)
  const validateForm = () => {
    if (!form.department) return "Department is required";
    if (!form.type || !["recieve", "sent"].includes(form.type))
      return "Type is required";
    if (!form.amount || isNaN(form.amount))
      return "Amount is required and must be a number.";
    if (!form.date) return "Date is required";
    if (!form.paymentMethod) return "Payment method is required";
    if (!PAYMENT_METHOD_OPTIONS.includes(form.paymentMethod))
      return "Payment method must be UPI or Cash";
    if (!form.recieverName) return "Receiver name is required";
    if (!form.senderName) return "Sender name is required";
    return "";
  };

  // Add or update form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      date: form.date ? new Date(form.date) : undefined,
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/${editId}`, payload);
        setSuccessMsg("Payment record updated successfully.");
      } else {
        await axios.post(API_BASE, payload);
        setSuccessMsg("Payment record created successfully.");
      }
      setForm(initialFormState);
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          (editId
            ? "Failed to update payment record."
            : "Failed to create payment record.")
      );
    }
  };

  // Prepare form to edit a record
  const startEdit = (record) => {
    setForm({
      department: record.department || "",
      type: record.type || "recieve",
      amount: record.amount || "",
      date: record.date
        ? new Date(record.date).toISOString().slice(0, 10)
        : "",
      paymentMethod: record.paymentMethod || "",
      recieverName: record.recieverName || "",
      senderName: record.senderName || "",
    });
    setEditId(record._id);
    setSuccessMsg("");
    setFormError("");
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setForm(initialFormState);
    setFormError("");
    setSuccessMsg("");
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSuccessMsg("Payment record deleted.");
      fetchRecords();
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "Failed to delete payment record."
      );
    }
    setDeletingId(null);
  };

  return (
    <div className="py-7 px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1 tracking-tight">
            Payment Records
          </h1>
          <p className="text-black/50 text-base">
            View, add and export payment records for internal audit and reference.
          </p>
        </div>
      </div>

      {/* Add/Edit Payment Record Form */}
      <div className="bg-white rounded-lg shadow border border-black/10 mb-10 max-w-3xl mx-auto py-7 px-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-semibold text-black">
            {editId ? "Edit Payment Record" : "Add Payment Record"}
          </span>
          {editId && (
            <span className="ml-2 px-2 py-1 rounded bg-orange-100 text-[#f58021] text-xs font-bold uppercase tracking-wider">
              Editing
            </span>
          )}
        </div>
        {(formError || successMsg) && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              formError
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {formError || successMsg}
          </div>
        )}
        {dropdownLoading && (
          <div className="mb-3 px-4 py-2 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
            Loading dropdown data...
          </div>
        )}
        {dropdownError && (
          <div className="mb-3 px-4 py-2 rounded bg-red-50 text-red-600 border border-red-200">
            {dropdownError}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        >
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select...</option>
              {dropdownOptions.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
            >
              <option value="recieve">Recieve</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              placeholder="Amount"
              min={0}
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select...</option>
              {/* Only UPI and Cash are available */}
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Receiver Name</label>
            <select
              name="recieverName"
              value={form.recieverName}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select...</option>
              {dropdownOptions.receivers.map((receiver) => (
                <option key={receiver} value={receiver}>
                  {receiver}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Sender Name</label>
            <select
              name="senderName"
              value={form.senderName}
              onChange={handleChange}
              required
              className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select...</option>
              {dropdownOptions.senders.map((sender) => (
                <option key={sender} value={sender}>
                  {sender}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end mt-2 sm:col-span-2 md:col-span-1">
            <button
              type="submit"
              className="flex items-center text-white font-semibold py-2 px-5 rounded bg-[#f58021] hover:bg-[#e07314] transition-all"
              disabled={dropdownLoading}
            >
              {editId ? (
                <>
                  <RiCheckLine className="mr-2" /> Update
                </>
              ) : (
                <>
                  <RiAddLine className="mr-2" /> Add
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center ml-4 text-black border border-black/20 rounded font-medium px-4 py-2 hover:bg-black/[0.06] transition-all"
                disabled={dropdownLoading}
              >
                <RiCloseLine className="mr-1" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Payment Records */}
      <div className="bg-white border border-black/10 rounded-lg shadow px-2 py-2 mb-8">
        {loading && (
          <div className="text-center py-10 text-black/60 font-medium text-base">
            Loading payment records...
          </div>
        )}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">
            {apiError}
          </div>
        )}
        {!loading && !apiError && paymentRecords.length === 0 && (
          <div className="text-center text-black/50 py-9">
            No payment records found.
          </div>
        )}

        {!loading && !apiError && paymentRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="border-b border-black/10 bg-[#fffbef]">
                  <th className="p-3 font-semibold text-left">Department</th>
                  <th className="p-3 font-semibold text-left">Type</th>
                  <th className="p-3 font-semibold text-left">Amount</th>
                  <th className="p-3 font-semibold text-left">Date</th>
                  <th className="p-3 font-semibold text-left">
                    Payment Method
                  </th>
                  <th className="p-3 font-semibold text-left">
                    Receiver Name
                  </th>
                  <th className="p-3 font-semibold text-left">
                    Sender Name
                  </th>
                  <th className="p-3 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((rec) => (
                  <tr
                    key={rec._id}
                    className="border-b border-black/10 hover:bg-black/[0.03] group"
                  >
                    <td className="p-3">{rec.department}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          rec.type === "recieve"
                            ? "bg-green-100 text-green-800"
                            : "bg-[#f58021]/10 text-[#cf6d14]"
                        }`}
                      >
                        {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      ₹{rec.amount}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {rec.date
                        ? new Date(rec.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : ""}
                    </td>
                    <td className="p-3">{rec.paymentMethod}</td>
                    <td className="p-3">{rec.recieverName}</td>
                    <td className="p-3">{rec.senderName}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => startEdit(rec)}
                        disabled={!!editId && editId !== rec._id}
                        className={`flex items-center gap-1 text-[#f58021] px-2 py-1 rounded hover:bg-[#f58021]/10 font-medium transition-all ${
                          !!editId && editId !== rec._id
                            ? "opacity-30 pointer-events-none"
                            : ""
                        }`}
                        title="Edit"
                      >
                        <RiEdit2Line size={18} />
                        <span className="hidden md:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(rec._id)}
                        disabled={deletingId === rec._id}
                        className={`flex items-center gap-1 text-red-600 px-2 py-1 rounded hover:bg-red-50 font-medium transition-all ${
                          deletingId === rec._id
                            ? "opacity-60 pointer-events-none"
                            : ""
                        }`}
                        title="Delete"
                      >
                        <RiDeleteBin6Line size={18} />
                        <span className="hidden md:inline">
                          {deletingId === rec._id ? "Deleting..." : "Delete"}
                        </span>
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
  );
}

export default PaymentRecord;