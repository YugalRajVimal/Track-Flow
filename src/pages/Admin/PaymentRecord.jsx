// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   RiEdit2Line,
//   RiDeleteBin6Line,
//   RiCheckLine,
//   RiCloseLine,
//   RiAddLine,
// } from "react-icons/ri";

// const BRAND_ORANGE = "#f58021";

// const API_BASE = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/payment-records`
//   : "/api/v1/payment-records";

// const PAYMENT_DROPDOWN_API = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/payment-data`
//   : "/api/v1/payment-data";

// const PASSCODE_API = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/users/verify-payment-department-passcode`
//   : "/api/v1/verify-payment-department-passcode";

// const PAYMENT_METHOD_OPTIONS = ["UPI", "Cash"];

// const initialFormState = {
//   department: "",
//   type: "recieve",
//   amount: "",
//   date: "",
//   paymentMethod: "",
//   recieverName: "",
//   senderName: "",
//   recieverNameOther: "",
//   senderNameOther: "",
// };

// // ─── Passcode gate ──────────────────────────────────────────────────────────────
// function PasscodeGate({ onSuccess }) {
//   const [passcode, setPasscode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   const handleSubmit = async () => {
//     if (!passcode.trim()) {
//       setError("Enter the passcode to continue.");
//       return;
//     }
//     setError("");
//     setLoading(true);
//     try {
//       // Get the auth token from localStorage (assuming it's stored as "token")
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         PASSCODE_API,
//         { passcode: passcode.trim() },
//         {
//           headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         }
//       );
//       if (res.data?.success) {
//         onSuccess();
//       } else {
//         setError("Incorrect passcode. Try again.");
//         setPasscode("");
//         inputRef.current?.focus();
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || "Incorrect passcode. Try again.");
//       setPasscode("");
//       inputRef.current?.focus();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       minHeight: "100vh",
//       background: "#f9fafb",
//       fontFamily: "system-ui, -apple-system, sans-serif",
//     }}>
//       <div style={{
//         background: "#fff",
//         border: "1px solid #e5e7eb",
//         borderRadius: 14,
//         padding: "36px 32px 28px",
//         width: 360,
//         boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
//       }}>
//         <div style={{
//           width: 44, height: 44, borderRadius: 10,
//           background: "#fff7ed", border: "1px solid #fed7aa",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           marginBottom: 20, fontSize: 20,
//         }}>
//           🔒
//         </div>
//         <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#111827" }}>
//         Payment Department Access
//         </h2>
//         <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>
//           Enter the passcode to manage payment records.
//         </p>
//         <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
//           Passcode
//         </label>
//         <input
//           ref={inputRef}
//           type="password"
//           value={passcode}
//           onChange={(e) => { setPasscode(e.target.value); setError(""); }}
//           onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//           placeholder="Enter passcode"
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "9px 12px",
//             borderRadius: 8,
//             border: error ? "1px solid #fca5a5" : "1px solid #d1d5db",
//             fontSize: 14,
//             outline: "none",
//             boxSizing: "border-box",
//             marginBottom: error ? 8 : 16,
//             background: loading ? "#f9fafb" : "#fff",
//           }}
//         />
//         {error && (
//           <div style={{
//             fontSize: 13, color: "#b91c1c",
//             background: "#fef2f2", border: "1px solid #fca5a5",
//             borderRadius: 7, padding: "7px 10px", marginBottom: 14,
//           }}>
//             {error}
//           </div>
//         )}
//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={loading}
//           style={{
//             width: "100%", padding: "9px 0",
//             background: loading ? "#fdba74" : BRAND_ORANGE,
//             color: "#fff", border: "none", borderRadius: 8,
//             fontSize: 14, fontWeight: 600,
//             cursor: loading ? "not-allowed" : "pointer",
//           }}
//         >
//           {loading ? "Verifying…" : "Continue"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Main component ─────────────────────────────────────────────────────────────
// function PaymentRecord() {
//   const [authenticated, setAuthenticated] = useState(false);

