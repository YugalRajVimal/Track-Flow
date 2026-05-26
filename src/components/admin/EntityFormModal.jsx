import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { RiLoader4Line } from 'react-icons/ri'
import Modal from '../common/Modal'

export default function EntityFormModal({
  open, onClose, onSubmit, title, fields, defaultValues, loading
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (open) reset(defaultValues || {})
  }, [open, defaultValues])

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  ...(field.validation || {}),
                })}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300 appearance-none cursor-pointer"
              >
                <option value="">Select {field.label}...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                })}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300 resize-none"
                rows={3}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                type={field.type || 'text'}
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  ...(field.validation || {}),
                })}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300"
                placeholder={field.placeholder}
                autoComplete="off"
              />
            )}
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md bg-brand-500 text-white text-sm font-medium transition-colors flex items-center gap-2 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-brand-600'
            }`}
          >
            {loading ? <><RiLoader4Line className="animate-spin" /> Saving...</> : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
