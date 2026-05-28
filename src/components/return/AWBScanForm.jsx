// import React, { useState, useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
// import { RiBarcodeLine, RiQrScanLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
// import { returnAPI } from '../../api/awb'
// import { channelPartnersAPI, brandsAPI } from '../../api/services'
// import BarcodeScanner from './BarcodeScanner'

// export default function AWBScanForm({ onSuccess }) {
//   const [partners, setPartners] = useState([])
//   const [brands, setBrands] = useState([])
//   const [loadingBrands, setLoadingBrands] = useState(false)
//   const [scannerOpen, setScannerOpen] = useState(false)
//   const [submitting, setSubmitting] = useState(false)

//   const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm()
//   const selectedPartner = watch('channelPartnerId')

//   useEffect(() => {
//     channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
//   }, [])

//   useEffect(() => {
//     if (!selectedPartner) { setBrands([]); return }
//     setLoadingBrands(true)
//     brandsAPI.listByPartner(selectedPartner)
//       .then(r => setBrands(r.data?.data || []))
//       .finally(() => setLoadingBrands(false))
//   }, [selectedPartner])

//   const onScan = (awbId) => {
//     setValue('awbId', awbId, { shouldValidate: true })
//     toast.success(`Scanned: ${awbId}`)
//   }

//   const onSubmit = async (data) => {
//     setSubmitting(true)
//     try {
//       const res = await returnAPI.scan(data)
//       if (res.data?.success) {
//         toast.success(res.data.message || 'AWB scanned successfully')
//         reset()
//         onSuccess?.()
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to scan AWB'
//       toast.error(msg)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // Light theme classes
//   const baseInput =
//     "input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
//   const baseSelect =
//     "select-field bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
//   const baseLabel = "label text-slate-700"
//   const baseButtonPrimary =
//     "btn-primary w-full justify-center py-3 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 flex items-center gap-2"
//   const baseButtonSecondary =
//     "btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600"
//   const errorText = "text-pink-600 text-xs mt-1"

//   return (
//     <>
//       <BarcodeScanner
//         open={scannerOpen}
//         onClose={() => setScannerOpen(false)}
//         onScan={onScan}
//         title="Scan AWB Barcode"
//       />

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {/* Channel Partner */}
//         <div>
//           <label className={baseLabel}>Channel Partner *</label>
//           <div className="relative">
//             <select
//               {...register('channelPartnerId', { required: 'Channel partner is required' })}
//               className={baseSelect}
//             >
//               <option value="">Select channel partner...</option>
//               {partners.map(p => (
//                 <option key={p._id} value={p._id}>{p.name}</option>
//               ))}
//             </select>
//           </div>
//           {errors.channelPartnerId && (
//             <p className={errorText}>{errors.channelPartnerId.message}</p>
//           )}
//         </div>

//         {/* Brand */}
//         <div>
//           <label className={baseLabel}>Brand *</label>
//           <select
//             {...register('brandId', { required: 'Brand is required' })}
//             className={baseSelect}
//             disabled={!selectedPartner || loadingBrands}
//           >
//             <option value="">
//               {!selectedPartner ? 'Select partner first...' : loadingBrands ? 'Loading brands...' : 'Select brand...'}
//             </option>
//             {brands.map(b => (
//               <option key={b._id} value={b._id}>{b.name}</option>
//             ))}
//           </select>
//           {errors.brandId && (
//             <p className={errorText}>{errors.brandId.message}</p>
//           )}
//         </div>

//         {/* AWB ID */}
//         <div>
//           <label className={baseLabel}>AWB ID *</label>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
//               <input
//                 {...register('awbId', {
//                   required: 'AWB ID is required',
//                   minLength: { value: 6, message: 'Min 6 characters' },
//                   maxLength: { value: 30, message: 'Max 30 characters' },
//                   pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
//                 })}
//                 className={baseInput}
//                 placeholder="AWB123456"
//                 autoComplete="off"
//               />
//             </div>
//             <button
//               type="button"
//               onClick={() => setScannerOpen(true)}
//               className={baseButtonSecondary}
//               title="Scan barcode"
//             >
//               <RiQrScanLine className="text-lg" />
//             </button>
//           </div>
//           {errors.awbId && (
//             <p className={errorText}>{errors.awbId.message}</p>
//           )}
//         </div>

