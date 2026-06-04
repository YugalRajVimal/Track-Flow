import React from 'react'
import Modal from './Modal'
import { RiAlertLine } from 'react-icons/ri'

/*
  ConfirmDialog theme:
  - Orange (#f58021) only for buttons, backgrounds, and icons
  - All other UI (text, border, etc.) in black or white
*/
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  const ORANGE = '#f58021'
  const ORANGE_BG = '#fff8f2'
  const BORDER = '#191919'
  const BLACK = '#191919'
  const WHITE = '#ffffff'

  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm Action'} maxWidth="max-w-md">
      <div className="flex gap-4">
        {/* Orange background and icon; border black */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: ORANGE_BG,
            border: `1.5px solid ${BORDER}`,
          }}
        >
          <RiAlertLine style={{ color: ORANGE, fontSize: '1.35rem' }} />
        </div>
        <div>
          <p className="text-sm" style={{ color: BLACK }}>
            {message || 'Are you sure? This action cannot be undone.'}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border font-medium transition"
          style={{
            border: `1.5px solid ${BLACK}`,
            background: WHITE,
            color: ORANGE,
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium shadow disabled:opacity-60 transition"
          style={{
            background: ORANGE,
            color: WHITE,
          }}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
