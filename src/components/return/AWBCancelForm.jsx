import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiLoader4Line } from 'react-icons/ri'
import { returnAPI } from '../../api/return'
import BarcodeScanner from './BarcodeScanner'

// Orange only for buttons and icons; black/white everywhere else
const PRIMARY_ORANGE = '#f58021'
const TEXT_BLACK = '#18181b'
const BORDER_BLACK = '#18181b'

function PasscodeModal({ open, onVerify, onClose, verifying }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const handlePasscode = ({ passcode }) => {
    onVerify(passcode)
    reset()
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="bg-white rounded-xl shadow-lg max-w-xs w-full px-6 py-8 relative border"
        style={{ borderColor: BORDER_BLACK }}
      >
        <button
          className="absolute right-3 top-3 text-xl"
          style={{
            color: PRIMARY_ORANGE,
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >&times;</button>
        <form onSubmit={handleSubmit(handlePasscode)} className="space-y-4">
          <h2
            className="text-lg font-semibold text-center mb-2"
            style={{ color: TEXT_BLACK }}
          >
            Enter 5-digit Passcode
          </h2>
          <input
            {...register('passcode', {
              required: 'Passcode required',
              pattern: { value: /^\d{5}$/, message: '5-digit numeric passcode' }
            })}
            className="w-full text-center tracking-widest text-lg rounded border px-4 py-2 transition-all"
            style={{
              borderColor: BORDER_BLACK,
              color: TEXT_BLACK,
              background: 'white',
            }}
            placeholder="_____"
            minLength={5}
            maxLength={5}
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            disabled={verifying}
          />
          {errors.passcode && (
            <p className="text-xs mt-1 text-center" style={{ color: '#e53e3e' }}>
              {errors.passcode.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 font-semibold rounded transition-all"
            disabled={verifying}
            style={{
              background: PRIMARY_ORANGE,
              color: 'white',
              opacity: verifying ? 0.6 : 1,
            }}
          >
            {verifying ? (
              <>
                {/* Only the icon is orange, text is white */}
                <RiLoader4Line className="animate-spin" style={{ color: 'white' }} />
                Verifying...
              </>
            ) : 'Verify Passcode'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AWBCancelForm({ onSuccess, userId }) {
  const [scannerOpen, setScannerOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [passcodeVerified, setPasscodeVerified] = useState(false)
  const [passcodeModal, setPasscodeModal] = useState(true)
  const [verifyingPasscode, setVerifyingPasscode] = useState(false)
  const { reset } = useForm()

  // Passcode verify flow using /awb/verify-passcode API endpoint
  const handleVerifyPasscode = async (passcode) => {
    setVerifyingPasscode(true)
    try {
      await returnAPI.verifyPasscode(passcode)
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
      const res = await returnAPI.cancel(awbId)
      if (res.data?.success) {
        toast.success(res.data.message || `AWB ${awbId} cancelled`)
        reset()
        onSuccess?.()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to cancel AWB ${awbId}`)
    } finally {
      setSubmitting(false)
      setScannerOpen(true)
    }
  }

  const onScan = (awbId) => {
    toast(`AWB ${awbId} status set to cancel`, { icon: '⚠️' })
    if (submitting) {
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
    <div
      className="space-y-4 p-6 rounded-2xl shadow flex flex-col items-center border"
      style={{
        background: 'white',
        borderColor: BORDER_BLACK,
      }}
    >
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
        accentColor={PRIMARY_ORANGE}
        iconColor={PRIMARY_ORANGE}
        // (BarcodeScanner should use accentColor/iconColor for orange, otherwise stays b/w themed)
      />

      <div className="flex flex-col items-center gap-3 w-full justify-center pt-4">
        <p
          className="font-semibold text-lg"
          style={{ color: TEXT_BLACK }}
        >
          Scan AWB to Cancel
        </p>
        <p className="text-sm text-center" style={{ color: TEXT_BLACK, fontWeight: 500 }}>
          This operation <b style={{ color: '#d12e2e' }}>immediately cancels</b> AWB upon scanning.<br />
          No confirmation. Please scan carefully.
        </p>
        {submitting && (
          <div className="flex items-center gap-2 text-base mt-2" style={{ color: '#d12e2e' }}>
            {/* The loader icon itself should be orange for visual affordance */}
            <RiLoader4Line className="animate-spin" style={{ color: PRIMARY_ORANGE }} />
            Cancelling AWB...
          </div>
        )}
      </div>
    </div>
  )
}
