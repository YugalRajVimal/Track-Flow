


// import React, { useEffect, useRef, useState, useCallback } from 'react'
// import {
//   BrowserMultiFormatReader,
//   BarcodeFormat,
//   DecodeHintType,
//   NotFoundException,
// } from '@zxing/library'
// import { RiBarcodeLine, RiCameraLine, RiImageLine } from 'react-icons/ri'
// import Modal from '../common/Modal'

// // ── 1D-only formats ────────────────────────────────────────────────────────
// const BARCODE_FORMATS = [
//   BarcodeFormat.CODE_128,
//   BarcodeFormat.CODE_39,
//   BarcodeFormat.CODE_93,
//   BarcodeFormat.EAN_13,
//   BarcodeFormat.EAN_8,
//   BarcodeFormat.UPC_A,
//   BarcodeFormat.UPC_E,
//   BarcodeFormat.ITF,
//   BarcodeFormat.CODABAR,
//   BarcodeFormat.RSS_14,
// ]

// const BLOCKED_2D = new Set([
//   BarcodeFormat.QR_CODE,
//   BarcodeFormat.DATA_MATRIX,
//   BarcodeFormat.AZTEC,
//   BarcodeFormat.PDF_417,
//   BarcodeFormat.MAXICODE,
// ])

// // How many consecutive identical reads before we accept the result
// const CONFIRM_THRESHOLD = 4

// function createReader() {
//   const hints = new Map()
//   hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
//   hints.set(DecodeHintType.TRY_HARDER, true)
//   // CHARACTER_SET helps with long CODE-128 strings like Flipkart AWB
//   hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
//   return new BrowserMultiFormatReader(hints, {
//     delayBetweenScanAttempts: 80,   // fast polling
//     delayBetweenScanSuccess: 300,
//   })
// }

// // ── Confirmation buffer ────────────────────────────────────────────────────
// // Accepts a result only after CONFIRM_THRESHOLD reads of the SAME value.
// // Also prefers the LONGEST result seen (partial reads are shorter).
// function createConfirmBuffer() {
//   const counts = {}   // value → count
//   let longestSeen = ''

//   return {
//     push(value) {
//       if (!value) return null

//       // Track longest candidate (partial reads produce shorter strings)
//       if (value.length > longestSeen.length) longestSeen = value

//       // Only count strings that are at least as long as the longest seen
//       // so short partial reads don't pollute the vote
//       const key = value.length >= longestSeen.length ? value : null
//       if (!key) return null

//       counts[key] = (counts[key] || 0) + 1
//       if (counts[key] >= CONFIRM_THRESHOLD) return key
//       return null
//     },
//     reset() {
//       Object.keys(counts).forEach(k => delete counts[k])
//       longestSeen = ''
//     },
//   }
// }

// export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
//   const readerRef   = useRef(null)
//   const videoRef    = useRef(null)
//   const fileInputRef = useRef(null)
//   const streamRef   = useRef(null)
//   const bufferRef   = useRef(createConfirmBuffer())
//   const lockedRef   = useRef(false)   // prevent double-fire after confirm

//   const [mode, setMode]       = useState('camera')
//   const [error, setError]     = useState(null)
//   const [scanning, setScanning] = useState(false)
//   const [torchOn, setTorchOn] = useState(false)
//   const [confidence, setConfidence] = useState(0)  // visual feedback 0-100

//   // New: Track the last successfully scanned barcode value for display
//   const [lastScannedValue, setLastScannedValue] = useState(null);

//   // With these — add facingMode tracking too:
//   const [devices, setDevices] = useState([])
//   const [activeDeviceId, setActiveDeviceId] = useState(null)
//   const [facingMode, setFacingMode] = useState('environment') // 'environment'=rear, 'user'=front

//   // ── Stop camera ────────────────────────────────────────────────────────
//   const stopCamera = useCallback(async () => {
//     lockedRef.current = false
//     bufferRef.current.reset()
//     setConfidence(0)
//     try { readerRef.current?.reset() } catch (_) {}
//     streamRef.current?.getTracks().forEach(t => t.stop())
//     streamRef.current = null
//     setScanning(false)
//     setTorchOn(false)
//   }, [])

//   const startCamera = useCallback(async (preferredDeviceId = null, preferredFacing = null) => {
//     setError(null)
//     setScanning(false)
//     lockedRef.current = false
//     bufferRef.current.reset()
//     setConfidence(0)
  
