import React from 'react'
import Modal from './Modal'
import { RiAlertLine } from 'react-icons/ri'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm Action'} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <RiAlertLine className="text-red-500 text-xl" />
        </div>
        <div>
          <p className="text-sm text-slate-700">{message || 'Are you sure? This action cannot be undone.'}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-danger"
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
