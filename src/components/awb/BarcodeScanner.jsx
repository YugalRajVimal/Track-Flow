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

const BARCODE_FORMATS = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
]

const BLOCKED_2D = new Set([
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.AZTEC,
  BarcodeFormat.PDF_417,
  BarcodeFormat.MAXICODE,
])

function createCameraReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 10,
    delayBetweenScanSuccess: 500,
  })
}

function createFileReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
  hints.set(DecodeHintType.TRY_HARDER, true)
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  return new BrowserMultiFormatReader(hints)
}

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
  const cameraReaderRef = useRef(null)
  const videoRef        = useRef(null)
  const fileInputRef    = useRef(null)
  const lockedRef       = useRef(false)

  // Stable ref for onScan — never causes startCamera to be recreated
  const onScanRef = useRef(onScan)
  useEffect(() => { onScanRef.current = onScan }, [onScan])

  const [mode, setMode]             = useState('camera')
  const [error, setError]           = useState(null)
  const [scanning, setScanning]     = useState(false)
  const [torchOn, setTorchOn]       = useState(false)
  const [lastScannedValue, setLastScannedValue] = useState(null)
  const [devices, setDevices]       = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')

  // Keep preferred device stable across restarts
  const preferredDeviceIdRef = useRef(null)

  const getReader = useCallback(() => {
    if (!cameraReaderRef.current) {
      cameraReaderRef.current = createCameraReader()
    }
    return cameraReaderRef.current
  }, [])

  const stopCamera = useCallback(() => {
    lockedRef.current = false
    try { cameraReaderRef.current?.reset() } catch (e) {}
    setScanning(false)
    setTorchOn(false)
  }, [])

  const startCamera = useCallback(async (preferredDeviceId = null, preferredFacing = null) => {
    setError(null)
    setScanning(false)
    lockedRef.current = false

    try {
      const reader = getReader()

      await navigator.mediaDevices.getUserMedia({ video: true })
      const allMediaDevices = await navigator.mediaDevices.enumerateDevices()
      const allDevices = allMediaDevices
        .filter(d => d.kind === 'videoinput')
        .map(d => ({ deviceId: d.deviceId, label: d.label }))
      setDevices(allDevices)

      if (allDevices.length === 0) throw new Error('No camera found')

      let selected = null
      if (preferredDeviceId) {
        selected = allDevices.find(d => d.deviceId === preferredDeviceId)
      }
      if (!selected && preferredFacing) {
        const re = preferredFacing === 'environment'
          ? /back|rear|environment/i
          : /front|user|facetime|selfie/i
        selected = allDevices.find(d => re.test(d.label))
      }
      if (!selected) {
        selected =
          allDevices.find(d => /back|rear|environment/i.test(d.label)) ||
          allDevices[0]
      }

      setActiveDeviceId(selected.deviceId)
      preferredDeviceIdRef.current = selected.deviceId
      setFacingMode(/front|user|facetime|selfie/i.test(selected.label) ? 'user' : 'environment')

      await reader.decodeFromVideoDevice(
        selected.deviceId,
        videoRef.current,
        (result, err) => {
          if (lockedRef.current) return
          if (!result) return
          if (BLOCKED_2D.has(result.getBarcodeFormat())) return
          const text = result.getText()
          if (!text || text.length < 4) return

          lockedRef.current = true
          setLastScannedValue(text)

          // Stop camera, fire callback, then restart for next scan
          stopCamera()
          onScanRef.current(text)

          // Restart camera after a short pause so user can see the success state,
          // then the viewfinder comes back ready for the next barcode.
          setTimeout(() => {
            if (preferredDeviceIdRef.current) {
              setLastScannedValue(null)
              startCamera(preferredDeviceIdRef.current, null)
            }
          }, 1200)
        }
      )

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
  }, [getReader, stopCamera]) // eslint-disable-line react-hooks/exhaustive-deps

  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
    stopCamera()
    setTimeout(() => startCamera(null, nextFacing), 150)
  }, [facingMode, stopCamera, startCamera])

  const switchCamera = useCallback(async (deviceId) => {
    stopCamera()
    setTimeout(() => startCamera(deviceId, null), 150)
  }, [stopCamera, startCamera])

  const toggleTorch = useCallback(async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(t => !t)
    } catch (e) {}
  }, [torchOn])

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    try {
      const reader = createFileReader()
      const url    = URL.createObjectURL(file)
      const img    = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

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

      const sorted = Object.entries(results).sort((a, b) => b[1] - a[1])
      if (sorted.length === 0) {
        setError('No barcode found. Try a clearer, well-lit photo with the barcode fully in frame.')
        return
      }

      const topCount = sorted[0][1]
      const best = sorted
        .filter(([, c]) => c === topCount)
        .map(([v]) => v)
        .reduce((a, b) => (a.length >= b.length ? a : b))

      setLastScannedValue(best)
      onScanRef.current(best)

      // Clear success state after a moment for next upload
      setTimeout(() => setLastScannedValue(null), 2000)
    } catch (err) {
      if (err instanceof NotFoundException) {
        setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
      } else {
        setError('Could not read image. Please try again.')
      }
    }

    e.target.value = ''
  }, [])

  // Start/stop camera only when open or mode changes
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      const t = setTimeout(() => startCamera(null), 300)
      return () => { clearTimeout(t); stopCamera() }
    } else {
      stopCamera()
    }
  }, [open, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) stopCamera()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      try { cameraReaderRef.current?.reset() } catch (e) {}
      cameraReaderRef.current = null
    }
  }, [])

  const switchMode = (m) => {
    if (m !== mode) { setError(null); setMode(m) }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 bg-white text-slate-800">

        {/* Mode tabs */}
        <div className="flex gap-2">
          {[['camera', <RiCameraLine />, 'Camera'], ['file', <RiImageLine />, 'Upload Image']].map(([m, icon, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
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
              ? 'Hold each barcode in frame — camera restarts automatically after each scan'
              : 'Upload a clear, well-lit photo of the label'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success flash */}
        {lastScannedValue && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
            <span className="font-semibold">✓ Scanned:</span>
            <span className="font-mono break-all">{lastScannedValue}</span>
          </div>
        )}

        {/* Camera view */}
        {mode === 'camera' && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 w-4/5 h-20 border-2 border-brand-400 rounded">
                  <div
                    className="absolute inset-x-0 h-0.5 bg-brand-400"
                    style={{ animation: 'scanline 1.4s ease-in-out infinite' }}
                  />
                </div>
              </div>
            )}

            {scanning && (
              <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                <button
                  onClick={toggleTorch}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow ${
                    torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-black/60 text-white'
                  }`}
                >
                  🔦 {torchOn ? 'On' : 'Off'}
                </button>

                <div className="flex items-center gap-2">
                  {devices.length > 1 && (
                    <button
                      onClick={flipCamera}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white shadow active:scale-95 transition-transform"
                    >
                      <span style={{ fontSize: 15 }}>🔄</span>
                      <span>{facingMode === 'environment' ? 'Front' : 'Rear'}</span>
                    </button>
                  )}
                  {devices.length > 2 && (
                    <select
                      value={activeDeviceId || ''}
                      onChange={e => { if (e.target.value !== activeDeviceId) switchCamera(e.target.value) }}
                      className="bg-black/60 text-white px-2 py-1.5 rounded-full text-xs font-medium border-0 shadow"
                      style={{ maxWidth: 130 }}
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

        {/* File upload */}
        {mode === 'file' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
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