// // import React, { useEffect, useRef, useState } from 'react'
// // import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode'
// // import { RiBarcodeLine } from 'react-icons/ri'
// // import Modal from '../common/Modal'

// // export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
// //   const scannerRef = useRef(null)
// //   const [error, setError] = useState(null)
// //   const [scanning, setScanning] = useState(false)

// //   useEffect(() => {
// //     if (!open) return

// //     const timerId = setTimeout(() => {
// //       try {
// //         const scanner = new Html5QrcodeScanner(
// //           'qr-reader',
// //           {
// //             fps: 10,
// //             qrbox: { width: 250, height: 120 },
// //             supportedScanTypes: [
// //               Html5QrcodeScanType.SCAN_TYPE_CAMERA,
// //               Html5QrcodeScanType.SCAN_TYPE_FILE,
// //             ],
// //             rememberLastUsedCamera: true,
// //             // Only enable 1D barcode formats, disable QR
// //             formatsToSupport: [
// //               Html5QrcodeSupportedFormats.CODE_128,
// //               Html5QrcodeSupportedFormats.CODE_39,
// //               Html5QrcodeSupportedFormats.CODE_93,
// //               Html5QrcodeSupportedFormats.EAN_13,
// //               Html5QrcodeSupportedFormats.EAN_8,
// //               Html5QrcodeSupportedFormats.UPC_A,
// //               Html5QrcodeSupportedFormats.UPC_E,
// //               Html5QrcodeSupportedFormats.ITF,
// //               Html5QrcodeSupportedFormats.AZTEC, // Remove if you think this is 2D (optional)
// //               // DO NOT include Html5QrcodeSupportedFormats.QR_CODE
// //             ]
// //           },
// //           false
// //         )

// //         scanner.render(
// //           (decodedText, decodedResult) => {
// //             // Only process if not QR code (defensive: should be filtered, but double-check)
// //             if (decodedResult && decodedResult.result && decodedResult.result.format) {
// //               if (decodedResult.result.format.formatName === 'QR_CODE') {
// //                 // ignore QR codes
// //                 return
// //               }
// //             }
// //             scanner.clear().catch(() => {})
// //             onScan(decodedText)
// //             onClose()
// //           },
// //           (err) => {
// //             // silently ignore scan errors (camera frames without acceptable barcode)
// //           }
// //         )

// //         scannerRef.current = scanner
// //         setScanning(true)
// //       } catch (e) {
// //         setError('Camera access failed. Please allow camera permissions.')
// //       }
// //     }, 300)

// //     return () => {
// //       clearTimeout(timerId)
// //       if (scannerRef.current) {
// //         scannerRef.current.clear().catch(() => {})
// //         scannerRef.current = null
// //       }
// //       setScanning(false)
// //       setError(null)
// //     }
// //   }, [open])

// //   return (
// //     <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
// //       <div className="space-y-4 bg-white text-slate-800">
// //         <div className="flex items-center gap-2 text-sm text-slate-500">
// //           <RiBarcodeLine className="text-brand-500" />
// //           <span>Point camera at barcode only</span>
// //         </div>

// //         {error ? (
// //           <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
// //             {error}
// //           </div>
// //         ) : (
// //           <div
// //             id="qr-reader"
// //             className="rounded-xl overflow-hidden [&_.html5-qrcode-element]:text-slate-700 [&_button]:btn-secondary-light [&_select]:input-field-light [&_video]:rounded-xl bg-slate-50"
// //           />
// //         )}

// //         <p className="text-xs text-slate-400 text-center">
// //           Supports camera scanning and file upload.<br />
// //           <b>Only barcodes will be scanned. QR codes will be ignored.</b>
// //         </p>
// //       </div>
// //     </Modal>
// //   )
// // }


// import React, { useEffect, useRef, useState } from 'react'
// import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
// import { RiBarcodeLine } from 'react-icons/ri'
// import Modal from '../common/Modal'

