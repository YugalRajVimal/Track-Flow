
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
import { returnAPI } from '../../api/return'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import BarcodeScanner from './BarcodeScanner'
import { useAuthStore } from '../../store/authStore'

const orange = '#f58021'

export default function AWBScanForm({ onSuccess }) {
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const awbInputRef = useRef(null)

  // Get auth details and derive isAdmin from the store
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

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
      backDateScan: false,
      backDate: '',
    },
  })

  const selectedPartner = watch('channelPartnerId')
  const backDateScanSelected = watch('backDateScan')

  // ── Derive the selected partner object so we can read its name ──
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
    // Also reset backDate if present
    if (isAdmin) {
      setValue('backDate', '', { shouldValidate: false, shouldDirty: false })
      setValue('backDateScan', false, { shouldValidate: false, shouldDirty: false })
    }
  }, [setValue, clearErrors, isAdmin])

  const doSubmit = useCallback(
    async (data) => {
      const { channelPartnerId, brandId, awbId, backDateScan, backDate } = data

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
      // If admin & backdate selected, validate date
      if (isAdmin && backDateScan) {
        if (!backDate) {
          toast.error('Please select a date for backdate scan')
          return
        }
      }

      try {
        setSubmitting(true)
        const apiPayload = { channelPartnerId, brandId, awbId }
        if (isAdmin && backDateScan) {
          apiPayload.backDateScan = true
          apiPayload.backDate = backDate // pass as 'date'
        }
        const res = await returnAPI.scan(apiPayload)
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
    [clearAWB, onSuccess, isAdmin],
  )

  const onScan = useCallback(
    async (scannedValue) => {
      const data = {
        channelPartnerId: getValues('channelPartnerId'),
        brandId: getValues('brandId'),
        awbId: scannedValue,
      }
      if (isAdmin && getValues('backDateScan')) {
        data.backDateScan = true
        data.backDate = getValues('backDate')
      }
      await doSubmit(data)
    },
    [doSubmit, getValues, isAdmin],
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

  // Style classes for black & white, orange only for buttons and icons
  const baseInput =
    `input-field pl-9 font-mono bg-white border border-black text-black placeholder-gray-400 focus:border-black focus:ring-black`
  const baseSelect =
    `select-field bg-white border border-black text-black placeholder-gray-400 focus:border-black focus:ring-black`
  const baseLabel = 'label text-black'
  const baseButtonSecondary =
    `btn-secondary px-3 flex-shrink-0 bg-[${orange}] border border-[${orange}] hover:bg-white hover:text-[${orange}] text-white`
  const baseButtonPrimary =
    `btn-primary px-4 py-2 rounded bg-[${orange}] text-white hover:bg-black  flex items-center gap-1 font-semibold`
  const errorText = 'text-pink-600 text-xs mt-1'

  // --- SCAN TYPE ALERT LOGIC ---
  let scanInfo = null
  if (selectedPartnerObj) {
    scanInfo = {
      type: 'barcode',
      label: 'Scan only Label Barcode.',
    }
  }

  function ScanAlertBox({ scanInfo }) {
    if (!scanInfo) return null
    const boxClass = 'bg-white border border-black text-black'
    const icon = <RiBarcodeLine className="text-2xl mr-2" style={{ color: orange }} />
    return (
      <div className={`flex items-center gap-2 p-3 rounded mb-4 font-semibold ${boxClass}`}>
        {icon}
        <span>{scanInfo.label}</span>
      </div>
    )
  }

  return (
    <>
      {/* ── Alert box shows scan instructions based on selected partner ── */}
      <ScanAlertBox scanInfo={scanInfo} />

      {/* ── Pass partnerName so BarcodeScanner knows the active partner ── */}
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
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: orange }} />
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
              <RiBarcodeLine className="text-lg"/>
            </button>
          </div>
          {errors.awbId && <p className={errorText}>{errors.awbId.message}</p>}
        </div>

        {/* Admin-only: Backdate Scan Logic */}
        {isAdmin && (
          <div>
            <label className={baseLabel}>
              <input
                type="checkbox"
                {...register('backDateScan')}
                className="mr-2"
                disabled={submitting}
              />
              Backdate Scan
            </label>
          </div>
        )}
        {/* Admin-only: Date field, only if backDateScan is selected */}
        {isAdmin && backDateScanSelected && (
          <div>
            <label className={baseLabel}>Backdate *</label>
            <input
              type="date"
              {...register('backDate', { required: 'Backdate is required' })}
              className={baseInput}
              disabled={submitting}
            />
            {errors.backDate && <p className={errorText}>{errors.backDate.message}</p>}
          </div>
        )}

        <button type="submit" disabled={submitting} className={baseButtonPrimary} style={{ backgroundColor: orange }}>
          {submitting ? (
            <>
              <RiLoader4Line className="animate-spin" style={{ color: "white" }} />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <RiSendPlane2Line style={{ color: "white" }} />
              <span>Submit Scan</span>
            </>
          )}
        </button>
      </form>
    </>
  )
}