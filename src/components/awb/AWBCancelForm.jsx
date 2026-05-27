import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiCloseCircleLine, RiQrScanLine, RiLoader4Line, RiBarcodeLine, RiDeleteBack2Line } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// Simple calculator-keyboard for entering a 5-digit passcode
function PasscodeKeyboard({ value, onChange, disabled }) {
  const handleClick = (digit) => {
    if (disabled) return
    if (digit === 'back') {
      onChange(value.slice(0, -1))
    } else if (value.length < 5) {
      onChange(value + digit)
    }
  }
  return (
    <div className="grid grid-cols-3 gap-2 mt-2 w-44 mx-auto">
      {[...'123456789'].map(n =>
        <button
          key={n}
          type="button"
          disabled={disabled}
          className="h-10 rounded bg-slate-100 hover:bg-brand-100 text-lg font-mono text-slate-700 border border-slate-200 transition"
          onClick={() => handleClick(n)}
        >{n}</button>
      )}
      <span className=""/>
      <button
        type="button"
        disabled={disabled}
        className="h-10 rounded bg-slate-100 hover:bg-brand-100 text-lg font-mono text-slate-700 border border-slate-200 transition"
        onClick={() => handleClick('0')}
      >0</button>
      <button
        type="button"
        disabled={disabled}
        className="h-10 rounded bg-slate-100 hover:bg-red-100 border border-slate-200 flex items-center justify-center"
        onClick={() => handleClick('back')}
        aria-label="Erase"
        tabIndex={-1}
      >
        <RiDeleteBack2Line className="text-xl text-red-500"/>
      </button>
    </div>
  )
}

export default function AWBCancelForm({ onSuccess }) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [passcode, setPasscode] = useState('')
  const { register, handleSubmit, setValue, reset, formState: { errors }, setError, clearErrors } = useForm()

  const onScan = (awbId) => {
    setValue('awbId', awbId, { shouldValidate: true })
    toast.success(`Scanned: ${awbId}`)
  }

  const onSubmit = async ({ awbId }) => {
    if (passcode.length !== 5) {
      setError('passcode', { type: 'manual', message: 'Enter 5-digit passcode' })
      return
    } else {
      clearErrors('passcode')
    }
    setSubmitting(true)
    try {
      const res = await awbAPI.cancel(awbId, { passcode })
      if (res.data?.success) {
        toast.success(res.data.message || 'AWB cancelled')
        reset()
        setPasscode('')
        onSuccess?.()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel AWB')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan to Cancel AWB"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-2xl shadow border border-slate-200">
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
                disabled={submitting}
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-200 hover:bg-brand-100 transition"
              tabIndex={-1}
              aria-label="Scan AWB barcode"
              title="Scan AWB barcode"
              disabled={submitting}
            >
              <RiQrScanLine className="text-lg text-brand-600" />
            </button>
          </div>
          {errors.awbId && <p className="text-red-500 text-xs mt-1">{errors.awbId.message}</p>}
        </div>

        <div>
          <label className="label text-slate-700 font-medium">Your Passcode *</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{5}"
            maxLength={5}
            className="input-field w-44 text-center tracking-widest font-mono text-lg bg-white border border-slate-200 text-slate-900 select-none"
            value={passcode}
            placeholder="•••••"
            disabled
            readOnly
            tabIndex={-1}
            style={{ letterSpacing: '0.35em', WebkitTextSecurity: 'disc' }}
          />
          <PasscodeKeyboard 
            value={passcode} 
            onChange={v => {
              if (/^\d{0,5}$/.test(v)) setPasscode(v)
              if (v.length === 5) clearErrors('passcode')
            }}
            disabled={submitting}
          />
          {errors.passcode && <p className="text-red-500 text-xs mt-1">{errors.passcode.message}</p>}
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