//   const [paymentRecords, setPaymentRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [form, setForm] = useState(initialFormState);
//   const [formError, setFormError] = useState("");
//   const [apiError, setApiError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [editId, setEditId] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);

//   const [dropdownOptions, setDropdownOptions] = useState({ departments: [] });
//   const [dropdownLoading, setDropdownLoading] = useState(false);
//   const [dropdownError, setDropdownError] = useState("");

//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(API_BASE);
//       setPaymentRecords(res.data.data || []);
//       setApiError("");
//     } catch (err) {
//       setApiError(err?.response?.data?.message || "Failed to load payment records");
//     }
//     setLoading(false);
//   };

//   const fetchDropdownData = async () => {
//     setDropdownLoading(true);
//     try {
//       const res = await axios.get(PAYMENT_DROPDOWN_API);
//       const data = res.data?.data;
//       setDropdownOptions({ departments: data[0]?.departments || [] });
//       setDropdownError("");
//     } catch (err) {
//       setDropdownError("Failed to load form dropdown data");
//       setDropdownOptions({ departments: [] });
//     }
//     setDropdownLoading(false);
//   };

//   // Only fetch after passcode verified
//   useEffect(() => {
//     if (!authenticated) return;
//     fetchRecords();
//     fetchDropdownData();
//   }, [authenticated]);

