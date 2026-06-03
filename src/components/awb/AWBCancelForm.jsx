
import React, { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiLoader4Line, RiQrScanLine } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// ─────────────────────────────────────────────────────────────────────────────
// Passcode modal — color theme update (white + #f58021)
// ─────────────────────────────────────────────────────────────────────────────
function PasscodeModal({ open, onVerify, onClose, verifying }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const handlePasscode = ({ passcode }) => { onVerify(passcode); reset() }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="bg-white rounded-xl shadow-lg max-w-xs w-full px-6 py-8 relative border"
        style={{
          borderColor: '#f58021'
        }}
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
          <h2 className="text-lg font-semibold text-center mb-2" style={{ color: '#f58021' }}>
            Enter 5-digit Passcode
          </h2>
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
            style={{
              borderColor: '#f58021',
              background: '#fff'
            }}
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
// Multi select toggles for Scan type — white & #f58021 theme
// ─────────────────────────────────────────────────────────────────────────────
function ScanTypeMultiSelect({ isMeesho, onChange, disabled }) {
  // Only one mode can be selected at a time: Meesho QR or Barcode
  return (
    <div className="flex items-center gap-4 justify-center w-full mb-3">
      <button
        type="button"
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-medium transition
          ${!isMeesho
            ? 'bg-[#f5802115] border-[#f58021] text-[#f58021] shadow'
            : 'bg-white border-[#f58021]/30 text-[#f58021]'
          }
          hover:bg-[#f5802120] hover:border-[#f58021]
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        aria-pressed={!isMeesho}
        onClick={() => !disabled && onChange(false)}
        style={{
          boxShadow: !isMeesho ? '0 1px 8px #fa89043b' : undefined,
        }}
      >
        <RiBarcodeLine className="text-lg" style={{ color: '#f58021' }} />
        <span>Barcode Scan</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-medium transition
          ${isMeesho
            ? 'bg-[#f5802115] border-[#f58021] text-[#f58021] shadow'
            : 'bg-white border-[#f58021]/30 text-[#f58021]'
          }
          hover:bg-[#f5802120] hover:border-[#f58021]
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        aria-pressed={isMeesho}
        onClick={() => !disabled && onChange(true)}
        style={{
          boxShadow: isMeesho ? '0 1px 8px #fa89043b' : undefined,
        }}
      >
        <RiQrScanLine className="text-lg" style={{ color: '#f58021' }} />
        <span>QR Scan</span>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component — color theme update (white & #f58021)
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

  // ── Class shorthands — Use only white + orange theme ──────────────
  const baseInput =
    'input-field pl-9 font-mono bg-white border border-[#f58021] text-[#f58021] placeholder-[#f58021]/60 focus:border-[#f58021] focus:ring-[#f58021]/20'
  const baseButtonSecondary =
    'btn-secondary px-3 flex-shrink-0 bg-white border border-[#f58021] hover:bg-[#f5802111] hover:border-[#f58021] text-[#f58021] font-semibold transition rounded-lg'
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
      className="space-y-4 p-6 rounded-2xl shadow border flex flex-col items-center w-full max-w-md mx-auto"
      style={{
        background: '#fff',
        borderColor: '#f58021',
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
        <div className="mt-1 text-xs text-[#f58021] text-center font-medium">
          {isMeeshoOrder
            ? 'Scan QR code printed on Meesho packet only'
            : 'Scan AWB barcode (not Meesho QR) only'
          }
        </div>
      </div>

      {/* ── AWB input field ────────────────────────────────────── */}
      <form className="w-full" autoComplete="off" onSubmit={handleSubmit(doSubmit)}>
        <label className="label font-medium mb-1 block text-center" style={{ color: "#f58021" }}>
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
            <RiBarcodeLine className="text-lg" style={{ color: '#f58021' }} />
          </button>
        </div>
        {errors.awbId && <p className={errorText + ' text-center'}>{errors.awbId.message}</p>}
        <button type="submit" className="hidden">Submit</button>
      </form>

      {/* ── Info block ────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 w-full justify-center pt-2">
        <p className="font-semibold text-lg text-[#f58021] text-center">
          Scan AWB to Cancel
        </p>
        <p className="text-sm text-[#f58021]/80 text-center max-w-xs mx-auto">
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