// export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
//   const scannerRef = useRef(null)
//   const fileInputRef = useRef(null)
//   const [error, setError] = useState(null)
//   const [scanning, setScanning] = useState(false)
//   const [mode, setMode] = useState('camera') // 'camera' | 'file'

//   const BARCODE_FORMATS = [
//     Html5QrcodeSupportedFormats.CODE_128,
//     Html5QrcodeSupportedFormats.CODE_39,
//     Html5QrcodeSupportedFormats.CODE_93,
//     Html5QrcodeSupportedFormats.EAN_13,
//     Html5QrcodeSupportedFormats.EAN_8,
//     Html5QrcodeSupportedFormats.UPC_A,
//     Html5QrcodeSupportedFormats.UPC_E,
//     Html5QrcodeSupportedFormats.ITF,
//   ]

//   const stopScanner = async () => {
//     if (scannerRef.current) {
//       try {
//         const state = scannerRef.current.getState()
//         // State 2 = SCANNING, State 3 = PAUSED
//         if (state === 2 || state === 3) {
//           await scannerRef.current.stop()
//         }
//         scannerRef.current.clear()
//       } catch (e) {
//         // ignore cleanup errors
//       }
//       scannerRef.current = null
//     }
//     setScanning(false)
//   }

//   const startCameraScanner = async () => {
//     setError(null)
//     try {
//       const html5Qrcode = new Html5Qrcode('qr-reader-camera', {
//         formatsToSupport: BARCODE_FORMATS,
//         verbose: false,
//       })
//       scannerRef.current = html5Qrcode

//       // Get rear camera preferentially
//       const cameras = await Html5Qrcode.getCameras()
//       if (!cameras || cameras.length === 0) {
//         throw new Error('No camera found')
//       }

//       // Prefer rear/environment camera
//       const rearCamera = cameras.find(c =>
//         /back|rear|environment/i.test(c.label)
//       ) || cameras[cameras.length - 1]

//       await html5Qrcode.start(
//         { deviceId: { exact: rearCamera.id } },
//         {
//           fps: 15,                          // higher fps = better for camera
//           qrbox: { width: 280, height: 100 }, // wide & short for 1D barcodes
//           aspectRatio: 1.7778,              // 16:9 keeps camera stable
//           disableFlip: false,
//         },
//         (decodedText) => {
//           stopScanner().then(() => {
//             onScan(decodedText)
//             onClose()
//           })
//         },
//         () => { /* ignore per-frame failures */ }
//       )

//       setScanning(true)
//     } catch (e) {
//       const msg = e?.message || ''
//       if (msg.includes('Permission') || msg.includes('permission') || msg.includes('NotAllowed')) {
//         setError('Camera permission denied. Please allow camera access and try again.')
//       } else if (msg.includes('No camera')) {
//         setError('No camera found on this device.')
//       } else {
//         setError('Could not start camera. Try uploading an image instead.')
//       }
//     }
//   }

//   const handleFileUpload = async (e) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setError(null)

//     try {
//       // Use a separate hidden div for file scanning to avoid conflicts
//       const html5Qrcode = new Html5Qrcode('qr-reader-file', {
//         formatsToSupport: BARCODE_FORMATS,
//         verbose: false,
//       })

//       const result = await html5Qrcode.scanFile(file, true)
//       html5Qrcode.clear()
//       onScan(result)
//       onClose()
//     } catch (e) {
//       setError('No barcode found in image. Please try another image or use the camera.')
//     }

//     // Reset input so same file can be re-selected
//     e.target.value = ''
//   }

//   useEffect(() => {
//     if (!open) return
//     setMode('camera')

//     const timerId = setTimeout(() => {
//       startCameraScanner()
//     }, 400)

//     return () => {
//       clearTimeout(timerId)
//       stopScanner()
//       setError(null)
//     }
//   }, [open])