//     try {
//       readerRef.current = createReader()
  
//       // ── Enumerate cameras ──────────────────────────────────────────────
//       // On mobile, labels are blank until after first getUserMedia call.
//       // So we request permission first with a cheap constraint, then enumerate.
//       let allDevices = []
//       try {
//         // Trigger permission prompt so labels get populated
//         const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
//         tempStream.getTracks().forEach(t => t.stop())
//       } catch (_) {}
  
//       allDevices = await readerRef.current.listVideoInputDevices()
//       setDevices(allDevices)
  
//       // ── Pick device ────────────────────────────────────────────────────
//       let selected = null
  
//       if (preferredDeviceId) {
//         // User explicitly switched to a device
//         selected = allDevices.find(d => d.deviceId === preferredDeviceId)
//       }
  
//       if (!selected && preferredFacing) {
//         // Switch by facing mode (front/back toggle)
//         if (preferredFacing === 'environment') {
//           selected = allDevices.find(d => /back|rear|environment/i.test(d.label))
//         } else {
//           selected = allDevices.find(d => /front|user|facetime|selfie/i.test(d.label))
//         }
//       }
  
//       if (!selected) {
//         // Default: rear camera
//         selected =
//           allDevices.find(d => /back|rear|environment/i.test(d.label)) ||
//           allDevices[0]
//       }
  
//       if (!selected) throw new Error('No camera found')
  
//       setActiveDeviceId(selected.deviceId)
  
//       // Detect facing mode from label for the flip button state
//       const isfront = /front|user|facetime|selfie/i.test(selected.label)
//       setFacingMode(isfront ? 'user' : 'environment')
  
//       // ── Start stream ───────────────────────────────────────────────────
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           deviceId:        { exact: selected.deviceId },
//           width:           { ideal: 1920, min: 1280 },
//           height:          { ideal: 1080, min: 720 },
//           focusMode:       'continuous',
//           exposureMode:    'continuous',
//           whiteBalanceMode:'continuous',
//         },
//       })
//       streamRef.current = stream
  
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         await videoRef.current.play()
//       }
  
//       readerRef.current.decodeFromStream(stream, videoRef.current, (result) => {
//         if (!result || lockedRef.current) return
//         if (BLOCKED_2D.has(result.getBarcodeFormat())) return
  
//         const text = result.getText()
//         if (!text || text.length < 4) return
  
//         const confirmed = bufferRef.current.push(text)
//         setConfidence(prev => Math.min(100, prev + (confirmed ? 100 : 12)))
  
//         if (confirmed) {
//           lockedRef.current = true
//           setConfidence(100)
//           setLastScannedValue(confirmed)
//           stopCamera().then(() => {
//             onScan(confirmed)
//             // REMOVE: onClose() so modal does not close automatically
//             // onClose()
//           })
//         }
//       })
  
//       setScanning(true)
//     } catch (e) {
//       const msg = e?.message || ''
//       if (/permission|notallowed/i.test(msg)) {
//         setError('Camera permission denied. Please allow camera access and reload.')
//       } else if (/no camera/i.test(msg)) {
//         setError('No camera found on this device.')
//       } else {
//         setError('Camera failed to start. Try uploading an image instead.')
//         console.error(e)
//       }
//     }
//   }, [stopCamera, onScan /* onClose intentionally removed from deps */])

//   // Switch camera handler — stops current, restarts with new device
//   // Flip between front and back
//   const flipCamera = useCallback(async () => {
//     const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
//     await stopCamera()
//     setTimeout(() => startCamera(null, nextFacing), 200)
//   }, [facingMode, stopCamera, startCamera])

//   // Switch to a specific device (for 3+ camera phones)
//   const switchCamera = useCallback(async (deviceId) => {
//     await stopCamera()
//     setTimeout(() => startCamera(deviceId, null), 200)
//   }, [stopCamera, startCamera])

//   // ── Torch toggle ──────────────────────────────────────────────────────
//   const toggleTorch = useCallback(async () => {
//     const track = streamRef.current?.getVideoTracks()[0]
//     if (!track) return
//     try {
//       await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
//       setTorchOn(t => !t)
//     } catch (_) {}
//   }, [torchOn])

//   // ── File upload scan ──────────────────────────────────────────────────
//   const handleFileChange = useCallback(async (e) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setError(null)

