/**
 * AWBMissingForm.jsx
 *
 * Two-phase UI:
 *   Phase 1 (upload)  – Channel Partner + Brand + Date Range + File → call /missing/preview
 *   Phase 2 (confirm) – Show preview table → call /missing/save on confirm
 */

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  RiUpload2Line, RiLoader4Line, RiCheckDoubleLine,
  RiCloseLine, RiAlertLine, RiFileTextLine,
  RiArrowLeftLine, RiInformationLine,
  RiQrScanLine, RiBarcodeLine,
} from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import dayjs from 'dayjs'

// ORANGE ONLY FOR BUTTONS & ICONS; B/W THEME ELSEWHERE

const PRIMARY_ORANGE = '#f58021'

const PARTNER_LABELS = {
  flipkart: 'Flipkart',
  meesho:   'Meesho',
  myntra:   'Myntra',
  website:  'Website',
}

const PARTNER_COLORS = {
  flipkart: 'bg-white border-black text-black',
  meesho:   'bg-white border-black text-black',
  myntra:   'bg-white border-black text-black',
  website:  'bg-white border-black text-black',
}

function FileIcon({ name }) {
  // Orange only for icons, else black/white
  // Only .csv supported now
  return <RiFileTextLine className="text-2xl" style={{ color: PRIMARY_ORANGE }} />
}