//   // When switching modes
//   useEffect(() => {
//     if (!open) return
//     if (mode === 'camera') {
//       stopScanner().then(() => startCameraScanner())
//     } else {
//       stopScanner()
//     }
//   }, [mode])

//   return (
//     <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
//       <div className="space-y-4 bg-white text-slate-800">

//         {/* Mode toggle */}
//         <div className="flex gap-2">
//           <button
//             className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
//               mode === 'camera'
//                 ? 'bg-brand-500 text-white'
//                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//             }`}
//             onClick={() => setMode('camera')}
//           >
//             📷 Camera
//           </button>
//           <button
//             className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
//               mode === 'file'
//                 ? 'bg-brand-500 text-white'
//                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//             }`}
//             onClick={() => setMode('file')}
//           >
//             🖼 Upload Image
//           </button>
//         </div>

//         <div className="flex items-center gap-2 text-sm text-slate-500">
//           <RiBarcodeLine className="text-brand-500" />
//           <span>
//             {mode === 'camera'
//               ? 'Point camera at barcode — hold steady'
//               : 'Upload an image containing a barcode'}
//           </span>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Camera viewer */}
//         <div
//           id="qr-reader-camera"
//           className={`rounded-xl overflow-hidden bg-slate-50 ${mode !== 'camera' ? 'hidden' : ''}`}
//         />

//         {/* Hidden div required by html5-qrcode for file scanning */}
//         <div id="qr-reader-file" className="hidden" />

//         {/* File upload UI */}
//         {mode === 'file' && (
//           <div>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleFileUpload}
//             />
//             <button
//               className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               Click to choose an image
//             </button>
//           </div>
//         )}

//         <p className="text-xs text-slate-400 text-center">
//           Supports CODE-128, EAN-13, UPC-A, and more.<br />
//           <b>QR codes are ignored.</b>
//         </p>
//       </div>
//     </Modal>
//   )
// }
import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library'
import { RiBarcodeLine, RiCameraLine, RiImageLine } from 'react-icons/ri'
import Modal from '../common/Modal'

// ── 1D-only formats ────────────────────────────────────────────────────────
const BARCODE_FORMATS = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.RSS_14,
]

const BLOCKED_2D = new Set([
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.AZTEC,
  BarcodeFormat.PDF_417,
  BarcodeFormat.MAXICODE,
])

// How many consecutive identical reads before we accept the result
const CONFIRM_THRESHOLD = 4

function createReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
  hints.set(DecodeHintType.TRY_HARDER, true)
  // CHARACTER_SET helps with long CODE-128 strings like Flipkart AWB
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 80,   // fast polling
    delayBetweenScanSuccess: 300,
  })
}

// ── Confirmation buffer ────────────────────────────────────────────────────
// Accepts a result only after CONFIRM_THRESHOLD reads of the SAME value.
// Also prefers the LONGEST result seen (partial reads are shorter).
function createConfirmBuffer() {
  const counts = {}   // value → count
  let longestSeen = ''

  return {
    push(value) {
      if (!value) return null

      // Track longest candidate (partial reads produce shorter strings)
      if (value.length > longestSeen.length) longestSeen = value

      // Only count strings that are at least as long as the longest seen
      // so short partial reads don't pollute the vote
      const key = value.length >= longestSeen.length ? value : null
      if (!key) return null

      counts[key] = (counts[key] || 0) + 1
      if (counts[key] >= CONFIRM_THRESHOLD) return key
      return null
    },
    reset() {
      Object.keys(counts).forEach(k => delete counts[k])
      longestSeen = ''
    },
  }
}

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
  const readerRef   = useRef(null)
  const videoRef    = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef   = useRef(null)
  const bufferRef   = useRef(createConfirmBuffer())
  const lockedRef   = useRef(false)   // prevent double-fire after confirm

  const [mode, setMode]       = useState('camera')
  const [error, setError]     = useState(null)
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [confidence, setConfidence] = useState(0)  // visual feedback 0-100

  // Add to state declarations
