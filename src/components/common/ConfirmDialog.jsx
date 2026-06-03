import React from 'react'
import Modal from './Modal'
import { RiAlertLine } from 'react-icons/ri'

/* 
  White & #f58021 (orange) theme for confirm dialogs.
  Buttons and icon are orange, text dark/neutral.
*/
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm Action'} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#fff8f2] flex items-center justify-center flex-shrink-0 border border-orange-200">
          <RiAlertLine className="text-[#f58021] text-xl" />
        </div>
        <div>
          <p className="text-sm text-slate-800">{message || 'Are you sure? This action cannot be undone.'}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-orange-200 bg-white text-[#f58021] font-medium hover:bg-[#fff8f2] transition"
        >Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#f58021] text-white font-medium shadow hover:bg-[#e67518] disabled:opacity-60 transition"
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
