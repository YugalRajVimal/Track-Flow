import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from 'react-icons/ri'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`bg-white text-slate-900 shadow-xl rounded-lg w-full ${maxWidth} modal-content`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-slate-200"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