const [devices, setDevices] = useState([])
const [activeDeviceId, setActiveDeviceId] = useState(null)

  // ── Stop camera ────────────────────────────────────────────────────────
  const stopCamera = useCallback(async () => {
    lockedRef.current = false
    bufferRef.current.reset()
    setConfidence(0)
    try { readerRef.current?.reset() } catch (_) {}
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanning(false)
    setTorchOn(false)
  }, [])


// Update startCamera to accept an optional deviceId
const startCamera = useCallback(async (preferredDeviceId = null) => {
  setError(null)
  setScanning(false)
  lockedRef.current = false
  bufferRef.current.reset()
  setConfidence(0)

  try {
    readerRef.current = createReader()

    const allDevices = await readerRef.current.listVideoInputDevices()
    if (!allDevices.length) throw new Error('No camera found')

    // Save devices list for the switcher UI
    setDevices(allDevices)

    // Priority: explicit choice → rear camera → last device
    const selected =
      (preferredDeviceId && allDevices.find(d => d.deviceId === preferredDeviceId)) ||
      allDevices.find(d => /back|rear|environment/i.test(d.label)) ||
      allDevices[allDevices.length - 1]

    setActiveDeviceId(selected.deviceId)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: selected.deviceId },
        width:    { ideal: 1920, min: 1280 },
        height:   { ideal: 1080, min: 720 },
        focusMode:        'continuous',
        exposureMode:     'continuous',
        whiteBalanceMode: 'continuous',
      },
    })
    streamRef.current = stream

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }

    readerRef.current.decodeFromStream(stream, videoRef.current, (result) => {
      if (!result || lockedRef.current) return
      if (BLOCKED_2D.has(result.getBarcodeFormat())) return

      const text = result.getText()
      if (!text || text.length < 4) return

      const confirmed = bufferRef.current.push(text)
      setConfidence(prev => Math.min(100, prev + (confirmed ? 100 : 12)))

      if (confirmed) {
        lockedRef.current = true
        setConfidence(100)
        stopCamera().then(() => {
          onScan(confirmed)
          onClose()
        })
      }
    })

    setScanning(true)
  } catch (e) {
    const msg = e?.message || ''
    if (/permission|notallowed/i.test(msg)) {
      setError('Camera permission denied. Please allow camera access and reload.')
    } else if (/no camera/i.test(msg)) {
      setError('No camera found on this device.')
    } else {
      setError('Camera failed to start. Try uploading an image instead.')
    }
  }
}, [stopCamera, onScan, onClose])

