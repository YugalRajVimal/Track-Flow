
import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  RiUpload2Line, RiLoader4Line, RiCheckDoubleLine,
  RiCloseLine, RiAlertLine, RiFileExcelLine,
  RiFileTextLine, RiArrowLeftLine, RiInformationLine,
  RiQrScanLine, RiBarcodeLine,
} from 'react-icons/ri'
import { returnAPI } from '../../api/return'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import dayjs from 'dayjs'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PARTNER_LABELS = {
  flipkart: 'Flipkart',
  meesho:   'Meesho',
  myntra:   'Myntra',
  website:  'Website (Excel)',
}

// For theme: Only buttons, backgrounds, and icons should be orange, everything else is black/white
const PARTNER_COLORS = {
  flipkart: 'bg-white border-[#f58021] text-black',
  meesho:   'bg-white border-[#f58021] text-black',
  myntra:   'bg-white border-[#f58021] text-black',
  website:  'bg-white border-[#f58021] text-black',
}

function FileIcon({ name }) {
  if (!name) return <RiFileTextLine className="text-[#f58021] text-2xl" />
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'xlsx' || ext === 'xls')
    return <RiFileExcelLine className="text-[#f58021] text-2xl" />
  return <RiFileTextLine className="text-[#f58021] text-2xl" />
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function PartnerBadge({ partner }) {
  if (!partner) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PARTNER_COLORS[partner] || 'bg-white border-[#f58021] text-black'}`}>
      {PARTNER_LABELS[partner] || partner} format detected
    </span>
  )
}

function PreviewTable({ rows, partnerName }) {
  if (!rows || rows.length === 0) {
    // Background, Icon and Button - orange. All other text black.
    return (
      <div className="flex flex-col items-center justify-center py-12 text-black gap-3 bg-white border border-[#f58021] rounded-xl">
        <RiCheckDoubleLine className="text-5xl text-[#f58021]" />
        <p className="text-base font-semibold text-black">No missing AWBs found!</p>
        <p className="text-sm text-center text-black">All AWBs in the file are already present in the database.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#f58021] bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-white border-b border-[#f58021]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">AWB ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">Missing At</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f1f1]">
          {rows.map((row, i) => (
            <tr key={row.awbId} className="hover:bg-[#fff2e6] transition-colors">
              <td className="px-4 py-3 text-black text-xs">{i + 1}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-white border border-[#f58021] text-black px-2 py-1 rounded-lg">
                  {row.awbId}
                </span>
              </td>
              <td className="px-4 py-3 text-black text-xs">
                {row.missingAt ? dayjs(row.missingAt).format('MMM D, YYYY') : '—'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#f58021] text-xs font-medium border border-[#f58021]">
                  <RiAlertLine className="shrink-0 text-[#f58021]" />
                  <span className="text-black">Missing</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ScanAlertBox component (custom alert for scan type/info)
// ─────────────────────────────────────────────────────────────────────────────

function ScanAlertBox({ scanInfo }) {
  if (!scanInfo) return null
  // Only background and icon orange, text black
  const boxClass = 'bg-white border border-[#f58021] text-black'

  const icon = scanInfo.type === 'qr' ? (
    <RiQrScanLine className="text-2xl mr-2 text-[#f58021]" />
  ) : (
    <RiBarcodeLine className="text-2xl mr-2 text-[#f58021]" />
  )

  return (
    <div className={`flex items-center gap-2 p-3 rounded mb-4 font-semibold ${boxClass}`}>
      {icon}
      <span>{scanInfo.label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FullScreenPopup component
// ─────────────────────────────────────────────────────────────────────────────

function FullScreenPopup({ visible, partnerName, brandName, startDate, endDate }) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f58021]/95 transition-opacity duration-300 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-12 max-w-md w-[92vw] flex flex-col items-center text-center gap-6">
        <RiInformationLine
          className="text-[#f58021] text-5xl mx-auto mb-2 drop-shadow"
        />
        <div>
          <div className="text-2xl font-bold text-[#222] mb-2">Selection Confirmed</div>
          <div className="text-black text-lg font-medium mb-2">
            You have selected:
          </div>
          <ul className="space-y-2 text-left text-base">
            <li>
              <span className="font-bold text-[#f58021]">Partner:</span>
              <span className="ml-2 text-black">{partnerName}</span>
            </li>
            <li>
              <span className="font-bold text-[#f58021]">Brand:</span>
              <span className="ml-2 text-black">{brandName}</span>
            </li>
            <li>
              <span className="font-bold text-[#f58021]">Date Range:</span>
              <span className="ml-2 text-black">{dayjs(startDate).format('MMM D, YYYY')} – {dayjs(endDate).format('MMM D, YYYY')}</span>
            </li>
          </ul>
        </div>
        <div className="text-base text-black/80 mt-4">
          Please make sure your selection is correct before you continue.<br/>
          This will close automatically after 7 seconds.
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AWBMissingForm({ onSuccess }) {
  // ── Shared state ──────────────────────────────────────────────────────────
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [phase, setPhase] = useState('upload')

  const [channelPartnerId, setChannelPartnerId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const [previewData, setPreviewData] = useState(null)
  const [saving, setSaving] = useState(false)

  const [savedPreviewDates, setSavedPreviewDates] = useState({ startDate: '', endDate: '' })

  // State for confirmation popup
  const [showPopup, setShowPopup] = useState(false)
  // Track last shown selections to prevent unnecessary re-shows
  const lastSelectionsRef = useRef({
    channelPartnerId: '',
    brandId: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
  }, [])

  useEffect(() => {
    if (!channelPartnerId) {
      setBrands([]); setBrandId('');
      return
    }
    setLoadingBrands(true)
    brandsAPI
      .listByPartner(channelPartnerId)
      .then(r => {
        setBrands(r.data?.data || [])
        setBrandId('')
      })
      .finally(() => setLoadingBrands(false))
  }, [channelPartnerId])

  // Show popup when all: partner, brand, date range, and all changed compared to last shown
  useEffect(() => {
    if (
      channelPartnerId &&
      brandId &&
      startDate &&
      endDate &&
      (
        lastSelectionsRef.current.channelPartnerId !== channelPartnerId ||
        lastSelectionsRef.current.brandId !== brandId ||
        lastSelectionsRef.current.startDate !== startDate ||
        lastSelectionsRef.current.endDate !== endDate
      )
    ) {
      setShowPopup(true)
      lastSelectionsRef.current = {
        channelPartnerId,
        brandId,
        startDate,
        endDate,
      }
      // Hide popup after 7 seconds
      const timer = setTimeout(() => {
        setShowPopup(false)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [channelPartnerId, brandId, startDate, endDate])

  const handleFileDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped) validateAndSetFile(dropped)
  }

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0]
    if (chosen) validateAndSetFile(chosen)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv', 'xls', 'xlsx'].includes(ext)) {
      toast.error('Only CSV, XLS, or XLSX files are supported.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB.')
      return
    }
    setFile(f)
  }

  let scanInfo = null
  const selectedPartnerObj = partners.find(p => p._id === channelPartnerId)
  if (selectedPartnerObj) {
    if (
      selectedPartnerObj.name?.toLowerCase().includes('meesho')
    ) {
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

  const handlePreview = async () => {
    if (!channelPartnerId) { toast.error('Please select a Channel Partner.'); return }
    if (!brandId) { toast.error('Please select a Brand.'); return }
    if (!startDate || !endDate) { toast.error('Please enter both Start and End dates.'); return }
    if (new Date(startDate) > new Date(endDate)) { toast.error('Start date cannot be after end date.'); return }
    if (!file) { toast.error('Please upload a CSV or Excel file.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('channelPartnerId', channelPartnerId)
      formData.append('brandId', brandId)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)

      const res = await returnAPI.previewMissing(formData)
      if (res.data?.success) {
        setPreviewData({
          ...res.data.data,
          missingFromDate: startDate,
          missingToDate: endDate,
        })
        setSavedPreviewDates({ startDate, endDate })
        setPhase('preview')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Preview failed. Check the file format.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!previewData?.missing?.length) {
      toast('No missing AWBs to save.', { icon: 'ℹ️' })
      return
    }
    setSaving(true)
    try {

      const savePayload = {
        rows: previewData.missing,
        missingFromDate: previewData.missingFromDate || savedPreviewDates.startDate,
        missingToDate: previewData.missingToDate || savedPreviewDates.endDate,
      }
      const res = await returnAPI.saveMissing(savePayload)

      if (res.data?.success) {
        toast.success(res.data.message || 'Missing AWBs saved successfully.')
        if (typeof onSuccess === 'function') onSuccess()
        resetAll()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed. Please try again. ')
    } finally {
      setSaving(false)
    }
  }

  const resetAll = () => {
    setPhase('upload')
    setPreviewData(null)
    setFile(null)
    setChannelPartnerId('')
    setBrandId('')
    setStartDate('')
    setEndDate('')
    setSavedPreviewDates({ startDate: '', endDate: '' })
    // Optionally, reset popup state and last selections so popup is shown again for next selection
    // setShowPopup(false)
    // lastSelectionsRef.current = { channelPartnerId: '', brandId: '', startDate: '', endDate: '' }
  }

  // Form fields - borders orange (for clarity), background white, text black
  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#f58021] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#f58021]/30 focus:border-[#f58021] transition-all placeholder-[#b8b8b8] disabled:opacity-60'
  const labelCls = 'block text-sm font-medium text-black mb-1.5'

  // Buttons: bg orange, icon orange, text white/black as required
  const orangeButton =
    'w-full py-2.5 rounded-xl bg-[#f58021] hover:bg-[#ffa84c] text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const orangeOutlineButton =
    'flex-1 py-2.5 rounded-xl border border-[#f58021] bg-white text-[#f58021] font-semibold flex items-center justify-center gap-2 hover:bg-[#fff7ef] transition-colors disabled:opacity-60'

  // Get selected names for the popup
  const cpPopupName = partners.find(p => p._id === channelPartnerId)?.name || ''
  const brandPopupName = brands.find(b => b._id === brandId)?.name || ''

  // PHASE 1: Upload form
  if (phase === 'upload') {
    return (
      <div className="space-y-5 w-full relative">
        {/* Full-screen popup: shown when all selections set */}
        <FullScreenPopup
          visible={showPopup}
          partnerName={cpPopupName}
          brandName={brandPopupName}
          startDate={startDate}
          endDate={endDate}
        />

        {/* Info banner */}
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-white border border-[#f58021]">
          <RiInformationLine className="text-[#f58021] text-xl shrink-0 mt-0.5" />
          <div className="text-xs text-black space-y-1">
            <p className="font-semibold text-black">How this works:</p>
            <p>Upload a Flipkart CSV, Meesho CSV, Myntra CSV, or Website Excel. The system will compare AWB IDs in the file against scanned records in the selected date range and flag any that are missing.</p>
          </div>
        </div>

        {/* Channel Partner */}
        <div>
          <label className={labelCls}>Channel Partner *</label>
          <select
            value={channelPartnerId}
            onChange={e => setChannelPartnerId(e.target.value)}
            className={inputCls}
            disabled={loading}
          >
            <option value="">Select channel partner...</option>
            {partners.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className={labelCls}>Brand *</label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className={inputCls}
            disabled={!channelPartnerId || loadingBrands || loading}
          >
            <option value="">
              {!channelPartnerId
                ? 'Select partner first...'
                : loadingBrands
                  ? 'Loading brands...'
                  : 'Select brand...'}
            </option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className=''>
          <label className={labelCls}>Date Range (Scanned At) *</label>
          <div className="flex flex-col gap-2 sm:items-center">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`${inputCls} w-full sm:w-auto`}
              disabled={loading}
            />
            <span className="text-black/75 text-sm shrink-0 text-center sm:text-left">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={`${inputCls} w-full sm:w-auto`}
              disabled={loading}
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className={labelCls}>Upload File (CSV / XLS / XLSX) *</label>

          {file ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#f58021] bg-white">
              <FileIcon name={file.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{file.name}</p>
                <p className="text-xs text-black">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg text-[#f58021] hover:text-red-500 hover:bg-[#fff0e6] transition-colors"
                disabled={loading}
              >
                <RiCloseLine />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#f58021] bg-white hover:border-[#f58021] hover:bg-[#fff7f2] transition-colors"
            >
              <RiUpload2Line className="text-3xl text-[#f58021]" />
              <p className="text-sm text-black font-medium">Click or drag & drop</p>
              <p className="text-xs text-black">CSV · XLS · XLSX — max 10 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* Supported formats note */}
        <div className="rounded-xl border border-[#ffe5cf] bg-white p-3 text-xs text-black space-y-1.5">
          <p className="font-semibold text-black">Supported file formats:</p>
          <ul className="space-y-1 list-none pl-0">
            <li><span className="font-medium text-black">Flipkart CSV</span> — column: <code className="bg-white px-1 rounded text-black">Tracking ID</code></li>
            <li><span className="font-medium text-black">Meesho CSV</span> — column: <code className="bg-white px-1 rounded text-black">Packet Id</code> (only SHIPPED rows)</li>
            <li><span className="font-medium text-black">Myntra CSV</span> — column: <code className="bg-white px-1 rounded text-black">AWB Number</code></li>
            <li><span className="font-medium text-black">Website Excel</span> — sheet: <code className="bg-white px-1 rounded text-black">AWB wise Details</code>, column: <code className="bg-white px-1 rounded text-black">AWB NO.</code></li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className={orangeButton}
        >
          {loading ? (
            <><RiLoader4Line className="animate-spin text-white" /> Analysing file...</>
          ) : (
            <><RiAlertLine className="text-white" /> Find Missing AWBs</>
          )}
        </button>
      </div>
    )
  }

  // PHASE 2: Preview + Confirm
  const missingCount = previewData?.missing?.length ?? 0
  const totalInFile = previewData?.totalInFile ?? 0
  const foundCount = totalInFile - missingCount
  const partnerLabel = PARTNER_LABELS[previewData?.partner] || previewData?.partner || '—'
  const cpName = partners.find(p => p._id === channelPartnerId)?.name || channelPartnerId
  const brandName = brands.find(b => b._id === brandId)?.name || brandId

  let previewScanInfo = null
  let previewPartnerName = previewData?.partner || ''
  let previewPartnerObj = partners.find(
    p =>
      p.name?.toLowerCase() === previewPartnerName?.toLowerCase() ||
      p._id === channelPartnerId
  )
  if (previewPartnerObj) {
    if (previewPartnerObj.name?.toLowerCase().includes('meesho')) {
      previewScanInfo = {
        type: 'qr',
        label: 'MEESHO: Scan only Packet QR Code.',
      }
    } else {
      previewScanInfo = {
        type: 'barcode',
        label: 'Scan only Label Barcode.',
      }
    }
  }

  const displayStartDate = previewData?.missingFromDate || savedPreviewDates.startDate || startDate
  const displayEndDate = previewData?.missingToDate || savedPreviewDates.endDate || endDate

  return (
    <div className="space-y-5 w-full">

      {/* Back button (outline orange, icon orange, text black) */}
      <button
        type="button"
        onClick={resetAll}
        className="flex items-center gap-1.5 text-sm text-[#f58021] hover:text-[#d16d00] transition-colors"
        disabled={saving}
      >
        <RiArrowLeftLine className="text-[#f58021]" />
        Back to upload
      </button>

      {/* Scan Alert Box */}
      <ScanAlertBox scanInfo={previewScanInfo} />

      {/* Summary banner: orange border when missingCount>0, bg/other text black/white */}
      <div className={`rounded-xl border p-4 space-y-2 ${missingCount > 0 ? 'bg-white border-[#f58021]' : 'bg-white border-[#f58021]'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className={`font-bold text-lg text-black`}>
              {missingCount > 0
                ? `${missingCount} Missing AWB${missingCount !== 1 ? 's' : ''} Found`
                : 'All AWBs Accounted For'}
            </p>
            <p className="text-xs text-black mt-0.5">
              {totalInFile} AWBs in file · {foundCount} already in DB · {missingCount} missing
            </p>
          </div>
          <PartnerBadge partner={previewData?.partner} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-black pt-1">
          <span><span className="font-medium">Partner:</span> {cpName}</span>
          <span><span className="font-medium">Brand:</span> {brandName}</span>
          <span><span className="font-medium">Date range:</span> {dayjs(displayStartDate).format('MMM D')} – {dayjs(displayEndDate).format('MMM D, YYYY')}</span>
          <span><span className="font-medium">Source:</span> {partnerLabel}</span>
          <span><span className="font-medium">File:</span> {file?.name}</span>
        </div>
      </div>

      {/* Preview table */}
      <PreviewTable rows={previewData?.missing} partnerName={partnerLabel} />

      {/* Action buttons */}
      {missingCount > 0 && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetAll}
            disabled={saving}
            className={orangeOutlineButton}
          >
            <RiCloseLine className="text-[#f58021]" />
            <span className="text-black">Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={orangeButton}
          >
            {saving ? (
              <><RiLoader4Line className="animate-spin text-white" /> Saving...</>
            ) : (
              <><RiCheckDoubleLine className="text-white"/> Confirm & Save {missingCount} Record{missingCount !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}