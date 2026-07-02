

// // import React, { useEffect, useRef, useState } from 'react';
// // import axios from 'axios';

// // const API_BASE = import.meta.env.VITE_API_BASE_URL
// //   ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
// //   : '/api/v1/color-chemicals';

// // const UPLOADS_BASE = import.meta.env.VITE_API_BASE_URL
// //   ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/uploads'
// //   : (window.location.origin + '/api/v1/uploads');

// // const BRAND_ORANGE = '#f58021';

// // const initialForm = {
// //   challanNo: '',
// //   date: '',
// //   shopName: '',
// //   Amount: '',
// //   receiverName: '',
// //   remark: '',
// // };

// // /* ─── design tokens ──────────────────────────────────────────── */
// // const COLOR = {
// //   primary:   '#3b5bdb',
// //   primaryHov:'#2f4ac2',
// //   danger:    '#e03131',
// //   dangerHov: '#c92a2a',
// //   success:   '#2f9e44',
// //   warning:   '#f59f00',
// //   border:    '#dee2e6',
// //   bg:        '#f8f9fa',
// //   surface:   '#ffffff',
// //   text:      '#212529',
// //   muted:     '#6c757d',
// //   rowHov:    '#f1f3f5',
// //   badgeBg:   '#e7f5ff',
// //   badgeText: '#1971c2',
// // };

// // const s = {
// //   page: {
// //     fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
// //     backgroundColor: COLOR.bg,
// //     minHeight: '100vh',
// //     padding: '28px 24px',
// //     color: COLOR.text,
// //   },
// //   header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
// //   headerIcon: {
// //     width: 40, height: 40, background: COLOR.primary, borderRadius: 10,
// //     display: 'flex', alignItems: 'center', justifyContent: 'center',
// //     color: '#fff', fontSize: 20, flexShrink: 0,
// //   },
// //   h1: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' },
// //   subtitle: { fontSize: 13, color: COLOR.muted, margin: '2px 0 0' },
// //   card: {
// //     background: COLOR.surface, border: `1px solid ${COLOR.border}`,
// //     borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
// //   },
// //   cardHeader: {
// //     padding: '16px 20px', borderBottom: `1px solid ${COLOR.border}`,
// //     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //   },
// //   cardTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
// //   cardBody: { padding: 20 },
// //   grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px 20px' },
// //   formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
// //   label: { fontSize: 12, fontWeight: 600, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.5px' },
// //   input: {
// //     height: 38, padding: '0 11px', border: `1px solid ${COLOR.border}`,
// //     borderRadius: 7, fontSize: 14, color: COLOR.text, outline: 'none',
// //     width: '100%', boxSizing: 'border-box', transition: 'border-color .15s',
// //     backgroundColor: COLOR.surface,
// //   },
// //   fileWrap: {
// //     border: `1.5px dashed ${COLOR.border}`, borderRadius: 7, padding: '10px 12px',
// //     fontSize: 13, cursor: 'pointer', backgroundColor: COLOR.bg,
// //     display: 'flex', alignItems: 'center', gap: 8,
// //   },
// //   btnRow: { display: 'flex', gap: 10, marginTop: 20 },
// //   btn: (color) => ({
// //     padding: '0 20px', height: 38, border: 'none', borderRadius: 7,
// //     fontSize: 13, fontWeight: 600, cursor: 'pointer', backgroundColor: color,
// //     color: '#fff', transition: 'background .15s', display: 'flex', alignItems: 'center', gap: 6,
// //   }),
// //   btnGhost: {
// //     padding: '0 16px', height: 38, border: `1px solid ${COLOR.border}`,
// //     borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
// //     backgroundColor: COLOR.surface, color: COLOR.text,
// //   },
// //   alert: (type) => ({
// //     padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
// //     display: 'flex', alignItems: 'center', gap: 8,
// //     backgroundColor: type === 'error' ? '#fff5f5' : '#ebfbee',
// //     border: `1px solid ${type === 'error' ? '#ffc9c9' : '#b2f2bb'}`,
// //     color: type === 'error' ? COLOR.danger : COLOR.success,
// //   }),
// //   table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
// //   th: {
// //     padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
// //     color: COLOR.muted, textTransform: 'uppercase', letterSpacing: '0.5px',
// //     borderBottom: `2px solid ${COLOR.border}`, whiteSpace: 'nowrap',
// //   },
// //   td: { padding: '11px 14px', borderBottom: `1px solid ${COLOR.border}`, verticalAlign: 'middle', color: COLOR.text },
// //   badge: {
// //     display: 'inline-block', padding: '3px 10px', borderRadius: 20,
// //     fontSize: 12, fontWeight: 600, backgroundColor: COLOR.badgeBg, color: COLOR.badgeText,
// //   },
// //   photoLink: {
// //     display: 'inline-flex', alignItems: 'center', gap: 4, color: COLOR.primary,
// //     textDecoration: 'none', fontSize: 13, fontWeight: 500,
// //   },
// //   iconBtn: (color) => ({
// //     border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12,
// //     fontWeight: 600, cursor: 'pointer', backgroundColor: `${color}18`,
// //     color: color, transition: 'background .15s',
// //   }),
// //   empty: { textAlign: 'center', padding: '48px 0', color: COLOR.muted, fontSize: 14 },
// //   previewLargeWrap: {
// //     marginTop: 8, borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLOR.border}`,
// //     display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
// //   },
// //   previewLargeImg: {
// //     display: 'block', width: 320, height: 260, objectFit: 'contain',
// //     background: COLOR.bg, borderRadius: 6,
// //   },
// //   downloadBtn: {
// //     marginTop: 6, padding: '4px 14px', border: 'none', borderRadius: 6,
// //     backgroundColor: COLOR.primary, color: '#fff', fontWeight: 500, fontSize: 13,
// //     cursor: 'pointer', transition: 'background .18s', textDecoration: 'none',
// //     display: 'inline-flex', alignItems: 'center', gap: 5,
// //   },
// // };

// // /* ─── helpers ────────────────────────────────────────────────── */
// // const getFullImgUrl = (imgPath) => {
// //   if (!imgPath) return '';
// //   if (/^https?:\/\//i.test(imgPath)) return imgPath;
// //   let cleanPath = imgPath.replace(/^[\/]*uploads[\/]*/, '');
// //   cleanPath = cleanPath.replace(/^api\/v1\/uploads[\/]*/i, '');
// //   return `${UPLOADS_BASE.replace(/\/$/, '')}/${cleanPath.replace(/^\/+/, '')}`;
// // };

// // const fetchAndDownloadImage = async (imgUrl, filename) => {
// //   try {
// //     const res = await fetch(imgUrl, { mode: 'cors', credentials: 'include' });
// //     if (!res.ok) throw new Error('Failed');
// //     const blob = await res.blob();
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url; a.download = filename || '';
// //     document.body.appendChild(a); a.click();
// //     setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 600);
// //   } catch {
// //     window.open(imgUrl, '_blank', 'noopener,noreferrer');
// //     alert('Direct download failed (CORS). Opened in new tab — right-click to Save As.');
// //   }
// // };