//         <button type="submit" disabled={submitting} className={baseButtonPrimary}>
//           {submitting ? (
//             <><RiLoader4Line className="animate-spin" /> Scanning...</>
//           ) : (
//             <><RiSendPlane2Line /> Submit Scan</>
//           )}
//         </button>
//       </form>
//     </>
//   )
// }

// import React, { useState, useEffect, useRef } from 'react'
// import { useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
// import { RiBarcodeLine, RiQrScanLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
// import { returnAPI } from '../../api/return'
// import { channelPartnersAPI, brandsAPI } from '../../api/services'
// import BarcodeScanner from './BarcodeScanner'

// export default function AWBScanForm({ onSuccess }) {
//   const [partners, setPartners] = useState([])
//   const [brands, setBrands] = useState([])
//   const [loadingBrands, setLoadingBrands] = useState(false)
//   const [scannerOpen, setScannerOpen] = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   // Used to reset only AWB field after successful scan
//   const awbInputRef = useRef(null)

//   // React Hook Form for easy form control
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     getValues,
//     formState: { errors },
//     clearErrors,
//   } = useForm({
//     defaultValues: {
//       channelPartnerId: "",
//       brandId: "",
//       awbId: "",
//     }
//   })

//   const selectedPartner = watch('channelPartnerId')

//   useEffect(() => {
//     channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
//   }, [])

//   useEffect(() => {
//     if (!selectedPartner) { setBrands([]); return }
//     setLoadingBrands(true)
//     brandsAPI.listByPartner(selectedPartner)
//       .then(r => setBrands(r.data?.data || []))
//       .finally(() => setLoadingBrands(false))
//   }, [selectedPartner])

//   // Helper for both manual and scanner submit
//   const doSubmit = async (data) => {
//     const { channelPartnerId, brandId, awbId } = data
//     // Toast showing scan attempt 
//     toast(`Submitting AWB: ${awbId || '(empty)'}`)
//     if (!channelPartnerId) {
//       toast.error("Please select a Channel Partner before scanning or submitting")
//       return
//     }
//     if (!brandId) {
//       toast.error("Please select a Brand before scanning or submitting")
//       return
//     }
//     // Validate AWB client-side before hitting API
//     if (
//       !awbId ||
//       awbId.length < 6 ||
//       awbId.length > 30 ||
//       !/^[a-zA-Z0-9]+$/.test(awbId)
//     ) {
//       toast.error("AWB must be 6-30 alphanumeric characters.")
//       // Always clear after feedback for barcode machines (even if invalid)
//       setValue('awbId', '')
//       awbInputRef.current && awbInputRef.current.focus()
//       clearErrors('awbId')
//       return
//     }
//     try {
//       setSubmitting(true)
//       const res = await returnAPI.scan({ channelPartnerId, brandId, awbId })
//       if (res.data?.success) {
//         toast.success(res.data.message || `AWB ${awbId} scanned successfully`)
//         // Always clear AWB field after any submission (barcode or manual)
//         setValue('awbId', '')
//         clearErrors('awbId')
//         awbInputRef.current && awbInputRef.current.focus()
//         onSuccess?.()
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to scan AWB'
//       toast.error(msg)
//       // Always clear field after server error
//       setValue('awbId', '')
//       clearErrors('awbId')
//       awbInputRef.current && awbInputRef.current.focus()
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   // This gets triggered by the barcode scanner (hardware or UI scan)
//   const onScan = async (awbId) => {
//     setValue('awbId', awbId, { shouldValidate: true, shouldDirty: true })
//     clearErrors('awbId')
//     // Call the shared submit logic
//     // Use the latest values for other fields
//     await doSubmit({
//       channelPartnerId: getValues('channelPartnerId'),
//       brandId: getValues('brandId'),
//       awbId
//     })
//     // Leave scanner open (UX spec)
//   }

//   // Allow user to type and submit with Enter
//   const handleAWBKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       handleSubmit(doSubmit)()
//     }
//   }

//   // OnChange updates error message live as the user types
//   const handleAWBChange = (e) => {
//     setValue('awbId', e.target.value, { shouldValidate: true, shouldDirty: true })
//     if (errors.awbId && e.target.value) {
//       clearErrors('awbId')
//     }
//   }

//   // Light theme classes
//   const baseInput =
//     "input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
//   const baseSelect =
//     "select-field bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
//   const baseLabel = "label text-slate-700"
//   const baseButtonSecondary =
//     "btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600"
//   const baseButtonPrimary =
//     "btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 font-semibold"
//   const errorText = "text-pink-600 text-xs mt-1"

