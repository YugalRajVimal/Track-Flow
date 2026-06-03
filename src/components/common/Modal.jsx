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
            className={`bg-white text-[#191919] shadow-xl rounded-lg w-full ${maxWidth} modal-content border-2 border-orange-200`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-orange-200 bg-[#fff8f2] rounded-t-lg">
                <h2 className="text-base font-semibold text-[#f58021]">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-[#f58021] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#f58021]/90 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  style={{
                    border: '1px solid #f58021',
                    background: 'white'
                  }}
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
            )}
            <div className="p-5 bg-white">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
