// import React, { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import {
//   RiBarcodeLine, RiSendPlaneLine, RiCloseCircleLine, RiTimeLine, RiExchangeDollarLine
// } from 'react-icons/ri'
// import dayjs from 'dayjs'
// import { dashboardAPI } from '../api/services'
// import StatCard from '../components/dashboard/StatCard'
// import ScanActivityChart from '../components/dashboard/ScanActivityChart'
// import BrandAnalyticsChart from '../components/dashboard/BrandAnalyticsChart'
// import StatusBadge from '../components/common/StatusBadge'

// // --- Light theme color palette ---
// const textPrimary = 'text-slate-800'
// const textSecondary = 'text-slate-500'
// const textSubtle = 'text-slate-400'
// const borderLight = 'border-slate-200'
// const bgCard = 'bg-white'
// const surfaceHighlight = 'bg-brand-50'
// const progressBg = 'bg-brand-100'
// const progressBar = 'bg-brand-500'
// const brandIcon = 'text-brand-600'
// const accentMono = 'font-mono text-slate-700'

// export default function DashboardPage() {
//   const [stats, setStats] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     dashboardAPI.getStats()
//       .then(r => setStats(r.data?.data || null))
//       .catch(() => setStats(null))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
//         {Array(4).fill(0).map((_, i) => (
//           <div key={i} className={`h-36 rounded-xl ${bgCard} border ${borderLight}`} />
//         ))}
//       </div>
//     )
//   }

//   const statCards = [
//     { icon: RiBarcodeLine, label: 'Total Scans Today', value: stats?.totalScansToday, color: 'brand' },
//     { icon: RiSendPlaneLine, label: 'Total Dispatched', value: stats?.totalDispatched, color: 'emerald' },
//     { icon: RiCloseCircleLine, label: 'Total Cancelled', value: stats?.totalCancelled, color: 'red' },
//     { icon: RiExchangeDollarLine, label: 'Total Return', value: stats?.totalReturnRecords, color: 'amber' },
//   ]

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div>
//         <h1 className="page-title text-slate-900">Dashboard</h1>
//         <p className={`${textSubtle} text-sm mt-1`}>
//           Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
//         </p>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {statCards.map((card, i) => (
//           <StatCard key={card.label} {...card} index={i} />
//         ))}
//       </div>

//       {/* Charts row */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//         {/* Scan Activity */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.25 }}
//           className={`rounded-xl border ${borderLight} ${bgCard} p-5 xl:col-span-2`}
//         >
//           <h2 className="section-title mb-4 text-slate-900">Scan Activity</h2>
//           <ScanActivityChart data={stats?.scanActivityGraph} />
//         </motion.div>

//         {/* Brand Analytics */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
//         >
//           <h2 className="section-title mb-4 text-slate-900">Brand Analytics</h2>
//           <BrandAnalyticsChart data={stats?.brandAnalytics} />
//         </motion.div>
//       </div>

