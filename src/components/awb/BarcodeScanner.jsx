import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { RiQrScanLine } from 'react-icons/ri'
import Modal from '../common/Modal'

export default function BarcodeScanner({ open, onClose, onScan, title = 'Scan Barcode' }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!open) return

    const timerId = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 120 },
            supportedScanTypes: [
              Html5QrcodeScanType.SCAN_TYPE_CAMERA,
              Html5QrcodeScanType.SCAN_TYPE_FILE,
            ],
            rememberLastUsedCamera: true,
          },
          false
        )

        scanner.render(
          (decodedText) => {
            scanner.clear().catch(() => {})
            onScan(decodedText)
            onClose()
          },
          (err) => {
            // silently ignore scan errors (camera frames without QR)
          }
        )

        scannerRef.current = scanner
        setScanning(true)
      } catch (e) {
        setError('Camera access failed. Please allow camera permissions.')
      }
    }, 300)

    return () => {
      clearTimeout(timerId)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      setScanning(false)
      setError(null)
    }
  }, [open])

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 bg-white text-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RiQrScanLine className="text-brand-500" />
          <span>Point camera at barcode or QR code</span>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        ) : (
          <div
            id="qr-reader"
            className="rounded-xl overflow-hidden [&_.html5-qrcode-element]:text-slate-700 [&_button]:btn-secondary-light [&_select]:input-field-light [&_video]:rounded-xl bg-slate-50"
          />
        )}

        <p className="text-xs text-slate-400 text-center">
          Supports camera scanning and file upload
        </p>
      </div>
    </Modal>
  )
}
