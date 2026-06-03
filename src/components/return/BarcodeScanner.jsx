

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library'
import { RiBarcodeLine, RiCameraLine, RiImageLine } from 'react-icons/ri'
import Modal from '../common/Modal'

// ─────────────────────────────────────────────
// Format sets
// ─────────────────────────────────────────────

/** Only Standard 1-D barcode formats allowed */
const BARCODE_1D_FORMATS = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
]

/** 2-D / QR formats — REMOVED */
const QR_2D_FORMATS = []

/** Set for blocking QR codes */
const ALL_BLOCKED_2D = new Set([
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.AZTEC,
  BarcodeFormat.PDF_417,
])

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Returns true when the partner name matches Meesho (case-insensitive)
 *   NO LONGER CHANGES BEHAVIOR.
 */
const isMeeshoPartner = (name = '') => /meesho/i.test(name)

function createReader(formats, tryHarder = false) {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  if (tryHarder) hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 10,
    delayBetweenScanSuccess: 500,
  })
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

/**
 * BarcodeScanner
 *
 * Props:
 *   open         – boolean, controls modal visibility
 *   onClose      – () => void
 *   onScan       – (decodedText: string) => void
 *   title        – string (modal header)
 *   partnerName  – string (shown for display only, does not affect scan types)
 */