// // /* ─── ColorChemical ──────────────────────────────────────────── */
// // const ColorChemical = () => {
// //   // Remove passcode—always authenticated
// //   // const [authenticated, setAuthenticated] = useState(false);

// //   const [records, setRecords]             = useState([]);
// //   const [loading, setLoading]             = useState(false);
// //   const [submitting, setSubmitting]       = useState(false);
// //   const [form, setForm]                   = useState(initialForm);
// //   const [editId, setEditId]               = useState(null);
// //   const [existingPhoto, setExistingPhoto] = useState('');
// //   const [file, setFile]                   = useState(null);
// //   const [preview, setPreview]             = useState('');
// //   const [error, setError]                 = useState('');
// //   const [success, setSuccess]             = useState('');
// //   const [showPreviewId, setShowPreviewId] = useState(null);
// //   const fileRef = useRef();
// //   const formRef = useRef();

// //   /* ── fetch ─────────────────────────────────────────────────── */
// //   const loadRecords = async () => {
// //     setLoading(true); setError('');
// //     try {
// //       const res = await axios.get(API_BASE);
// //       setRecords(res.data);
// //     } catch {
// //       setError('Failed to fetch records. Check your connection.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => { loadRecords(); }, []);

// //   /* ── form ──────────────────────────────────────────────────── */
// //   const handleChange = (e) =>
// //     setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

// //   const handleFileChange = (e) => {
// //     const f = e.target.files[0];
// //     setFile(f || null);
// //     if (f) {
// //       const reader = new FileReader();
// //       reader.onload = (ev) => setPreview(ev.target.result);
// //       reader.readAsDataURL(f);
// //     } else {
// //       setPreview('');
// //     }
// //   };

// //   const resetForm = () => {
// //     setForm(initialForm); setFile(null); setPreview('');
// //     setExistingPhoto(''); setEditId(null); setError(''); setSuccess('');
// //     if (fileRef.current) fileRef.current.value = '';
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!file && !editId) { setError('Please select a challan photo.'); return; }
// //     setError(''); setSuccess(''); setSubmitting(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append('challanNo', form.challanNo);
// //       fd.append('date', form.date);
// //       fd.append('shopName', form.shopName);
// //       fd.append('Amount', form.Amount);
// //       fd.append('receiverName', form.receiverName);
// //       fd.append('remark', form.remark);
// //       if (file) fd.append('challanPhotoUpload', file);
// //       const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
// //       if (editId) {
// //         await axios.put(`${API_BASE}/${editId}`, fd, cfg);
// //         setSuccess('Record updated successfully.');
// //       } else {
// //         await axios.post(API_BASE, fd, cfg);
// //         setSuccess('Record added successfully.');
// //       }
// //       resetForm(); loadRecords();
// //     } catch (err) {
// //       setError(err.response?.data?.message || 'Failed to save. Please check the details.');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleEdit = (item) => {
// //     setForm({
// //       challanNo:    item.challanNo    || '',
// //       date:         item.date ? item.date.slice(0, 10) : '',
// //       shopName:     item.shopName     || '',
// //       Amount:       item.Amount != null ? String(item.Amount) : '',
// //       receiverName: item.receiverName || '',
// //       remark:       item.remark       || '',
// //     });
// //     setFile(null); setPreview('');
// //     setExistingPhoto(item.challanPhotoUpload || '');
// //     setEditId(item._id); setError(''); setSuccess('');
// //     formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //   };

// //   const handleDelete = async (id) => {
// //     if (!window.confirm('Delete this color chemical record?')) return;
// //     setError(''); setSuccess('');
// //     try {
// //       await axios.delete(`${API_BASE}/${id}`);
// //       setSuccess('Record deleted.');
// //       loadRecords();
// //     } catch {
// //       setError('Failed to delete the record.');
// //     }
// //   };

// //   // Remove passcode check
// //   // if (!authenticated) {
// //   //   return <PasscodeGate onSuccess={() => setAuthenticated(true)} />;
// //   // }

// //   const isEditing = Boolean(editId);

// //   /* ── render ────────────────────────────────────────────────── */
// //   return (
// //     <div style={s.page}>
// //       {/* Header */}
// //       <div style={s.header}>
// //         <div style={s.headerIcon}>🧪</div>
// //         <div>
// //           <h1 style={s.h1}>Color Chemicals</h1>
// //           <p style={s.subtitle}>Manage challan records for color chemical purchases</p>
// //         </div>
// //       </div>

// //       {error   && <div style={s.alert('error')}>⚠ {error}</div>}
// //       {success && <div style={s.alert('success')}>✓ {success}</div>}

// //       {/* Form card */}
// //       <div style={{ ...s.card, marginBottom: 24 }} ref={formRef}>
// //         <div style={s.cardHeader}>
// //           <span style={s.cardTitle}>
// //             {isEditing ? '✏️  Edit Record' : '➕  Add New Record'}
// //           </span>
// //           {isEditing && <button style={s.btnGhost} onClick={resetForm}>Cancel</button>}
// //         </div>

// //         <div style={s.cardBody}>
// //           <form onSubmit={handleSubmit}>
// //             <div style={s.grid2}>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Challan No *</label>
// //                 <input style={s.input} name="challanNo" value={form.challanNo}
// //                   onChange={handleChange} placeholder="e.g. CH-2024-001" required />
// //               </div>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Date *</label>
// //                 <input style={s.input} name="date" type="date"
// //                   value={form.date} onChange={handleChange} required />
// //               </div>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Shop Name *</label>
// //                 <input style={s.input} name="shopName" value={form.shopName}
// //                   onChange={handleChange} placeholder="Supplier shop name" required />
// //               </div>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Amount (₹)</label>
// //                 <input style={s.input} name="Amount" type="number" min="0" step="0.01"
// //                   value={form.Amount} onChange={handleChange} placeholder="0.00" />
// //               </div>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Receiver Name *</label>
// //                 <input style={s.input} name="receiverName" value={form.receiverName}
// //                   onChange={handleChange} placeholder="Person who received it" required />
// //               </div>
// //               <div style={s.formGroup}>
// //                 <label style={s.label}>Remark</label>
// //                 <input style={s.input} name="remark" value={form.remark}
// //                   onChange={handleChange} placeholder="Optional note" maxLength={200} />
// //               </div>
// //             </div>

// //             {/* File upload */}
// //             <div style={{ ...s.formGroup, marginTop: 14 }}>
// //               <label style={s.label}>
// //                 Challan Photo {isEditing ? '(leave blank to keep existing)' : '*'}
// //               </label>
// //               <label style={s.fileWrap}>
// //                 <span style={{ fontSize: 18 }}>📎</span>
// //                 <span style={{ color: file ? COLOR.text : COLOR.muted, flex: 1, fontSize: 13 }}>
// //                   {file ? file.name : 'Click to choose image (JPG, PNG, etc.)'}
// //                 </span>
// //                 <input ref={fileRef} type="file" accept="image/*"
// //                   onChange={handleFileChange} style={{ display: 'none' }} />
// //               </label>

