import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from 'react-icons/ri'

const ORANGE = '#f58021'
const BLACK = '#191919'
const WHITE = '#ffffff'

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
            className={`bg-white text-black shadow-xl rounded-lg w-full ${maxWidth} modal-content border-2 border-orange-200`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-orange-200 bg-white rounded-t-lg">
                <h2 className="text-base font-semibold text-black">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white bg-[#f58021] hover:bg-[#191919] transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  style={{
                    border: `1px solid ${ORANGE}`,
                    background: ORANGE
                  }}
                >
                  <RiCloseLine className="text-xl" style={{ color: WHITE }} />
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
