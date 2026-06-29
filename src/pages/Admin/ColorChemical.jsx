// // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';

// // const API_BASE = import.meta.env.VITE_API_BASE_URL
// //   ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
// //   : '/api/v1/color-chemicals';

// // const initialForm = {
// //   challanNo: '',
// //   date: '',
// //   shopName: '',
// //   challanPhotoUpload: '',
// //   Amount: '',
// //   receiverName: '',
// //   remark: ''
// // };

// // const ColorChemical = () => {
// //   const [colorChemicals, setColorChemicals] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [form, setForm] = useState(initialForm);
// //   const [editId, setEditId] = useState(null);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [file, setFile] = useState(null);

// //   const fetchColorChemicals = async () => {
// //     setLoading(true);
// //     setError('');
// //     try {
// //       const res = await axios.get(API_BASE);
// //       setColorChemicals(res.data);
// //     } catch (err) {
// //       setError('Failed to fetch color chemicals.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchColorChemicals();
// //   }, []);

// //   const handleChange = (e) => {
// //     setForm((prev) => ({
// //       ...prev,
// //       [e.target.name]: e.target.value,
// //     }));
// //   };

// //   const handleFileChange = (e) => {
// //     setFile(e.target.files[0]);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');
// //     setSuccess('');

// //     try {
// //       let formData = new FormData();
// //       formData.append('challanNo', form.challanNo);
// //       formData.append('date', form.date);
// //       formData.append('shopName', form.shopName);
// //       formData.append('Amount', form.Amount);
// //       formData.append('receiverName', form.receiverName);
// //       formData.append('remark', form.remark);
// //       if (file) formData.append('challanPhotoUpload', file);

// //       if (editId) {
// //         // For edit, if user didn't select a new file, do not re-send file.
// //         if (!file) formData.delete('challanPhotoUpload');

// //         await axios.put(`${API_BASE}/${editId}`, formData, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //         setSuccess('Color Chemical updated successfully.');
// //       } else {
// //         await axios.post(API_BASE, formData, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //         setSuccess('Color Chemical added successfully.');
// //       }
// //       setForm(initialForm);
// //       setFile(null);
// //       setEditId(null);
// //       fetchColorChemicals();
// //     } catch (err) {
// //       setError('Failed to submit. Please check the details.');
// //     }
// //   };

// //   const handleEdit = (item) => {
// //     setForm({
// //       challanNo: item.challanNo || '',
// //       date: item.date ? item.date.slice(0, 10) : '',
// //       shopName: item.shopName || '',
// //       challanPhotoUpload: item.challanPhotoUpload || '',
// //       Amount: item.Amount || '',
// //       receiverName: item.receiverName || '',
// //       remark: item.remark || '',
// //     });
// //     setFile(null);
// //     setEditId(item._id);
// //     setError('');
// //     setSuccess('');
// //   };

// //   const handleDelete = async (id) => {
// //     if (!window.confirm('Are you sure you want to delete this color chemical?')) return;
// //     setError('');
// //     setSuccess('');
// //     try {
// //       await axios.delete(`${API_BASE}/${id}`);
// //       setSuccess('Color Chemical deleted.');
// //       fetchColorChemicals();
// //     } catch {
// //       setError('Failed to delete.');
// //     }
// //   };

// //   const handleCancelEdit = () => {
// //     setEditId(null);
// //     setForm(initialForm);
// //     setFile(null);
// //     setError('');
// //     setSuccess('');
// //   };

// //   return (
// //     <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
// //       <h2>Color Chemicals</h2>

// //       <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
// //         <div>
// //           <label>
// //             Challan No:{' '}
// //             <input
// //               name="challanNo"
// //               value={form.challanNo}
// //               onChange={handleChange}
// //               required
// //             />
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Date:{' '}
// //             <input
// //               name="date"
// //               type="date"
// //               value={form.date}
// //               onChange={handleChange}
// //               required
// //             />
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Shop Name:{' '}
// //             <input
// //               name="shopName"
// //               value={form.shopName}
// //               onChange={handleChange}
// //               required
// //             />
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Challan Photo Upload:{' '}
// //             <input
// //               name="challanPhotoUpload"
// //               type="file"
// //               accept="image/*"
// //               onChange={handleFileChange}
// //               required={!editId}
// //             />
// //             {editId && form.challanPhotoUpload && !file && (
// //               <span> (Current: <a href={form.challanPhotoUpload} target="_blank" rel="noopener noreferrer">View</a>)</span>
// //             )}
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Amount:{' '}
// //             <input
// //               name="Amount"
// //               type="number"
// //               value={form.Amount}
// //               onChange={handleChange}
// //             />
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Receiver Name:{' '}
// //             <input
// //               name="receiverName"
// //               value={form.receiverName}
// //               onChange={handleChange}
// //               required
// //             />
// //           </label>
// //         </div>
// //         <div>
// //           <label>
// //             Remark:{' '}
// //             <input
// //               name="remark"
// //               value={form.remark}
// //               onChange={handleChange}
// //               maxLength={200}
// //             />
// //           </label>
// //         </div>
// //         <div style={{ marginTop: 10 }}>
// //           <button type="submit">{editId ? 'Update' : 'Add'}</button>
// //           {editId && (
// //             <button type="button" onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
// //               Cancel Edit
// //             </button>
// //           )}
// //         </div>
// //       </form>