//   return (
//     <>
//       <BarcodeScanner
//         open={scannerOpen}
//         onClose={() => setScannerOpen(false)}
//         onScan={onScan}
//         title="Scan AWB Barcode"
//       />

//       <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit(doSubmit)}>
//         {/* Channel Partner */}
//         <div>
//           <label className={baseLabel}>Channel Partner *</label>
//           <div className="relative">
//             <select
//               {...register('channelPartnerId', { required: 'Channel partner is required' })}
//               className={baseSelect}
//               disabled={submitting}
//             >
//               <option value="">Select channel partner...</option>
//               {partners.map(p => (
//                 <option key={p._id} value={p._id}>{p.name}</option>
//               ))}
//             </select>
//           </div>
//           {errors.channelPartnerId && (
//             <p className={errorText}>{errors.channelPartnerId.message}</p>
//           )}
//         </div>

//         {/* Brand */}
//         <div>
//           <label className={baseLabel}>Brand *</label>
//           <select
//             {...register('brandId', { required: 'Brand is required' })}
//             className={baseSelect}
//             disabled={!selectedPartner || loadingBrands || submitting}
//           >
//             <option value="">
//               {!selectedPartner ? 'Select partner first...' : loadingBrands ? 'Loading brands...' : 'Select brand...'}
//             </option>
//             {brands.map(b => (
//               <option key={b._id} value={b._id}>{b.name}</option>
//             ))}
//           </select>
//           {errors.brandId && (
//             <p className={errorText}>{errors.brandId.message}</p>
//           )}
//         </div>

//         {/* AWB ID field (manual input allowed, scan also works, Enter submits) */}
//         <div>
//           <label className={baseLabel}>AWB ID *</label>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
//               <input
//                 {...register('awbId', {
//                   required: 'AWB ID is required',
//                   minLength: { value: 6, message: 'Min 6 characters' },
//                   maxLength: { value: 30, message: 'Max 30 characters' },
//                   pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
//                 })}
//                 className={baseInput}
//                 placeholder="AWB123456"
//                 autoComplete="off"
//                 ref={awbInputRef}
//                 onKeyDown={handleAWBKeyDown}
//                 onChange={handleAWBChange}
//                 disabled={submitting}
//               />
//             </div>
//             <button
//               type="button"
//               onClick={() => setScannerOpen(true)}
//               className={baseButtonSecondary}
//               title="Scan barcode"
//               disabled={submitting}
//             >
//               <RiQrScanLine className="text-lg" />
//             </button>
//           </div>
//           {errors.awbId && (
//             <p className={errorText}>{errors.awbId.message}</p>
//           )}
//         </div>
//         <button type="submit" disabled={submitting} className={baseButtonPrimary}>
//           {submitting ? (
//             <><RiLoader4Line className="animate-spin" /> Scanning...</>
//           ) : (
//             <><RiSendPlane2Line /> Submit Scan</>
//           )}
//         </button>
//       </form>
//     </>
//   )
// }

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiQrScanLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
import { returnAPI } from '../../api/return'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import BarcodeScanner from './BarcodeScanner'

