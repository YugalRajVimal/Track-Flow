
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiQrScanLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import BarcodeScanner from './BarcodeScanner'
import { useAuthStore } from '../../store/authStore'

// Orange color for buttons and icons only
const PRIMARY_ORANGE = '#f58021'

// Scan Alert Box Component - Black/White theme
function ScanAlertBox({ scanInfo }) {
  if (!scanInfo) return null

  // Black/White background, only icon and border are orange
  const boxClass = 'bg-white border border-[#f58021] text-black'

  const icon = scanInfo.type === 'qr' ? (
    <RiQrScanLine className="text-2xl mr-2" style={{ color: PRIMARY_ORANGE }} />
  ) : (
    <RiBarcodeLine className="text-2xl mr-2" style={{ color: PRIMARY_ORANGE }} />
  )

  return (
    <div className={`flex items-center gap-2 p-3 rounded mb-4 font-semibold ${boxClass}`}>
      {icon}
      <span>{scanInfo.label}</span>
    </div>
  )
}

// Modal Popup for Selection Feedback
function SelectionPopup({ open, partnerName, brandName }) {
  if (!open) return null
  return (
    <div
      className="fixed z-50 inset-0 flex items-center justify-center bg-black/70"
      style={{ minHeight: '100vh', minWidth: '100vw' }}
    >
      <div className="bg-white rounded-lg shadow-lg px-10 py-8 text-center flex flex-col items-center border-2 border-[#f58021]">
        <RiQrScanLine className="text-5xl mb-4" style={{ color: PRIMARY_ORANGE }} />
        <h2 className="font-bold text-2xl mb-2 text-black">Selection Confirmed!</h2>
        <div className="text-lg text-black mb-4">
          <span>
            <strong>Partner:</strong> {partnerName ? <span className="text-[#f58021]">{partnerName}</span> : '--'}
          </span>
          <br />
          <span>
            <strong>Brand:</strong> {brandName ? <span className="text-[#f58021]">{brandName}</span> : '--'}
          </span>
        </div>
        <div className="text-gray-600">You may proceed in 7 seconds...</div>
      </div>
    </div>
  )
}

export default function AWBScanForm({ onSuccess }) {
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showBackdate, setShowBackdate] = useState(false)

  // State for selection popup
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupPartner, setPopupPartner] = useState('')
  const [popupBrand, setPopupBrand] = useState('')

  const popupTimeoutRef = useRef(null)

  const awbInputRef = useRef(null)
  const user = useAuthStore((state) => state.user)
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
      backDate: '',
      backDateScan: false,
    },
  })

  // Watch selected values
  const selectedPartner = watch('channelPartnerId')
  const selectedBrand = watch('brandId')
  const watchBackDateScan = watch('backDateScan')
  const watchBackDate = watch('backDate')

  const selectedPartnerObj = partners.find(p => p._id === selectedPartner) || null
  const selectedPartnerName = selectedPartnerObj?.name || ''
  const selectedBrandObj = brands.find(b => b._id === selectedBrand) || null
  const selectedBrandName = selectedBrandObj?.name || ''

  // Show popup when both selectedPartner and selectedBrand are set & changed
  // Don't show on first mount, only on _change_.
  useEffect(() => {
    // Only show popup if both were previously empty or different, and now are both valid/non-empty
    if (selectedPartner && selectedBrand) {
      setPopupPartner(selectedPartnerName)
      setPopupBrand(selectedBrandName)
      setPopupOpen(true)
      // Ensure old timeout is cleared before setting a new one
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
      popupTimeoutRef.current = setTimeout(() => {
        setPopupOpen(false)
      }, 7000)
    }
    // Cleanup on unmount
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
    }
    // Only trigger when partner and brand change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner, selectedBrand, selectedPartnerName, selectedBrandName])

  let scanInfo = null
  if (selectedPartnerObj) {
    if (selectedPartnerObj.name?.toLowerCase().includes('meesho')) {
      scanInfo = {
        type: 'qr',
        label: 'MEESHO: Scan only Packet QR Code.',
      }
    } else {
      scanInfo = {
        type: 'barcode',
        label: 'Scan only Label Barcode.',
      }
    }
  }

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

  // Modified clearAWB: no longer clears backDate (date field stays)
  const clearAWB = useCallback(() => {
    setValue('awbId', '', { shouldValidate: false, shouldDirty: false })
    clearErrors('awbId')
    if (awbInputRef.current) {
      awbInputRef.current.value = ''
      setTimeout(() => { awbInputRef.current?.focus() }, 0)
    }
    // Only clear backDateScan (checkbox), don't clear backDate/date
    if (isAdmin) {
      // setValue('backDateScan', false, { shouldValidate: false, shouldDirty: false })
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
          apiPayload.date = backDate
        }
        const res = await awbAPI.scan(apiPayload)
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

  // Black/White theme for all fields except buttons and icons (orange)
  const baseInput =
    'input-field pl-9 font-mono bg-white border border-black text-black placeholder-gray-300 focus:border-black focus:ring-black/20'
  const baseSelect =
    'select-field bg-white border border-black text-black placeholder-gray-300 focus:border-black focus:ring-black/20'
  const baseLabel = 'label text-black font-medium'
  const baseButtonSecondary =
    'btn-secondary px-3 flex-shrink-0 bg-white border border-[#f58021] hover:bg-[#f58021] hover:text-white text-[#f58021] font-medium transition'
  const baseButtonPrimary =
    'btn-primary px-4 py-2 rounded bg-[#f58021] text-white hover:bg-orange-500 flex items-center gap-1 font-semibold'
  const errorText = 'text-pink-600 text-xs mt-1'

  return (
    <>
      {/* Pass partnerName so BarcodeScanner knows the active partner */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan AWB Barcode"
        partnerName={selectedPartnerName}
      />

      {/* Full page selection confirmation popup */}
      <SelectionPopup
        open={popupOpen}
        partnerName={popupPartner}
        brandName={popupBrand}
      />

      {/* Scan alert box for selected partner */}
      <ScanAlertBox scanInfo={scanInfo} />

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
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: PRIMARY_ORANGE}} />
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
              <RiQrScanLine className="text-lg"  />
            </button>
          </div>
          {errors.awbId && <p className={errorText}>{errors.awbId.message}</p>}
        </div>

        {/* Admin Only: Backdate scan feature */}
        {isAdmin && (
          <div>
            <label className={baseLabel + " flex items-center gap-2"}>
              <input
                type="checkbox"
                {...register('backDateScan')}
                disabled={submitting}
              />
              Backdate Scan
            </label>
            {watchBackDateScan && (
              <div className="mt-2">
                <label className={baseLabel + " block"}>Select Date *</label>
                <input
                  type="date"
                  {...register('backDate', {
                    required: {
                      value: watchBackDateScan,
                      message: 'Date is required for backdate scan',
                    },
                    validate: value =>
                      !watchBackDateScan || !!value || 'Date is required for backdate scan',
                  })}
                  className={baseInput}
                  disabled={submitting}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.backDate && (
                  <p className={errorText}>{errors.backDate.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={submitting} className={baseButtonPrimary}>
          {submitting ? (
            <><RiLoader4Line className="animate-spin" style={{ color: 'white' }} /> Scanning...</>
          ) : (
            <><RiSendPlane2Line style={{ color: 'white' }} /> Submit Scan</>
          )}
        </button>
      </form>
    </>
  )
}