// //       {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
// //       {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
// //       {loading ? (
// //         <div>Loading...</div>
// //       ) : (
// //         <div>
// //           <table border={1} cellSpacing={0} cellPadding={8} width="100%">
// //             <thead>
// //               <tr>
// //                 <th>Challan No</th>
// //                 <th>Date</th>
// //                 <th>Shop Name</th>
// //                 <th>Challan Photo</th>
// //                 <th>Amount</th>
// //                 <th>Receiver Name</th>
// //                 <th>Remark</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {colorChemicals.map((item) => (
// //                 <tr key={item._id}>
// //                   <td>{item.challanNo}</td>
// //                   <td>{item.date ? new Date(item.date).toLocaleDateString() : ''}</td>
// //                   <td>{item.shopName}</td>
// //                   <td>
// //                     {item.challanPhotoUpload
// //                       ? (
// //                         <a
// //                           href={item.challanPhotoUpload}
// //                           target="_blank"
// //                           rel="noopener noreferrer"
// //                         >
// //                           View
// //                         </a>
// //                       )
// //                       : 'N/A'
// //                     }
// //                   </td>
// //                   <td>{item.Amount !== undefined ? item.Amount : ''}</td>
// //                   <td>{item.receiverName}</td>
// //                   <td>{item.remark}</td>
// //                   <td>
// //                     <button onClick={() => handleEdit(item)}>Edit</button>
// //                     <button
// //                       onClick={() => handleDelete(item._id)}
// //                       style={{ marginLeft: 6 }}
// //                     >
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //               {!colorChemicals.length && (
// //                 <tr>
// //                   <td colSpan={8}>No color chemicals found.</td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ColorChemical;

// import React, { useEffect, useRef, useState } from 'react';
// import axios from 'axios';

// // Helper to get correct API base for both data (API_BASE) and images (UPLOADS_BASE)
// const API_BASE = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
//   : '/api/v1/color-chemicals';

// // This is the base for image uploads - must match your backend public uploads URL
// const UPLOADS_BASE = import.meta.env.VITE_API_BASE_URL
//   ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/uploads'
//   : (window.location.origin + '/api/v1/uploads');

// const initialForm = {
//   challanNo: '',
//   date: '',
//   shopName: '',
//   Amount: '',
//   receiverName: '',
//   remark: '',
// };

// /* ─── tiny design tokens ─────────────────────────────────────── */
// const COLOR = {
//   primary:   '#3b5bdb',
//   primaryHov:'#2f4ac2',
//   danger:    '#e03131',
//   dangerHov: '#c92a2a',
//   success:   '#2f9e44',
//   warning:   '#f59f00',
//   border:    '#dee2e6',
//   bg:        '#f8f9fa',
//   surface:   '#ffffff',
//   text:      '#212529',
//   muted:     '#6c757d',
//   rowHov:    '#f1f3f5',
//   badgeBg:   '#e7f5ff',
//   badgeText: '#1971c2',
// };

// const s = {
//   page: {
//     fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
//     backgroundColor: COLOR.bg,
//     minHeight: '100vh',
//     padding: '28px 24px',
//     color: COLOR.text,
//   },
//   header: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 28,
//   },
//   headerIcon: {
//     width: 40, height: 40,
//     background: COLOR.primary,
//     borderRadius: 10,
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     color: '#fff', fontSize: 20,
//     flexShrink: 0,
//   },
//   h1: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' },
//   subtitle: { fontSize: 13, color: COLOR.muted, margin: '2px 0 0' },

//   card: {
//     background: COLOR.surface,
//     border: `1px solid ${COLOR.border}`,
//     borderRadius: 12,
//     boxShadow: '0 1px 4px rgba(0,0,0,.06)',
//   },
//   cardHeader: {
//     padding: '16px 20px',
//     borderBottom: `1px solid ${COLOR.border}`,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   cardTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
//   cardBody: { padding: 20 },

//   grid2: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
//     gap: '14px 20px',
//   },
//   formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
//   label: { fontSize: 12, fontWeight: 600, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.5px' },
//   input: {
//     height: 38,
//     padding: '0 11px',
//     border: `1px solid ${COLOR.border}`,
//     borderRadius: 7,
//     fontSize: 14,
//     color: COLOR.text,
//     outline: 'none',
//     width: '100%',
//     boxSizing: 'border-box',
//     transition: 'border-color .15s',
//     backgroundColor: COLOR.surface,
//   },
//   fileWrap: {
//     border: `1.5px dashed ${COLOR.border}`,
//     borderRadius: 7,
//     padding: '10px 12px',
//     fontSize: 13,
//     cursor: 'pointer',
//     backgroundColor: COLOR.bg,
//     display: 'flex',
//     alignItems: 'center',
//     gap: 8,
//   },

//   btnRow: { display: 'flex', gap: 10, marginTop: 20 },
//   btn: (color, hov) => ({
//     padding: '0 20px',
//     height: 38,
//     border: 'none',
//     borderRadius: 7,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: 'pointer',
//     backgroundColor: color,
//     color: '#fff',
//     transition: 'background .15s',
//     display: 'flex', alignItems: 'center', gap: 6,
//   }),
//   btnGhost: {
//     padding: '0 16px',
//     height: 38,
//     border: `1px solid ${COLOR.border}`,
//     borderRadius: 7,
//     fontSize: 13,
//     fontWeight: 500,
//     cursor: 'pointer',
//     backgroundColor: COLOR.surface,
//     color: COLOR.text,
//   },

