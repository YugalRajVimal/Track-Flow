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
import { TbAlertCircle, TbAlertTriangle } from 'react-icons/tb'
import dayjs from 'dayjs'
import { dashboardAPI, channelPartnersAPI, brandsAPI } from '../api/services'
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
// Light theme tokens
// ─────────────────────────────────────────────────────────────────────────────
const textSecondary  = 'text-slate-500'
const textSubtle     = 'text-slate-400'
const borderLight    = 'border-slate-200'
const bgCard         = 'bg-white'
const progressBg     = 'bg-brand-100'
const progressBar    = 'bg-brand-500'
const brandIcon      = 'text-brand-600'

// ─────────────────────────────────────────────────────────────────────────────
// DateAndFilterBar component - handles brand/channel filters
// ─────────────────────────────────────────────────────────────────────────────
function DateAndFilterBar({
  startDate,
  endDate,
  onApply,
  loading,
  channelOptions,
  brandOptions,
  channel,
  setChannel,
  brand,
  setBrand,
}) {
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
    onApply(start.format(FORMAT), end.format(FORMAT), channel, brand)
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return
    if (dayjs(customStart).isAfter(dayjs(customEnd))) return
    onApply(customStart, customEnd, channel, brand)
  }

  // channelPartnerId/_id (not .id!) for sending to backend
  const handleChannelChange = e => {
    setChannel(e.target.value)
    setBrand("")
    onApply(startDate, endDate, e.target.value, "")
  }

  const handleBrandChange = e => {
    setBrand(e.target.value)
    onApply(startDate, endDate, channel, e.target.value)
  }

  return (
    <div className={`rounded-xl border ${borderLight} ${bgCard} p-4`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <RiCalendarLine className={`${brandIcon} text-base shrink-0`} />
        <span className="text-sm font-medium text-slate-700 mr-1">Filter by date:</span>
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
      <div className="flex flex-wrap gap-3 mb-1 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Channel Partner</label>
          <select
            value={channel}
            disabled={loading}
            onChange={handleChannelChange}
            className="input-field text-sm px-3 py-1.5 w-48"
          >
            <option value="">All Channels</option>
            {/* Use _id for actual filter value */}
            {channelOptions.map(cp => (
              <option value={cp._id} key={cp._id}>{cp.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Brand</label>
          <select
            value={brand}
            disabled={loading}
            onChange={handleBrandChange}
            className="input-field text-sm px-3 py-1.5 w-48"
          >
            <option value="">All Brands</option>
            {/* Use _id for actual filter value */}
            {brandOptions.map(b => (
              <option value={b._id} key={b._id}>{b.displayName || b.name}</option>
            ))}
          </select>
        </div>
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
          {/* Find display names by _id, not .id */}
          {channelOptions.find(cp => cp._id === channel) ? (
            <> &middot; <span className="text-slate-700">{channelOptions.find(cp => cp._id === channel)?.name}</span></>
          ) : null}
          {brandOptions.find(b => b._id === brand) ? (
            <> &middot; <span className="text-slate-700">{brandOptions.find(b => b._id === brand)?.displayName || brandOptions.find(b => b._id === brand)?.name}</span></>
          ) : null}
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

  // Filter states with _id (Mongo) for value
  const [channel, setChannel] = useState("")
  const [brand, setBrand] = useState("")
  const [channelOptions, setChannelOptions] = useState([])
  const [brandOptions, setBrandOptions] = useState([])

  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [startDate, setStartDate] = useState(today)
  const [endDate,   setEndDate]   = useState(today)

  // Get channel partners list, use _id
  useEffect(() => {
    let mounted = true
    channelPartnersAPI.list()
      .then(res => {
        const list = res?.data?.data || []
        // Remove non-_id fields; just keep as is but our select uses _id now
        if(mounted) setChannelOptions(list)
      })
      .catch(()=>setChannelOptions([]))
    return () => { mounted = false }
  }, [])

  // Fetch brands for current channel (_id); send channelPartnerId as _id to filter brands API
  useEffect(() => {
    let mounted = true
    // Filter brands via selected channel Partner _id
    // Convention: brandsAPI.list({ channelPartnerId: <_id> })
    // If no channel, fetch all brands
    const apiCall = brandsAPI.list(channel ? { channelPartnerId: channel } : undefined)
    Promise.resolve(apiCall)
      .then(res => {
        const list = res?.data?.data || []
        console.log(list);
        if(mounted) setBrandOptions(list)
      })
      .catch(()=>setBrandOptions([]))
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  // Fetch stats using the filters - send channelPartnerId/brandId as _id
  const fetchStats = useCallback((start, end, _channel = channel, _brand = brand) => {
    setLoading(true)
    dashboardAPI
      .getStats({
        startDate: start,
        endDate: end,
        channelPartnerId: _channel || undefined,
        brandId: _brand || undefined,
      })
      .then(r => setStats(r.data?.data || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [channel, brand])

  // Initial load — today, all filters
  useEffect(() => { fetchStats(today, today, "", "") }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Whenever filters change from DateAndFilterBar
  const handleFiltersApply = (start, end, _channel, _brand) => {
    setStartDate(start)
    setEndDate(end)
    setChannel(_channel)
    setBrand(_brand)
    fetchStats(start, end, _channel, _brand)
  }

  // Calculate Return Percentage vs Dispatched
  const dispatched = stats?.totalDispatched ?? 0;
  const returned = stats?.totalReturnRecords ?? 0;
  const returnPercentage = dispatched > 0 ? ((returned / dispatched) * 100) : 0;

  // ── Stat cards config ─────────────────────────────────────────────
  const statCards = [
    { icon: RiBarcodeLine,        label: 'Total Scans',         value: stats?.totalScansToday,         color: 'brand'    },
    { icon: RiSendPlaneLine,      label: 'Total Dispatched',    value: stats?.totalDispatched,         color: 'emerald'  },
    { icon: RiCloseCircleLine,    label: 'Total Cancelled',     value: stats?.totalCancelled,          color: 'red'      },
    { icon: RiExchangeDollarLine, label: 'Total Return',        value: stats?.totalReturnRecords,      color: 'amber'    },
    { icon: TbAlertCircle,        label: 'AddAWB Missing',      value: stats?.awbMissingRecordsCount, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-500'},
    { icon: TbAlertTriangle,      label: 'Return Missing',      value: stats?.returnMissingRecordsCount, color: 'fuchsia', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  ]

  // ── Skeleton ──────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className={`h-16 rounded-xl ${bgCard} border ${borderLight} animate-pulse`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 animate-pulse">
          {Array(6).fill(0).map((_, i) => (
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
        {/* Refresh button for current range and filters */}
        <button
          type="button"
          onClick={() => fetchStats(startDate, endDate, channel, brand)}
          disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5 self-start"
        >
          <RiRefreshLine className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Date + Filters Bar */}
      <DateAndFilterBar
        startDate={startDate}
        endDate={endDate}
        onApply={handleFiltersApply}
        loading={loading}
        channelOptions={channelOptions}
        brandOptions={brandOptions}
        channel={channel}
        setChannel={setChannel}
        brand={brand}
        setBrand={setBrand}
      />

      {/* Stat cards — shimmer overlay while refetching */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {statCards.map((card, i) => (
          <div key={card.label} className={card.bg ? `${card.bg} rounded-xl` : ''}>
            <StatCard {...card} index={i}
              iconColor={card.text ? card.text : undefined}
            />
          </div>
        ))}
      </div>

      {/* Percentage Dispatched Vs Returns */}
      <div className={`mt-1`}>
        <div
          className={`rounded-xl border ${borderLight} ${bgCard} p-4 flex items-center gap-4`}
        >
          <span className="font-semibold text-slate-900">
            Dispatched vs Returns:
          </span>
          <span className="text-slate-900 text-lg font-mono">
            {dispatched} Dispatched
            <span className="mx-2 text-slate-400">/</span>
            {returned} Returns
          </span>
          <span className="ml-6 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E'
                }}>
            {`Return % of Dispatched: ${dispatched > 0 ? returnPercentage.toFixed(2) : '0.00'}%`}
          </span>
        </div>
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
          <h2 className="section-title mb-4 text-slate-900">Dispatched Analytics</h2>
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

        {/* Return Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl border ${borderLight} ${bgCard} p-5`}
        >
          <h2 className="section-title mb-4 text-slate-900">Return Analytics</h2>
          {stats?.returnAnalytics?.length > 0 ? (
            <div className="space-y-3">
              {stats.returnAnalytics.map((ra, i) => {
                const total = stats.returnAnalytics.reduce((s, x) => s + (x.totalReturns || x.count || 0), 0)
                const count = ra.totalReturns || ra.count || 0
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textSubtle}>
                        {ra.channelPartnerName || ra.partnerName || ra.name}
                      </span>
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
            <p className={`${textSecondary} text-sm`}>No return data for selected range</p>
          )}
        </motion.div>
      </div>

      {/* Bottom row 2: Recent Activities */}
      <div className={`mt-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
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
                        {activity.channelPartner?.name || ''} · {activity.brand?.displayName || activity.brand?.name || ''}
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