//     try {
//       // Run the same image through the reader MULTIPLE times at different
//       // scales — this catches partial reads on high-res label photos
//       const reader = createReader()
//       const url    = URL.createObjectURL(file)

//       const img = new Image()
//       await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

//       // Try at original size, then 2×, then 0.75× scale
//       const canvas  = document.createElement('canvas')
//       const ctx     = canvas.getContext('2d')
//       const scales  = [1, 1.5, 2, 0.75]
//       const results = {}

//       for (const scale of scales) {
//         canvas.width  = Math.round(img.naturalWidth  * scale)
//         canvas.height = Math.round(img.naturalHeight * scale)
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

//         try {
//           const r = await reader.decodeFromCanvas(canvas)
//           if (r && !BLOCKED_2D.has(r.getBarcodeFormat())) {
//             const t = r.getText()
//             results[t] = (results[t] || 0) + 1
//           }
//         } catch (_) {}
//       }

//       URL.revokeObjectURL(url)

//       // Pick the value seen most often (majority vote across scales)
//       const sorted = Object.entries(results).sort((a, b) => b[1] - a[1])
//       if (sorted.length === 0) {
//         setError('No barcode found. Try a clearer, well-lit photo with the barcode fully in frame.')
//         return
//       }

//       // Among tied winners, prefer the longest (most complete read)
//       const topCount  = sorted[0][1]
//       const topValues = sorted.filter(([, c]) => c === topCount).map(([v]) => v)
//       const best      = topValues.reduce((a, b) => (a.length >= b.length ? a : b))

//       setLastScannedValue(best)
//       onScan(best)
//       // Do not close modal
//       // onClose()
//     } catch (err) {
//       if (err instanceof NotFoundException) {
//         setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
//       } else {
//         setError('Could not read image. Please try again.')
//         console.error(err)
//       }
//     }

//     e.target.value = ''
//   }, [onScan])

//   // ── Lifecycle ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!open) return
//     if (mode === 'camera') {
//       const t = setTimeout(() => {
//         // On open/camera mode, don't pass preferredDeviceId to allow default rear-camera logic
//         startCamera(null)
//       }, 300)
//       return () => { clearTimeout(t); stopCamera() }
//     } else {
//       stopCamera()
//     }
//   }, [open, mode, startCamera, stopCamera])

//   useEffect(() => { if (!open) stopCamera() }, [open, stopCamera])

//   const switchMode = (m) => { if (m !== mode) { setError(null); setConfidence(0); setMode(m) } }

//   return (
//     <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
//       <div className="space-y-4 bg-white text-slate-800">

//         {/* Mode tabs */}
//         <div className="flex gap-2">
//           {[['camera', <RiCameraLine />, 'Camera'], ['file', <RiImageLine />, 'Upload Image']].map(([m, icon, label]) => (
//             <button key={m} onClick={() => switchMode(m)}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 mode === m ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               {icon} {label}
//             </button>
//           ))}
//         </div>

//         {/* Hint */}
//         <div className="flex items-center gap-2 text-sm text-slate-500">
//           <RiBarcodeLine className="text-brand-500 shrink-0" />
//           <span>
//             {mode === 'camera'
//               ? 'Keep barcode fully in frame and hold steady'
//               : 'Upload a clear, well-lit photo of the label'}
//           </span>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Success - Last scanned value display */}
//         {lastScannedValue && (
//           <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
//             <span className="font-semibold">Scanned:</span>
//             <span className="font-mono break-all">{lastScannedValue}</span>
//             <button
//               className="ml-auto px-2 py-1 rounded text-xs bg-green-200 hover:bg-green-300 text-green-800"
//               onClick={() => setLastScannedValue(null)}
//             >
//               Clear
//             </button>
//           </div>
//         )}

//         {/* Camera view with dropdown camera selector */}
//         {mode === 'camera' && (
//           <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
//             <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

//             {/* Targeting overlay */}
//             {scanning && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="absolute inset-0 bg-black/30" />
//                 <div className="relative z-10 w-4/5 h-20 border-2 border-brand-400 rounded">
//                   <div className="absolute inset-x-0 h-0.5 bg-brand-400"
//                     style={{ animation: 'scanline 1.4s ease-in-out infinite' }} />
//                 </div>
//               </div>
//             )}

//             {/* Confidence bar */}
//             {scanning && confidence > 0 && (
//               <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/40">
//                 <div className="h-full bg-brand-400 transition-all duration-150"
//                   style={{ width: `${confidence}%` }} />
//               </div>
//             )}