//   alert: (type) => ({
//     padding: '10px 14px',
//     borderRadius: 8,
//     fontSize: 13,
//     marginBottom: 16,
//     display: 'flex',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: type === 'error' ? '#fff5f5' : '#ebfbee',
//     border: `1px solid ${type === 'error' ? '#ffc9c9' : '#b2f2bb'}`,
//     color: type === 'error' ? COLOR.danger : COLOR.success,
//   }),

//   table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
//   th: {
//     padding: '10px 14px',
//     textAlign: 'left',
//     fontSize: 11,
//     fontWeight: 700,
//     color: COLOR.muted,
//     textTransform: 'uppercase',
//     letterSpacing: '0.5px',
//     borderBottom: `2px solid ${COLOR.border}`,
//     whiteSpace: 'nowrap',
//   },
//   td: {
//     padding: '11px 14px',
//     borderBottom: `1px solid ${COLOR.border}`,
//     verticalAlign: 'middle',
//     color: COLOR.text,
//   },

//   badge: {
//     display: 'inline-block',
//     padding: '3px 10px',
//     borderRadius: 20,
//     fontSize: 12,
//     fontWeight: 600,
//     backgroundColor: COLOR.badgeBg,
//     color: COLOR.badgeText,
//   },
//   photoLink: {
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: 4,
//     color: COLOR.primary,
//     textDecoration: 'none',
//     fontSize: 13,
//     fontWeight: 500,
//   },
//   iconBtn: (color) => ({
//     border: 'none',
//     borderRadius: 6,
//     padding: '5px 10px',
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//     backgroundColor: `${color}18`,
//     color: color,
//     transition: 'background .15s',
//   }),

//   empty: {
//     textAlign: 'center',
//     padding: '48px 0',
//     color: COLOR.muted,
//     fontSize: 14,
//   },

//   previewWrap: {
//     marginTop: 8,
//     borderRadius: 7,
//     overflow: 'hidden',
//     border: `1px solid ${COLOR.border}`,
//     display: 'inline-block',
//   },
//   previewImg: {
//     display: 'block',
//     width: 80, height: 60,
//     objectFit: 'cover',
//   },
//   previewLargeWrap: {
//     marginTop: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//     border: `1px solid ${COLOR.border}`,
//     display: 'inline-flex',
//     flexDirection: 'column',
//     alignItems: 'flex-start'
//   },
//   previewLargeImg: {
//     display: 'block',
//     width: 320, height: 260,
//     objectFit: 'contain',
//     background: COLOR.bg,
//     borderRadius: 6,
//   },
//   downloadBtn: {
//     marginTop: 6,
//     padding: '4px 14px',
//     border: 'none',
//     borderRadius: 6,
//     backgroundColor: COLOR.primary,
//     color: '#fff',
//     fontWeight: 500,
//     fontSize: 13,
//     cursor: 'pointer',
//     transition: 'background .18s',
//     textDecoration: 'none',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: 5,
//   }
// };

// /* ─── component ─────────────────────────────────────────────── */
// const ColorChemical = () => {
//   const [records, setRecords]       = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm]             = useState(initialForm);
//   const [editId, setEditId]         = useState(null);
//   const [existingPhoto, setExistingPhoto] = useState('');
//   const [file, setFile]             = useState(null);
//   const [preview, setPreview]       = useState('');
//   const [error, setError]           = useState('');
//   const [success, setSuccess]       = useState('');
//   const [showPreviewId, setShowPreviewId] = useState(null); // for table preview
//   const fileRef = useRef();
//   const formRef = useRef();

//   /* ── data fetching ─────────────────────────────────────────── */
//   const load = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(API_BASE);
//       setRecords(res.data);
//     } catch {
//       setError('Failed to fetch records. Check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   /* ── form handlers ─────────────────────────────────────────── */
//   const handleChange = (e) =>
//     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

//   const handleFileChange = (e) => {
//     const f = e.target.files[0];
//     setFile(f || null);
//     if (f) {
//       const reader = new FileReader();
//       reader.onload = (ev) => setPreview(ev.target.result);
//       reader.readAsDataURL(f);
//     } else {
//       setPreview('');
//     }
//   };

//   const resetForm = () => {
//     setForm(initialForm);
//     setFile(null);
//     setPreview('');
//     setExistingPhoto('');
//     setEditId(null);
//     setError('');
//     setSuccess('');
//     if (fileRef.current) fileRef.current.value = '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file && !editId) { setError('Please select a challan photo.'); return; }
//     setError('');
//     setSuccess('');
//     setSubmitting(true);

//     try {
//       const fd = new FormData();
//       fd.append('challanNo', form.challanNo);
//       fd.append('date', form.date);
//       fd.append('shopName', form.shopName);
//       fd.append('Amount', form.Amount);
//       fd.append('receiverName', form.receiverName);
//       fd.append('remark', form.remark);
//       // Field name matches multer upload.single('challanPhotoUpload')
//       if (file) fd.append('challanPhotoUpload', file);

//       const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };

//       if (editId) {
//         await axios.put(`${API_BASE}/${editId}`, fd, cfg);
//         setSuccess('Record updated successfully.');
//       } else {
//         await axios.post(API_BASE, fd, cfg);
//         setSuccess('Record added successfully.');
//       }