// //               {preview && (
// //                 <div style={s.previewLargeWrap}>
// //                   <img src={preview} alt="preview" style={s.previewLargeImg} />
// //                   <button style={s.downloadBtn} type="button" onClick={() => {
// //                     const a = document.createElement('a');
// //                     a.href = preview; a.download = file?.name || 'challan-photo.jpg';
// //                     document.body.appendChild(a); a.click();
// //                     setTimeout(() => document.body.removeChild(a), 600);
// //                   }}>
// //                     ⬇ Download Preview
// //                   </button>
// //                 </div>
// //               )}

// //               {isEditing && existingPhoto && !file && (
// //                 <div style={s.previewLargeWrap}>
// //                   <img src={getFullImgUrl(existingPhoto)} alt="View Challan" style={s.previewLargeImg} />
// //                   <button style={s.downloadBtn} type="button"
// //                     onClick={() => fetchAndDownloadImage(
// //                       getFullImgUrl(existingPhoto),
// //                       existingPhoto.split('/').pop() || 'challan-photo.jpg'
// //                     )}>
// //                     ⬇ Download
// //                   </button>
// //                 </div>
// //               )}
// //             </div>

// //             <div style={s.btnRow}>
// //               <button type="submit" disabled={submitting}
// //                 style={{ ...s.btn(COLOR.primary), opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
// //                 {submitting
// //                   ? (isEditing ? 'Updating…' : 'Adding…')
// //                   : (isEditing ? '✓ Update Record' : '+ Add Record')}
// //               </button>
// //               {isEditing && (
// //                 <button type="button" style={s.btnGhost} onClick={resetForm}>Cancel</button>
// //               )}
// //             </div>
// //           </form>
// //         </div>
// //       </div>

// //       {/* Table card */}
// //       <div style={s.card}>
// //         <div style={s.cardHeader}>
// //           <span style={s.cardTitle}>
// //             All Records
// //             {records.length > 0 && (
// //               <span style={{ ...s.badge, marginLeft: 10, fontSize: 11 }}>{records.length}</span>
// //             )}
// //           </span>
// //         </div>

// //         <div style={{ overflowX: 'auto' }}>
// //           {loading ? (
// //             <div style={s.empty}>⏳ Loading records…</div>
// //           ) : records.length === 0 ? (
// //             <div style={s.empty}>
// //               <div style={{ fontSize: 32, marginBottom: 8 }}>🧪</div>
// //               <div style={{ fontWeight: 600, marginBottom: 4 }}>No records yet</div>
// //               <div style={{ color: COLOR.muted, fontSize: 13 }}>
// //                 Add your first color chemical challan above.
// //               </div>
// //             </div>
// //           ) : (
// //             <table style={s.table}>
// //               <thead>
// //                 <tr>
// //                   {['Challan No', 'Date', 'Shop Name', 'Photo', 'Amount (₹)', 'Receiver', 'Remark', 'Actions'].map((h) => (
// //                     <th key={h} style={s.th}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {records.map((item) => {
// //                   const previewImgUrl = getFullImgUrl(item.challanPhotoUpload);
// //                   const open = showPreviewId === item._id;
// //                   return (
// //                     <React.Fragment key={item._id}>
// //                       <tr
// //                         style={{ transition: 'background .12s' }}
// //                         onMouseEnter={(e) => (e.currentTarget.style.background = COLOR.rowHov)}
// //                         onMouseLeave={(e) => (e.currentTarget.style.background = '')}
// //                       >
// //                         <td style={s.td}><span style={s.badge}>{item.challanNo}</span></td>
// //                         <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
// //                           {item.date
// //                             ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
// //                             : '—'}
// //                         </td>
// //                         <td style={s.td}>{item.shopName}</td>
// //                         <td style={s.td}>
// //                           {item.challanPhotoUpload ? (
// //                             <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
// //                               <button type="button"
// //                                 style={{ ...s.photoLink, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
// //                                 onClick={() => setShowPreviewId(open ? null : item._id)}
// //                                 title={open ? 'Hide Preview' : 'Show Preview'}>
// //                                 {open ? '🙈 Hide' : <><span role="img" aria-label="view">🖼</span> Preview</>}
// //                               </button>
// //                               <button type="button" style={s.downloadBtn} title="Download Image"
// //                                 onClick={() => fetchAndDownloadImage(
// //                                   previewImgUrl,
// //                                   item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
// //                                 )}>
// //                                 ⬇
// //                               </button>
// //                             </div>
// //                           ) : (
// //                             <span style={{ color: COLOR.muted }}>—</span>
// //                           )}
// //                         </td>
// //                         <td style={{ ...s.td, fontWeight: 600 }}>
// //                           {item.Amount != null ? `₹${Number(item.Amount).toLocaleString('en-IN')}` : '—'}
// //                         </td>
// //                         <td style={s.td}>{item.receiverName}</td>
// //                         <td style={{ ...s.td, color: COLOR.muted, maxWidth: 160 }}>
// //                           <span title={item.remark} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                             {item.remark || '—'}
// //                           </span>
// //                         </td>
// //                         <td style={s.td}>
// //                           <div style={{ display: 'flex', gap: 6 }}>
// //                             <button style={s.iconBtn(COLOR.primary)} onClick={() => handleEdit(item)}>✏ Edit</button>
// //                             <button style={s.iconBtn(COLOR.danger)} onClick={() => handleDelete(item._id)}>🗑 Delete</button>
// //                           </div>
// //                         </td>
// //                       </tr>

// //                       {/* Inline image preview row */}
// //                       {open && item.challanPhotoUpload && (
// //                         <tr>
// //                           <td colSpan={8} style={{ background: COLOR.bg, paddingTop: 0, paddingBottom: 14 }}>
// //                             <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, margin: '10px 0', flexWrap: 'wrap' }}>
// //                               <div style={s.previewLargeWrap}>
// //                                 <img src={previewImgUrl} alt="Preview" style={s.previewLargeImg} />
// //                                 <button type="button" style={s.downloadBtn}
// //                                   onClick={() => fetchAndDownloadImage(
// //                                     previewImgUrl,
// //                                     item.challanPhotoUpload.split('/').pop() || 'challan-photo.jpg'
// //                                   )}>
// //                                   ⬇ Download
// //                                 </button>
// //                               </div>
// //                             </div>
// //                           </td>
// //                         </tr>
// //                       )}
// //                     </React.Fragment>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ColorChemical;

// import React, { useEffect, useMemo, useRef, useState } from 'react'
// import axios from 'axios'
// import toast from 'react-hot-toast'
// import {
//   RiCheckLine, RiCloseLine, RiDeleteBin5Line, RiSearchLine,
//   RiRefreshLine, RiAddLine, RiPencilLine, RiFlaskLine, RiImageLine,
//   RiDownloadLine, RiInboxArchiveLine,
// } from 'react-icons/ri'
// import EmptyState from '../../components/common/EmptyState'
// import Modal from '../../components/common/Modal'

// const API_BASE = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
//   : '/api/v1/color-chemicals'

// const UPLOADS_BASE = import.meta.env.VITE_API_BASE_URL
//   ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/uploads'
//   : (window.location.origin + '/api/v1/uploads')