export default function AWBScanForm({ onSuccess }) {
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const awbInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm({
    defaultValues: {
      channelPartnerId: "",
      brandId: "",
      awbId: "",
    }
  })

  const selectedPartner = watch('channelPartnerId')

  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
  }, [])

  useEffect(() => {
    if (!selectedPartner) { setBrands([]); return }
    setLoadingBrands(true)
    brandsAPI.listByPartner(selectedPartner)
      .then(r => setBrands(r.data?.data || []))
      .finally(() => setLoadingBrands(false))
  }, [selectedPartner])

  // ── Clear AWB and refocus ─────────────────────────────────────────────
  const clearAWB = () => {
    setValue('awbId', '', { shouldValidate: false, shouldDirty: false })
    clearErrors('awbId')
    // Also clear the DOM input directly — prevents stale value in uncontrolled scenarios
    if (awbInputRef.current) {
      awbInputRef.current.value = ''
      awbInputRef.current.focus()
    }
  }

  const doSubmit = async (data) => {
    const { channelPartnerId, brandId, awbId } = data

    if (!channelPartnerId) {
      toast.error("Please select a Channel Partner before scanning or submitting")
      clearAWB()
      return
    }
    if (!brandId) {
      toast.error("Please select a Brand before scanning or submitting")
      clearAWB()
      return
    }
    if (
      !awbId ||
      awbId.length < 6 ||
      awbId.length > 30 ||
      !/^[a-zA-Z0-9]+$/.test(awbId)
    ) {
      toast.error("AWB must be 6-30 alphanumeric characters.")
      clearAWB()
      return
    }

    try {
      setSubmitting(true)
      const res = await returnAPI.scan({ channelPartnerId, brandId, awbId })
      if (res.data?.success) {
        toast.success(res.data.message || `AWB ${awbId} scanned successfully`)
        onSuccess?.()
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to scan AWB'
      toast.error(msg)
    } finally {
      setSubmitting(false)
      // Always clear after every attempt — success or failure
      clearAWB()
    }
  }

  // ── Hardware scanner / camera scan handler ────────────────────────────
  const onScan = async (scannedValue) => {
    // Clear first to ensure no prefix from previous scan
    clearAWB()

    // Small tick to let React flush the clear before setting new value
    await new Promise(r => setTimeout(r, 0))

    setValue('awbId', scannedValue, { shouldValidate: true, shouldDirty: true })
    if (awbInputRef.current) awbInputRef.current.value = scannedValue

    await doSubmit({
      channelPartnerId: getValues('channelPartnerId'),
      brandId: getValues('brandId'),
      awbId: scannedValue,
    })
  }

  // ── Enter key on AWB field submits ────────────────────────────────────
  const handleAWBKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(doSubmit)()
    }
  }

  // ── Fix: merge RHF ref with our awbInputRef ───────────────────────────
  // register() returns a ref — we must not overwrite it with our own ref.
  // Use the callback ref pattern to hold both.
  const { ref: rhfRef, ...awbRegister } = register('awbId', {
    required: 'AWB ID is required',
    minLength: { value: 6, message: 'Min 6 characters' },
    maxLength: { value: 30, message: 'Max 30 characters' },
    pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
  })

  const mergedRef = (el) => {
    rhfRef(el)           // Give RHF its ref so setValue/clearErrors work correctly
    awbInputRef.current = el  // Keep our ref for direct DOM focus/clear
  }

  // Light theme classes
  const baseInput =
    "input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
  const baseSelect =
    "select-field bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
  const baseLabel = "label text-slate-700"
  const baseButtonSecondary =
    "btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600"
  const baseButtonPrimary =
    "btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 font-semibold"
  const errorText = "text-pink-600 text-xs mt-1"

  return (
    <>
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan AWB Barcode"
      />

      <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit(doSubmit)}>

        {/* Channel Partner */}
        <div>
          <label className={baseLabel}>Channel Partner *</label>
          <select
            {...register('channelPartnerId', { required: 'Channel partner is required' })}
            className={baseSelect}
            disabled={submitting}
          >
            <option value="">Select channel partner...</option>
            {partners.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {errors.channelPartnerId && (
            <p className={errorText}>{errors.channelPartnerId.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className={baseLabel}>Brand *</label>
          <select
            {...register('brandId', { required: 'Brand is required' })}
            className={baseSelect}
            disabled={!selectedPartner || loadingBrands || submitting}
          >
            <option value="">
              {!selectedPartner ? 'Select partner first...' : loadingBrands ? 'Loading brands...' : 'Select brand...'}
            </option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          {errors.brandId && (
            <p className={errorText}>{errors.brandId.message}</p>
          )}
        </div>

        {/* AWB ID */}
        <div>
          <label className={baseLabel}>AWB ID *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                {...awbRegister}
                ref={mergedRef}          // ← merged ref: RHF + our awbInputRef
                className={baseInput}
                placeholder="AWB123456"
                autoComplete="off"
                onKeyDown={handleAWBKeyDown}
                disabled={submitting}
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className={baseButtonSecondary}
              title="Scan barcode"
              disabled={submitting}
            >
              <RiQrScanLine className="text-lg" />
            </button>
          </div>
          {errors.awbId && (
            <p className={errorText}>{errors.awbId.message}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className={baseButtonPrimary}>
          {submitting ? (
            <><RiLoader4Line className="animate-spin" /> Scanning...</>
          ) : (
            <><RiSendPlane2Line /> Submit Scan</>
          )}
        </button>
      </form>
    </>
  )
}