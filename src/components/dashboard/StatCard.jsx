import React from 'react'
import { motion } from 'framer-motion'

// #f58021 palette for StatCard
export default function StatCard({ icon: Icon, label, value, color = 'brand', trend, index = 0 }) {
  // Orange/white theme color palette
  const colorMap = {
    brand: {
      bg: 'bg-[#fff8f2]',
      text: 'text-[#f58021]',
      border: 'border-orange-200',
      glow: 'rgba(245,128,33,0.11)', // 0.11 just to show, tweak as desired
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      glow: 'rgba(16,185,129,0.08)',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-500',
      border: 'border-red-200',
      glow: 'rgba(239,68,68,0.08)',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-500',
      border: 'border-amber-200',
      glow: 'rgba(245,158,11,0.09)',
    },
  }
  // Always use orange/white as fallback for 'brand'
  const c = colorMap[color] || colorMap.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={
        `stat-card border ${c.border}  h-full hover:border-[#f58021] bg-white rounded-xl shadow-sm relative transition-all duration-300`
      }
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`text-xl ${c.text}`} />
        </div>
        {trend !== undefined && (
          <span className={
            `text-xs font-medium px-2 py-1 rounded-lg ${
              trend >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            }`
          }>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold text-[#191919] tracking-tight">
          {value?.toLocaleString() ?? '—'}
        </div>
        <div className="text-sm text-orange-400 mt-1">{label}</div>
      </div>
      {/* decorative orange glow */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)` }}
      />
    </motion.div>
  )
}