// const initialForm = {
//   challanNo: '',
//   date: '',
//   shopName: '',
//   Amount: '',
//   receiverName: '',
//   remark: '',
// }

// /* ---------------------------------------------------------------- */
// /*  Shared style tokens (matches the Sub-Task Submission page)       */
// /* ---------------------------------------------------------------- */
// const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
// const pillInput =
//   'w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
// const softInput =
//   'w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400 resize-none'
// const fileInput =
//   'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

// /* ---------------------------------------------------------------- */
// /*  Helpers                                                          */
// /* ---------------------------------------------------------------- */
// const getFullImgUrl = (imgPath) => {
//   if (!imgPath) return ''
//   if (/^https?:\/\//i.test(imgPath)) return imgPath
//   let cleanPath = imgPath.replace(/^[\/]*uploads[\/]*/, '')
//   cleanPath = cleanPath.replace(/^api\/v1\/uploads[\/]*/i, '')
//   return `${UPLOADS_BASE.replace(/\/$/, '')}/${cleanPath.replace(/^\/+/, '')}`
// }

// const formatCurrency = (val) =>
//   val !== undefined && val !== null && val !== '' && !isNaN(Number(val))
//     ? `₹${Number(val).toLocaleString('en-IN')}`
//     : '-'

// const formatDate = (val) =>
//   val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

// const copyToClipboard = async (text) => {
//   if (!text) return
//   try {
//     await navigator.clipboard.writeText(text)
//     toast.success('Copied')
//   } catch {
//     toast.error('Failed to copy')
//   }
// }

// function usePreviewImageModal() {
//   const [previewUrl, setPreviewUrl] = useState(null)
//   const [previewAlt, setPreviewAlt] = useState('')
//   const [showPreview, setShowPreview] = useState(false)
//   const [downloadError, setDownloadError] = useState('')
//   const [downloading, setDownloading] = useState(false)

//   function open(url, alt = '') {
//     setPreviewUrl(url)
//     setPreviewAlt(alt)
//     setShowPreview(true)
//     setDownloadError('')
//   }
//   function close() {
//     setShowPreview(false)
//     setPreviewUrl(null)
//     setPreviewAlt('')
//     setDownloadError('')
//   }

//   const handleDownload = async () => {
//     if (!previewUrl) return
//     setDownloadError('')
//     setDownloading(true)
//     try {
//       const response = await fetch(previewUrl, { credentials: 'same-origin', mode: 'cors' })
//       if (!response.ok) throw new Error('Image download failed')
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       const fname = decodeURIComponent(previewUrl.split('/').pop() || 'challan_photo.jpg')
//       link.download = fname
//       document.body.appendChild(link)
//       link.click()
//       setTimeout(() => {
//         document.body.removeChild(link)
//         window.URL.revokeObjectURL(url)
//       }, 100)
//     } catch {
//       window.open(previewUrl, '_blank', 'noopener,noreferrer')
//       setDownloadError('Direct download failed (CORS) — opened in a new tab instead. Right-click to Save As.')
//     }
//     setDownloading(false)
//   }

//   const ModalPreview = ({ width = 480 }) =>
//     <Modal open={showPreview} onClose={close} width={width} showClose title="Challan Photo">
//       {previewUrl ? (
//         <div className="p-4 flex flex-col items-center gap-4">
//           <img
//             src={previewUrl}
//             alt={previewAlt || 'Challan photo'}
//             className="max-w-full max-h-[400px] rounded-xl border border-orange-200 shadow"
//             style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
//           />
//           <button
//             type="button"
//             className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2 transition disabled:bg-gray-300"
//             onClick={handleDownload}
//             disabled={downloading}
//           >
//             {downloading ? 'Downloading…' : 'Download'}
//           </button>
//           {downloadError && <div className="text-center text-xs text-red-500">{downloadError}</div>}
//         </div>
//       ) : (
//         <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
//       )}
//     </Modal>
//   return { open, close, ModalPreview }
// }

// /* ---------------------------------------------------------------- */
// /*  Main component                                                   */
// /* ---------------------------------------------------------------- */
// const ColorChemical = () => {
//   const [records, setRecords] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [loadError, setLoadError] = useState('')

//   const [searchTerm, setSearchTerm] = useState('')

//   const [showFormModal, setShowFormModal] = useState(false)
//   const [form, setForm] = useState(initialForm)
//   const [editId, setEditId] = useState(null)
//   const [existingPhoto, setExistingPhoto] = useState('')
//   const [file, setFile] = useState(null)
//   const [preview, setPreview] = useState('')
//   const [submitting, setSubmitting] = useState(false)
//   const [deletingId, setDeletingId] = useState(null)
//   const [error, setError] = useState('')

//   const fileRef = useRef()
//   const challanPreview = usePreviewImageModal()

//   /* ---------------- data loading ---------------- */
//   const loadRecords = async () => {
//     setLoading(true)
//     setLoadError('')
//     try {
//       const res = await axios.get(API_BASE)
//       setRecords(Array.isArray(res.data) ? res.data : (res.data?.data || []))
//     } catch {
//       setLoadError('Could not load records. Check your connection and try refreshing.')
//       setRecords([])
//     }
//     setLoading(false)
//   }

//   useEffect(() => { loadRecords() }, [])

//   /* ---------------- derived ---------------- */
//   const filteredRecords = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase()
//     if (!term) return records
//     return records.filter(r => {
//       const haystack = [r.challanNo, r.shopName, r.receiverName, r.remark].filter(Boolean).join(' ').toLowerCase()
//       return haystack.includes(term)
//     })
//   }, [records, searchTerm])

//   const totalAmount = useMemo(
//     () => records.reduce((sum, r) => (isNaN(Number(r.Amount)) ? sum : sum + Number(r.Amount)), 0),
//     [records]
//   )

//   /* ---------------- form handlers ---------------- */
//   const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

//   const handleFileChange = (e) => {
//     const f = e.target.files[0]
//     setFile(f || null)
//     if (f) {
//       const reader = new FileReader()
//       reader.onload = (ev) => setPreview(ev.target.result)
//       reader.readAsDataURL(f)
//     } else {
//       setPreview('')
//     }
//   }

//   const resetForm = () => {
//     setForm(initialForm)
//     setFile(null)
//     setPreview('')
//     setExistingPhoto('')
//     setEditId(null)
//     setError('')
//     if (fileRef.current) fileRef.current.value = ''
//   }

//   function closeFormModal() {
//     setShowFormModal(false)
//     resetForm()
//   }

//   function openAddModal() {
//     resetForm()
//     setShowFormModal(true)
//   }

//   function openEditModal(item) {
//     setForm({
//       challanNo: item.challanNo || '',
//       date: item.date ? item.date.slice(0, 10) : '',
//       shopName: item.shopName || '',
//       Amount: item.Amount != null ? String(item.Amount) : '',
//       receiverName: item.receiverName || '',
//       remark: item.remark || '',
//     })
//     setFile(null)
//     setPreview('')
//     setExistingPhoto(item.challanPhotoUpload || '')
//     setEditId(item._id)
//     setError('')
//     setShowFormModal(true)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!file && !editId) { setError('Please select a challan photo.'); return }
//     if (!form.challanNo || !form.date || !form.shopName || !form.receiverName) {
//       setError('Please fill in every required field.')
//       return
//     }
//     setError('')
//     setSubmitting(true)
//     try {
//       const fd = new FormData()
//       fd.append('challanNo', form.challanNo)
//       fd.append('date', form.date)
//       fd.append('shopName', form.shopName)
//       fd.append('Amount', form.Amount)
//       fd.append('receiverName', form.receiverName)
//       fd.append('remark', form.remark)
//       if (file) fd.append('challanPhotoUpload', file)
//       const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
//       if (editId) {
//         await axios.put(`${API_BASE}/${editId}`, fd, cfg)
//         toast.success('Record updated')
//       } else {
//         await axios.post(API_BASE, fd, cfg)
//         toast.success('Record added')
//       }
//       closeFormModal()
//       loadRecords()
//     } catch (err) {
//       const msg = err?.response?.data?.message || 'Failed to save. Please check the details.'
//       setError(msg)
//       toast.error(msg)
//     }
//     setSubmitting(false)
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this color chemical record? This cannot be undone.')) return
//     setDeletingId(id)
//     try {
//       await axios.delete(`${API_BASE}/${id}`)
//       toast('Record deleted', { icon: '🗑️' })
//       loadRecords()
//     } catch {
//       toast.error('Failed to delete the record')
//     }
//     setDeletingId(null)
//   }

//   const isEditing = Boolean(editId)

//   /* ---------------- render ---------------- */
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <div className="border-b border-gray-100 bg-gradient-to-b from-orange-50/60 to-white">
//         <div className="max-w-7xl mx-auto px-2 md:px-6 sm:px-10 py-8 flex items-center gap-3">
//           <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
//             <RiFlaskLine size={22} />
//           </div>
//           <div>
//             <div className="text-xs font-bold uppercase tracking-wide text-orange-500">Fabric Task Workflow</div>
//             <h1 className="text-xl font-extrabold text-gray-900 -mt-0.5">Color Chemicals</h1>
//             <p className="text-sm text-gray-500 mt-0.5">Manage challan records for color chemical purchases.</p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-2 md:px-6 sm:px-10 py-6 pb-10">

//         {/* Summary strip */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
//           <SummaryCard label="Total Records" value={records.length} accent="border-gray-200 text-gray-700" />
//           <SummaryCard label="Total Amount" value={`₹${totalAmount.toLocaleString('en-IN')}`} accent="border-orange-200 text-orange-700" />
//           <SummaryCard label="Matching Search" value={filteredRecords.length} accent="border-amber-200 text-amber-700" />
//         </div>

//         {/* Filter bar */}
//         <div className="flex flex-wrap items-center gap-3 mb-5 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3">
//           <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
//             <RiSearchLine className="text-gray-400" size={16} />
//             <input
//               type="text"
//               placeholder="Search Challan No, Shop, Receiver, Remark..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
//             />
//             {searchTerm && (
//               <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
//                 <RiCloseLine size={14} />
//               </button>
//             )}
//           </div>

//           <button
//             type="button"
//             onClick={loadRecords}
//             className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 transition"
//           >
//             <RiRefreshLine size={15} className={loading ? 'animate-spin' : ''} />
//             Refresh
//           </button>

//           <button
//             type="button"
//             onClick={openAddModal}
//             className="flex items-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 transition ml-auto"
//           >
//             <RiAddLine size={16} />
//             Add Record
//           </button>
//         </div>

//         {loadError && (
//           <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium flex items-center justify-between gap-3">
//             <span>{loadError}</span>
//             <button type="button" onClick={loadRecords} className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-1.5 transition whitespace-nowrap">
//               Try again
//             </button>
//           </div>
//         )}

//         {/* Main table */}
//         <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="py-16 text-center text-orange-500 text-sm font-medium animate-pulse">Loading records...</div>
//           ) : filteredRecords.length === 0 ? (
//             <div className="py-10">
//               <EmptyState
//                 icon="🧪"
//                 text={records.length === 0 ? 'No records yet. Add your first color chemical challan.' : 'No records match your search.'}
//               />
//               {records.length === 0 && (
//                 <div className="text-center mt-4">
//                   <button type="button" onClick={openAddModal} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
//                     Add a record
//                   </button>
//                 </div>
//               )}
//               {records.length > 0 && searchTerm && (
//                 <div className="text-center mt-3">
//                   <button type="button" onClick={() => setSearchTerm('')} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
//                     Clear search
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1000px] text-sm">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     <Th>Challan No</Th>
//                     <Th>Date</Th>
//                     <Th>Shop Name</Th>
//                     <Th>Photo</Th>
//                     <Th>Amount</Th>
//                     <Th>Receiver</Th>
//                     <Th>Remark</Th>
//                     <Th>Actions</Th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRecords.map(item => {
//                     const photoUrl = getFullImgUrl(item.challanPhotoUpload)
//                     return (
//                       <tr key={item._id} className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors">
//                         <td className="px-3 py-3 whitespace-nowrap">
//                           <span className="inline-flex items-center gap-1">
//                             <span className="bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs rounded-full px-3 py-1">
//                               {item.challanNo}
//                             </span>
//                             <button
//                               type="button"
//                               aria-label="Copy Challan No"
//                               className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]"
//                               onClick={() => copyToClipboard(item.challanNo)}
//                             >Copy</button>
//                           </span>
//                         </td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-700">{formatDate(item.date)}</td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-800 font-medium">{item.shopName}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">
//                           {item.challanPhotoUpload ? (
//                             <button
//                               type="button"
//                               className="flex items-center gap-1 text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs"
//                               onClick={() => challanPreview.open(photoUrl, `Challan #${item.challanNo}`)}
//                               title="Preview image"
//                             >
//                               <RiImageLine size={13} />
//                               View photo
//                             </button>
//                           ) : (
//                             <span className="text-gray-400 text-xs">No photo</span>
//                           )}
//                         </td>
//                         <td className="px-3 py-3 whitespace-nowrap font-bold text-gray-900">{formatCurrency(item.Amount)}</td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-700">{item.receiverName}</td>
//                         <td className="px-3 py-3 whitespace-nowrap text-gray-600 max-w-[160px] truncate" title={item.remark ?? ''}>{item.remark || '-'}</td>
//                         <td className="px-3 py-3 whitespace-nowrap">
//                           <div className="flex items-center gap-1.5">
//                             <button
//                               type="button"
//                               className="flex items-center gap-1 rounded-full border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 text-[11px] font-semibold px-3 py-1.5 transition"
//                               onClick={() => openEditModal(item)}
//                             >
//                               <RiPencilLine size={12} />
//                               Edit
//                             </button>
//                             <button
//                               type="button"
//                               className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition disabled:opacity-50"
//                               title="Delete record"
//                               onClick={() => handleDelete(item._id)}
//                               disabled={deletingId === item._id}
//                             >
//                               <RiDeleteBin5Line size={13} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         <div className="mt-3 text-xs text-gray-400 text-right">
//           Showing {filteredRecords.length} of {records.length} records
//         </div>
//       </div>

//       {/* Add / Edit Record Modal */}
//       <Modal
//         open={showFormModal}
//         onClose={closeFormModal}
//         width={520}
//         title={isEditing ? 'Edit Record' : 'Add New Record'}
//         showClose
//       >
//         <form className="flex flex-col gap-6 py-1 px-1" onSubmit={handleSubmit} autoComplete="off">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex flex-col">
//               <label className={labelClass}>Challan No<span className="text-red-500 font-bold ml-1">*</span></label>
//               <input name="challanNo" type="text" placeholder="e.g. CH-2024-001" value={form.challanNo} onChange={handleChange} className={pillInput} required />
//             </div>
//             <div className="flex flex-col">
//               <label className={labelClass}>Date<span className="text-red-500 font-bold ml-1">*</span></label>
//               <input name="date" type="date" value={form.date} onChange={handleChange} className={pillInput} required />
//             </div>
//             <div className="flex flex-col">
//               <label className={labelClass}>Shop Name<span className="text-red-500 font-bold ml-1">*</span></label>
//               <input name="shopName" type="text" placeholder="Supplier shop name" value={form.shopName} onChange={handleChange} className={pillInput} required />
//             </div>
//             <div className="flex flex-col">
//               <label className={labelClass}>Amount (₹)</label>
//               <input name="Amount" type="number" min={0} step="0.01" placeholder="0.00" value={form.Amount} onChange={handleChange} className={pillInput} />
//             </div>
//             <div className="flex flex-col">
//               <label className={labelClass}>Receiver Name<span className="text-red-500 font-bold ml-1">*</span></label>
//               <input name="receiverName" type="text" placeholder="Person who received it" value={form.receiverName} onChange={handleChange} className={pillInput} required />
//             </div>
//           </div>

//           <div className="flex flex-col">
//             <label className={labelClass}>Remark <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
//             <textarea name="remark" rows={2} maxLength={200} placeholder="Any note for this record..." value={form.remark} onChange={handleChange} className={softInput} />
//           </div>

//           <div className="flex flex-col">
//             <label className={labelClass}>
//               Challan Photo
//               <span className={`text-red-500 font-bold ml-1${existingPhoto ? ' opacity-60' : ''}`}>*</span>
//               {existingPhoto && <span className="ml-1 text-gray-400 font-normal normal-case">(optional — existing kept if blank)</span>}
//             </label>
//             {existingPhoto && !file && (
//               <div className="mb-2 flex items-center gap-2 text-xs">
//                 <span className="text-gray-500">Current:</span>
//                 <button
//                   type="button"
//                   className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium"
//                   onClick={() => challanPreview.open(getFullImgUrl(existingPhoto), 'Existing Challan Photo')}
//                 >
//                   View photo
//                 </button>
//               </div>
//             )}
//             <input ref={fileRef} name="challanPhotoUpload" type="file" accept="image/*" onChange={handleFileChange} className={fileInput} required={!existingPhoto} />
//             {file && (
//               <span className="text-xs text-orange-600 font-medium mt-1">New file: {file.name}</span>
//             )}
//             {preview && (
//               <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/40 p-3 flex flex-col items-start gap-2">
//                 <img src={preview} alt="preview" className="rounded-xl border border-orange-100 max-h-[220px] object-contain bg-white" />
//               </div>
//             )}
//           </div>

//           {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>}

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <button type="button" className="flex items-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition" onClick={closeFormModal} disabled={submitting}>
//               <RiCloseLine size={16} />
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
//               disabled={submitting}
//             >
//               <RiCheckLine size={17} />
//               {submitting ? 'Saving…' : (isEditing ? 'Update Record' : 'Add Record')}
//             </button>
//           </div>
//         </form>
//       </Modal>

//       {challanPreview.ModalPreview && <challanPreview.ModalPreview />}
//     </div>
//   )
// }

// /* small presentational helpers */
// const Th = ({ children }) => (
//   <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap text-left">{children}</th>
// )

// const SummaryCard = ({ label, value, accent, onClick, active }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     disabled={!onClick}
//     className={`text-left rounded-2xl border bg-white px-4 py-3 shadow-sm transition ${accent} ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'} ${active ? 'ring-2 ring-orange-300' : ''}`}
//   >
//     <div className="text-2xl font-extrabold flex items-center gap-1.5">
//       {value}
//       {label === 'Total Amount' && <RiInboxArchiveLine className="opacity-40" size={16} />}
//     </div>
//     <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
//   </button>
// )

