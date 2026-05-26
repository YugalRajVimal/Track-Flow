import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiBarcodeLine, RiQrScanLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri'
import { awbAPI } from '../../api/awb'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import BarcodeScanner from './BarcodeScanner'

export default function AWBScanForm({ onSuccess }) {
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm()
  const selectedPartner = watch('channelPartnerId')

  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
  }, [])

  useEffect(() => {
    if (!selectedPartner) { setBrands([]); return }
    setLoadingBrands(true)
    brandsAPI.listByPartner(selectedPartner)
      .then(r => setBrands(r.data?.data || []))
      .finally(() => setLoadingBrands(false))
  }, [selectedPartner])

  const onScan = (awbId) => {
    setValue('awbId', awbId, { shouldValidate: true })
    toast.success(`Scanned: ${awbId}`)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await awbAPI.scan(data)
      if (res.data?.success) {
        toast.success(res.data.message || 'AWB scanned successfully')
        reset()
        onSuccess?.()
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to scan AWB'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Light theme classes
  const baseInput =
    "input-field pl-9 font-mono bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
  const baseSelect =
    "select-field bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-200"
  const baseLabel = "label text-slate-700"
  const baseButtonPrimary =
    "btn-primary w-full justify-center py-3 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 flex items-center gap-2"
  const baseButtonSecondary =
    "btn-secondary px-3 flex-shrink-0 bg-slate-100 border border-slate-300 hover:bg-blue-100 text-blue-600"
  const errorText = "text-pink-600 text-xs mt-1"

  return (
    <>
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={onScan}
        title="Scan AWB Barcode"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Channel Partner */}
        <div>
          <label className={baseLabel}>Channel Partner *</label>
          <div className="relative">
            <select
              {...register('channelPartnerId', { required: 'Channel partner is required' })}
              className={baseSelect}
            >
              <option value="">Select channel partner...</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {errors.channelPartnerId && (
            <p className={errorText}>{errors.channelPartnerId.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className={baseLabel}>Brand *</label>
          <select
            {...register('brandId', { required: 'Brand is required' })}
            className={baseSelect}
            disabled={!selectedPartner || loadingBrands}
          >
            <option value="">
              {!selectedPartner ? 'Select partner first...' : loadingBrands ? 'Loading brands...' : 'Select brand...'}
            </option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          {errors.brandId && (
            <p className={errorText}>{errors.brandId.message}</p>
          )}
        </div>

        {/* AWB ID */}
        <div>
          <label className={baseLabel}>AWB ID *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RiBarcodeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                {...register('awbId', {
                  required: 'AWB ID is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                  maxLength: { value: 30, message: 'Max 30 characters' },
                  pattern: { value: /^[a-zA-Z0-9]+$/, message: 'Alphanumeric only' },
                })}
                className={baseInput}
                placeholder="AWB123456"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className={baseButtonSecondary}
              title="Scan barcode"
            >
              <RiQrScanLine className="text-lg" />
            </button>
          </div>
          {errors.awbId && (
            <p className={errorText}>{errors.awbId.message}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className={baseButtonPrimary}>
          {submitting ? (
            <><RiLoader4Line className="animate-spin" /> Scanning...</>
          ) : (
            <><RiSendPlane2Line /> Submit Scan</>
          )}
        </button>
      </form>
    </>
  )
}