//             {/* Top controls row */}
//             {scanning && (
//               <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">

//                 {/* Torch */}
//                 <button
//                   onClick={toggleTorch}
//                   className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow ${
//                     torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-black/60 text-white'
//                   }`}
//                 >
//                   🔦 {torchOn ? 'On' : 'Off'}
//                 </button>

//                 <div className="flex items-center gap-2">
//                   {/* Flip camera button — always visible on mobile, works by facingMode */}
//                   {devices.length > 1 && (
//                     <button
//                       onClick={flipCamera}
//                       className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white shadow active:scale-95 transition-transform"
//                       title={facingMode === 'environment' ? 'Switch to front camera' : 'Switch to rear camera'}
//                     >
//                       {/* Flip icon using unicode — no extra dependency */}
//                       <span style={{ display: 'inline-block', fontSize: 15 }}>🔄</span>
//                       <span>{facingMode === 'environment' ? 'Front' : 'Rear'}</span>
//                     </button>
//                   )}

//                   {/* Extra dropdown only shown on desktop/tablet with 3+ cameras */}
//                   {devices.length > 2 && (
//                     <select
//                       value={activeDeviceId || ''}
//                       onChange={e => { if (e.target.value !== activeDeviceId) switchCamera(e.target.value) }}
//                       className="bg-black/60 text-white px-2 py-1.5 rounded-full text-xs font-medium border-0 shadow"
//                       style={{ maxWidth: 130 }}
//                     >
//                       {devices.map((d, i) => (
//                         <option value={d.deviceId} key={d.deviceId}>
//                           {d.label?.trim() || `Camera ${i + 1}`}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//               </div>
//             )}

//             {!scanning && !error && (
//               <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/50">
//                 Starting camera…
//               </div>
//             )}
//           </div>
//         )}

//         {/* File upload */}
//         {mode === 'file' && (
//           <>
//             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
//             <button onClick={() => fileInputRef.current?.click()}
//               className="w-full py-10 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm flex flex-col items-center gap-2"
//             >
//               <RiImageLine className="text-3xl" />
//               <span>Tap to choose a photo of the barcode</span>
//               <span className="text-xs text-slate-300">JPG · PNG · WebP</span>
//             </button>
//           </>
//         )}

//         <p className="text-xs text-slate-400 text-center">
//           CODE-128 · EAN-13 · UPC-A · CODE-39 and more<br />
//           <b>QR codes and 2D codes are always ignored</b>
//         </p>
//       </div>

//       <style>{`
//         @keyframes scanline {
//           0%   { top: 0;    opacity: 1;   }
//           50%  { top: 74px; opacity: 0.7; }
//           100% { top: 0;    opacity: 1;   }
//         }
//       `}</style>
//     </Modal>
//   )
// }



// import React, { useEffect, useRef, useState, useCallback } from 'react'
// import {
//   BrowserMultiFormatReader,
//   BarcodeFormat,
//   DecodeHintType,
//   NotFoundException,
// } from '@zxing/library'
// import { RiBarcodeLine, RiCameraLine, RiImageLine } from 'react-icons/ri'
// import Modal from '../common/Modal'

// // ── 1D-only formats ────────────────────────────────────────────────────────
// const BARCODE_FORMATS = [
//   BarcodeFormat.CODE_128,
//   BarcodeFormat.CODE_39,
//   BarcodeFormat.CODE_93,
//   BarcodeFormat.EAN_13,
//   BarcodeFormat.EAN_8,
//   BarcodeFormat.UPC_A,
//   BarcodeFormat.UPC_E,
//   BarcodeFormat.ITF,
//   BarcodeFormat.CODABAR,
//   BarcodeFormat.RSS_14,
// ]

// const BLOCKED_2D = new Set([
//   BarcodeFormat.QR_CODE,
//   BarcodeFormat.DATA_MATRIX,
//   BarcodeFormat.AZTEC,
//   BarcodeFormat.PDF_417,
//   BarcodeFormat.MAXICODE,
// ])

// function createReader() {
//   const hints = new Map()
//   hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
//   hints.set(DecodeHintType.TRY_HARDER, true)
//   // CHARACTER_SET helps with long CODE-128 strings like Flipkart AWB
//   hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
//   return new BrowserMultiFormatReader(hints, {
//     delayBetweenScanAttempts: 20,   // Make polling even FASTER
//     delayBetweenScanSuccess: 10,
//   })
// }

