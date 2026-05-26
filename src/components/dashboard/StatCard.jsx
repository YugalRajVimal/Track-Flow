import React from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'brand', trend, index = 0 }) {
  // Light theme color palette
  const colorMap = {
    brand: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      glow: 'rgba(99,102,241,0.09)',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-500',
      border: 'border-emerald-200',
      glow: 'rgba(16,185,129,0.10)',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-500',
      border: 'border-red-200',
      glow: 'rgba(239,68,68,0.09)',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-500',
      border: 'border-amber-200',
      glow: 'rgba(245,158,11,0.09)',
    },
  }
  const c = colorMap[color] || colorMap.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`stat-card border ${c.border} hover:border-indigo-300 bg-white rounded-xl shadow-sm relative transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`text-xl ${c.text}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {value?.toLocaleString() ?? '—'}
        </div>
        <div className="text-sm text-slate-500 mt-1">{label}</div>
      </div>
      {/* decorative */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)` }}
      />
    </motion.div>
  )
}
