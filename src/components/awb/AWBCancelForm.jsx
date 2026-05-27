import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiCloseCircleLine, RiQrScanLine, RiLoader4Line, RiBarcodeLine } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// Passcode modal for 5-digit entry
function PasscodeModal({ open, onVerify, onClose, verifying }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const handlePasscode = ({ passcode }) => {
    onVerify(passcode)
    reset()
  }
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
              pattern: { value: /^\d{5}$/, message: '5-digit numeric passcode' }
            })}
            className="input-field w-full text-center tracking-widest text-lg"
            placeholder="_____" 
            minLength={5} maxLength={5}
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            disabled={verifying}
          />
          {errors.passcode && <p className="text-red-500 text-xs mt-1 text-center">{errors.passcode.message}</p>}
          <button
            type="submit"
            className="btn-brand w-full flex items-center justify-center gap-2 py-2"
            disabled={verifying}
          >
            {verifying ? (
              <>
                <RiLoader4Line className="animate-spin" />
                Verifying...
              </>
            ) : 'Verify Passcode'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Requires userId prop
export default function AWBCancelForm({ onSuccess, userId }) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [passcodeVerified, setPasscodeVerified] = useState(false)
  const [passcodeModal, setPasscodeModal] = useState(true)
  const [verifyingPasscode, setVerifyingPasscode] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm()

  // Passcode verify flow using /awb/verify-passcode API endpoint
  const handleVerifyPasscode = async (passcode) => {
    setVerifyingPasscode(true)
    try {
      // The endpoint used is /awb/verify-passcode as corrected in the followup
      await awbAPI.verifyPasscode(passcode)
      setPasscodeVerified(true)
      setPasscodeModal(false)
      toast.success('Passcode verified')
    } catch (err) {
      // Don't log the user out, just keep them on the page and show error
      let msg = 'Invalid passcode'
      if (err?.response?.data?.message) msg = err.response.data.message
      toast.error(msg)
      // Do not sign out or reset passcodeVerified or modal state
    } finally {
      setVerifyingPasscode(false)
    }
  }

  const onScan = (awbId) => {
    setValue('awbId', awbId, { shouldValidate: true })
    toast.success(`Scanned: ${awbId}`)
  }

  const onSubmit = async ({ awbId }) => {
    setSubmitting(true)
    try {
      const res = await awbAPI.cancel(awbId)
      if (res.data?.success) {
        toast.success(res.data.message || 'AWB cancelled')
        reset()
        onSuccess?.()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel AWB')
    } finally {
      setSubmitting(false)
    }
  }

  // Show passcode modal first, only show form after passing
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
    <>
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl shadow border border-slate-200">
        <div>
          <label className="label text-slate-700 font-medium">AWB ID to Cancel *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('awbId', {
                  required: 'AWB ID is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                  maxLength: { value: 30, message: 'Max 30 characters' },
                  pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
                })}
                className="input-field pl-9 font-mono bg-white border border-slate-200 text-slate-900 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30"
                placeholder="Enter AWB to cancel..."
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-200 hover:bg-brand-100 transition"
              tabIndex={-1}
              aria-label="Scan AWB barcode"
              title="Scan AWB barcode"
            >
              <RiQrScanLine className="text-lg text-brand-600" />
            </button>
          </div>
          {errors.awbId && <p className="text-red-500 text-xs mt-1">{errors.awbId.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={submitting} 
          className="btn-danger w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow transition-colors disabled:bg-red-200 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <RiLoader4Line className="animate-spin" /> 
              <span className="tracking-wide">Cancelling...</span>
            </>
          ) : (
            <>
              <RiCloseCircleLine /> 
              <span className="tracking-wide">Cancel AWB</span>
            </>
          )}
        </button>
      </form>
    </>
  )
}