// export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
//   const readerRef   = useRef(null)
//   const videoRef    = useRef(null)
//   const fileInputRef = useRef(null)
//   const streamRef   = useRef(null)
//   const lockedRef   = useRef(false)   // prevent double-fire after confirm

//   const [mode, setMode]       = useState('camera')
//   const [error, setError]     = useState(null)
//   const [scanning, setScanning] = useState(false)
//   const [torchOn, setTorchOn] = useState(false)

//   // Removed confidence state & logic

//   const [lastScannedValue, setLastScannedValue] = useState(null);
//   const [devices, setDevices] = useState([])
//   const [activeDeviceId, setActiveDeviceId] = useState(null)
//   const [facingMode, setFacingMode] = useState('environment') // 'environment'=rear, 'user'=front

//   // ── Stop camera ────────────────────────────────────────────────────────
//   const stopCamera = useCallback(async () => {
//     lockedRef.current = false
//     try { readerRef.current?.reset() } catch (_) {}
//     streamRef.current?.getTracks().forEach(t => t.stop())
//     streamRef.current = null
//     setScanning(false)
//     setTorchOn(false)
//   }, [])

//   const startCamera = useCallback(async (preferredDeviceId = null, preferredFacing = null) => {
//     setError(null)
//     setScanning(false)
//     lockedRef.current = false

//     try {
//       readerRef.current = createReader()

//       // ── Enumerate cameras ──────────────────────────────────────────────
//       let allDevices = []
//       try {
//         const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
//         tempStream.getTracks().forEach(t => t.stop())
//       } catch (_) {}

//       allDevices = await readerRef.current.listVideoInputDevices()
//       setDevices(allDevices)

//       // ── Pick device ────────────────────────────────────────────────────
//       let selected = null

//       if (preferredDeviceId) {
//         selected = allDevices.find(d => d.deviceId === preferredDeviceId)
//       }

//       if (!selected && preferredFacing) {
//         if (preferredFacing === 'environment') {
//           selected = allDevices.find(d => /back|rear|environment/i.test(d.label))
//         } else {
//           selected = allDevices.find(d => /front|user|facetime|selfie/i.test(d.label))
//         }
//       }

//       if (!selected) {
//         selected =
//           allDevices.find(d => /back|rear|environment/i.test(d.label)) ||
//           allDevices[0]
//       }

//       if (!selected) throw new Error('No camera found')

//       setActiveDeviceId(selected.deviceId)

//       const isfront = /front|user|facetime|selfie/i.test(selected.label)
//       setFacingMode(isfront ? 'user' : 'environment')

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           deviceId:        { exact: selected.deviceId },
//           width:           { ideal: 1920, min: 1280 },
//           height:          { ideal: 1080, min: 720 },
//           focusMode:       'continuous',
//           exposureMode:    'continuous',
//           whiteBalanceMode:'continuous',
//         },
//       })
//       streamRef.current = stream

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         await videoRef.current.play()
//       }

//       readerRef.current.decodeFromStream(stream, videoRef.current, (result) => {
//         if (!result || lockedRef.current) return
//         if (BLOCKED_2D.has(result.getBarcodeFormat())) return

//         const text = result.getText()
//         if (!text || text.length < 4) return

//         lockedRef.current = true
//         setLastScannedValue(text)
//         stopCamera().then(() => {
//           onScan(text)
//           // Don't close modal automatically
//         })
//       })

//       setScanning(true)
//     } catch (e) {
//       const msg = e?.message || ''
//       if (/permission|notallowed/i.test(msg)) {
//         setError('Camera permission denied. Please allow camera access and reload.')
//       } else if (/no camera/i.test(msg)) {
//         setError('No camera found on this device.')
//       } else {
//         setError('Camera failed to start. Try uploading an image instead.')
//         console.error(e)
//       }
//     }
//   }, [stopCamera, onScan ])

//   const flipCamera = useCallback(async () => {
//     const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
//     await stopCamera()
//     setTimeout(() => startCamera(null, nextFacing), 200)
//   }, [facingMode, stopCamera, startCamera])

//   const switchCamera = useCallback(async (deviceId) => {
//     await stopCamera()
//     setTimeout(() => startCamera(deviceId, null), 200)
//   }, [stopCamera, startCamera])

