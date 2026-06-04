
import React, { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiLoader4Line, RiQrScanLine } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// ─────────────────────────────────────────────────────────────────────────────
// Passcode modal — themed: only buttons/icons orange, bg black/white
// ─────────────────────────────────────────────────────────────────────────────
function PasscodeModal({ open, onVerify, onClose, verifying }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const handlePasscode = ({ passcode }) => { onVerify(passcode); reset() }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="bg-white rounded-xl shadow-lg max-w-xs w-full px-6 py-8 relative border border-black"
      >
        <button
          className="absolute right-3 top-3 text-xl"
          style={{
            color: '#f58021'
          }}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >&times;</button>
        <form onSubmit={handleSubmit(handlePasscode)} className="space-y-4">
          <h2 className="text-lg font-semibold text-center mb-2 text-black">
            Enter 5-digit Passcode
          </h2>
          <input
            {...register('passcode', {
              required: 'Passcode required',
              pattern: { value: /^\d{5}$/, message: '5-digit numeric passcode' },
            })}
            className="input-field w-full text-center tracking-widest text-lg border border-black bg-white text-black placeholder-black/60 focus:border-black focus:ring-black/20"
            placeholder="_____"
            minLength={5}
            maxLength={5}
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            disabled={verifying}
          />
          {errors.passcode && (
            <p className="text-red-500 text-xs mt-1 text-center">{errors.passcode.message}</p>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition"
            style={{
              background: '#f58021',
              color: '#fff',
              border: 'none'
            }}
            disabled={verifying}
          >
            {verifying ? <><RiLoader4Line className="animate-spin" /> Verifying...</> : 'Verify Passcode'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi select toggles for Scan type — ONLY buttons/icons orange
// ─────────────────────────────────────────────────────────────────────────────
function ScanTypeMultiSelect({ isMeesho, onChange, disabled }) {
  // Only one mode can be selected at a time: Meesho QR or Barcode
  return (
    <div className="flex items-center gap-4 justify-center w-full mb-3">
      <button
        type="button"
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border
          ${!isMeesho
            ? 'bg-[#f58021] border-[#f58021] text-white shadow'
            : 'bg-white border-black text-black'
          }
          hover:bg-[#f58021]/80 hover:text-white
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        aria-pressed={!isMeesho}
        onClick={() => !disabled && onChange(false)}
        style={{
          boxShadow: !isMeesho ? '0 1px 8px #fa89043b' : undefined,
        }}
      >
        <RiBarcodeLine className="text-lg" style={{ color: '#fff', ...(isMeesho && { color: '#f58021' }) }} />
        <span>Barcode Scan</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition border
          ${isMeesho
            ? 'bg-[#f58021] border-[#f58021] text-white shadow'
            : 'bg-white border-black text-black'
          }
          hover:bg-[#f58021]/80 hover:text-white
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        aria-pressed={isMeesho}
        onClick={() => !disabled && onChange(true)}
        style={{
          boxShadow: isMeesho ? '0 1px 8px #fa89043b' : undefined,
        }}
      >
        <RiQrScanLine className="text-lg" style={{ color: '#fff', ...(!isMeesho && { color: '#f58021' }) }} />
        <span>MEESHO PACKAGE QR SCAN</span>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component — themed: only buttons/icons orange, otherwise black/white
// ─────────────────────────────────────────────────────────────────────────────

export default function AWBCancelForm({ onSuccess, userId }) {
  // Camera (scanner) should NOT open initially
  const [scannerOpen, setScannerOpen]           = useState(false)
  const [submitting, setSubmitting]             = useState(false)
  const [passcodeVerified, setPasscodeVerified] = useState(false)
  const [passcodeModal, setPasscodeModal]       = useState(true)
  const [verifyingPasscode, setVerifyingPasscode] = useState(false)

  // ── NEW: scan type multi select state ───────────────────────────────
  const [isMeeshoOrder, setIsMeeshoOrder] = useState(false)
  // Derive the partnerName string BarcodeScanner expects:
  const partnerName = isMeeshoOrder ? 'Meesho' : ''

  const awbInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
    reset: rhfReset,
  } = useForm({ defaultValues: { awbId: '' } })

  // ── Passcode verify ───────────────────────────────────────────────
  const handleVerifyPasscode = async (passcode) => {
    setVerifyingPasscode(true)
    try {
      await awbAPI.verifyPasscode(passcode)
      setPasscodeVerified(true)
      setPasscodeModal(false)
      toast.success('Passcode verified')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid passcode')
    } finally {
      setVerifyingPasscode(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  const clearAWB = useCallback(() => {
    setValue('awbId', '', { shouldValidate: false, shouldDirty: false })
    clearErrors('awbId')
    if (awbInputRef.current) {
      awbInputRef.current.value = ''
      setTimeout(() => { awbInputRef.current?.focus() }, 0)
    }
  }, [setValue, clearErrors])

  const cancelAWB = async (awbId) => {
    setSubmitting(true)
    try {
      const res = await awbAPI.cancel(awbId)
      if (res.data?.success) {
        toast.success(res.data.message || `AWB ${awbId} cancelled`)
        rhfReset()
        onSuccess?.()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to cancel AWB ${awbId}`)
    } finally {
      setSubmitting(false)
      setScannerOpen(false)
      clearAWB()
    }
  }

  const onScan = useCallback((awbId) => {
    if (submitting) return
    setScannerOpen(false)
    if (!awbId || awbId.length < 6 || awbId.length > 30 || !/^[a-zA-Z0-9]+$/.test(awbId)) {
      toast.error('AWB must be 6-30 alphanumeric characters.')
      clearAWB()
      setScannerOpen(false)
      return
    }
    cancelAWB(awbId)
  }, [submitting, clearAWB]) // eslint-disable-line react-hooks/exhaustive-deps

  const doSubmit = useCallback(({ awbId }) => { onScan(awbId) }, [onScan])

  const handleAWBKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(doSubmit)() }
  }

  const { ref: rhfRef, ...awbRegister } = register('awbId', {
    required: 'AWB ID is required',
    minLength: { value: 6, message: 'Min 6 characters' },
    maxLength: { value: 30, message: 'Max 30 characters' },
    pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
  })

  const mergedRef = (el) => { rhfRef(el); awbInputRef.current = el }

  // ── Class shorthands — ONLY buttons/icons orange, otherwise b/w ──────
  const baseInput =
    'input-field pl-9 font-mono bg-white border border-black text-black placeholder-black/60 focus:border-black focus:ring-black/20'
  const baseButtonSecondary =
    'btn-secondary px-3 flex-shrink-0 bg-[#f58021] border border-[#f58021] hover:bg-[#f58021]/80 text-white font-semibold transition rounded-lg'
  const errorText = 'text-pink-600 text-xs mt-1'

  // ── Passcode gate ─────────────────────────────────────────────────
  if (!passcodeVerified) {
    return (
      <PasscodeModal
        open={passcodeModal}
        onVerify={handleVerifyPasscode}
        onClose={() => setPasscodeModal(false)}
        verifying={verifyingPasscode}
      />
    )
  }

  return (
    <div
      className="space-y-4 p-6 rounded-2xl shadow border border-black flex flex-col items-center w-full max-w-xl mx-auto"
      style={{
        background: '#fff'
      }}
    >

      {/* ── BarcodeScanner — receives partnerName for auto-switch ─── */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
        partnerName={partnerName}
      />

      {/* ── Multi-Select Scan Type Buttons ──────────────────────── */}
      <div className="w-full">
        <ScanTypeMultiSelect
          isMeesho={isMeeshoOrder}
          onChange={(next) => {
            setIsMeeshoOrder(next)
            if (scannerOpen) setScannerOpen(false)
          }}
          disabled={submitting}
        />
        <div className="mt-1 text-xs text-black text-center font-medium">
          {isMeeshoOrder
            ? 'Scan QR code printed on Meesho packet only'
            : 'Scan AWB barcode (not Meesho QR) only'
          }
        </div>
      </div>

      {/* ── AWB input field ────────────────────────────────────── */}
      <form className="w-full" autoComplete="off" onSubmit={handleSubmit(doSubmit)}>
        <label className="label font-medium mb-1 block text-center text-black">
          AWB ID *
        </label>
        <div className="flex gap-2 w-full justify-center">
          <div className="relative flex-1">
            <RiBarcodeLine
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#f58021' }}
            />
            <input
              {...awbRegister}
              ref={mergedRef}
              className={baseInput + ' w-full pr-3'}
              placeholder="AWB123456"
              autoComplete="off"
              onKeyDown={handleAWBKeyDown}
              disabled={submitting}
              onChange={e => awbRegister.onChange?.(e)}
              inputMode="text"
            />
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className={baseButtonSecondary}
            title="Scan barcode"
            disabled={submitting}
          >
            <RiBarcodeLine className="text-lg" style={{ color: '#fff' }} />
          </button>
        </div>
        {errors.awbId && <p className={errorText + ' text-center'}>{errors.awbId.message}</p>}
        <button type="submit" className="hidden">Submit</button>
      </form>

      {/* ── Info block ────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 w-full justify-center pt-2">
        <p className="font-semibold text-lg text-black text-center">
          Scan AWB to Cancel
        </p>
        <p className="text-sm text-black/80 text-center max-w-xs mx-auto">
          This operation <b>immediately cancels</b> AWB upon scanning or submitting.<br />
          No confirmation. Please scan carefully.
        </p>
        {submitting && (
          <div className="flex items-center gap-2 text-[#f58021] text-base mt-2">
            <RiLoader4Line className="animate-spin" />
            Cancelling AWB...
          </div>
        )}
      </div>
    </div>
  )
}