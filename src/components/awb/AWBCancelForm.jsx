import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiLoader4Line } from 'react-icons/ri'
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
  const [scannerOpen, setScannerOpen] = useState(true) // open scanner by default
  const [submitting, setSubmitting] = useState(false)
  const [passcodeVerified, setPasscodeVerified] = useState(false)
  const [passcodeModal, setPasscodeModal] = useState(true)
  const [verifyingPasscode, setVerifyingPasscode] = useState(false)
  const { reset } = useForm()

  // Passcode verify flow using /awb/verify-passcode API endpoint
  const handleVerifyPasscode = async (passcode) => {
    setVerifyingPasscode(true)
    try {
      await awbAPI.verifyPasscode(passcode)
      setPasscodeVerified(true)
      setPasscodeModal(false)
      toast.success('Passcode verified')
      setScannerOpen(true)
    } catch (err) {
      let msg = 'Invalid passcode'
      if (err?.response?.data?.message) msg = err.response.data.message
      toast.error(msg)
    } finally {
      setVerifyingPasscode(false)
    }
  }

  // Cancels the AWB immediately after scan, no form
  const cancelAWB = async (awbId) => {
    setSubmitting(true)
    try {
      const res = await awbAPI.cancel(awbId)
      if (res.data?.success) {
        toast.success(res.data.message || `AWB ${awbId} cancelled`)
        reset()
        onSuccess?.()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to cancel AWB ${awbId}`)
    } finally {
      setSubmitting(false)
      // Open scanner again for next scan
      setScannerOpen(true)
    }
  }

  const onScan = (awbId) => {
    // Always toast on every scan that this id status set to cancel
    toast(`AWB ${awbId} status set to cancel`, { icon: '⚠️' })
    if (submitting) {
      // Ignore scan while canceling previous AWB
      return
    }
    setScannerOpen(false)
    cancelAWB(awbId)
  }

  // Show passcode modal first, only show scanner after passing
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
    <div className="space-y-4 bg-white p-6 rounded-2xl shadow border border-slate-200 flex flex-col items-center">
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
      />

      <div className="flex flex-col items-center gap-3 w-full justify-center pt-4">
        <p className="font-semibold text-lg text-slate-700">Scan AWB to Cancel</p>
        <p className="text-sm text-slate-500 text-center">
          This operation <b>immediately cancels</b> AWB upon scanning.<br/>
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
