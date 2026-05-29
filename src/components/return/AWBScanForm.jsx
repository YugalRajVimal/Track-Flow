

// import React, { useState, useEffect, useRef, useCallback } from 'react'
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

//   const awbInputRef = useRef(null)

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

//   const clearAWB = useCallback(() => {
//     setValue('awbId', '', { shouldValidate: false, shouldDirty: false })
//     clearErrors('awbId')
//     if (awbInputRef.current) {
//       awbInputRef.current.value = ''
//       setTimeout(() => { awbInputRef.current?.focus() }, 0)
//     }
//   }, [setValue, clearErrors])

//   const doSubmit = useCallback(async (data) => {
//     const { channelPartnerId, brandId, awbId } = data

//     if (!channelPartnerId) {
//       toast.error("Please select a Channel Partner before scanning or submitting")
//       clearAWB()
//       return
//     }
//     if (!brandId) {
//       toast.error("Please select a Brand before scanning or submitting")
//       clearAWB()
//       return
//     }
//     if (!awbId || awbId.length < 6 || awbId.length > 30 || !/^[a-zA-Z0-9]+$/.test(awbId)) {
//       toast.error("AWB must be 6-30 alphanumeric characters.")
//       clearAWB()
//       return
//     }

//     try {
//       setSubmitting(true)
//       const res = await returnAPI.scan({ channelPartnerId, brandId, awbId })
//       if (res.data?.success) {
//         toast.success(res.data.message || `AWB ${awbId} scanned successfully`)
//         onSuccess?.()
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to scan AWB'
//       toast.error(msg)
//     } finally {
//       setSubmitting(false)
//       clearAWB()
//     }
//   }, [clearAWB, onSuccess])

//   // Keep scanner open — just submit and BarcodeScanner restarts camera for next scan
//   const onScan = useCallback(async (scannedValue) => {
//     await doSubmit({
//       channelPartnerId: getValues('channelPartnerId'),
//       brandId: getValues('brandId'),
//       awbId: scannedValue,
//     })
//   }, [doSubmit, getValues])

//   const handleAWBKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       handleSubmit(doSubmit)()
//     }
//   }

//   const { ref: rhfRef, ...awbRegister } = register('awbId', {
//     required: 'AWB ID is required',
//     minLength: { value: 6, message: 'Min 6 characters' },
//     maxLength: { value: 30, message: 'Max 30 characters' },
//     pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
//   })

//   const mergedRef = (el) => {
//     rhfRef(el)
//     awbInputRef.current = el
//   }

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
//         <div>
//           <label className={baseLabel}>Channel Partner *</label>
//           <select
//             {...register('channelPartnerId', { required: 'Channel partner is required' })}
//             className={baseSelect}
//             disabled={submitting}
//           >
//             <option value="">Select channel partner...</option>
//             {partners.map(p => (
//               <option key={p._id} value={p._id}>{p.name}</option>
//             ))}
//           </select>
//           {errors.channelPartnerId && <p className={errorText}>{errors.channelPartnerId.message}</p>}
//         </div>

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
//           {errors.brandId && <p className={errorText}>{errors.brandId.message}</p>}
//         </div>

//         <div>
//           <label className={baseLabel}>AWB ID *</label>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
//               <input
//                 {...awbRegister}
//                 ref={mergedRef}
//                 className={baseInput}
//                 placeholder="AWB123456"
//                 autoComplete="off"
//                 onKeyDown={handleAWBKeyDown}
//                 disabled={submitting}
//                 onChange={e => awbRegister.onChange?.(e)}
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
//           {errors.awbId && <p className={errorText}>{errors.awbId.message}</p>}
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


import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  } = useForm({
    defaultValues: {
      channelPartnerId: '',
      brandId: '',
      awbId: '',
    },
  })

  const selectedPartner = watch('channelPartnerId')

  // ── NEW: derive the selected partner object so we can read its name ──
  const selectedPartnerObj = partners.find(p => p._id === selectedPartner) || null
  const selectedPartnerName = selectedPartnerObj?.name || ''

  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
  }, [])

  useEffect(() => {
    if (!selectedPartner) { setBrands([]); return }
    setLoadingBrands(true)
    brandsAPI
      .listByPartner(selectedPartner)
      .then(r => setBrands(r.data?.data || []))
      .finally(() => setLoadingBrands(false))
  }, [selectedPartner])

  const clearAWB = useCallback(() => {
    setValue('awbId', '', { shouldValidate: false, shouldDirty: false })
    clearErrors('awbId')
    if (awbInputRef.current) {
      awbInputRef.current.value = ''
      setTimeout(() => { awbInputRef.current?.focus() }, 0)
    }
  }, [setValue, clearErrors])

  const doSubmit = useCallback(
    async (data) => {
      const { channelPartnerId, brandId, awbId } = data

      if (!channelPartnerId) {
        toast.error('Please select a Channel Partner before scanning or submitting')
        clearAWB()
        return
      }
      if (!brandId) {
        toast.error('Please select a Brand before scanning or submitting')
        clearAWB()
        return
      }
      if (!awbId || awbId.length < 6 || awbId.length > 30 || !/^[a-zA-Z0-9]+$/.test(awbId)) {
        toast.error('AWB must be 6-30 alphanumeric characters.')
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
        clearAWB()
      }
    },
    [clearAWB, onSuccess],
  )

  const onScan = useCallback(
    async (scannedValue) => {
      await doSubmit({
        channelPartnerId: getValues('channelPartnerId'),
        brandId: getValues('brandId'),
        awbId: scannedValue,
      })
    },
    [doSubmit, getValues],
  )

  const handleAWBKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(doSubmit)()
    }
  }

  const { ref: rhfRef, ...awbRegister } = register('awbId', {
    required: 'AWB ID is required',
    minLength: { value: 6, message: 'Min 6 characters' },
    maxLength: { value: 30, message: 'Max 30 characters' },
    pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
  })

  const mergedRef = (el) => {
    rhfRef(el)
    awbInputRef.current = el
  }

  const baseInput =
    'input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200'
  const baseSelect =
    'select-field bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200'
  const baseLabel = 'label text-slate-700'
  const baseButtonSecondary =
    'btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600'
  const baseButtonPrimary =
    'btn-primary px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 font-semibold'
  const errorText = 'text-pink-600 text-xs mt-1'

  return (
    <>
      {/* ── CHANGED: pass partnerName so BarcodeScanner knows the active partner ── */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan AWB Barcode"
        partnerName={selectedPartnerName}
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
              {!selectedPartner
                ? 'Select partner first...'
                : loadingBrands
                ? 'Loading brands...'
                : 'Select brand...'}
            </option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          {errors.brandId && <p className={errorText}>{errors.brandId.message}</p>}
        </div>

        {/* AWB ID */}
        <div>
          <label className={baseLabel}>AWB ID *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                {...awbRegister}
                ref={mergedRef}
                className={baseInput}
                placeholder="AWB123456"
                autoComplete="off"
                onKeyDown={handleAWBKeyDown}
                disabled={submitting}
                onChange={e => awbRegister.onChange?.(e)}
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
          {errors.awbId && <p className={errorText}>{errors.awbId.message}</p>}
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