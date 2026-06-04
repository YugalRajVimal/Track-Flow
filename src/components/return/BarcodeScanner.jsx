
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

const QR_2D_FORMATS = []

const ALL_BLOCKED_2D = new Set([
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.AZTEC,
  BarcodeFormat.PDF_417,
])

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

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

export default function BarcodeScanner({
  open,
  onClose,
  onScan,
  title = 'Scan Barcode',
  partnerName = '',
}) {
  const activeFormats = BARCODE_1D_FORMATS
  const blockedSet = ALL_BLOCKED_2D
  const cameraReaderRef = useRef(null)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const lockedRef = useRef(false)
  const onScanRef = useRef(onScan)
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const [mode, setMode] = useState('camera')
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [lastScannedValue, setLastScannedValue] = useState(null)
  const [devices, setDevices] = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const preferredDeviceIdRef = useRef(null)
  const getReader = useCallback(() => {
    if (!cameraReaderRef.current) {
      cameraReaderRef.current = createReader(activeFormats)
    }
    return cameraReaderRef.current
  }, [activeFormats])
  const stopCamera = useCallback(() => {
    lockedRef.current = false
    try {
      cameraReaderRef.current?.reset()
    } catch (_) {}
    cameraReaderRef.current = null
    setScanning(false)
    setTorchOn(false)
  }, [])
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
        if (preferredDeviceId) selected = allDevices.find(d => d.deviceId === preferredDeviceId)
        if (!selected && preferredFacing) {
          const re =
            preferredFacing === 'environment'
              ? /back|rear|environment/i
              : /front|user|facetime|selfie/i
          selected = allDevices.find(d => re.test(d.label))
        }
        if (!selected)
          selected = allDevices.find(d => /back|rear|environment/i.test(d.label)) || allDevices[0]
        setActiveDeviceId(selected.deviceId)
        preferredDeviceIdRef.current = selected.deviceId
        setFacingMode(
          /front|user|facetime|selfie/i.test(selected.label) ? 'user' : 'environment'
        )
        await reader.decodeFromVideoDevice(selected.deviceId, videoRef.current, result => {
          if (lockedRef.current || !result) return
          const fmt = result.getBarcodeFormat()
          if (blockedSet.has(fmt)) return
          const text = result.getText()
          if (!text || text.length < 4) return
          lockedRef.current = true
          setLastScannedValue(text)
          stopCamera()
          onScanRef.current(text)
          setTimeout(() => {
            if (preferredDeviceIdRef.current) {
              setLastScannedValue(null)
              startCamera(preferredDeviceIdRef.current, null)
            }
          }, 1200)
        })
        setScanning(true)
      } catch (e) {
        const msg = e?.message || ''
        if (/permission|notallowed/i.test(msg))
          setError('Camera permission denied. Please allow camera access and reload.')
        else if (/no camera/i.test(msg)) setError('No camera found on this device.')
        else setError('Camera failed to start. Try uploading an image instead.')
      }
    },
    [getReader, stopCamera, blockedSet]
  )
  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
    stopCamera()
    setTimeout(() => startCamera(null, nextFacing), 150)
  }, [facingMode, stopCamera, startCamera])
  const switchCamera = useCallback(
    async deviceId => {
      stopCamera()
      setTimeout(() => startCamera(deviceId, null), 150)
    },
    [stopCamera, startCamera]
  )
  const toggleTorch = useCallback(async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(t => !t)
    } catch (_) {}
  }, [torchOn])
  const handleFileChange = useCallback(
    async e => {
      const file = e.target.files?.[0]
      if (!file) return
      setError(null)
      try {
        const reader = createReader(activeFormats, true)
        const url = URL.createObjectURL(file)
        const img = new Image()
        await new Promise((res, rej) => {
          img.onload = res
          img.onerror = rej
          img.src = url
        })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const scales = [1, 1.5, 2, 0.75]
        const counts = {}
        for (const scale of scales) {
          canvas.width = Math.round(img.naturalWidth * scale)
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
          setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
        } else {
          setError('Could not read image. Please try again.')
        }
      }
      e.target.value = ''
    },
    [activeFormats, blockedSet]
  )
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      const t = setTimeout(() => startCamera(null), 300)
      return () => {
        clearTimeout(t)
        stopCamera()
      }
    } else {
      stopCamera()
    }
  }, [open, mode])
  useEffect(() => {
    if (!open) stopCamera()
  }, [open])
  useEffect(() => {
    if (!open || mode !== 'camera') return
    stopCamera()
    const t = setTimeout(() => startCamera(null), 300)
    return () => clearTimeout(t)
  }, [partnerName])
  useEffect(() => {
    return () => {
      try {
        cameraReaderRef.current?.reset()
      } catch (_) {}
      cameraReaderRef.current = null
    }
  }, [])
  const switchMode = m => {
    if (m !== mode) {
      setError(null)
      setMode(m)
    }
  }
  const scanHint =
    mode === 'camera'
      ? 'Point camera at the barcode'
      : 'Upload a clear, well-lit photo of the barcode'
  const formatLine = 'CODE-128 · EAN-13 · UPC-A · CODE-39 and more'
  const ScanIcon = RiBarcodeLine
  const orange = '#f58021'

  // THEMING VARS
  // Buttons, backgrounds, and icons: orange. All other backgrounds/text: black/white/gray.

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      style={{
        background: "#fff",
      }}
    >
      <div className="space-y-4" style={{ background: "#fff", color: "#111" }}>
        {/* ── Partner badge ───────────────────── */}
        {partnerName && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-fit`}
            style={{
              background: "#fff",
              border: `1.5px solid ${orange}`,
              color: orange,
            }}
          >
            <ScanIcon className="shrink-0" style={{ color: orange }} />
            <span>{partnerName} — scanning barcodes only</span>
          </div>
        )}

        {/* ── Mode tabs ───────────────────── */}
        <div className="flex gap-2">
          {[
            ['camera', <RiCameraLine style={{ color: orange }} />, 'Camera'],
            ['file', <RiImageLine style={{ color: orange }} />, 'Upload Image'],
          ].map(([m, icon, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: mode === m ? orange : "#fff",
                color: mode === m ? "#fff" : orange,
                border: `1.5px solid ${orange}`,
                boxShadow: mode === m ? `0 1px 4px 0 ${orange}33` : undefined,
                fontWeight: 600,
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── Hint ───────────────────── */}
        <div className="flex items-center gap-2 text-sm" style={{ color: "#111" }}>
          <ScanIcon className="shrink-0" style={{ color: orange }} />
          <span>{scanHint}</span>
        </div>

        {/* ── Error ───────────────────── */}
        {error && (
          <div
            className="rounded-xl p-3 text-red-600 text-sm border"
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              color: "#e53935",
            }}
          >
            {error}
          </div>
        )}

        {/* ── Success flash ───────────────────── */}
        {lastScannedValue && (
          <div
            className="rounded-xl p-3 text-green-700 text-sm flex items-center gap-2 border"
            style={{
              background: "#fff",
              border: "1px solid #66bb6a",
              color: "#388e3c",
            }}
          >
            <span className="font-semibold">✓ Scanned:</span>
            <span className="font-mono break-all">{lastScannedValue}</span>
          </div>
        )}

        {/* ── Camera view ───────────────────── */}
        {mode === 'camera' && (
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: "#000",
              aspectRatio: "16/9",
            }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ background: "#000" }}
              muted
              playsInline
              autoPlay
            />

            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0" style={{ background: "#000", opacity: 0.3 }} />
                {/* Barcode viewfinder -- Orange border */}
                <div className="relative z-10 w-4/5 h-20 rounded" style={{ border: `2.5px solid ${orange}` }}>
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow transition-colors"
                  style={{
                    background: orange,
                    color: "#fff",
                    border: `1.5px solid ${orange}`,
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 16 }}>🔦</span>{" "}
                  {torchOn ? 'On' : 'Off'}
                </button>
                <div className="flex items-center gap-2">
                  {devices.length > 1 && (
                    <button
                      onClick={flipCamera}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow active:scale-95 transition-transform"
                      style={{
                        background: orange,
                        color: "#fff",
                        border: `1.5px solid ${orange}`,
                      }}
                    >
                      <span style={{ fontSize: 15, color: "#fff" }}>🔄</span>
                      <span>{facingMode === 'environment' ? 'Front' : 'Rear'}</span>
                    </button>
                  )}
                  {devices.length > 2 && (
                    <select
                      value={activeDeviceId || ''}
                      onChange={e => {
                        if (e.target.value !== activeDeviceId) switchCamera(e.target.value)
                      }}
                      className="px-2 py-1.5 rounded-full text-xs font-bold border-0 shadow"
                      style={{
                        background: orange,
                        color: "#fff",
                        border: `1.5px solid ${orange}`,
                        maxWidth: 130,
                      }}
                    >
                      {devices.map((d, i) => (
                        <option value={d.deviceId} key={d.deviceId} style={{ color: "#111" }}>
                          {d.label?.trim() || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {!scanning && !error && (
              <div
                className="absolute inset-0 flex items-center justify-center text-sm"
                style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
              >
                Starting camera…
              </div>
            )}
          </div>
        )}

        {/* ── File upload ───────────────────── */}
        {mode === 'file' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 rounded-xl transition-colors text-sm flex flex-col items-center gap-2 font-bold"
              style={{
                border: `2px dashed ${orange}`,
                color: orange,
                background: "#fff",
                fontWeight: 500,
              }}
              onMouseOver={e => (e.currentTarget.style.background = `${orange}08`)}
              onMouseOut={e => (e.currentTarget.style.background = '#fff')}
            >
              <RiImageLine className="text-3xl" style={{ color: orange }} />
              <span>Tap to choose a photo of the barcode</span>
              <span className="text-xs" style={{ color: "#999" }}>
                JPG · PNG · WebP
              </span>
            </button>
          </>
        )}

        {/* ── Footer note ───────────────────── */}
        <p className="text-xs text-center" style={{ color: "#444" }}>
          {formatLine}
          <br />
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