function PartnerBadge({ partner }) {
  if (!partner) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PARTNER_COLORS[partner] || 'bg-white border-black text-black'}`}>
      {PARTNER_LABELS[partner] || partner} format detected
    </span>
  )
}

function PreviewTable({ rows, partnerName }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-black gap-3">
        <RiCheckDoubleLine className="text-5xl" style={{ color: PRIMARY_ORANGE }} />
        <p className="text-base font-semibold text-black">No missing AWBs found!</p>
        <p className="text-sm text-center text-black">All AWBs in the file are already present in the database.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-black bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-white border-b border-black">
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">AWB ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">Missing At</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {rows.map((row, i) => (
            <tr key={row.awbId} className="hover:bg-black/5 transition-colors bg-white">
              <td className="px-4 py-3 text-black text-xs">{i + 1}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs bg-black/5 border border-black text-black px-2 py-1 rounded-lg">
                  {row.awbId}
                </span>
              </td>
              <td className="px-4 py-3 text-black text-xs">
                {row.missingAt ? dayjs(row.missingAt).format('MMM D, YYYY') : '—'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/10 text-black text-xs font-medium border border-black">
                  <RiAlertLine className="shrink-0" style={{ color: PRIMARY_ORANGE }} />
                  Missing
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScanAlertBox({ scanInfo }) {
  if (!scanInfo) return null
  // Orange ONLY for icons, else B/W alert box
  const boxClass = `bg-white border border-black text-black`

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

// --- POPUP COMPONENT FOR SELECTION SUMMARY ---
function SelectionSummaryPopup({ show, onClose, partner, brand, startDate, endDate, partners, brands }) {
  if (!show) return null

  const foundPartner = partners.find(p => p._id === partner)
  const foundBrand = brands.find(b => b._id === brand)

  function formatDate(d) {
    if (!d) return ''
    try {
      // format as e.g. 'Apr 12, 2024'
      return dayjs(d).format('MMM D, YYYY')
    } catch {
      return d
    }
  }

  return (
    <div
      className="fixed z-50 inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center"
      style={{animation: "fadeIn .2s"}}
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 min-w-[340px] flex flex-col items-center border border-black relative">
        <RiInformationLine className="text-4xl mb-4" style={{ color: PRIMARY_ORANGE }} />
        <h2 className="text-2xl font-bold text-black mb-3">Selection Summary</h2>
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-semibold">Partner:</span>
            <span className="">{foundPartner?.name || partner || <span className="text-black/30">Not selected</span>}</span>
          </div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-semibold">Brand:</span>
            <span className="">{foundBrand?.name || brand || <span className="text-black/30">Not selected</span>}</span>
          </div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-semibold">Start Date:</span>
            <span>{formatDate(startDate) || <span className="text-black/30">Not selected</span>}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">End Date:</span>
            <span>{formatDate(endDate) || <span className="text-black/30">Not selected</span>}</span>
          </div>
        </div>
        <div className="text-black/75 text-center mb-5">
          Please review your selections above.<br/>
          The popup will close automatically in 7 seconds.
        </div>
        <button
          type="button"
          className="px-6 py-2 rounded-lg bg-[#f58021] text-white font-semibold text-base transition hover:bg-orange-600"
          onClick={onClose}
        >
          OK
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>
    </div>
  )
}


export default function AWBMissingForm({ onSuccess }) {
  // State - unchanged
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

  // --- For selection summary popup ---
  const [showSelectionPopup, setShowSelectionPopup] = useState(false)
  const [selectionPopupTimer, setSelectionPopupTimer] = useState(null)
  const [lastSelections, setLastSelections] = useState({
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

  // Show popup logic: watch selections for first time all selected, or change to some new complete set
  useEffect(() => {
    if (channelPartnerId && brandId && startDate && endDate) {
      // Only show if something changed from last recognized selection
      const unchanged =
        lastSelections.channelPartnerId === channelPartnerId &&
        lastSelections.brandId === brandId &&
        lastSelections.startDate === startDate &&
        lastSelections.endDate === endDate;
      if (!showSelectionPopup && !unchanged) {
        setShowSelectionPopup(true);
        setLastSelections({
          channelPartnerId,
          brandId,
          startDate,
          endDate,
        });
        // set timer for auto-close after 5 seconds
        if (selectionPopupTimer) clearTimeout(selectionPopupTimer)
        const t = setTimeout(() => {
          setShowSelectionPopup(false)
        }, 7000)
        setSelectionPopupTimer(t)
      }
    }
    // cleanup on unmount
    return () => {
      if (selectionPopupTimer) clearTimeout(selectionPopupTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelPartnerId, brandId, startDate, endDate])

  const handleCloseSelectionPopup = () => {
    setShowSelectionPopup(false)
    if (selectionPopupTimer) clearTimeout(selectionPopupTimer)
  }

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
    if (ext !== 'csv') {
      toast.error('Only CSV files are supported.')
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
    if (!file) { toast.error('Please upload a CSV file.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('channelPartnerId', channelPartnerId)
      formData.append('brandId', brandId)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)

      const res = await awbAPI.previewMissing(formData)
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
        rows: previewData.missing, // rows = missing
        missingFromDate: previewData.missingFromDate || savedPreviewDates.startDate,
        missingToDate: previewData.missingToDate || savedPreviewDates.endDate,
      }
      const res = await awbAPI.saveMissing(await savePayload)
      if (res.data?.success) {
        toast.success(res.data.message || 'Missing AWBs saved successfully.')
        if (typeof onSuccess === 'function') onSuccess()
        resetAll()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed. Please try again.')
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
  }

  // THEME EDITS: BLACK/WHITE FIELDS, LABELS; BUTTONS/ICONS ORANGE

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder-black/50 disabled:opacity-60'
  const labelCls = 'block text-sm font-medium text-black mb-1.5'

  if (phase === 'upload') {
    return (
      <div className="space-y-5 w-full">
        <SelectionSummaryPopup
          show={showSelectionPopup}
          onClose={handleCloseSelectionPopup}
          partner={channelPartnerId}
          brand={brandId}
          startDate={startDate}
          endDate={endDate}
          partners={partners}
          brands={brands}
        />

        {/* Info banner */}
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-white border border-black">
          <RiInformationLine className="text-xl shrink-0 mt-0.5" style={{ color: PRIMARY_ORANGE }} />
          <div className="text-xs text-black space-y-1">
            <p className="font-semibold">How this works:</p>
            <p>Upload a Flipkart, Meesho, Myntra, or Website CSV. The system will compare AWB IDs in the file against scanned records in the selected date range and flag any that are missing.</p>
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
        <div>
          <label className={labelCls}>Date Range (Scanned At) *</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={inputCls + " w-full sm:w-auto"}
              disabled={loading}
            />
            <span className="text-black/75 text-sm shrink-0 text-center sm:text-left">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputCls + " w-full sm:w-auto"}
              disabled={loading}
            />
          </div>
        </div>
 

        {/* File Upload */}
        <div>
          <label className={labelCls}>Upload File (CSV) *</label>
          {file ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-black bg-white">
              <FileIcon name={file.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{file.name}</p>
                <p className="text-xs text-black/40">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg"
                disabled={loading}
                style={{
                  color: PRIMARY_ORANGE,
                  border: `1.5px solid transparent`,
                  background: 'transparent',
                }}
              >
                <RiCloseLine />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-black bg-white hover:border-black hover:bg-black/5 transition-colors"
            >
              <RiUpload2Line className="text-3xl" style={{ color: PRIMARY_ORANGE }} />
              <p className="text-sm font-medium text-black">Click or drag & drop</p>
              <p className="text-xs text-black/40">CSV — max 10 MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* Supported formats note */}
        <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black space-y-1.5">
          <p className="font-semibold text-black">Supported file formats:</p>
          <ul className="space-y-1 list-none pl-0">
            <li><span className="font-medium" style={{ color: PRIMARY_ORANGE }}>Flipkart CSV</span> — column: <code className="bg-black/5 px-1 rounded text-black">Tracking ID</code></li>
            <li><span className="font-medium" style={{ color: PRIMARY_ORANGE }}>Meesho CSV</span> — column: <code className="bg-black/5 px-1 rounded text-black">Packet Id</code> (only SHIPPED rows)</li>
            <li><span className="font-medium" style={{ color: PRIMARY_ORANGE }}>Myntra CSV</span> — column: <code className="bg-black/5 px-1 rounded text-black">AWB Number</code></li>
            <li>
              <span className="font-medium" style={{ color: PRIMARY_ORANGE }}>Website CSV</span> — column: <code className="bg-black/5 px-1 rounded text-black">AWB NO.</code> <span className="text-black/70">(only rows with <b>SHIPPED</b> or <b>IN-TRANSIT</b> status included)</span>
            </li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          style={{
            background: PRIMARY_ORANGE,
            color: 'white',
            width: '100%',
            borderRadius: '0.75rem',
            fontWeight: 600,
            padding: '0.7rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none',
            transition: 'background 0.2s',
          }}
          className="transition-colors"
        >
          {loading ? (
            <><RiLoader4Line className="animate-spin" style={{ color: "white" }} /> Analysing file...</>
          ) : (
            <><RiAlertLine style={{ color: "white" }} /> Find Missing AWBs</>
          )}
        </button>
      </div>
    )
  }

  // ---- PHASE 2 ----

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

      {/* Back button -- ORANGE BUTTON */}
      <button
        type="button"
        onClick={resetAll}
        style={{
          color: PRIMARY_ORANGE,
          background: 'white',
          borderRadius: '0.5rem',
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: 'none',
          fontSize: '0.95rem',
          fontWeight: 500,
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        className="transition-colors hover:bg-[#f58021] hover:text-white"
        disabled={saving}
      >
        <RiArrowLeftLine style={{ color: PRIMARY_ORANGE }} />
        Back to upload
      </button>

      {/* Scan Alert Box */}
      <ScanAlertBox scanInfo={previewScanInfo} />

      {/* Summary banner */}
      <div className="rounded-xl border p-4 space-y-2 bg-white border-black">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-bold text-lg text-black">
              {missingCount > 0
                ? `${missingCount} Missing AWB${missingCount !== 1 ? 's' : ''} Found`
                : 'All AWBs Accounted For'}
            </p>
            <p className="text-xs text-black/75">
              {totalInFile} AWBs in file · {foundCount} already in DB · {missingCount} missing
            </p>
          </div>
          <PartnerBadge partner={previewData?.partner} />
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-black/75">
          <span><span className="font-medium text-black">Partner:</span> {cpName}</span>
          <span><span className="font-medium text-black">Brand:</span> {brandName}</span>
          <span>
            <span className="font-medium text-black">Date range:</span> {dayjs(displayStartDate).format('MMM D')} – {dayjs(displayEndDate).format('MMM D, YYYY')}
          </span>
          <span>
            <span className="font-medium text-black">Source:</span> {partnerLabel}
          </span>
          <span>
            <span className="font-medium text-black">File:</span> {file?.name}
          </span>
          {/* Website CSV mention for filtered statuses */}
          {partnerLabel === 'Website' && (
            <span>
              <span className="font-medium text-black">Filtered by status:</span> <span className="font-semibold text-black">SHIPPED, IN-TRANSIT</span>
            </span>
          )}
        </div>
      </div>

      {/* Preview table */}
      <PreviewTable rows={previewData?.missing} partnerName={partnerLabel} />

      {/* Action buttons - ORANGE BUTTONS ONLY, B/W ELSE*/}
      {missingCount > 0 && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetAll}
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.7rem 0',
              borderRadius: '0.75rem',
              background: 'white',
              border: `2px solid ${PRIMARY_ORANGE}`,
              color: PRIMARY_ORANGE,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s, color 0.2s',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            className={`transition-colors hover:bg-[#f58021] hover:text-white`}
          >
            <RiCloseLine style={{ color: PRIMARY_ORANGE }} />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.7rem 0',
              borderRadius: '0.75rem',
              background: PRIMARY_ORANGE,
              color: 'white',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: 'none',
              transition: 'background 0.2s',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            className="transition-colors"
          >
            {saving ? (
              <><RiLoader4Line className="animate-spin" style={{ color: "white" }} /> Saving...</>
            ) : (
              <><RiCheckDoubleLine style={{ color: "white" }} /> Confirm & Save {missingCount} Record{missingCount !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}