import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RiBarcodeLine, RiSendPlaneLine, RiCloseCircleLine, RiTimeLine
} from 'react-icons/ri'
import dayjs from 'dayjs'
import { dashboardAPI } from '../api/services'
import StatCard from '../components/dashboard/StatCard'
import ScanActivityChart from '../components/dashboard/ScanActivityChart'
import BrandAnalyticsChart from '../components/dashboard/BrandAnalyticsChart'
import StatusBadge from '../components/common/StatusBadge'

// --- Light theme color palette ---
const textPrimary = 'text-slate-800'
const textSecondary = 'text-slate-500'
const textSubtle = 'text-slate-400'
const borderLight = 'border-slate-200'
const bgCard = 'bg-white'
const surfaceHighlight = 'bg-brand-50'
const progressBg = 'bg-brand-100'
const progressBar = 'bg-brand-500'
const brandIcon = 'text-brand-600'
const accentMono = 'font-mono text-slate-700'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data?.data || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className={`h-36 rounded-xl ${bgCard} border ${borderLight}`} />
        ))}
      </div>
    )
  }

  const statCards = [
    { icon: RiBarcodeLine, label: 'Total Scans Today', value: stats?.totalScansToday, color: 'brand' },
    { icon: RiSendPlaneLine, label: 'Total Dispatched', value: stats?.totalDispatched, color: 'emerald' },
    { icon: RiCloseCircleLine, label: 'Total Cancelled', value: stats?.totalCancelled, color: 'red' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title text-slate-900">Dashboard</h1>
        <p className={`${textSubtle} text-sm mt-1`}>
          Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Scan Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5 xl:col-span-2`}
        >
          <h2 className="section-title mb-4 text-slate-900">Scan Activity</h2>
          <ScanActivityChart data={stats?.scanActivityGraph} />
        </motion.div>

        {/* Brand Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
        >
          <h2 className="section-title mb-4 text-slate-900">Brand Analytics</h2>
          <BrandAnalyticsChart data={stats?.brandAnalytics} />
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Channel Partner Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
        >
          <h2 className="section-title mb-4 text-slate-900">Channel Partner Analytics</h2>
          {stats?.channelPartnerAnalytics?.length > 0 ? (
            <div className="space-y-3">
              {stats.channelPartnerAnalytics.map((cp, i) => {
                const total = stats.channelPartnerAnalytics.reduce((s, x) => s + (x.totalScans || x.count || 0), 0)
                const count = cp.totalScans || cp.count || 0
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${textSubtle}`}>{cp.partnerName || cp.name}</span>
                      <span className={`${textSecondary} font-mono`}>{count}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${progressBg}`}>
                      <div
                        className={`h-full ${progressBar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className={`${textSecondary} text-sm`}>No data available</p>
          )}
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
        >
          <h2 className="section-title mb-4 flex items-center gap-2 text-slate-900">
            <RiTimeLine className={`${brandIcon}`} />
            Recent Activities
          </h2>
          {stats?.recentActivities?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 6).map((activity, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-2 border-b ${borderLight} last:border-0`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-900 font-mono truncate">
                        {activity.awbId || activity.awb}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {activity.channelPartner?.name || ''} · {activity.brand?.name || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <StatusBadge status={activity.status} />
                    <span className={`${textSecondary} text-xs hidden sm:block`}>
                      {dayjs(activity.scannedAt || activity.createdAt).format('HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${textSecondary} text-sm`}>No recent activities</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