export default function BarcodeScanner({
  open,
  onClose,
  onScan,
  title = 'Scan Barcode',
  partnerName = '',   
}) {
  // ── scan mode always barcode (1D barcodes) ─────────────────────
  // NO MORE SPECIAL CASE FOR 'meesho'
  const activeFormats = BARCODE_1D_FORMATS
  // Block all QR/2D code types
  const blockedSet    = ALL_BLOCKED_2D

  // ── refs ───────────────────────────────────────────────────────
  const cameraReaderRef = useRef(null)
  const videoRef        = useRef(null)
  const fileInputRef    = useRef(null)
  const lockedRef       = useRef(false)
  const onScanRef       = useRef(onScan)
  useEffect(() => { onScanRef.current = onScan }, [onScan])

  // ── state ──────────────────────────────────────────────────────
  const [mode, setMode]                     = useState('camera')
  const [error, setError]                   = useState(null)
  const [scanning, setScanning]             = useState(false)
  const [torchOn, setTorchOn]               = useState(false)
  const [lastScannedValue, setLastScannedValue] = useState(null)
  const [devices, setDevices]               = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(null)
  const [facingMode, setFacingMode]         = useState('environment')

  const preferredDeviceIdRef = useRef(null)

  // ── reader factory — always 1D codes ───────────────────────────
  const getReader = useCallback(() => {
    if (!cameraReaderRef.current) {
      cameraReaderRef.current = createReader(activeFormats)
    }
    return cameraReaderRef.current
  }, [activeFormats])

  // ── stop camera ────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    lockedRef.current = false
    try { cameraReaderRef.current?.reset() } catch (_) {}
    cameraReaderRef.current = null
    setScanning(false)
    setTorchOn(false)
  }, [])

  // ── start camera ───────────────────────────────────────────────
  const startCamera = useCallback(
    async (preferredDeviceId = null, preferredFacing = null) => {
      setError(null)
      setScanning(false)
      lockedRef.current = false

      try {
        const reader = getReader()

        await navigator.mediaDevices.getUserMedia({ video: true })
        const allDevices = (await navigator.mediaDevices.enumerateDevices())
          .filter(d => d.kind === 'videoinput')
          .map(d => ({ deviceId: d.deviceId, label: d.label }))
        setDevices(allDevices)

        if (allDevices.length === 0) throw new Error('No camera found')

        let selected = null
        if (preferredDeviceId)
          selected = allDevices.find(d => d.deviceId === preferredDeviceId)
        if (!selected && preferredFacing) {
          const re = preferredFacing === 'environment'
            ? /back|rear|environment/i
            : /front|user|facetime|selfie/i
          selected = allDevices.find(d => re.test(d.label))
        }
        if (!selected)
          selected = allDevices.find(d => /back|rear|environment/i.test(d.label)) || allDevices[0]

        setActiveDeviceId(selected.deviceId)
        preferredDeviceIdRef.current = selected.deviceId
        setFacingMode(/front|user|facetime|selfie/i.test(selected.label) ? 'user' : 'environment')

        await reader.decodeFromVideoDevice(
          selected.deviceId,
          videoRef.current,
          (result) => {
            if (lockedRef.current || !result) return

            const fmt = result.getBarcodeFormat()

            // ── KEY LOGIC: reject formats not in the allowed set (barcodes only) ───
            if (blockedSet.has(fmt)) return

            const text = result.getText()
            if (!text || text.length < 4) return

            lockedRef.current = true
            setLastScannedValue(text)

            stopCamera()
            onScanRef.current(text)

            // restart for next scan
            setTimeout(() => {
              if (preferredDeviceIdRef.current) {
                setLastScannedValue(null)
                startCamera(preferredDeviceIdRef.current, null)
              }
            }, 1200)
          },
        )

        setScanning(true)
      } catch (e) {
        const msg = e?.message || ''
        if (/permission|notallowed/i.test(msg))
          setError('Camera permission denied. Please allow camera access and reload.')
        else if (/no camera/i.test(msg))
          setError('No camera found on this device.')
        else
          setError('Camera failed to start. Try uploading an image instead.')
      }
    },
    [getReader, stopCamera, blockedSet],   
  )

  // ── flip / switch camera ───────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
    stopCamera()
    setTimeout(() => startCamera(null, nextFacing), 150)
  }, [facingMode, stopCamera, startCamera])

  const switchCamera = useCallback(async (deviceId) => {
    stopCamera()
    setTimeout(() => startCamera(deviceId, null), 150)
  }, [stopCamera, startCamera])

  // ── torch ──────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(t => !t)
    } catch (_) {}
  }, [torchOn])

  // ── file upload ────────────────────────────────────────────────
  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      setError(null)

      try {
        const reader = createReader(activeFormats, true)   // tryHarder=true for files
        const url    = URL.createObjectURL(file)
        const img    = new Image()
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

        const canvas = document.createElement('canvas')
        const ctx    = canvas.getContext('2d')
        const scales = [1, 1.5, 2, 0.75]
        const counts = {}

        for (const scale of scales) {
          canvas.width  = Math.round(img.naturalWidth  * scale)
          canvas.height = Math.round(img.naturalHeight * scale)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          try {
            const r = await reader.decodeFromCanvas(canvas)
            if (r && !blockedSet.has(r.getBarcodeFormat())) {
              const t = r.getText()
              counts[t] = (counts[t] || 0) + 1
            }
          } catch (_) {}
        }

        URL.revokeObjectURL(url)

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
        if (sorted.length === 0) {
          setError(
            'No barcode found. Try a clearer, well-lit photo with the barcode fully in frame.'
          )
          return
        }

        const topCount = sorted[0][1]
        const best = sorted
          .filter(([, c]) => c === topCount)
          .map(([v]) => v)
          .reduce((a, b) => (a.length >= b.length ? a : b))

        setLastScannedValue(best)
        onScanRef.current(best)
        setTimeout(() => setLastScannedValue(null), 2000)
      } catch (err) {
        if (err instanceof NotFoundException) {
          setError(
            'No barcode detected. Make sure the full barcode is visible and well-lit.'
          )
        } else {
          setError('Could not read image. Please try again.')
        }
      }

      e.target.value = ''
    },
    [activeFormats, blockedSet],
  )

  // ── open / close effects ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      const t = setTimeout(() => startCamera(null), 300)
      return () => { clearTimeout(t); stopCamera() }
    } else {
      stopCamera()
    }
  }, [open, mode])           

  useEffect(() => {
    if (!open) stopCamera()
  }, [open])                     

  // Partner name does NOT change scan behavior, but restart on prop change anyway
  useEffect(() => {
    if (!open || mode !== 'camera') return
    stopCamera()
    const t = setTimeout(() => startCamera(null), 300)
    return () => clearTimeout(t)
  }, [partnerName])                 

  useEffect(() => {
    return () => {
      try { cameraReaderRef.current?.reset() } catch (_) {}
      cameraReaderRef.current = null
    }
  }, [])

  const switchMode = (m) => {
    if (m !== mode) { setError(null); setMode(m) }
  }

  // ── hint text — always barcode, not QR ───────────────────────────
  const scanHint =
    mode === 'camera'
      ? 'Point camera at the barcode'
      : 'Upload a clear, well-lit photo of the barcode'

  const formatLine = 'CODE-128 · EAN-13 · UPC-A · CODE-39 and more'

  const ScanIcon = RiBarcodeLine

  // Orange color constant
  const orange = '#f58021'

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 bg-white" style={{ color: '#333' }}>

        {/* ── Partner badge ─────────────────────────────────────────── */}
        {partnerName && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-fit`}
            style={{
              background: `${orange}15`,
              border: `1px solid ${orange}`,
              color: orange
            }}
          >
            <ScanIcon className="shrink-0" style={{ color: orange }} />
            <span>
              {partnerName} — scanning barcodes only
            </span>
          </div>
        )}

        {/* ── Mode tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {[
            ['camera', <RiCameraLine />, 'Camera'],
            ['file',   <RiImageLine />,  'Upload Image'],
          ].map(([m, icon, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors`}
              style={{
                background: mode === m ? orange : '#f6f6f6',
                color: mode === m ? 'white' : orange,
                border: mode === m ? `1.5px solid ${orange}` : `1.5px solid #f6f6f6`,
                boxShadow: mode === m ? `0 1px 4px 0 ${orange}22` : undefined
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── Hint ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm" style={{ color: orange }}>
          <ScanIcon className="shrink-0" style={{ color: orange }} />
          <span>{scanHint}</span>
        </div>

        {/* ── Error ────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ── Success flash ─────────────────────────────────────────── */}
        {lastScannedValue && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
            <span className="font-semibold">✓ Scanned:</span>
            <span className="font-mono break-all">{lastScannedValue}</span>
          </div>
        )}

        {/* ── Camera view ───────────────────────────────────────────── */}
        {mode === 'camera' && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-black/30" />
                {/* Always wide barcode viewfinder */}
                <div className="relative z-10 w-4/5 h-20 rounded"
                  style={{ border: `2.5px solid ${orange}` }}
                >
                  <div
                    className="absolute inset-x-0 h-0.5"
                    style={{
                      background: orange,
                      animation: 'scanline 1.4s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            )}

            {scanning && (
              <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                <button
                  onClick={toggleTorch}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow transition-colors"
                  style={{
                    background: torchOn ? '#ffd89b' : 'rgba(0,0,0,0.7)',
                    color: torchOn ? orange : '#fff',
                  }}
                >
                  🔦 {torchOn ? 'On' : 'Off'}
                </button>
                <div className="flex items-center gap-2">
                  {devices.length > 1 && (
                    <button
                      onClick={flipCamera}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shadow active:scale-95 transition-transform"
                      style={{
                        background: 'rgba(0,0,0,.7)',
                        color: orange,
                        border: `1.3px solid ${orange}`
                      }}
                    >
                      <span style={{ fontSize: 15 }}>🔄</span>
                      <span>{facingMode === 'environment' ? 'Front' : 'Rear'}</span>
                    </button>
                  )}
                  {devices.length > 2 && (
                    <select
                      value={activeDeviceId || ''}
                      onChange={e => { if (e.target.value !== activeDeviceId) switchCamera(e.target.value) }}
                      className="px-2 py-1.5 rounded-full text-xs font-medium border-0 shadow"
                      style={{
                        background: 'rgba(0,0,0,.7)',
                        color: orange,
                        border: `1.3px solid ${orange}`,
                        maxWidth: 130
                      }}
                    >
                      {devices.map((d, i) => (
                        <option value={d.deviceId} key={d.deviceId}>
                          {d.label?.trim() || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/50">
                Starting camera…
              </div>
            )}
          </div>
        )}

        {/* ── File upload ───────────────────────────────────────────── */}
        {mode === 'file' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 border-2 border-dashed rounded-xl transition-colors text-sm flex flex-col items-center gap-2"
              style={{
                borderColor: orange,
                color: orange,
                background: '#fff',
                fontWeight: 500
              }}
              onMouseOver={e => e.currentTarget.style.background = `${orange}08`}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <RiImageLine className="text-3xl" style={{ color: orange }} />
              <span>
                Tap to choose a photo of the barcode
              </span>
              <span className="text-xs" style={{ color: "#bbbbbb" }}>JPG · PNG · WebP</span>
            </button>
          </>
        )}

        {/* ── Footer note ───────────────────────────────────────────── */}
        <p className="text-xs text-center" style={{ color: "#bbbbbb" }}>
          {formatLine}<br />
          <b style={{ color: orange }}>QR codes and 2D codes are always ignored.</b>
        </p>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0;    opacity: 1;   }
          50%  { top: 74px; opacity: 0.7; }
          100% { top: 0;    opacity: 1;   }
        }
      `}</style>
    </Modal>
  )
}