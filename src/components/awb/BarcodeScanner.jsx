// import React, { useEffect, useRef, useState } from 'react'
// import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode'
// import { RiBarcodeLine } from 'react-icons/ri'
// import Modal from '../common/Modal'

// export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
//   const scannerRef = useRef(null)
//   const [error, setError] = useState(null)
//   const [scanning, setScanning] = useState(false)

//   useEffect(() => {
//     if (!open) return

//     const timerId = setTimeout(() => {
//       try {
//         const scanner = new Html5QrcodeScanner(
//           'qr-reader',
//           {
//             fps: 10,
//             qrbox: { width: 250, height: 120 },
//             supportedScanTypes: [
//               Html5QrcodeScanType.SCAN_TYPE_CAMERA,
//               Html5QrcodeScanType.SCAN_TYPE_FILE,
//             ],
//             rememberLastUsedCamera: true,
//             // Only enable 1D barcode formats, disable QR
//             formatsToSupport: [
//               Html5QrcodeSupportedFormats.CODE_128,
//               Html5QrcodeSupportedFormats.CODE_39,
//               Html5QrcodeSupportedFormats.CODE_93,
//               Html5QrcodeSupportedFormats.EAN_13,
//               Html5QrcodeSupportedFormats.EAN_8,
//               Html5QrcodeSupportedFormats.UPC_A,
//               Html5QrcodeSupportedFormats.UPC_E,
//               Html5QrcodeSupportedFormats.ITF,
//               Html5QrcodeSupportedFormats.AZTEC, // Remove if you think this is 2D (optional)
//               // DO NOT include Html5QrcodeSupportedFormats.QR_CODE
//             ]
//           },
//           false
//         )

//         scanner.render(
//           (decodedText, decodedResult) => {
//             // Only process if not QR code (defensive: should be filtered, but double-check)
//             if (decodedResult && decodedResult.result && decodedResult.result.format) {
//               if (decodedResult.result.format.formatName === 'QR_CODE') {
//                 // ignore QR codes
//                 return
//               }
//             }
//             scanner.clear().catch(() => {})
//             onScan(decodedText)
//             onClose()
//           },
//           (err) => {
//             // silently ignore scan errors (camera frames without acceptable barcode)
//           }
//         )

//         scannerRef.current = scanner
//         setScanning(true)
//       } catch (e) {
//         setError('Camera access failed. Please allow camera permissions.')
//       }
//     }, 300)

//     return () => {
//       clearTimeout(timerId)
//       if (scannerRef.current) {
//         scannerRef.current.clear().catch(() => {})
//         scannerRef.current = null
//       }
//       setScanning(false)
//       setError(null)
//     }
//   }, [open])

//   return (
//     <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
//       <div className="space-y-4 bg-white text-slate-800">
//         <div className="flex items-center gap-2 text-sm text-slate-500">
//           <RiBarcodeLine className="text-brand-500" />
//           <span>Point camera at barcode only</span>
//         </div>

//         {error ? (
//           <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
//             {error}
//           </div>
//         ) : (
//           <div
//             id="qr-reader"
//             className="rounded-xl overflow-hidden [&_.html5-qrcode-element]:text-slate-700 [&_button]:btn-secondary-light [&_select]:input-field-light [&_video]:rounded-xl bg-slate-50"
//           />
//         )}

//         <p className="text-xs text-slate-400 text-center">
//           Supports camera scanning and file upload.<br />
//           <b>Only barcodes will be scanned. QR codes will be ignored.</b>
//         </p>
//       </div>
//     </Modal>
//   )
// }


import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { RiBarcodeLine } from 'react-icons/ri'
import Modal from '../common/Modal'

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [mode, setMode] = useState('camera') // 'camera' | 'file'

  const BARCODE_FORMATS = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
  ]

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        // State 2 = SCANNING, State 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (e) {
        // ignore cleanup errors
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  const startCameraScanner = async () => {
    setError(null)
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader-camera', {
        formatsToSupport: BARCODE_FORMATS,
        verbose: false,
      })
      scannerRef.current = html5Qrcode

      // Get rear camera preferentially
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found')
      }

      // Prefer rear/environment camera
      const rearCamera = cameras.find(c =>
        /back|rear|environment/i.test(c.label)
      ) || cameras[cameras.length - 1]

      await html5Qrcode.start(
        { deviceId: { exact: rearCamera.id } },
        {
          fps: 15,                          // higher fps = better for camera
          qrbox: { width: 280, height: 100 }, // wide & short for 1D barcodes
          aspectRatio: 1.7778,              // 16:9 keeps camera stable
          disableFlip: false,
        },
        (decodedText) => {
          stopScanner().then(() => {
            onScan(decodedText)
            onClose()
          })
        },
        () => { /* ignore per-frame failures */ }
      )

      setScanning(true)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('Permission') || msg.includes('permission') || msg.includes('NotAllowed')) {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (msg.includes('No camera')) {
        setError('No camera found on this device.')
      } else {
        setError('Could not start camera. Try uploading an image instead.')
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    try {
      // Use a separate hidden div for file scanning to avoid conflicts
      const html5Qrcode = new Html5Qrcode('qr-reader-file', {
        formatsToSupport: BARCODE_FORMATS,
        verbose: false,
      })

      const result = await html5Qrcode.scanFile(file, true)
      html5Qrcode.clear()
      onScan(result)
      onClose()
    } catch (e) {
      setError('No barcode found in image. Please try another image or use the camera.')
    }

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  useEffect(() => {
    if (!open) return
    setMode('camera')

    const timerId = setTimeout(() => {
      startCameraScanner()
    }, 400)

    return () => {
      clearTimeout(timerId)
      stopScanner()
      setError(null)
    }
  }, [open])

  // When switching modes
  useEffect(() => {
    if (!open) return
    if (mode === 'camera') {
      stopScanner().then(() => startCameraScanner())
    } else {
      stopScanner()
    }
  }, [mode])

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 bg-white text-slate-800">

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'camera'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => setMode('camera')}
          >
            📷 Camera
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'file'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => setMode('file')}
          >
            🖼 Upload Image
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RiBarcodeLine className="text-brand-500" />
          <span>
            {mode === 'camera'
              ? 'Point camera at barcode — hold steady'
              : 'Upload an image containing a barcode'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Camera viewer */}
        <div
          id="qr-reader-camera"
          className={`rounded-xl overflow-hidden bg-slate-50 ${mode !== 'camera' ? 'hidden' : ''}`}
        />

        {/* Hidden div required by html5-qrcode for file scanning */}
        <div id="qr-reader-file" className="hidden" />

        {/* File upload UI */}
        {mode === 'file' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Click to choose an image
            </button>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center">
          Supports CODE-128, EAN-13, UPC-A, and more.<br />
          <b>QR codes are ignored.</b>
        </p>
      </div>
    </Modal>
  )
}