//   // ── Torch toggle ──────────────────────────────────────────────────────
//   const toggleTorch = useCallback(async () => {
//     const track = streamRef.current?.getVideoTracks()[0]
//     if (!track) return
//     try {
//       await track.applyConstraints({ advanced: [{ torch: !torchOn }] })
//       setTorchOn(t => !t)
//     } catch (_) {}
//   }, [torchOn])

//   // ── File upload scan ──────────────────────────────────────────────────
//   const handleFileChange = useCallback(async (e) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setError(null)

//     try {
//       // Still try multiple scales, as it's not slow
//       const reader = createReader()
//       const url    = URL.createObjectURL(file)

//       const img = new Image()
//       await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

//       const canvas  = document.createElement('canvas')
//       const ctx     = canvas.getContext('2d')
//       const scales  = [1, 1.5, 2, 0.75]
//       const results = {}

//       for (const scale of scales) {
//         canvas.width  = Math.round(img.naturalWidth  * scale)
//         canvas.height = Math.round(img.naturalHeight * scale)
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

//         try {
//           const r = await reader.decodeFromCanvas(canvas)
//           if (r && !BLOCKED_2D.has(r.getBarcodeFormat())) {
//             const t = r.getText()
//             results[t] = (results[t] || 0) + 1
//           }
//         } catch (_) {}
//       }

//       URL.revokeObjectURL(url)

//       const sorted = Object.entries(results).sort((a, b) => b[1] - a[1])
//       if (sorted.length === 0) {
//         setError('No barcode found. Try a clearer, well-lit photo with the barcode fully in frame.')
//         return
//       }

//       const topCount  = sorted[0][1]
//       const topValues = sorted.filter(([, c]) => c === topCount).map(([v]) => v)
//       const best      = topValues.reduce((a, b) => (a.length >= b.length ? a : b))

//       setLastScannedValue(best)
//       onScan(best)
//       // Do not close modal
//     } catch (err) {
//       if (err instanceof NotFoundException) {
//         setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
//       } else {
//         setError('Could not read image. Please try again.')
//         console.error(err)
//       }
//     }

//     e.target.value = ''
//   }, [onScan])

//   // ── Lifecycle ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!open) return
//     if (mode === 'camera') {
//       const t = setTimeout(() => {
//         startCamera(null)
//       }, 300)
//       return () => { clearTimeout(t); stopCamera() }
//     } else {
//       stopCamera()
//     }
//   }, [open, mode, startCamera, stopCamera])

//   useEffect(() => { if (!open) stopCamera() }, [open, stopCamera])

//   const switchMode = (m) => { if (m !== mode) { setError(null); setMode(m) } }

//   return (
//     <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
//       <div className="space-y-4 bg-white text-slate-800">

//         {/* Mode tabs */}
//         <div className="flex gap-2">
//           {[['camera', <RiCameraLine />, 'Camera'], ['file', <RiImageLine />, 'Upload Image']].map(([m, icon, label]) => (
//             <button key={m} onClick={() => switchMode(m)}
//               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 mode === m ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               {icon} {label}
//             </button>
//           ))}
//         </div>

//         {/* Hint */}
//         <div className="flex items-center gap-2 text-sm text-slate-500">
//           <RiBarcodeLine className="text-brand-500 shrink-0" />
//           <span>
//             {mode === 'camera'
//               ? 'Keep barcode fully in frame and hold steady'
//               : 'Upload a clear, well-lit photo of the label'}
//           </span>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Success - Last scanned value display */}
//         {lastScannedValue && (
//           <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
//             <span className="font-semibold">Scanned:</span>
//             <span className="font-mono break-all">{lastScannedValue}</span>
//             <button
//               className="ml-auto px-2 py-1 rounded text-xs bg-green-200 hover:bg-green-300 text-green-800"
//               onClick={() => setLastScannedValue(null)}
//             >
//               Clear
//             </button>
//           </div>
//         )}

//         {/* Camera view with dropdown camera selector */}
//         {mode === 'camera' && (
//           <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
//             <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

//             {/* Targeting overlay */}
//             {scanning && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="absolute inset-0 bg-black/30" />
//                 <div className="relative z-10 w-4/5 h-20 border-2 border-brand-400 rounded">
//                   <div className="absolute inset-x-0 h-0.5 bg-brand-400"
//                     style={{ animation: 'scanline 1.4s ease-in-out infinite' }} />
//                 </div>
//               </div>
//             )}