//       resetForm();
//       load();
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to save. Please check the details.';
//       setError(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (item) => {
//     setForm({
//       challanNo:    item.challanNo    || '',
//       date:         item.date ? item.date.slice(0, 10) : '',
//       shopName:     item.shopName     || '',
//       Amount:       item.Amount       != null ? String(item.Amount) : '',
//       receiverName: item.receiverName || '',
//       remark:       item.remark       || '',
//     });
//     setFile(null);
//     setPreview('');
//     setExistingPhoto(item.challanPhotoUpload || '');
//     setEditId(item._id);
//     setError('');
//     setSuccess('');
//     formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this color chemical record?')) return;
//     setError('');
//     setSuccess('');
//     try {
//       await axios.delete(`${API_BASE}/${id}`);
//       setSuccess('Record deleted.');
//       load();
//     } catch {
//       setError('Failed to delete the record.');
//     }
//   };

//   // --- Download helper for images
//   const fetchAndDownloadImage = async (imgUrl, filename) => {
//     try {
//       // always use the full URL for fetch
//       // To fix CORS issue, images must be hosted with correct CORS headers.
//       // If your backend does not do this, you cannot bypass CORS.
//       // Solution: open image in new tab as fallback if download via fetch fails.
//       // Use 'no-cors' as last resort (won't work for download), but this is not a solution.
//       const res = await fetch(imgUrl, { mode: 'cors', credentials: 'include' });
//       if (!res.ok) throw new Error('Failed to download');
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename || '';
//       document.body.appendChild(a);
//       a.click();
//       setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//       }, 600);
//     } catch {
//       // fallback: open image in new tab (user can right-click and "Save as")
//       window.open(imgUrl, '_blank', 'noopener,noreferrer');
//       alert('Image direct download failed (CORS/permission issue). Opened in new tab for manual download.');
//     }
//   };

//   // Returns a fully-qualified URL for uploaded images using the UPLOADS_BASE.
//   const getFullImgUrl = (imgPath) => {
//     if (!imgPath) return '';
//     if (/^https?:\/\//i.test(imgPath)) return imgPath; // absolute
//     // If imgPath is already a full path (starts with /api/v1/uploads or /uploads), strip the leading for join
//     let cleanPath = imgPath.replace(/^[\/]*uploads[\/]*/, '');
//     cleanPath = cleanPath.replace(/^api\/v1\/uploads[\/]*/i, '');
//     // build URL
//     return `${UPLOADS_BASE.replace(/\/$/, '')}/${cleanPath.replace(/^\/+/, '')}`;
//   };

//   /* ── render ────────────────────────────────────────────────── */
//   const isEditing = Boolean(editId);

//   return (
//     <div style={s.page}>
//       {/* Page header */}
//       <div style={s.header}>
//         <div style={s.headerIcon}>🧪</div>
//         <div>
//           <h1 style={s.h1}>Color Chemicals</h1>
//           <p style={s.subtitle}>Manage challan records for color chemical purchases</p>
//         </div>
//       </div>

//       {/* Alerts */}
//       {error   && <div style={s.alert('error')}>  ⚠ {error}</div>}
//       {success && <div style={s.alert('success')}>✓ {success}</div>}

//       {/* Form card */}
//       <div style={{ ...s.card, marginBottom: 24 }} ref={formRef}>
//         <div style={s.cardHeader}>
//           <span style={s.cardTitle}>
//             {isEditing ? '✏️  Edit Record' : '➕  Add New Record'}
//           </span>
//           {isEditing && (
//             <button style={s.btnGhost} onClick={resetForm}>Cancel</button>
//           )}
//         </div>

//         <div style={s.cardBody}>
//           <form onSubmit={handleSubmit}>
//             <div style={s.grid2}>
//               {/* Challan No */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Challan No *</label>
//                 <input
//                   style={s.input}
//                   name="challanNo"
//                   value={form.challanNo}
//                   onChange={handleChange}
//                   placeholder="e.g. CH-2024-001"
//                   required
//                 />
//               </div>

//               {/* Date */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Date *</label>
//                 <input
//                   style={s.input}
//                   name="date"
//                   type="date"
//                   value={form.date}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               {/* Shop Name */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Shop Name *</label>
//                 <input
//                   style={s.input}
//                   name="shopName"
//                   value={form.shopName}
//                   onChange={handleChange}
//                   placeholder="Supplier shop name"
//                   required
//                 />
//               </div>

//               {/* Amount */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Amount (₹)</label>
//                 <input
//                   style={s.input}
//                   name="Amount"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.Amount}
//                   onChange={handleChange}
//                   placeholder="0.00"
//                 />
//               </div>

//               {/* Receiver Name */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Receiver Name *</label>
//                 <input
//                   style={s.input}
//                   name="receiverName"
//                   value={form.receiverName}
//                   onChange={handleChange}
//                   placeholder="Person who received it"
//                   required
//                 />
//               </div>

//               {/* Remark */}
//               <div style={s.formGroup}>
//                 <label style={s.label}>Remark</label>
//                 <input
//                   style={s.input}
//                   name="remark"
//                   value={form.remark}
//                   onChange={handleChange}
//                   placeholder="Optional note"
//                   maxLength={200}
//                 />
//               </div>
//             </div>

//             {/* File upload — full width row */}
//             <div style={{ ...s.formGroup, marginTop: 14 }}>
//               <label style={s.label}>
//                 Challan Photo {isEditing ? '(leave blank to keep existing)' : '*'}
//               </label>

//               <label style={s.fileWrap}>
//                 <span style={{ fontSize: 18 }}>📎</span>
//                 <span style={{ color: file ? COLOR.text : COLOR.muted, flex: 1, fontSize: 13 }}>
//                   {file ? file.name : 'Click to choose image (JPG, PNG, etc.)'}
//                 </span>
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   style={{ display: 'none' }}
//                 />
//               </label>

//               {/* New file preview (large, with download) */}
//               {preview && (
//                 <div style={s.previewLargeWrap}>
//                   <img src={preview} alt="preview" style={s.previewLargeImg} />
//                   <button
//                     style={s.downloadBtn}
//                     type="button"
//                     onClick={() => {
//                       const filename = file?.name || 'challan-photo.jpg';
//                       // DataURL preview; just trigger download
//                       const a = document.createElement('a');
//                       a.href = preview;
//                       a.download = filename;
//                       document.body.appendChild(a);
//                       a.click();
//                       setTimeout(() => document.body.removeChild(a), 600);
//                     }}
//                   >
//                     ⬇ Download Preview
//                   </button>
//                 </div>
//               )}

//               {/* Existing photo (edit mode, no new file selected) */}
//               {isEditing && existingPhoto && !file && (
//                 <div style={s.previewLargeWrap}>
//                   <img
//                     src={getFullImgUrl(existingPhoto)}
//                     alt="View Challan"
//                     style={s.previewLargeImg}
//                   />
//                   <button
//                     style={s.downloadBtn}
//                     type="button"
//                     onClick={() => fetchAndDownloadImage(
//                       getFullImgUrl(existingPhoto),
//                       existingPhoto.split('/').pop() || 'challan-photo.jpg'
//                     )}
//                   >
//                     ⬇ Download
//                   </button>
//                 </div>
//               )}
//             </div>

//             <div style={s.btnRow}>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 style={{
//                   ...s.btn(COLOR.primary),
//                   opacity: submitting ? 0.7 : 1,
//                   cursor: submitting ? 'not-allowed' : 'pointer',
//                 }}
//               >
//                 {submitting
//                   ? (isEditing ? 'Updating…' : 'Adding…')
//                   : (isEditing ? '✓ Update Record' : '+ Add Record')}
//               </button>
//               {isEditing && (
//                 <button type="button" style={s.btnGhost} onClick={resetForm}>
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Table card */}
//       <div style={s.card}>
//         <div style={s.cardHeader}>
//           <span style={s.cardTitle}>
//             All Records
//             {records.length > 0 && (
//               <span style={{ ...s.badge, marginLeft: 10, fontSize: 11 }}>
//                 {records.length}
//               </span>
//             )}
//           </span>
//         </div>

//         <div style={{ overflowX: 'auto' }}>
//           {loading ? (
//             <div style={s.empty}>⏳ Loading records…</div>
//           ) : records.length === 0 ? (
//             <div style={s.empty}>
//               <div style={{ fontSize: 32, marginBottom: 8 }}>🧪</div>
//               <div style={{ fontWeight: 600, marginBottom: 4 }}>No records yet</div>
//               <div style={{ color: COLOR.muted, fontSize: 13 }}>
//                 Add your first color chemical challan above.
//               </div>
//             </div>
//           ) : (
//             <table style={s.table}>
//               <thead>
//                 <tr>
//                   {['Challan No', 'Date', 'Shop Name', 'Photo', 'Amount (₹)', 'Receiver', 'Remark', 'Actions'].map((h) => (
//                     <th key={h} style={s.th}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {records.map((item) => {
//                   const previewImgUrl = getFullImgUrl(item.challanPhotoUpload);
//                   const open = showPreviewId === item._id;

//                   return (
//                     <React.Fragment key={item._id}>
//                       <tr
//                         style={{ transition: 'background .12s' }}
//                         onMouseEnter={(e) => (e.currentTarget.style.background = COLOR.rowHov)}
//                         onMouseLeave={(e) => (e.currentTarget.style.background = '')}
//                       >
//                         <td style={s.td}>
//                           <span style={s.badge}>{item.challanNo}</span>
//                         </td>
//                         <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
//                           {item.date
//                             ? new Date(item.date).toLocaleDateString('en-IN', {
//                                 day: '2-digit', month: 'short', year: 'numeric',
//                               })
//                             : '—'}
//                         </td>
//                         <td style={s.td}>{item.shopName}</td>
//                         <td style={s.td}>
//                           {item.challanPhotoUpload
//                             ? (
//                               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                                 <button
//                                   type="button"
//                                   style={{ ...s.photoLink, background: 'none', border: 0, padding: 0, cursor: 'pointer'}}
//                                   onClick={() =>
//                                     setShowPreviewId(open ? null : item._id)
//                                   }
//                                   title={open ? 'Hide Preview' : 'Show Preview'}
//                                 >
//                                   {open ? '🙈 Hide' : <><span role="img" aria-label="view">🖼</span> Preview</>}
//                                 </button>
//                                 <button
//                                   type="button"
//                                   style={s.downloadBtn}
//                                   title="Download Image"
//                                   onClick={() =>
//                                     fetchAndDownloadImage(
//                                       previewImgUrl,
//                                       item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
//                                     )
//                                   }
//                                 >
//                                   ⬇
//                                 </button>
//                               </div>
//                             )
//                             : <span style={{ color: COLOR.muted }}>—</span>}
//                         </td>
//                         <td style={{ ...s.td, fontWeight: 600 }}>
//                           {item.Amount != null
//                             ? `₹${Number(item.Amount).toLocaleString('en-IN')}`
//                             : '—'}
//                         </td>
//                         <td style={s.td}>{item.receiverName}</td>
//                         <td style={{ ...s.td, color: COLOR.muted, maxWidth: 160 }}>
//                           <span title={item.remark} style={{
//                             display: 'block',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             whiteSpace: 'nowrap',
//                           }}>
//                             {item.remark || '—'}
//                           </span>
//                         </td>
//                         <td style={s.td}>
//                           <div style={{ display: 'flex', gap: 6 }}>
//                             <button
//                               style={s.iconBtn(COLOR.primary)}
//                               onClick={() => handleEdit(item)}
//                             >
//                               ✏ Edit
//                             </button>
//                             <button
//                               style={s.iconBtn(COLOR.danger)}
//                               onClick={() => handleDelete(item._id)}
//                             >
//                               🗑 Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                       {/* Preview row */}
//                       {open && item.challanPhotoUpload && (
//                         <tr>
//                           <td colSpan={8} style={{ background: COLOR.bg, paddingTop: 0, paddingBottom: 14 }}>
//                             <div style={{
//                               display: 'flex',
//                               alignItems: 'flex-start',
//                               gap: 18,
//                               margin: '10px 0',
//                               flexWrap: 'wrap'
//                             }}>
//                               <div style={s.previewLargeWrap}>
//                                 <img
//                                   src={previewImgUrl}
//                                   alt="Preview"
//                                   style={s.previewLargeImg}
//                                   // Direct access to cross origin image might be blocked, but
//                                   // our getFullImgUrl() ensures the URL is correct for the user's setup.
//                                 />
//                                 <button
//                                   type="button"
//                                   style={s.downloadBtn}
//                                   onClick={() =>
//                                     fetchAndDownloadImage(
//                                       previewImgUrl,
//                                       item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
//                                     )
//                                   }
//                                 >
//                                   ⬇ Download
//                                 </button>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ColorChemical;

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
  : '/api/v1/color-chemicals';