// export default ColorChemical
import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  RiCheckLine, RiCloseLine, RiDeleteBin5Line, RiSearchLine,
  RiRefreshLine, RiAddLine, RiPencilLine, RiFlaskLine, RiImageLine,
  RiDownloadLine, RiInboxArchiveLine,
} from 'react-icons/ri'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/color-chemicals`
  : '/api/v1/color-chemicals'

const UPLOADS_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/uploads'
  : (window.location.origin + '/api/v1/uploads')

const initialForm = {
  challanNo: '',
  date: '',
  shopName: '',
  Amount: '',
  receiverName: '',
  remark: '',
}

/* ---------------------------------------------------------------- */
/*  Shared style tokens (matches the Sub-Task Submission page)       */
/* ---------------------------------------------------------------- */
const labelClass = 'block text-xs font-bold uppercase tracking-wide text-orange-600 mb-2'
const pillInput =
  'w-full rounded-full border border-gray-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400'
const softInput =
  'w-full rounded-2xl border border-gray-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:bg-gray-50 disabled:text-gray-400 resize-none'
const fileInput =
  'block w-full text-sm text-gray-600 rounded-xl border border-gray-300 bg-white px-3 py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-600 file:font-semibold file:px-4 file:py-1.5 file:text-xs hover:file:bg-orange-100'

/* ---------------------------------------------------------------- */
/*  Helpers                                                          */
/* ---------------------------------------------------------------- */
const getFullImgUrl = (imgPath) => {
  if (!imgPath) return ''
  if (/^https?:\/\//i.test(imgPath)) return imgPath
  let cleanPath = imgPath.replace(/^[\/]*uploads[\/]*/, '')
  cleanPath = cleanPath.replace(/^api\/v1\/uploads[\/]*/i, '')
  return `${UPLOADS_BASE.replace(/\/$/, '')}/${cleanPath.replace(/^\/+/, '')}`
}

const formatCurrency = (val) =>
  val !== undefined && val !== null && val !== '' && !isNaN(Number(val))
    ? `₹${Number(val).toLocaleString('en-IN')}`
    : '-'

const formatDate = (val) =>
  val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const copyToClipboard = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied')
  } catch {
    toast.error('Failed to copy')
  }
}

function usePreviewImageModal() {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewAlt, setPreviewAlt] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloading, setDownloading] = useState(false)

  function open(url, alt = '') {
    setPreviewUrl(url)
    setPreviewAlt(alt)
    setShowPreview(true)
    setDownloadError('')
  }
  function close() {
    setShowPreview(false)
    setPreviewUrl(null)
    setPreviewAlt('')
    setDownloadError('')
  }

  const handleDownload = async () => {
    if (!previewUrl) return
    setDownloadError('')
    setDownloading(true)
    try {
      const response = await fetch(previewUrl, { credentials: 'same-origin', mode: 'cors' })
      if (!response.ok) throw new Error('Image download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fname = decodeURIComponent(previewUrl.split('/').pop() || 'challan_photo.jpg')
      link.download = fname
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch {
      window.open(previewUrl, '_blank', 'noopener,noreferrer')
      setDownloadError('Direct download failed (CORS) — opened in a new tab instead. Right-click to Save As.')
    }
    setDownloading(false)
  }

  const ModalPreview = ({ width = 480 }) =>
    <Modal open={showPreview} onClose={close} width={width} showClose title="Challan Photo">
      {previewUrl ? (
        <div className="p-3 sm:p-4 flex flex-col items-center gap-4">
          <img
            src={previewUrl}
            alt={previewAlt || 'Challan photo'}
            className="max-w-full max-h-[50vh] sm:max-h-[400px] rounded-xl border border-orange-200 shadow"
            style={{ objectFit: 'contain', background: '#f9f6f2', width: '100%' }}
          />
          <button
            type="button"
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2 transition disabled:bg-gray-300"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          {downloadError && <div className="text-center text-xs text-red-500">{downloadError}</div>}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8 text-sm">No image to preview</div>
      )}
    </Modal>
  return { open, close, ModalPreview }
}

/* ---------------------------------------------------------------- */
/*  Main component                                                   */
/* ---------------------------------------------------------------- */
const ColorChemical = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editId, setEditId] = useState(null)
  const [existingPhoto, setExistingPhoto] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const fileRef = useRef()
  const challanPreview = usePreviewImageModal()

  /* ---------------- data loading ---------------- */
  const loadRecords = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await axios.get(API_BASE)
      setRecords(Array.isArray(res.data) ? res.data : (res.data?.data || []))
    } catch {
      setLoadError('Could not load records. Check your connection and try refreshing.')
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => { loadRecords() }, [])

  /* ---------------- derived ---------------- */
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return records
    return records.filter(r => {
      const haystack = [r.challanNo, r.shopName, r.receiverName, r.remark].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [records, searchTerm])

  const totalAmount = useMemo(
    () => records.reduce((sum, r) => (isNaN(Number(r.Amount)) ? sum : sum + Number(r.Amount)), 0),
    [records]
  )

  /* ---------------- form handlers ---------------- */
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    setFile(f || null)
    if (f) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview('')
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setFile(null)
    setPreview('')
    setExistingPhoto('')
    setEditId(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function closeFormModal() {
    setShowFormModal(false)
    resetForm()
  }

  function openAddModal() {
    resetForm()
    setShowFormModal(true)
  }

  function openEditModal(item) {
    setForm({
      challanNo: item.challanNo || '',
      date: item.date ? item.date.slice(0, 10) : '',
      shopName: item.shopName || '',
      Amount: item.Amount != null ? String(item.Amount) : '',
      receiverName: item.receiverName || '',
      remark: item.remark || '',
    })
    setFile(null)
    setPreview('')
    setExistingPhoto(item.challanPhotoUpload || '')
    setEditId(item._id)
    setError('')
    setShowFormModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !editId) { setError('Please select a challan photo.'); return }
    if (!form.challanNo || !form.date || !form.shopName || !form.receiverName) {
      setError('Please fill in every required field.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('challanNo', form.challanNo)
      fd.append('date', form.date)
      fd.append('shopName', form.shopName)
      fd.append('Amount', form.Amount)
      fd.append('receiverName', form.receiverName)
      fd.append('remark', form.remark)
      if (file) fd.append('challanPhotoUpload', file)
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editId) {
        await axios.put(`${API_BASE}/${editId}`, fd, cfg)
        toast.success('Record updated')
      } else {
        await axios.post(API_BASE, fd, cfg)
        toast.success('Record added')
      }
      closeFormModal()
      loadRecords()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save. Please check the details.'
      setError(msg)
      toast.error(msg)
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this color chemical record? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await axios.delete(`${API_BASE}/${id}`)
      toast('Record deleted', { icon: '🗑️' })
      loadRecords()
    } catch {
      toast.error('Failed to delete the record')
    }
    setDeletingId(null)
  }

  const isEditing = Boolean(editId)

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <RiFlaskLine size={20} className="sm:hidden" />
            <RiFlaskLine size={22} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide text-orange-500">Fabric Task Workflow</div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 -mt-0.5 truncate">Color Chemicals</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage challan records for color chemical purchases.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-10 py-5 sm:py-6 pb-10">

        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <SummaryCard label="Total Records" value={records.length} accent="border-gray-200 text-gray-700" />
          <SummaryCard label="Total Amount" value={`₹${totalAmount.toLocaleString('en-IN')}`} accent="border-orange-200 text-orange-700" />
          {/* <SummaryCard label="Matching Search" value={filteredRecords.length} accent="border-amber-200 text-amber-700" className="" /> */}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-5 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[220px] bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <RiSearchLine className="text-gray-400 flex-shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search Challan No, Shop, Receiver..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0" aria-label="Clear search">
                <RiCloseLine size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={loadRecords}
              className="flex md:items-center md:justify-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 transition md:flex-1 sm:flex-none"
            >
              <RiRefreshLine size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden xs:inline sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 sm:px-5 py-2 transition md:flex-1 sm:flex-none sm:ml-auto"
            >
              <RiAddLine size={16} />
              Add Record
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>{loadError}</span>
            <button type="button" onClick={loadRecords} className="rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-1.5 transition whitespace-nowrap">
              Try again
            </button>
          </div>
        )}

        {/* Main content: table on sm+, cards on mobile */}
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm py-16 text-center text-orange-500 text-sm font-medium animate-pulse">
            Loading records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm py-10">
            <EmptyState
              icon="🧪"
              text={records.length === 0 ? 'No records yet. Add your first color chemical challan.' : 'No records match your search.'}
            />
            {records.length === 0 && (
              <div className="text-center mt-4">
                <button type="button" onClick={openAddModal} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
                  Add a record
                </button>
              </div>
            )}
            {records.length > 0 && searchTerm && (
              <div className="text-center mt-3">
                <button type="button" onClick={() => setSearchTerm('')} className="text-orange-600 hover:text-orange-700 text-xs font-semibold underline">
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filteredRecords.map(item => {
                const photoUrl = getFullImgUrl(item.challanPhotoUpload)
                return (
                  <div key={item._id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <span className="bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs rounded-full px-3 py-1">
                          {item.challanNo}
                        </span>
                        <button
                          type="button"
                          aria-label="Copy Challan No"
                          className="text-orange-500 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]"
                          onClick={() => copyToClipboard(item.challanNo)}
                        >Copy</button>
                      </span>
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatCurrency(item.Amount)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs mb-3">
                      <div>
                        <div className="text-gray-400 font-semibold uppercase text-[10px]">Date</div>
                        <div className="text-gray-700">{formatDate(item.date)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold uppercase text-[10px]">Shop</div>
                        <div className="text-gray-800 font-medium truncate">{item.shopName}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold uppercase text-[10px]">Receiver</div>
                        <div className="text-gray-700 truncate">{item.receiverName}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold uppercase text-[10px]">Photo</div>
                        {item.challanPhotoUpload ? (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-orange-600 underline underline-offset-2 font-medium text-xs"
                            onClick={() => challanPreview.open(photoUrl, `Challan #${item.challanNo}`)}
                          >
                            <RiImageLine size={13} /> View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No photo</span>
                        )}
                      </div>
                      {item.remark && (
                        <div className="col-span-2">
                          <div className="text-gray-400 font-semibold uppercase text-[10px]">Remark</div>
                          <div className="text-gray-600">{item.remark}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-1 rounded-full border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 text-xs font-semibold px-3 py-2 transition"
                        onClick={() => openEditModal(item)}
                      >
                        <RiPencilLine size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 transition disabled:opacity-50"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                      >
                        <RiDeleteBin5Line size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop / tablet table */}
            <div className="hidden sm:block rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <Th>Challan No</Th>
                      <Th>Date</Th>
                      <Th>Shop Name</Th>
                      <Th>Photo</Th>
                      <Th>Amount</Th>
                      <Th>Receiver</Th>
                      <Th>Remark</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(item => {
                      const photoUrl = getFullImgUrl(item.challanPhotoUpload)
                      return (
                        <tr key={item._id} className="border-t border-gray-100 hover:bg-orange-50/40 transition-colors">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <span className="bg-orange-100 border border-orange-200 text-orange-700 font-bold text-xs rounded-full px-3 py-1">
                                {item.challanNo}
                              </span>
                              <button
                                type="button"
                                aria-label="Copy Challan No"
                                className="text-orange-500 hover:text-orange-700 rounded-full px-1.5 py-0.5 border border-orange-200 bg-orange-50 text-[10px]"
                                onClick={() => copyToClipboard(item.challanNo)}
                              >Copy</button>
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-700">{formatDate(item.date)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-800 font-medium">{item.shopName}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {item.challanPhotoUpload ? (
                              <button
                                type="button"
                                className="flex items-center gap-1 text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium text-xs"
                                onClick={() => challanPreview.open(photoUrl, `Challan #${item.challanNo}`)}
                                title="Preview image"
                              >
                                <RiImageLine size={13} />
                                View photo
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">No photo</span>
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap font-bold text-gray-900">{formatCurrency(item.Amount)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-700">{item.receiverName}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-gray-600 max-w-[160px] truncate" title={item.remark ?? ''}>{item.remark || '-'}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-full border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 text-[11px] font-semibold px-3 py-1.5 transition"
                                onClick={() => openEditModal(item)}
                              >
                                <RiPencilLine size={12} />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 p-1.5 transition disabled:opacity-50"
                                title="Delete record"
                                onClick={() => handleDelete(item._id)}
                                disabled={deletingId === item._id}
                              >
                                <RiDeleteBin5Line size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-3 text-xs text-gray-400 text-right">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {/* Add / Edit Record Modal */}
      <Modal
        open={showFormModal}
        onClose={closeFormModal}
        width={520}
        title={isEditing ? 'Edit Record' : 'Add New Record'}
        showClose
      >
        <form className="flex flex-col gap-5 sm:gap-6 py-1 px-1" onSubmit={handleSubmit} autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Challan No<span className="text-red-500 font-bold ml-1">*</span></label>
              <input name="challanNo" type="text" placeholder="e.g. CH-2024-001" value={form.challanNo} onChange={handleChange} className={pillInput} required />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Date<span className="text-red-500 font-bold ml-1">*</span></label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className={pillInput} required />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Shop Name<span className="text-red-500 font-bold ml-1">*</span></label>
              <input name="shopName" type="text" placeholder="Supplier shop name" value={form.shopName} onChange={handleChange} className={pillInput} required />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Amount (₹)</label>
              <input name="Amount" type="number" min={0} step="0.01" placeholder="0.00" value={form.Amount} onChange={handleChange} className={pillInput} />
            </div>
            <div className="flex flex-col sm:col-span-2">
              <label className={labelClass}>Receiver Name<span className="text-red-500 font-bold ml-1">*</span></label>
              <input name="receiverName" type="text" placeholder="Person who received it" value={form.receiverName} onChange={handleChange} className={pillInput} required />
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Remark <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
            <textarea name="remark" rows={2} maxLength={200} placeholder="Any note for this record..." value={form.remark} onChange={handleChange} className={softInput} />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>
              Challan Photo
              <span className={`text-red-500 font-bold ml-1${existingPhoto ? ' opacity-60' : ''}`}>*</span>
              {existingPhoto && <span className="ml-1 text-gray-400 font-normal normal-case block sm:inline">(optional — existing kept if blank)</span>}
            </label>
            {existingPhoto && !file && (
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="text-gray-500">Current:</span>
                <button
                  type="button"
                  className="text-orange-600 hover:text-orange-700 underline underline-offset-2 font-medium"
                  onClick={() => challanPreview.open(getFullImgUrl(existingPhoto), 'Existing Challan Photo')}
                >
                  View photo
                </button>
              </div>
            )}
            <input ref={fileRef} name="challanPhotoUpload" type="file" accept="image/*" onChange={handleFileChange} className={fileInput} required={!existingPhoto} />
            {file && (
              <span className="text-xs text-orange-600 font-medium mt-1">New file: {file.name}</span>
            )}
            {preview && (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/40 p-3 flex flex-col items-start gap-2">
                <img src={preview} alt="preview" className="rounded-xl border border-orange-100 max-h-[180px] sm:max-h-[220px] object-contain bg-white w-full" />
              </div>
            )}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-600 text-xs font-semibold">{error}</div>}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button type="button" className="flex items-center justify-center gap-2 rounded-full border border-gray-300 hover:bg-gray-50 px-5 py-2.5 text-gray-700 font-semibold text-sm transition" onClick={closeFormModal} disabled={submitting}>
              <RiCloseLine size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-7 py-2.5 font-semibold text-sm shadow-sm transition disabled:bg-gray-300"
              disabled={submitting}
            >
              <RiCheckLine size={17} />
              {submitting ? 'Saving…' : (isEditing ? 'Update Record' : 'Add Record')}
            </button>
          </div>
        </form>
      </Modal>

      {challanPreview.ModalPreview && <challanPreview.ModalPreview />}
    </div>
  )
}

/* small presentational helpers */
const Th = ({ children }) => (
  <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap text-left">{children}</th>
)

const SummaryCard = ({ label, value, accent, onClick, active, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={`text-left rounded-2xl border bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-sm transition ${accent} ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'} ${active ? 'ring-2 ring-orange-300' : ''} ${className}`}
  >
    <div className="text-xl sm:text-2xl font-extrabold flex items-center gap-1.5 truncate">
      {value}
      {label === 'Total Amount' && <RiInboxArchiveLine className="opacity-40 flex-shrink-0" size={16} />}
    </div>
    <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
  </button>
)

export default ColorChemical