//   const selectedDeptObj = dropdownOptions.departments.find((d) => d.name === form.department);
//   const isRecieverOther = form.recieverName === "__other__";
//   const isSenderOther = form.senderName === "__other__";

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "department") {
//       setForm((prev) => ({ ...prev, department: value, recieverName: "", senderName: "", recieverNameOther: "", senderNameOther: "" }));
//     } else if (name === "recieverName") {
//       setForm((prev) => ({ ...prev, recieverName: value, recieverNameOther: value === "__other__" ? "" : prev.recieverNameOther }));
//     } else if (name === "senderName") {
//       setForm((prev) => ({ ...prev, senderName: value, senderNameOther: value === "__other__" ? "" : prev.senderNameOther }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const validateForm = () => {
//     if (!form.department) return "Department is required";
//     if (!form.type || !["recieve", "sent"].includes(form.type)) return "Type is required";
//     if (!form.amount || isNaN(form.amount)) return "Amount is required and must be a number.";
//     if (!form.date) return "Date is required";
//     if (!form.paymentMethod) return "Payment method is required";
//     if (!PAYMENT_METHOD_OPTIONS.includes(form.paymentMethod)) return "Payment method must be UPI or Cash";
//     if (!form.recieverName) return "Receiver name is required";
//     if (form.recieverName === "__other__" && !form.recieverNameOther.trim()) return "Please enter the receiver name.";
//     if (!form.senderName) return "Sender name is required";
//     if (form.senderName === "__other__" && !form.senderNameOther.trim()) return "Please enter the sender name.";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError("");
//     setSuccessMsg("");
//     const error = validateForm();
//     if (error) { setFormError(error); return; }

//     const payload = {
//       ...form,
//       recieverName: form.recieverName === "__other__" ? form.recieverNameOther : form.recieverName,
//       senderName: form.senderName === "__other__" ? form.senderNameOther : form.senderName,
//       amount: parseFloat(form.amount),
//       date: form.date ? new Date(form.date) : undefined,
//     };
//     delete payload.recieverNameOther;
//     delete payload.senderNameOther;

//     try {
//       if (editId) {
//         await axios.put(`${API_BASE}/${editId}`, payload);
//         setSuccessMsg("Payment record updated successfully.");
//       } else {
//         await axios.post(API_BASE, payload);
//         setSuccessMsg("Payment record created successfully.");
//       }
//       setForm(initialFormState);
//       setEditId(null);
//       fetchRecords();
//     } catch (err) {
//       setFormError(err?.response?.data?.message || (editId ? "Failed to update payment record." : "Failed to create payment record."));
//     }
//   };

//   const startEdit = (record) => {
//     let currRecieverIsOther = false;
//     let currSenderIsOther = false;
//     if (record.department) {
//       const deptObj = dropdownOptions.departments.find((d) => d.name === record.department);
//       if (deptObj) {
//         currRecieverIsOther = record.recieverName && !deptObj.receiverNames.includes(record.recieverName);
//         currSenderIsOther = record.senderName && !deptObj.senderNames.includes(record.senderName);
//       }
//     }
//     setForm({
//       department: record.department || "",
//       type: record.type || "recieve",
//       amount: record.amount || "",
//       date: record.date ? new Date(record.date).toISOString().slice(0, 10) : "",
//       paymentMethod: record.paymentMethod || "",
//       recieverName: currRecieverIsOther ? "__other__" : record.recieverName || "",
//       senderName: currSenderIsOther ? "__other__" : record.senderName || "",
//       recieverNameOther: currRecieverIsOther ? record.recieverName : "",
//       senderNameOther: currSenderIsOther ? record.senderName : "",
//     });
//     setEditId(record._id);
//     setSuccessMsg("");
//     setFormError("");
//   };

//   const cancelEdit = () => {
//     setEditId(null);
//     setForm(initialFormState);
//     setFormError("");
//     setSuccessMsg("");
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this record?")) return;
//     setDeletingId(id);
//     try {
//       await axios.delete(`${API_BASE}/${id}`);
//       setSuccessMsg("Payment record deleted.");
//       fetchRecords();
//     } catch (err) {
//       setApiError(err?.response?.data?.message || "Failed to delete payment record.");
//     }
//     setDeletingId(null);
//   };

//   // Show passcode gate first
//   if (!authenticated) {
//     return <PasscodeGate onSuccess={() => setAuthenticated(true)} />;
//   }

//   return (
//     <div className="py-7 px-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-black mb-1 tracking-tight">Payment Records</h1>
//           <p className="text-black/50 text-base">
//             View, add and export payment records for internal audit and reference.
//           </p>
//         </div>
//       </div>

//       {/* Add/Edit Form */}
//       <div className="bg-white rounded-lg shadow border border-black/10 mb-10 max-w-3xl mx-auto py-7 px-8">
//         <div className="flex items-center gap-2 mb-1">
//           <span className="text-xl font-semibold text-black">
//             {editId ? "Edit Payment Record" : "Add Payment Record"}
//           </span>
//           {editId && (
//             <span className="ml-2 px-2 py-1 rounded bg-orange-100 text-[#f58021] text-xs font-bold uppercase tracking-wider">
//               Editing
//             </span>
//           )}
//         </div>
//         {(formError || successMsg) && (
//           <div className={`mb-4 px-4 py-2 rounded ${formError ? "bg-red-50 border border-red-200 text-red-600" : "bg-green-50 border border-green-200 text-green-700"}`}>
//             {formError || successMsg}
//           </div>
//         )}
//         {dropdownLoading && (
//           <div className="mb-3 px-4 py-2 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
//             Loading dropdown data...
//           </div>
//         )}
//         {dropdownError && (
//           <div className="mb-3 px-4 py-2 rounded bg-red-50 text-red-600 border border-red-200">
//             {dropdownError}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Department</label>
//             <select name="department" value={form.department} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
//               disabled={dropdownLoading}>
//               <option value="">Select...</option>
//               {dropdownOptions.departments.map((dept) => (
//                 <option key={dept.name} value={dept.name}>{dept.name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Type</label>
//             <select name="type" value={form.type} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white">
//               <option value="recieve">Recieve</option>
//               <option value="sent">Sent</option>
//             </select>
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Amount</label>
//             <input type="number" name="amount" value={form.amount} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
//               placeholder="Amount" min={0} />
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Date</label>
//             <input type="date" name="date" value={form.date} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Payment Method</label>
//             <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
//               disabled={dropdownLoading}>
//               <option value="">Select...</option>
//               {PAYMENT_METHOD_OPTIONS.map((method) => (
//                 <option key={method} value={method}>{method}</option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Receiver Name</label>
//             <select name="recieverName" value={form.recieverName} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
//               disabled={dropdownLoading || !form.department}>
//               <option value="">Select...</option>
//               {selectedDeptObj && selectedDeptObj.receiverNames.map((name) => (
//                 <option key={name} value={name}>{name}</option>
//               ))}
//               <option value="__other__">Other</option>
//             </select>
//             {isRecieverOther && (
//               <input type="text" name="recieverNameOther" value={form.recieverNameOther} onChange={handleChange} required
//                 placeholder="Enter receiver name"
//                 className="mt-2 border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
//             )}
//           </div>
//           <div className="flex flex-col">
//             <label className="font-medium mb-1 text-black">Sender Name</label>
//             <select name="senderName" value={form.senderName} onChange={handleChange} required
//               className="border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
//               disabled={dropdownLoading || !form.department}>
//               <option value="">Select...</option>
//               {selectedDeptObj && selectedDeptObj.senderNames.map((name) => (
//                 <option key={name} value={name}>{name}</option>
//               ))}
//               <option value="__other__">Other</option>
//             </select>
//             {isSenderOther && (
//               <input type="text" name="senderNameOther" value={form.senderNameOther} onChange={handleChange} required
//                 placeholder="Enter sender name"
//                 className="mt-2 border border-black/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
//             )}
//           </div>
//           <div className="flex items-end mt-2 sm:col-span-2 md:col-span-1">
//             <button type="submit"
//               className="flex items-center text-white font-semibold py-2 px-5 rounded bg-[#f58021] hover:bg-[#e07314] transition-all"
//               disabled={dropdownLoading}>
//               {editId ? <><RiCheckLine className="mr-2" /> Update</> : <><RiAddLine className="mr-2" /> Add</>}
//             </button>
//             {editId && (
//               <button type="button" onClick={cancelEdit}
//                 className="flex items-center ml-4 text-black border border-black/20 rounded font-medium px-4 py-2 hover:bg-black/[0.06] transition-all"
//                 disabled={dropdownLoading}>
//                 <RiCloseLine className="mr-1" /> Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* Records Table */}
//       <div className="bg-white border border-black/10 rounded-lg shadow px-2 py-2 mb-8">
//         {loading && (
//           <div className="text-center py-10 text-black/60 font-medium text-base">Loading payment records...</div>
//         )}
//         {apiError && (
//           <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">{apiError}</div>
//         )}
//         {!loading && !apiError && paymentRecords.length === 0 && (
//           <div className="text-center text-black/50 py-9">No payment records found.</div>
//         )}
//         {!loading && !apiError && paymentRecords.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse text-sm md:text-base">
//               <thead>
//                 <tr className="border-b border-black/10 bg-[#fffbef]">
//                   <th className="p-3 font-semibold text-left">Department</th>
//                   <th className="p-3 font-semibold text-left">Type</th>
//                   <th className="p-3 font-semibold text-left">Amount</th>
//                   <th className="p-3 font-semibold text-left">Date</th>
//                   <th className="p-3 font-semibold text-left">Payment Method</th>
//                   <th className="p-3 font-semibold text-left">Receiver Name</th>
//                   <th className="p-3 font-semibold text-left">Sender Name</th>
//                   <th className="p-3 font-semibold text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paymentRecords.map((rec) => (
//                   <tr key={rec._id} className="border-b border-black/10 hover:bg-black/[0.03] group">
//                     <td className="p-3">{rec.department}</td>
//                     <td className="p-3">
//                       <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${rec.type === "recieve" ? "bg-green-100 text-green-800" : "bg-[#f58021]/10 text-[#cf6d14]"}`}>
//                         {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
//                       </span>
//                     </td>
//                     <td className="p-3 font-mono font-semibold">₹{rec.amount}</td>
//                     <td className="p-3 whitespace-nowrap">
//                       {rec.date ? new Date(rec.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : ""}
//                     </td>
//                     <td className="p-3">{rec.paymentMethod}</td>
//                     <td className="p-3">{rec.recieverName}</td>
//                     <td className="p-3">{rec.senderName}</td>
//                     <td className="p-3 flex gap-2">
//                       <button onClick={() => startEdit(rec)} disabled={!!editId && editId !== rec._id}
//                         className={`flex items-center gap-1 text-[#f58021] px-2 py-1 rounded hover:bg-[#f58021]/10 font-medium transition-all ${!!editId && editId !== rec._id ? "opacity-30 pointer-events-none" : ""}`}
//                         title="Edit">
//                         <RiEdit2Line size={18} />
//                         <span className="hidden md:inline">Edit</span>
//                       </button>
//                       <button onClick={() => handleDelete(rec._id)} disabled={deletingId === rec._id}
//                         className={`flex items-center gap-1 text-red-600 px-2 py-1 rounded hover:bg-red-50 font-medium transition-all ${deletingId === rec._id ? "opacity-60 pointer-events-none" : ""}`}
//                         title="Delete">
//                         <RiDeleteBin6Line size={18} />
//                         <span className="hidden md:inline">{deletingId === rec._id ? "Deleting..." : "Delete"}</span>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default PaymentRecord;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RiEdit2Line,
  RiDeleteBin6Line,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
} from "react-icons/ri";