//             {/* Confidence bar REMOVED */}
//             {/*

//             {scanning && confidence > 0 && (
//               <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/40">
//                 <div className="h-full bg-brand-400 transition-all duration-150"
//                   style={{ width: `${confidence}%` }} />
//               </div>
//             )}
//             */}

//             {/* Top controls row */}
//             {scanning && (
//               <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">

//                 {/* Torch */}
//                 <button
//                   onClick={toggleTorch}
//                   className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow ${
//                     torchOn ? 'bg-yellow-400 text-yellow-900' : 'bg-black/60 text-white'
//                   }`}
//                 >
//                   🔦 {torchOn ? 'On' : 'Off'}
//                 </button>

//                 <div className="flex items-center gap-2">
//                   {/* Flip camera button — always visible on mobile, works by facingMode */}
//                   {devices.length > 1 && (
//                     <button
//                       onClick={flipCamera}
//                       className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white shadow active:scale-95 transition-transform"
//                       title={facingMode === 'environment' ? 'Switch to front camera' : 'Switch to rear camera'}
//                     >
//                       <span style={{ display: 'inline-block', fontSize: 15 }}>🔄</span>
//                       <span>{facingMode === 'environment' ? 'Front' : 'Rear'}</span>
//                     </button>
//                   )}

//                   {/* Extra dropdown only shown on desktop/tablet with 3+ cameras */}
//                   {devices.length > 2 && (
//                     <select
//                       value={activeDeviceId || ''}
//                       onChange={e => { if (e.target.value !== activeDeviceId) switchCamera(e.target.value) }}
//                       className="bg-black/60 text-white px-2 py-1.5 rounded-full text-xs font-medium border-0 shadow"
//                       style={{ maxWidth: 130 }}
//                     >
//                       {devices.map((d, i) => (
//                         <option value={d.deviceId} key={d.deviceId}>
//                           {d.label?.trim() || `Camera ${i + 1}`}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//               </div>
//             )}

//             {!scanning && !error && (
//               <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/50">
//                 Starting camera…
//               </div>
//             )}
//           </div>
//         )}

//         {/* File upload */}
//         {mode === 'file' && (
//           <>
//             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
//             <button onClick={() => fileInputRef.current?.click()}
//               className="w-full py-10 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm flex flex-col items-center gap-2"
//             >
//               <RiImageLine className="text-3xl" />
//               <span>Tap to choose a photo of the barcode</span>
//               <span className="text-xs text-slate-300">JPG · PNG · WebP</span>
//             </button>
//           </>
//         )}

//         <p className="text-xs text-slate-400 text-center">
//           CODE-128 · EAN-13 · UPC-A · CODE-39 and more<br />
//           <b>QR codes and 2D codes are always ignored</b>
//         </p>
//       </div>

//       <style>{`
//         @keyframes scanline {
//           0%   { top: 0;    opacity: 1;   }
//           50%  { top: 74px; opacity: 0.7; }
//           100% { top: 0;    opacity: 1;   }
//         }
//       `}</style>
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

// ── Only the most common 1D formats (fewer = faster decode) ───────────────
const BARCODE_FORMATS = [
  BarcodeFormat.CODE_128,   // Most common shipping/warehouse
  BarcodeFormat.EAN_13,     // Retail
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

// ── Two readers: fast (camera) and thorough (file upload) ─────────────────
function createCameraReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  // TRY_HARDER intentionally omitted for camera — it's slow and unnecessary
  // when you have a live stream with many frames per second
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 10,   // Scan every 10ms
    delayBetweenScanSuccess: 500,   // Wait 500ms after a hit before re-scanning
  })
}

function createFileReader() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS)
  hints.set(DecodeHintType.TRY_HARDER, true)   // OK for static images
  hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
  return new BrowserMultiFormatReader(hints)
}

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
  // ── Single persistent reader ref (not recreated on every scan) ──────────
  const cameraReaderRef = useRef(null)
  const videoRef        = useRef(null)
  const fileInputRef    = useRef(null)
  const lockedRef       = useRef(false)

  const [mode, setMode]             = useState('camera')
  const [error, setError]           = useState(null)
  const [scanning, setScanning]     = useState(false)
  const [torchOn, setTorchOn]       = useState(false)
  const [lastScannedValue, setLastScannedValue] = useState(null)
  const [devices, setDevices]       = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')

  // ── Lazy-init reader (created once, reused) ───────────────────────────
  const getReader = useCallback(() => {
    if (!cameraReaderRef.current) {
      cameraReaderRef.current = createCameraReader()
    }
    return cameraReaderRef.current
  }, [])

  // ── Stop camera (just reset the reader — no manual stream teardown) ───
  const stopCamera = useCallback(() => {
    lockedRef.current = false
    try { cameraReaderRef.current?.reset() } catch (_) {}
    setScanning(false)
    setTorchOn(false)
  }, [])

  // ── Start camera ──────────────────────────────────────────────────────
  const startCamera = useCallback(async (preferredDeviceId = null, preferredFacing = null) => {
    setError(null)
    setScanning(false)
    lockedRef.current = false

    try {
      const reader = getReader()

      // Enumerate cameras (no temp stream needed — listVideoInputDevices
      // works after the first getUserMedia permission is granted by ZXing itself)
      const allDevices = await BrowserMultiFormatReader.listVideoInputDevices()
      setDevices(allDevices)

      if (allDevices.length === 0) throw new Error('No camera found')

      // Pick device
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
      setFacingMode(/front|user|facetime|selfie/i.test(selected.label) ? 'user' : 'environment')

      // decodeFromVideoDevice handles getUserMedia + stream assignment internally
      // No manual getUserMedia call needed — this was a major source of slowness
      await reader.decodeFromVideoDevice(
        selected.deviceId,
        videoRef.current,
        (result, err) => {
          if (lockedRef.current) return
          if (!result) return   // err is NotFoundException on every empty frame — ignore

          if (BLOCKED_2D.has(result.getBarcodeFormat())) return

          const text = result.getText()
          if (!text || text.length < 4) return

          lockedRef.current = true
          setLastScannedValue(text)
          stopCamera()
          onScan(text)
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
        console.error(e)
      }
    }
  }, [getReader, stopCamera, onScan])

  const flipCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
    stopCamera()
    setTimeout(() => startCamera(null, nextFacing), 150)
  }, [facingMode, stopCamera, startCamera])

  const switchCamera = useCallback(async (deviceId) => {
    stopCamera()
    setTimeout(() => startCamera(deviceId, null), 150)
  }, [stopCamera, startCamera])

  // ── Torch ─────────────────────────────────────────────────────────────
  // ZXing manages the stream internally; access via videoRef.srcObject
  const toggleTorch = useCallback(async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0]
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
      const reader = createFileReader()   // Separate thorough reader for files
      const url    = URL.createObjectURL(file)
      const img    = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })

      const canvas = document.createElement('canvas')
      const ctx    = canvas.getContext('2d')
      // Try multiple scales — improves detection on small/large barcodes
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

      const topCount  = sorted[0][1]
      const best      = sorted
        .filter(([, c]) => c === topCount)
        .map(([v]) => v)
        .reduce((a, b) => (a.length >= b.length ? a : b))

      setLastScannedValue(best)
      onScan(best)
    } catch (err) {
      if (err instanceof NotFoundException) {
        setError('No barcode detected. Make sure the full barcode is visible and well-lit.')
      } else {
        setError('Could not read image. Please try again.')
        console.error(err)
      }
    }

    e.target.value = ''
  }, [onScan])

  // ── Lifecycle ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      const t = setTimeout(() => startCamera(null), 300)
      return () => { clearTimeout(t); stopCamera() }
    } else {
      stopCamera()
    }
  }, [open, mode])   // intentionally exclude startCamera/stopCamera to avoid re-running

  useEffect(() => { if (!open) stopCamera() }, [open])

  // Destroy reader on unmount to free memory
  useEffect(() => {
    return () => {
      try { cameraReaderRef.current?.reset() } catch (_) {}
      cameraReaderRef.current = null
    }
  }, [])

  const switchMode = (m) => { if (m !== mode) { setError(null); setMode(m) } }

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

        {/* Success */}
        {lastScannedValue && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
            <span className="font-semibold">Scanned:</span>
            <span className="font-mono break-all">{lastScannedValue}</span>
            <button
              className="ml-auto px-2 py-1 rounded text-xs bg-green-200 hover:bg-green-300 text-green-800"
              onClick={() => setLastScannedValue(null)}
            >
              Clear
            </button>
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
                  <div className="absolute inset-x-0 h-0.5 bg-brand-400"
                    style={{ animation: 'scanline 1.4s ease-in-out infinite' }} />
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