const UPLOADS_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/uploads'
  : (window.location.origin + '/api/v1/uploads');

const PASSCODE_API = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/users/verify-payment-department-passcode`
  : '/api/v1/verify-payment-department-passcode';

const BRAND_ORANGE = '#f58021';

const initialForm = {
  challanNo: '',
  date: '',
  shopName: '',
  Amount: '',
  receiverName: '',
  remark: '',
};

/* ─── design tokens ──────────────────────────────────────────── */
const COLOR = {
  primary:   '#3b5bdb',
  primaryHov:'#2f4ac2',
  danger:    '#e03131',
  dangerHov: '#c92a2a',
  success:   '#2f9e44',
  warning:   '#f59f00',
  border:    '#dee2e6',
  bg:        '#f8f9fa',
  surface:   '#ffffff',
  text:      '#212529',
  muted:     '#6c757d',
  rowHov:    '#f1f3f5',
  badgeBg:   '#e7f5ff',
  badgeText: '#1971c2',
};

const s = {
  page: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    backgroundColor: COLOR.bg,
    minHeight: '100vh',
    padding: '28px 24px',
    color: COLOR.text,
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  headerIcon: {
    width: 40, height: 40, background: COLOR.primary, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 20, flexShrink: 0,
  },
  h1: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' },
  subtitle: { fontSize: 13, color: COLOR.muted, margin: '2px 0 0' },
  card: {
    background: COLOR.surface, border: `1px solid ${COLOR.border}`,
    borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  },
  cardHeader: {
    padding: '16px 20px', borderBottom: `1px solid ${COLOR.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
  cardBody: { padding: 20 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px 20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    height: 38, padding: '0 11px', border: `1px solid ${COLOR.border}`,
    borderRadius: 7, fontSize: 14, color: COLOR.text, outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color .15s',
    backgroundColor: COLOR.surface,
  },
  fileWrap: {
    border: `1.5px dashed ${COLOR.border}`, borderRadius: 7, padding: '10px 12px',
    fontSize: 13, cursor: 'pointer', backgroundColor: COLOR.bg,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  btnRow: { display: 'flex', gap: 10, marginTop: 20 },
  btn: (color) => ({
    padding: '0 20px', height: 38, border: 'none', borderRadius: 7,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', backgroundColor: color,
    color: '#fff', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 6,
  }),
  btnGhost: {
    padding: '0 16px', height: 38, border: `1px solid ${COLOR.border}`,
    borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    backgroundColor: COLOR.surface, color: COLOR.text,
  },
  alert: (type) => ({
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
    backgroundColor: type === 'error' ? '#fff5f5' : '#ebfbee',
    border: `1px solid ${type === 'error' ? '#ffc9c9' : '#b2f2bb'}`,
    color: type === 'error' ? COLOR.danger : COLOR.success,
  }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: `2px solid ${COLOR.border}`, whiteSpace: 'nowrap',
  },
  td: { padding: '11px 14px', borderBottom: `1px solid ${COLOR.border}`, verticalAlign: 'middle', color: COLOR.text },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, backgroundColor: COLOR.badgeBg, color: COLOR.badgeText,
  },
  photoLink: {
    display: 'inline-flex', alignItems: 'center', gap: 4, color: COLOR.primary,
    textDecoration: 'none', fontSize: 13, fontWeight: 500,
  },
  iconBtn: (color) => ({
    border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12,
    fontWeight: 600, cursor: 'pointer', backgroundColor: `${color}18`,
    color: color, transition: 'background .15s',
  }),
  empty: { textAlign: 'center', padding: '48px 0', color: COLOR.muted, fontSize: 14 },
  previewLargeWrap: {
    marginTop: 8, borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLOR.border}`,
    display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
  },
  previewLargeImg: {
    display: 'block', width: 320, height: 260, objectFit: 'contain',
    background: COLOR.bg, borderRadius: 6,
  },
  downloadBtn: {
    marginTop: 6, padding: '4px 14px', border: 'none', borderRadius: 6,
    backgroundColor: COLOR.primary, color: '#fff', fontWeight: 500, fontSize: 13,
    cursor: 'pointer', transition: 'background .18s', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 5,
  },
};

/* ─── PasscodeGate (same API as PaymentRecord) ───────────────── */
function PasscodeGate({ onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!passcode.trim()) { setError('Enter the passcode to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        PASSCODE_API,
        { passcode: passcode.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (res.data?.success) {
        onSuccess();
      } else {
        setError('Incorrect passcode. Try again.');
        setPasscode('');
        inputRef.current?.focus();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Incorrect passcode. Try again.');
      setPasscode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f9fafb',
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '36px 32px 28px', width: 360,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: '#fff7ed',
          border: '1px solid #fed7aa', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 20, fontSize: 20,
        }}>
          🔒
        </div>

        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
          Color Chemicals Access
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6b7280' }}>
          Enter the passcode to manage color chemical records.
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
          Passcode
        </label>
        <input
          ref={inputRef}
          type="password"
          value={passcode}
          onChange={(e) => { setPasscode(e.target.value); setError(''); }}
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
            background: loading ? '#fdba74' : BRAND_ORANGE,
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────────── */
const getFullImgUrl = (imgPath) => {
  if (!imgPath) return '';
  if (/^https?:\/\//i.test(imgPath)) return imgPath;
  let cleanPath = imgPath.replace(/^[\/]*uploads[\/]*/, '');
  cleanPath = cleanPath.replace(/^api\/v1\/uploads[\/]*/i, '');
  return `${UPLOADS_BASE.replace(/\/$/, '')}/${cleanPath.replace(/^\/+/, '')}`;
};

const fetchAndDownloadImage = async (imgUrl, filename) => {
  try {
    const res = await fetch(imgUrl, { mode: 'cors', credentials: 'include' });
    if (!res.ok) throw new Error('Failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || '';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 600);
  } catch {
    window.open(imgUrl, '_blank', 'noopener,noreferrer');
    alert('Direct download failed (CORS). Opened in new tab — right-click to Save As.');
  }
};

/* ─── ColorChemical ──────────────────────────────────────────── */
const ColorChemical = () => {
  const [authenticated, setAuthenticated] = useState(false);

  const [records, setRecords]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm]                   = useState(initialForm);
  const [editId, setEditId]               = useState(null);
  const [existingPhoto, setExistingPhoto] = useState('');
  const [file, setFile]                   = useState(null);
  const [preview, setPreview]             = useState('');
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [showPreviewId, setShowPreviewId] = useState(null);
  const fileRef = useRef();
  const formRef = useRef();

  /* ── fetch ─────────────────────────────────────────────────── */
  const loadRecords = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(API_BASE);
      setRecords(res.data);
    } catch {
      setError('Failed to fetch records. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authenticated) loadRecords(); }, [authenticated]);

  /* ── form ──────────────────────────────────────────────────── */
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  };

  const resetForm = () => {
    setForm(initialForm); setFile(null); setPreview('');
    setExistingPhoto(''); setEditId(null); setError(''); setSuccess('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !editId) { setError('Please select a challan photo.'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('challanNo', form.challanNo);
      fd.append('date', form.date);
      fd.append('shopName', form.shopName);
      fd.append('Amount', form.Amount);
      fd.append('receiverName', form.receiverName);
      fd.append('remark', form.remark);
      if (file) fd.append('challanPhotoUpload', file);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editId) {
        await axios.put(`${API_BASE}/${editId}`, fd, cfg);
        setSuccess('Record updated successfully.');
      } else {
        await axios.post(API_BASE, fd, cfg);
        setSuccess('Record added successfully.');
      }
      resetForm(); loadRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please check the details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      challanNo:    item.challanNo    || '',
      date:         item.date ? item.date.slice(0, 10) : '',
      shopName:     item.shopName     || '',
      Amount:       item.Amount != null ? String(item.Amount) : '',
      receiverName: item.receiverName || '',
      remark:       item.remark       || '',
    });
    setFile(null); setPreview('');
    setExistingPhoto(item.challanPhotoUpload || '');
    setEditId(item._id); setError(''); setSuccess('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this color chemical record?')) return;
    setError(''); setSuccess('');
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSuccess('Record deleted.');
      loadRecords();
    } catch {
      setError('Failed to delete the record.');
    }
  };

  /* ── gate ──────────────────────────────────────────────────── */
  if (!authenticated) {
    return <PasscodeGate onSuccess={() => setAuthenticated(true)} />;
  }

  const isEditing = Boolean(editId);

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIcon}>🧪</div>
        <div>
          <h1 style={s.h1}>Color Chemicals</h1>
          <p style={s.subtitle}>Manage challan records for color chemical purchases</p>
        </div>
      </div>

      {error   && <div style={s.alert('error')}>⚠ {error}</div>}
      {success && <div style={s.alert('success')}>✓ {success}</div>}

      {/* Form card */}
      <div style={{ ...s.card, marginBottom: 24 }} ref={formRef}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>
            {isEditing ? '✏️  Edit Record' : '➕  Add New Record'}
          </span>
          {isEditing && <button style={s.btnGhost} onClick={resetForm}>Cancel</button>}
        </div>

        <div style={s.cardBody}>
          <form onSubmit={handleSubmit}>
            <div style={s.grid2}>
              <div style={s.formGroup}>
                <label style={s.label}>Challan No *</label>
                <input style={s.input} name="challanNo" value={form.challanNo}
                  onChange={handleChange} placeholder="e.g. CH-2024-001" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Date *</label>
                <input style={s.input} name="date" type="date"
                  value={form.date} onChange={handleChange} required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Shop Name *</label>
                <input style={s.input} name="shopName" value={form.shopName}
                  onChange={handleChange} placeholder="Supplier shop name" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Amount (₹)</label>
                <input style={s.input} name="Amount" type="number" min="0" step="0.01"
                  value={form.Amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Receiver Name *</label>
                <input style={s.input} name="receiverName" value={form.receiverName}
                  onChange={handleChange} placeholder="Person who received it" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Remark</label>
                <input style={s.input} name="remark" value={form.remark}
                  onChange={handleChange} placeholder="Optional note" maxLength={200} />
              </div>
            </div>

            {/* File upload */}
            <div style={{ ...s.formGroup, marginTop: 14 }}>
              <label style={s.label}>
                Challan Photo {isEditing ? '(leave blank to keep existing)' : '*'}
              </label>
              <label style={s.fileWrap}>
                <span style={{ fontSize: 18 }}>📎</span>
                <span style={{ color: file ? COLOR.text : COLOR.muted, flex: 1, fontSize: 13 }}>
                  {file ? file.name : 'Click to choose image (JPG, PNG, etc.)'}
                </span>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              {preview && (
                <div style={s.previewLargeWrap}>
                  <img src={preview} alt="preview" style={s.previewLargeImg} />
                  <button style={s.downloadBtn} type="button" onClick={() => {
                    const a = document.createElement('a');
                    a.href = preview; a.download = file?.name || 'challan-photo.jpg';
                    document.body.appendChild(a); a.click();
                    setTimeout(() => document.body.removeChild(a), 600);
                  }}>
                    ⬇ Download Preview
                  </button>
                </div>
              )}

              {isEditing && existingPhoto && !file && (
                <div style={s.previewLargeWrap}>
                  <img src={getFullImgUrl(existingPhoto)} alt="View Challan" style={s.previewLargeImg} />
                  <button style={s.downloadBtn} type="button"
                    onClick={() => fetchAndDownloadImage(
                      getFullImgUrl(existingPhoto),
                      existingPhoto.split('/').pop() || 'challan-photo.jpg'
                    )}>
                    ⬇ Download
                  </button>
                </div>
              )}
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={submitting}
                style={{ ...s.btn(COLOR.primary), opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting
                  ? (isEditing ? 'Updating…' : 'Adding…')
                  : (isEditing ? '✓ Update Record' : '+ Add Record')}
              </button>
              {isEditing && (
                <button type="button" style={s.btnGhost} onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Table card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>
            All Records
            {records.length > 0 && (
              <span style={{ ...s.badge, marginLeft: 10, fontSize: 11 }}>{records.length}</span>
            )}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={s.empty}>⏳ Loading records…</div>
          ) : records.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧪</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No records yet</div>
              <div style={{ color: COLOR.muted, fontSize: 13 }}>
                Add your first color chemical challan above.
              </div>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Challan No', 'Date', 'Shop Name', 'Photo', 'Amount (₹)', 'Receiver', 'Remark', 'Actions'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((item) => {
                  const previewImgUrl = getFullImgUrl(item.challanPhotoUpload);
                  const open = showPreviewId === item._id;
                  return (
                    <React.Fragment key={item._id}>
                      <tr
                        style={{ transition: 'background .12s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = COLOR.rowHov)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td style={s.td}><span style={s.badge}>{item.challanNo}</span></td>
                        <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                          {item.date
                            ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td style={s.td}>{item.shopName}</td>
                        <td style={s.td}>
                          {item.challanPhotoUpload ? (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button type="button"
                                style={{ ...s.photoLink, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                                onClick={() => setShowPreviewId(open ? null : item._id)}
                                title={open ? 'Hide Preview' : 'Show Preview'}>
                                {open ? '🙈 Hide' : <><span role="img" aria-label="view">🖼</span> Preview</>}
                              </button>
                              <button type="button" style={s.downloadBtn} title="Download Image"
                                onClick={() => fetchAndDownloadImage(
                                  previewImgUrl,
                                  item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
                                )}>
                                ⬇
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: COLOR.muted }}>—</span>
                          )}
                        </td>
                        <td style={{ ...s.td, fontWeight: 600 }}>
                          {item.Amount != null ? `₹${Number(item.Amount).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={s.td}>{item.receiverName}</td>
                        <td style={{ ...s.td, color: COLOR.muted, maxWidth: 160 }}>
                          <span title={item.remark} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.remark || '—'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={s.iconBtn(COLOR.primary)} onClick={() => handleEdit(item)}>✏ Edit</button>
                            <button style={s.iconBtn(COLOR.danger)} onClick={() => handleDelete(item._id)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline image preview row */}
                      {open && item.challanPhotoUpload && (
                        <tr>
                          <td colSpan={8} style={{ background: COLOR.bg, paddingTop: 0, paddingBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, margin: '10px 0', flexWrap: 'wrap' }}>
                              <div style={s.previewLargeWrap}>
                                <img src={previewImgUrl} alt="Preview" style={s.previewLargeImg} />
                                <button type="button" style={s.downloadBtn}
                                  onClick={() => fetchAndDownloadImage(
                                    previewImgUrl,
                                    item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
                                  )}>
                                  ⬇ Download
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorChemical;