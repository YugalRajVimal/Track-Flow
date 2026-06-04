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
            <label className="block text-sm font-semibold text-black mb-2">
              {field.label} {field.required && <span className="text-orange-600">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  ...(field.validation || {}),
                })}
                className="w-full bg-white border border-black text-black rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 appearance-none cursor-pointer"
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
                className="w-full bg-white border border-black text-black rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 resize-none"
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
                className="w-full bg-white border border-black text-black rounded-lg px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
                placeholder={field.placeholder}
                autoComplete="off"
              />
            )}
            {errors[field.name] && (
              <p className="text-orange-600 text-xs mt-1">{errors[field.name].message}</p>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-orange-500 border border-orange-600 text-white hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-medium transition-colors flex items-center gap-2 ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-orange-600'
            }`}
          >
            {loading ? <><RiLoader4Line className="animate-spin text-orange-200" /> Saving...</> : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