const BRAND_ORANGE = "#f58021";

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/payment-records`
  : "/api/v1/payment-records";

const PAYMENT_DROPDOWN_API = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/payment-data`
  : "/api/v1/payment-data";

const PASSCODE_API = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/users/verify-payment-department-passcode`
  : "/api/v1/verify-payment-department-passcode";

const PAYMENT_METHOD_OPTIONS = ["UPI", "Cash"];

const initialFormState = {
  department: "",
  type: "recieve",
  amount: "",
  date: "",
  paymentMethod: "",
  recieverName: "",
  senderName: "",
  recieverNameOther: "",
  senderNameOther: "",
};

// ─── Passcode gate ──────────────────────────────────────────────────────────────
function PasscodeGate({ onSuccess }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!passcode.trim()) {
      setError("Enter the passcode to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        PASSCODE_API,
        { passcode: passcode.trim() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (res.data?.success) {
        onSuccess();
      } else {
        setError("Incorrect passcode. Try again.");
        setPasscode("");
        inputRef.current?.focus();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Incorrect passcode. Try again.");
      setPasscode("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "32px 24px 24px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        boxSizing: "border-box",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "#fff7ed", border: "1px solid #fed7aa",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20, fontSize: 20,
        }}>
          🔒
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#111827" }}>
        Payment Department Access
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>
          Enter the passcode to manage payment records.
        </p>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          Passcode
        </label>
        <input
          ref={inputRef}
          type="password"
          value={passcode}
          onChange={(e) => { setPasscode(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter passcode"
          disabled={loading}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 8,
            border: error ? "1px solid #fca5a5" : "1px solid #d1d5db",
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: error ? 8 : 16,
            background: loading ? "#f9fafb" : "#fff",
          }}
        />
        {error && (
          <div style={{
            fontSize: 13, color: "#b91c1c",
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: 7, padding: "7px 10px", marginBottom: 14,
          }}>
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "11px 0",
            background: loading ? "#fdba74" : BRAND_ORANGE,
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
function PaymentRecord() {
  const [authenticated, setAuthenticated] = useState(false);

  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [dropdownOptions, setDropdownOptions] = useState({ departments: [] });
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setPaymentRecords(res.data.data || []);
      setApiError("");
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to load payment records");
    }
    setLoading(false);
  };

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const res = await axios.get(PAYMENT_DROPDOWN_API);
      const data = res.data?.data;
      setDropdownOptions({ departments: data[0]?.departments || [] });
      setDropdownError("");
    } catch (err) {
      setDropdownError("Failed to load form dropdown data");
      setDropdownOptions({ departments: [] });
    }
    setDropdownLoading(false);
  };

  // Only fetch after passcode verified
  useEffect(() => {
    if (!authenticated) return;
    fetchRecords();
    fetchDropdownData();
  }, [authenticated]);

  const selectedDeptObj = dropdownOptions.departments.find((d) => d.name === form.department);
  const isRecieverOther = form.recieverName === "__other__";
  const isSenderOther = form.senderName === "__other__";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setForm((prev) => ({ ...prev, department: value, recieverName: "", senderName: "", recieverNameOther: "", senderNameOther: "" }));
    } else if (name === "recieverName") {
      setForm((prev) => ({ ...prev, recieverName: value, recieverNameOther: value === "__other__" ? "" : prev.recieverNameOther }));
    } else if (name === "senderName") {
      setForm((prev) => ({ ...prev, senderName: value, senderNameOther: value === "__other__" ? "" : prev.senderNameOther }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.department) return "Department is required";
    if (!form.type || !["recieve", "sent"].includes(form.type)) return "Type is required";
    if (!form.amount || isNaN(form.amount)) return "Amount is required and must be a number.";
    if (!form.date) return "Date is required";
    if (!form.paymentMethod) return "Payment method is required";
    if (!PAYMENT_METHOD_OPTIONS.includes(form.paymentMethod)) return "Payment method must be UPI or Cash";
    if (!form.recieverName) return "Receiver name is required";
    if (form.recieverName === "__other__" && !form.recieverNameOther.trim()) return "Please enter the receiver name.";
    if (!form.senderName) return "Sender name is required";
    if (form.senderName === "__other__" && !form.senderNameOther.trim()) return "Please enter the sender name.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    const error = validateForm();
    if (error) { setFormError(error); return; }

    const payload = {
      ...form,
      recieverName: form.recieverName === "__other__" ? form.recieverNameOther : form.recieverName,
      senderName: form.senderName === "__other__" ? form.senderNameOther : form.senderName,
      amount: parseFloat(form.amount),
      date: form.date ? new Date(form.date) : undefined,
    };
    delete payload.recieverNameOther;
    delete payload.senderNameOther;

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
      setFormError(err?.response?.data?.message || (editId ? "Failed to update payment record." : "Failed to create payment record."));
    }
  };

  const startEdit = (record) => {
    let currRecieverIsOther = false;
    let currSenderIsOther = false;
    if (record.department) {
      const deptObj = dropdownOptions.departments.find((d) => d.name === record.department);
      if (deptObj) {
        currRecieverIsOther = record.recieverName && !deptObj.receiverNames.includes(record.recieverName);
        currSenderIsOther = record.senderName && !deptObj.senderNames.includes(record.senderName);
      }
    }
    setForm({
      department: record.department || "",
      type: record.type || "recieve",
      amount: record.amount || "",
      date: record.date ? new Date(record.date).toISOString().slice(0, 10) : "",
      paymentMethod: record.paymentMethod || "",
      recieverName: currRecieverIsOther ? "__other__" : record.recieverName || "",
      senderName: currSenderIsOther ? "__other__" : record.senderName || "",
      recieverNameOther: currRecieverIsOther ? record.recieverName : "",
      senderNameOther: currSenderIsOther ? record.senderName : "",
    });
    setEditId(record._id);
    setSuccessMsg("");
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(initialFormState);
    setFormError("");
    setSuccessMsg("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSuccessMsg("Payment record deleted.");
      fetchRecords();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to delete payment record.");
    }
    setDeletingId(null);
  };

  // Show passcode gate first
  if (!authenticated) {
    return <PasscodeGate onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="py-5 sm:py-7 px-3 sm:px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black mb-1 tracking-tight">Payment Records</h1>
          <p className="text-black/50 text-sm sm:text-base">
            View, add and export payment records for internal audit and reference.
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow border border-black/10 mb-8 sm:mb-10 max-w-3xl mx-auto py-5 sm:py-7 px-4 sm:px-8">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-lg sm:text-xl font-semibold text-black">
            {editId ? "Edit Payment Record" : "Add Payment Record"}
          </span>
          {editId && (
            <span className="ml-0 sm:ml-2 px-2 py-1 rounded bg-orange-100 text-[#f58021] text-xs font-bold uppercase tracking-wider">
              Editing
            </span>
          )}
        </div>
        {(formError || successMsg) && (
          <div className={`mb-4 px-4 py-2 rounded ${formError ? "bg-red-50 border border-red-200 text-red-600" : "bg-green-50 border border-green-200 text-green-700"}`}>
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
        <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Department</label>
            <select name="department" value={form.department} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}>
              <option value="">Select...</option>
              {dropdownOptions.departments.map((dept) => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Type</label>
            <select name="type" value={form.type} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white">
              <option value="recieve">Recieve</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Amount</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              placeholder="Amount" min={0} />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading}>
              <option value="">Select...</option>
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Receiver Name</label>
            <select name="recieverName" value={form.recieverName} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading || !form.department}>
              <option value="">Select...</option>
              {selectedDeptObj && selectedDeptObj.receiverNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="__other__">Other</option>
            </select>
            {isRecieverOther && (
              <input type="text" name="recieverNameOther" value={form.recieverNameOther} onChange={handleChange} required
                placeholder="Enter receiver name"
                className="mt-2 border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
            )}
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-black">Sender Name</label>
            <select name="senderName" value={form.senderName} onChange={handleChange} required
              className="border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white"
              disabled={dropdownLoading || !form.department}>
              <option value="">Select...</option>
              {selectedDeptObj && selectedDeptObj.senderNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="__other__">Other</option>
            </select>
            {isSenderOther && (
              <input type="text" name="senderNameOther" value={form.senderNameOther} onChange={handleChange} required
                placeholder="Enter sender name"
                className="mt-2 border border-black/20 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:border-[#f58021] bg-white" />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 mt-2 sm:col-span-2 md:col-span-1">
            <button type="submit"
              className="flex items-center justify-center text-white font-semibold py-2.5 sm:py-2 px-5 rounded bg-[#f58021] hover:bg-[#e07314] transition-all"
              disabled={dropdownLoading}>
              {editId ? <><RiCheckLine className="mr-2" /> Update</> : <><RiAddLine className="mr-2" /> Add</>}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit}
                className="flex items-center justify-center text-black border border-black/20 rounded font-medium px-4 py-2.5 sm:py-2 hover:bg-black/[0.06] transition-all"
                disabled={dropdownLoading}>
                <RiCloseLine className="mr-1" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Records: cards on mobile, table on sm+ */}
      <div className="bg-white border border-black/10 rounded-lg shadow px-2 sm:px-2 py-2 mb-8">
        {loading && (
          <div className="text-center py-10 text-black/60 font-medium text-base">Loading payment records...</div>
        )}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">{apiError}</div>
        )}
        {!loading && !apiError && paymentRecords.length === 0 && (
          <div className="text-center text-black/50 py-9">No payment records found.</div>
        )}

        {!loading && !apiError && paymentRecords.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden p-2">
              {paymentRecords.map((rec) => (
                <div key={rec._id} className="rounded-lg border border-black/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${rec.type === "recieve" ? "bg-green-100 text-green-800" : "bg-[#f58021]/10 text-[#cf6d14]"}`}>
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </span>
                    <span className="font-mono font-semibold">₹{rec.amount}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs mb-3">
                    <div><div className="text-black/40 font-semibold uppercase text-[10px]">Department</div><div>{rec.department}</div></div>
                    <div><div className="text-black/40 font-semibold uppercase text-[10px]">Date</div><div>{rec.date ? new Date(rec.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : ""}</div></div>
                    <div><div className="text-black/40 font-semibold uppercase text-[10px]">Method</div><div>{rec.paymentMethod}</div></div>
                    <div><div className="text-black/40 font-semibold uppercase text-[10px]">Receiver</div><div className="truncate">{rec.recieverName}</div></div>
                    <div className="col-span-2"><div className="text-black/40 font-semibold uppercase text-[10px]">Sender</div><div>{rec.senderName}</div></div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-black/10">
                    <button onClick={() => startEdit(rec)} disabled={!!editId && editId !== rec._id}
                      className={`flex-1 flex items-center justify-center gap-1 text-[#f58021] px-2 py-1.5 rounded border border-[#f58021]/30 hover:bg-[#f58021]/10 font-medium text-sm transition-all ${!!editId && editId !== rec._id ? "opacity-30 pointer-events-none" : ""}`}
                      title="Edit">
                      <RiEdit2Line size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(rec._id)} disabled={deletingId === rec._id}
                      className={`flex-1 flex items-center justify-center gap-1 text-red-600 px-2 py-1.5 rounded border border-red-200 hover:bg-red-50 font-medium text-sm transition-all ${deletingId === rec._id ? "opacity-60 pointer-events-none" : ""}`}
                      title="Delete">
                      <RiDeleteBin6Line size={16} /> {deletingId === rec._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table on sm+ */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="min-w-full border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b border-black/10 bg-[#fffbef]">
                    <th className="p-3 font-semibold text-left">Department</th>
                    <th className="p-3 font-semibold text-left">Type</th>
                    <th className="p-3 font-semibold text-left">Amount</th>
                    <th className="p-3 font-semibold text-left">Date</th>
                    <th className="p-3 font-semibold text-left">Payment Method</th>
                    <th className="p-3 font-semibold text-left">Receiver Name</th>
                    <th className="p-3 font-semibold text-left">Sender Name</th>
                    <th className="p-3 font-semibold text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRecords.map((rec) => (
                    <tr key={rec._id} className="border-b border-black/10 hover:bg-black/[0.03] group">
                      <td className="p-3">{rec.department}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${rec.type === "recieve" ? "bg-green-100 text-green-800" : "bg-[#f58021]/10 text-[#cf6d14]"}`}>
                          {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold">₹{rec.amount}</td>
                      <td className="p-3 whitespace-nowrap">
                        {rec.date ? new Date(rec.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : ""}
                      </td>
                      <td className="p-3">{rec.paymentMethod}</td>
                      <td className="p-3">{rec.recieverName}</td>
                      <td className="p-3">{rec.senderName}</td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => startEdit(rec)} disabled={!!editId && editId !== rec._id}
                          className={`flex items-center gap-1 text-[#f58021] px-2 py-1 rounded hover:bg-[#f58021]/10 font-medium transition-all ${!!editId && editId !== rec._id ? "opacity-30 pointer-events-none" : ""}`}
                          title="Edit">
                          <RiEdit2Line size={18} />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                        <button onClick={() => handleDelete(rec._id)} disabled={deletingId === rec._id}
                          className={`flex items-center gap-1 text-red-600 px-2 py-1 rounded hover:bg-red-50 font-medium transition-all ${deletingId === rec._id ? "opacity-60 pointer-events-none" : ""}`}
                          title="Delete">
                          <RiDeleteBin6Line size={18} />
                          <span className="hidden md:inline">{deletingId === rec._id ? "Deleting..." : "Delete"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentRecord;