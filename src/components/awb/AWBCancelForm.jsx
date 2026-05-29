
import React, { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiLoader4Line, RiQrScanLine } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// ─────────────────────────────────────────────────────────────────────────────
// Passcode modal — unchanged from original
// ─────────────────────────────────────────────────────────────────────────────
function PasscodeModal({ open, onVerify, onClose, verifying }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const handlePasscode = ({ passcode }) => { onVerify(passcode); reset() }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-lg max-w-xs w-full px-6 py-8 relative border border-slate-200">
        <button
          className="absolute right-3 top-3 text-xl text-slate-400 hover:text-slate-600"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >&times;</button>
        <form onSubmit={handleSubmit(handlePasscode)} className="space-y-4">
          <h2 className="text-lg font-semibold text-center mb-2">Enter 5-digit Passcode</h2>
          <input
            {...register('passcode', {
              required: 'Passcode required',
              pattern: { value: /^\d{5}$/, message: '5-digit numeric passcode' },
            })}
            className="input-field w-full text-center tracking-widest text-lg"
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
            className="btn-brand w-full flex items-center justify-center gap-2 py-2"
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
// Meesho toggle — pill-style switch with label
// ─────────────────────────────────────────────────────────────────────────────
function MeeshoToggle({ value, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 w-full">
      <div className="flex items-center gap-2">
        {value ? (
          <RiQrScanLine className="text-orange-500 text-lg shrink-0" />
        ) : (
          <RiBarcodeLine className="text-blue-500 text-lg shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-slate-700 leading-tight">
            {value ? 'Meesho order' : 'Standard order'}
          </p>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            {value ? 'Scanning QR codes only' : 'Scanning barcodes only'}
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-400 disabled:opacity-50 ${
          value ? 'bg-orange-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

// Requires userId prop
export default function AWBCancelForm({ onSuccess, userId }) {
  const [scannerOpen, setScannerOpen]           = useState(true)
  const [submitting, setSubmitting]             = useState(false)
  const [passcodeVerified, setPasscodeVerified] = useState(false)
  const [passcodeModal, setPasscodeModal]       = useState(true)
  const [verifyingPasscode, setVerifyingPasscode] = useState(false)

  // ── NEW: Meesho toggle state ──────────────────────────────────────
  const [isMeeshoOrder, setIsMeeshoOrder] = useState(false)
  // Derive the partnerName string BarcodeScanner expects:
  // pass "Meesho" when toggled on, empty string otherwise.
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
      setScannerOpen(true)
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
      setScannerOpen(true)
      clearAWB()
    }
  }

  const onScan = useCallback((awbId) => {
    if (submitting) return
    setScannerOpen(false)
    if (!awbId || awbId.length < 6 || awbId.length > 30 || !/^[a-zA-Z0-9]+$/.test(awbId)) {
      toast.error('AWB must be 6-30 alphanumeric characters.')
      clearAWB()
      setScannerOpen(true)
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

  // ── Class shorthands ──────────────────────────────────────────────
  const baseInput =
    'input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200'
  const baseButtonSecondary =
    'btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600'
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
    <div className="space-y-4 bg-white p-6 rounded-2xl shadow border border-slate-200 flex flex-col items-center w-full max-w-md mx-auto">

      {/* ── BarcodeScanner — receives partnerName so it auto-switches ── */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
        partnerName={partnerName}
      />

      {/* ── Meesho toggle ─────────────────────────────────────────── */}
      <div className="w-full">
        <MeeshoToggle
          value={isMeeshoOrder}
          onChange={(next) => {
            setIsMeeshoOrder(next)
            // If scanner is open, closing + reopening forces BarcodeScanner
            // to restart with the new format set immediately.
            if (scannerOpen) {
              setScannerOpen(false)
              setTimeout(() => setScannerOpen(true), 150)
            }
          }}
          disabled={submitting}
        />
      </div>

      {/* ── AWB input field ───────────────────────────────────────── */}
      <form className="w-full" autoComplete="off" onSubmit={handleSubmit(doSubmit)}>
        <label className="label text-slate-700 font-medium mb-1 block text-center">AWB ID *</label>
        <div className="flex gap-2 w-full justify-center">
          <div className="relative flex-1">
            <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
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
            <RiBarcodeLine className="text-lg" />
          </button>
        </div>
        {errors.awbId && <p className={errorText + ' text-center'}>{errors.awbId.message}</p>}
        <button type="submit" className="hidden">Submit</button>
      </form>

      {/* ── Info block ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 w-full justify-center pt-2">
        <p className="font-semibold text-lg text-slate-700 text-center">Scan AWB to Cancel</p>
        <p className="text-sm text-slate-500 text-center max-w-xs mx-auto">
          This operation <b>immediately cancels</b> AWB upon scanning or submitting.<br />
          No confirmation. Please scan carefully.
        </p>
        {submitting && (
          <div className="flex items-center gap-2 text-red-600 text-base mt-2">
            <RiLoader4Line className="animate-spin" />
            Cancelling AWB...
          </div>
        )}
      </div>
    </div>
  )
}