// Switch camera handler — stops current, restarts with new device
const switchCamera = useCallback(async (deviceId) => {
  await stopCamera()
  bufferRef.current.reset()
  setConfidence(0)
  setTimeout(() => startCamera(deviceId), 200)
}, [stopCamera, startCamera])

  // ── Torch toggle ──────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(t => !t)
    } catch (_) {}
  }, [torchOn])

  // ── File upload scan ──────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    try {
      // Run the same image through the reader MULTIPLE times at different
      // scales — this catches partial reads on high-res label photos
      const reader = createReader()
      const url    = URL.createObjectURL(file)

      const img = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

      // Try at original size, then 2×, then 0.75× scale
      const canvas  = document.createElement('canvas')
      const ctx     = canvas.getContext('2d')
      const scales  = [1, 1.5, 2, 0.75]
      const results = {}

      for (const scale of scales) {
        canvas.width  = Math.round(img.naturalWidth  * scale)
        canvas.height = Math.round(img.naturalHeight * scale)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        try {
          const r = await reader.decodeFromCanvas(canvas)
          if (r && !BLOCKED_2D.has(r.getBarcodeFormat())) {
            const t = r.getText()
            results[t] = (results[t] || 0) + 1
          }
        } catch (_) {}
      }

      URL.revokeObjectURL(url)

      // Pick the value seen most often (majority vote across scales)
      const sorted = Object.entries(results).sort((a, b) => b[1] - a[1])
      if (sorted.length === 0) {
        setError('No barcode found. Try a clearer, well-lit photo with the barcode fully in frame.')
        return
      }

      // Among tied winners, prefer the longest (most complete read)
      const topCount  = sorted[0][1]
      const topValues = sorted.filter(([, c]) => c === topCount).map(([v]) => v)
      const best      = topValues.reduce((a, b) => (a.length >= b.length ? a : b))

      onScan(best)
      onClose()
    } catch (err) {
      if (err instanceof NotFoundException) {
        setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
      } else {
        setError('Could not read image. Please try again.')
        console.error(err)
      }
    }

    e.target.value = ''
  }, [onScan, onClose])

  // ── Lifecycle ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      const t = setTimeout(startCamera, 300)
      return () => { clearTimeout(t); stopCamera() }
    } else {
      stopCamera()
    }
  }, [open, mode])

  useEffect(() => { if (!open) stopCamera() }, [open])

  const switchMode = (m) => { if (m !== mode) { setError(null); setConfidence(0); setMode(m) } }

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 bg-white text-slate-800">

        {/* Mode tabs */}
        <div className="flex gap-2">
          {[['camera', <RiCameraLine />, 'Camera'], ['file', <RiImageLine />, 'Upload Image']].map(([m, icon, label]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RiBarcodeLine className="text-brand-500 shrink-0" />
          <span>
            {mode === 'camera'
              ? 'Keep barcode fully in frame and hold steady'
              : 'Upload a clear, well-lit photo of the label'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Camera view */}
      {/* Camera view */}
{mode === 'camera' && (
  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

    {/* Targeting overlay — unchanged */}
    {scanning && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-4/5 h-20 border-2 border-brand-400 rounded">
          <div className="absolute inset-x-0 h-0.5 bg-brand-400"
            style={{ animation: 'scanline 1.4s ease-in-out infinite' }} />
        </div>
      </div>
    )}

    {/* Confidence bar — unchanged */}
    {scanning && confidence > 0 && (
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/40">
        <div className="h-full bg-brand-400 transition-all duration-150"
          style={{ width: `${confidence}%` }} />
      </div>
    )}

    {/* ── Top controls row ── */}
    {scanning && (
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">

        {/* Torch */}
        <button onClick={toggleTorch}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-black/50 text-white'
          }`}
        >
          🔦 {torchOn ? 'On' : 'Off'}
        </button>

        {/* Camera switcher — only shown when multiple cameras exist */}
        {devices.length > 1 && (
          <div className="flex items-center gap-1 bg-black/50 rounded-full p-1">
            {devices.map((d, i) => {
              const isRear  = /back|rear|environment/i.test(d.label)
              const isFront = /front|user|facetime/i.test(d.label)
              const isActive = d.deviceId === activeDeviceId

              // Label: try to detect front/rear, else fallback to index
              const label = isRear ? '🔭' : isFront ? '🤳' : `Cam ${i + 1}`

              return (
                <button
                  key={d.deviceId}
                  onClick={() => !isActive && switchCamera(d.deviceId)}
                  title={d.label || `Camera ${i + 1}`}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-slate-800'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

      </div>
    )}

    {!scanning && !error && (
      <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/50">
        Starting camera…
      </div>
    )}
  </div>
)}

        {/* File upload */}
        {mode === 'file' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm flex flex-col items-center gap-2"
            >
              <RiImageLine className="text-3xl" />
              <span>Tap to choose a photo of the barcode</span>
              <span className="text-xs text-slate-300">JPG · PNG · WebP</span>
            </button>
          </>
        )}

        <p className="text-xs text-slate-400 text-center">
          CODE-128 · EAN-13 · UPC-A · CODE-39 and more<br />
          <b>QR codes and 2D codes are always ignored</b>
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