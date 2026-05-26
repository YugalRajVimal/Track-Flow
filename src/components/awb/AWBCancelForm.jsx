import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiCloseCircleLine, RiQrScanLine, RiLoader4Line, RiBarcodeLine } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import BarcodeScanner from './BarcodeScanner'

// This component already uses a light theme via input-field, btn, and background styles,
// which are defined as light theme in index.css by default. 
// To ensure extra clarity for "light theme", all used classes here
// are the default ones, which remain in line with the project's light theme config.

export default function AWBCancelForm({ onSuccess }) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm()

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