//       {/* Bottom row */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//         {/* Channel Partner Analytics */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.35 }}
//           className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
//         >
//           <h2 className="section-title mb-4 text-slate-900">Channel Partner Analytics</h2>
//           {stats?.channelPartnerAnalytics?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.channelPartnerAnalytics.map((cp, i) => {
//                 const total = stats.channelPartnerAnalytics.reduce((s, x) => s + (x.totalScans || x.count || 0), 0)
//                 const count = cp.totalScans || cp.count || 0
//                 const pct = total > 0 ? Math.round((count / total) * 100) : 0
//                 return (
//                   <div key={i}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className={`${textSubtle}`}>{cp.partnerName || cp.name}</span>
//                       <span className={`${textSecondary} font-mono`}>{count}</span>
//                     </div>
//                     <div className={`h-2 rounded-full overflow-hidden ${progressBg}`}>
//                       <div
//                         className={`h-full ${progressBar} rounded-full transition-all duration-500`}
//                         style={{ width: `${pct}%` }}
//                       />
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           ) : (
//             <p className={`${textSecondary} text-sm`}>No data available</p>
//           )}
//         </motion.div>

//         {/* Recent Activities */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
//         >
//           <h2 className="section-title mb-4 flex items-center gap-2 text-slate-900">
//             <RiTimeLine className={`${brandIcon}`} />
//             Recent Activities
//           </h2>
//           {stats?.recentActivities?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.recentActivities.slice(0, 6).map((activity, i) => (
//                 <div
//                   key={i}
//                   className={`flex items-center justify-between py-2 border-b ${borderLight} last:border-0`}
//                 >
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
//                     <div className="min-w-0">
//                       <div className="text-sm text-slate-900 font-mono truncate">
//                         {activity.awbId || activity.awb}
//                       </div>
//                       <div className="text-xs text-slate-500 truncate">
//                         {activity.channelPartner?.name || ''} · {activity.brand?.name || ''}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2 flex-shrink-0 ml-2">
//                     <StatusBadge status={activity.status} />
//                     <span className={`${textSecondary} text-xs hidden sm:block`}>
//                       {dayjs(activity.scannedAt || activity.createdAt).format('HH:mm')}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className={`${textSecondary} text-sm`}>No recent activities</p>
//           )}
//         </motion.div>
//       </div>
//     </div>
//   )
// }


import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  RiBarcodeLine, RiSendPlaneLine, RiCloseCircleLine, RiTimeLine,
  RiExchangeDollarLine, RiCalendarLine, RiRefreshLine,
} from 'react-icons/ri'
import dayjs from 'dayjs'
import { dashboardAPI } from '../api/services'
import StatCard from '../components/dashboard/StatCard'
import ScanActivityChart from '../components/dashboard/ScanActivityChart'
import BrandAnalyticsChart from '../components/dashboard/BrandAnalyticsChart'
import StatusBadge from '../components/common/StatusBadge'

// ─────────────────────────────────────────────────────────────────────────────
// Preset ranges
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Today',      getDates: () => ({ start: dayjs().startOf('day'),          end: dayjs().endOf('day') }) },
  { label: 'Yesterday',  getDates: () => ({ start: dayjs().subtract(1,'day').startOf('day'), end: dayjs().subtract(1,'day').endOf('day') }) },
  { label: 'Last 7 days',getDates: () => ({ start: dayjs().subtract(6,'day').startOf('day'), end: dayjs().endOf('day') }) },
  { label: 'Last 30 days',getDates:() => ({ start: dayjs().subtract(29,'day').startOf('day'),end: dayjs().endOf('day') }) },
  { label: 'This month', getDates: () => ({ start: dayjs().startOf('month'),        end: dayjs().endOf('day') }) },
  { label: 'Custom',     getDates: null },
]

const FORMAT = 'YYYY-MM-DD'

// ─────────────────────────────────────────────────────────────────────────────
// Light theme tokens (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const textSecondary  = 'text-slate-500'
const textSubtle     = 'text-slate-400'
const borderLight    = 'border-slate-200'
const bgCard         = 'bg-white'
const progressBg     = 'bg-brand-100'
const progressBar    = 'bg-brand-500'
const brandIcon      = 'text-brand-600'

// ─────────────────────────────────────────────────────────────────────────────
// DateRangeFilter component
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeFilter({ startDate, endDate, onApply, loading }) {
  const [activePreset, setActivePreset] = useState('Today')
  const [customStart, setCustomStart]   = useState(startDate)
  const [customEnd,   setCustomEnd]     = useState(endDate)
  const [showCustom,  setShowCustom]    = useState(false)

  const handlePreset = (preset) => {
    setActivePreset(preset.label)
    if (preset.label === 'Custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    const { start, end } = preset.getDates()
    onApply(start.format(FORMAT), end.format(FORMAT))
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return
    if (dayjs(customStart).isAfter(dayjs(customEnd))) return
    onApply(customStart, customEnd)
  }

  return (
    <div className={`rounded-xl border ${borderLight} ${bgCard} p-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <RiCalendarLine className={`${brandIcon} text-base shrink-0`} />
        <span className="text-sm font-medium text-slate-700 mr-1">Filter by date:</span>

        {/* Preset pills */}
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => handlePreset(preset)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activePreset === preset.label
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-brand-50 hover:border-brand-300'
            } disabled:opacity-50`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs — shown only when "Custom" is selected */}
      {showCustom && (
        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd || dayjs().format(FORMAT)}
              onChange={e => setCustomStart(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={dayjs().format(FORMAT)}
              onChange={e => setCustomEnd(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36"
            />
          </div>
          <button
            type="button"
            disabled={!customStart || !customEnd || loading || dayjs(customStart).isAfter(dayjs(customEnd))}
            onClick={handleCustomApply}
            className="btn-brand px-4 py-1.5 text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <RiRefreshLine className={loading ? 'animate-spin' : ''} />
            Apply
          </button>
          {customStart && customEnd && dayjs(customStart).isAfter(dayjs(customEnd)) && (
            <p className="text-xs text-red-500 self-center">"From" must be before "To"</p>
          )}
        </div>
      )}

      {/* Active range display */}
      {activePreset !== 'Custom' && (
        <p className="text-xs text-slate-400 mt-2">
          Showing data for&nbsp;
          <span className="text-slate-600 font-medium">
            {startDate === endDate
              ? dayjs(startDate).format('MMM D, YYYY')
              : `${dayjs(startDate).format('MMM D, YYYY')} – ${dayjs(endDate).format('MMM D, YYYY')}`}
          </span>
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = dayjs().format(FORMAT)

  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [startDate, setStartDate] = useState(today)
  const [endDate,   setEndDate]   = useState(today)

  const fetchStats = useCallback((start, end) => {
    setLoading(true)
    dashboardAPI
      .getStats({ startDate: start, endDate: end })   // ← passes dates to API
      .then(r => setStats(r.data?.data || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  // Initial load — today
  useEffect(() => { fetchStats(today, today) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateApply = (start, end) => {
    setStartDate(start)
    setEndDate(end)
    fetchStats(start, end)
  }

  // ── Stat cards config ─────────────────────────────────────────────
  const statCards = [
    { icon: RiBarcodeLine,        label: 'Total Scans',      value: stats?.totalScansToday,    color: 'brand'   },
    { icon: RiSendPlaneLine,      label: 'Total Dispatched', value: stats?.totalDispatched,    color: 'emerald' },
    { icon: RiCloseCircleLine,    label: 'Total Cancelled',  value: stats?.totalCancelled,     color: 'red'     },
    { icon: RiExchangeDollarLine, label: 'Total Return',     value: stats?.totalReturnRecords, color: 'amber'   },
  ]

  // ── Skeleton ──────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className={`h-16 rounded-xl ${bgCard} border ${borderLight} animate-pulse`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={`h-36 rounded-xl ${bgCard} border ${borderLight}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-slate-900">Dashboard</h1>
          <p className={`${textSubtle} text-sm mt-1`}>
            Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        {/* Refresh button for current range */}
        <button
          type="button"
          onClick={() => fetchStats(startDate, endDate)}
          disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5 self-start"
        >
          <RiRefreshLine className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Date filter ─────────────────────────────────────────────── */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onApply={handleDateApply}
        loading={loading}
      />

      {/* Stat cards — shimmer overlay while refetching */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className={`grid grid-cols-1 xl:grid-cols-3 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5 xl:col-span-2`}
        >
          <h2 className="section-title mb-4 text-slate-900">Scan Activity</h2>
          <ScanActivityChart data={stats?.scanActivityGraph} />
        </motion.div>

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
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>

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
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textSubtle}>{cp.partnerName || cp.channelPartnerName || cp.name}</span>
                      <span className="text-slate-500 font-mono">{count}</span>
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
            <p className={`${textSecondary} text-sm`}>No data for selected range</p>
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
            <RiTimeLine className={brandIcon} />
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