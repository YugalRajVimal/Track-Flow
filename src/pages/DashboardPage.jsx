
// import React, { useEffect, useState, useCallback } from 'react'
// import { motion } from 'framer-motion'
// import {
//   RiBarcodeLine, RiSendPlaneLine, RiCloseCircleLine, RiTimeLine,
//   RiExchangeDollarLine, RiCalendarLine, RiRefreshLine,
// } from 'react-icons/ri'
// import { TbAlertCircle, TbAlertTriangle } from 'react-icons/tb'
// import dayjs from 'dayjs'
// import { dashboardAPI, channelPartnersAPI, brandsAPI } from '../api/services'
// import StatCard from '../components/dashboard/StatCard'
// import ScanActivityChart from '../components/dashboard/ScanActivityChart'
// import BrandAnalyticsChart from '../components/dashboard/BrandAnalyticsChart'
// import StatusBadge from '../components/common/StatusBadge'

// // Preset ranges
// const PRESETS = [
//   { label: 'Today',      getDates: () => ({ start: dayjs().startOf('day'),          end: dayjs().endOf('day') }) },
//   { label: 'Yesterday',  getDates: () => ({ start: dayjs().subtract(1,'day').startOf('day'), end: dayjs().subtract(1,'day').endOf('day') }) },
//   { label: 'Last 7 days',getDates: () => ({ start: dayjs().subtract(6,'day').startOf('day'), end: dayjs().endOf('day') }) },
//   { label: 'Last 30 days',getDates:() => ({ start: dayjs().subtract(29,'day').startOf('day'),end: dayjs().endOf('day') }) },
//   { label: 'This month', getDates: () => ({ start: dayjs().startOf('month'),        end: dayjs().endOf('day') }) },
//   { label: 'Custom',     getDates: null },
// ]

// const FORMAT = 'YYYY-MM-DD'
// const orange = "#f58021"
// const borderLight    = 'border-gray-200'
// const bgCard         = 'bg-white'
// const brandIcon      = 'text-[#f58021]'
// const btnBrand       = `bg-[#f58021] text-white border-[#f58021] hover:bg-[#f58021]/90`
// const btnBrandOutline = `bg-white text-[#f58021] border-[#f58021] hover:bg-[#f58021]/10`
// const focusRing      = "focus:ring-2 focus:ring-[#f58021]"

// /**
//  * Date and Filter Bar for Dashboard/Offline
//  * @param {*} props
//  */
// function DateAndFilterBar({
//   startDate,
//   endDate,
//   onApply,
//   loading,
//   showBrandAndChannel,
//   channelOptions = [],
//   brandOptions = [],
//   channel = "",
//   setChannel = () => {},
//   brand = "",
//   setBrand = () => {},
// }) {
//   const [activePreset, setActivePreset] = useState('Today')
//   const [customStart, setCustomStart] = useState(startDate)
//   const [customEnd, setCustomEnd] = useState(endDate)
//   const [showCustom, setShowCustom] = useState(false)

//   // On preset button click (Today, 7 days, Custom)
//   const handlePreset = preset => {
//     setActivePreset(preset.label)
//     if (preset.label === 'Custom') {
//       setShowCustom(true)
//       return
//     }
//     setShowCustom(false)
//     const { start, end } = preset.getDates()
//     onApply(start.format(FORMAT), end.format(FORMAT), channel, brand)
//   }

//   const handleCustomApply = () => {
//     if (!customStart || !customEnd) return
//     if (dayjs(customStart).isAfter(dayjs(customEnd))) return
//     onApply(customStart, customEnd, channel, brand)
//   }

//   const handleChannelChange = e => {
//     setChannel(e.target.value)
//     setBrand("")
//     onApply(startDate, endDate, e.target.value, "")
//   }

//   const handleBrandChange = e => {
//     setBrand(e.target.value)
//     onApply(startDate, endDate, channel, e.target.value)
//   }

//   return (
//     <div className={`rounded-xl border ${borderLight} ${bgCard} p-4`}>
//       <div className="flex flex-wrap items-center gap-2 mb-3">
//         <RiCalendarLine className={`${brandIcon} text-base shrink-0`} />
//         <span className={`text-sm font-medium text-black mr-1`}>Filter by date:</span>
//         {PRESETS.map(preset => (
//           <button
//             key={preset.label}
//             type="button"
//             disabled={loading}
//             onClick={() => handlePreset(preset)}
//             className={`
//               px-3 py-1 rounded-full text-xs font-medium transition-colors border
//               ${activePreset === preset.label
//                 ? `bg-[#f58021] text-white border-[#f58021]`
//                 : `bg-white text-[#f58021] border-gray-200 hover:bg-orange-50 hover:border-[#f58021]`}
//               disabled:opacity-50
//             `}
//           >
//             {preset.label}
//           </button>
//         ))}
//       </div>
//       {showBrandAndChannel && (
//         <div className="flex flex-wrap gap-3 mb-1 items-end">
//           <div className="flex flex-col">
//             <label className="text-xs text-gray-800 mb-1">Channel Partner</label>
//             <select
//               value={channel}
//               disabled={loading}
//               onChange={handleChannelChange}
//               className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black`}
//             >
//               <option value="">All Channels</option>
//               {channelOptions.map(cp => (
//                 <option value={cp._id} key={cp._id}>{cp.name}</option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs text-gray-800 mb-1">Brand</label>
//             <select
//               value={brand}
//               disabled={loading}
//               onChange={handleBrandChange}
//               className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black`}
//             >
//               <option value="">All Brands</option>
//               {brandOptions.map(b => (
//                 <option value={b._id} key={b._id}>{b.displayName || b.name}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       )}

//       {showCustom && (
//         <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-gray-100">
//           <div className="flex flex-col gap-1">
//             <label className="text-xs text-gray-800">From</label>
//             <input
//               type="date"
//               value={customStart}
//               max={customEnd || dayjs().format(FORMAT)}
//               onChange={e => setCustomStart(e.target.value)}
//               className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label className="text-xs text-gray-800">To</label>
//             <input
//               type="date"
//               value={customEnd}
//               min={customStart}
//               max={dayjs().format(FORMAT)}
//               onChange={e => setCustomEnd(e.target.value)}
//               className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black"
//             />
//           </div>
//           <button
//             type="button"
//             disabled={!customStart || !customEnd || loading || dayjs(customStart).isAfter(dayjs(customEnd))}
//             onClick={handleCustomApply}
//             className={`px-4 py-1.5 text-sm flex items-center gap-1.5 rounded ${btnBrand} disabled:opacity-50`}
//           >
//             <RiRefreshLine className={loading ? 'animate-spin' : ''} />
//             Apply
//           </button>
//           {customStart && customEnd && dayjs(customStart).isAfter(dayjs(customEnd)) && (
//             <p className="text-xs text-red-500 self-center">"From" must be before "To"</p>
//           )}
//         </div>
//       )}

//       {activePreset !== 'Custom' && (
//         <p className="text-xs text-gray-400 mt-2">
//           Showing data for&nbsp;
//           <span className="text-[#f58021] font-medium">
//             {startDate === endDate
//               ? dayjs(startDate).format('MMM D, YYYY')
//               : `${dayjs(startDate).format('MMM D, YYYY')} – ${dayjs(endDate).format('MMM D, YYYY')}`}
//           </span>
//           {showBrandAndChannel && channelOptions.find(cp => cp._id === channel) ? (
//             <> &middot; <span className="text-[#f58021]">{channelOptions.find(cp => cp._id === channel)?.name}</span></>
//           ) : null}
//           {showBrandAndChannel && brandOptions.find(b => b._id === brand) ? (
//             <> &middot; <span className="text-[#f58021]">{brandOptions.find(b => b._id === brand)?.displayName || brandOptions.find(b => b._id === brand)?.name}</span></>
//           ) : null}
//         </p>
//       )}
//     </div>
//   )
// }


// // Main Page
// export default function DashboardPage() {
//   const today = dayjs().format(FORMAT)
//   // Main dashboard
//   const [channel, setChannel] = useState("")
//   const [brand, setBrand] = useState("")
//   const [channelOptions, setChannelOptions] = useState([])
//   const [brandOptions, setBrandOptions] = useState([])
//   const [stats, setStats] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [startDate, setStartDate] = useState(today)
//   const [endDate, setEndDate] = useState(today)

//   // Offline Analytics
//   const [offlineStartDate, setOfflineStartDate] = useState(today)
//   const [offlineEndDate, setOfflineEndDate] = useState(today)
//   // Note: no channel/brand filter, as per backend service (OfflineRecord is date-only)
//   const [offlineAnalytics, setOfflineAnalytics] = useState([])
//   const [offlineLoading, setOfflineLoading] = useState(true)

//   // Setup dashboard (AWB) filters
//   useEffect(() => {
//     let mounted = true
//     channelPartnersAPI.list()
//       .then(res => {
//         const list = res?.data?.data || []
//         if (mounted) setChannelOptions(list)
//       })
//       .catch(() => setChannelOptions([]))
//     return () => { mounted = false }
//   }, [])

//   useEffect(() => {
//     let mounted = true
//     const apiCall = brandsAPI.list(channel ? { channelPartnerId: channel } : undefined)
//     Promise.resolve(apiCall)
//       .then(res => {
//         const list = res?.data?.data || []
//         if (mounted) setBrandOptions(list)
//       })
//       .catch(() => setBrandOptions([]))
//     return () => { mounted = false }
//   }, [channel])

//   // Main + offline combined fetch, 
//   // matches @dashboard.service.js - offlineAnalytics is separate & only by date (not by channel/brand)
//   const fetchDashboardAndOfflineStats = useCallback((_props = {}) => {
//     setLoading(true)
//     setOfflineLoading(true)
//     dashboardAPI
//       .getStats({
//         startDate, endDate, channelPartnerId: channel || undefined, brandId: brand || undefined,
//         offlineStartDate, offlineEndDate,
//       })
//       .then(r => {
//         setStats(r.data?.data || null)
//         setOfflineAnalytics(r.data?.data?.offlineAnalytics || [])
//       })
//       .catch(() => {
//         setStats(null)
//         setOfflineAnalytics([])
//       })
//       .finally(() => {
//         setLoading(false)
//         setOfflineLoading(false)
//       })
//     // eslint-disable-next-line
//   }, [startDate, endDate, channel, brand, offlineStartDate, offlineEndDate])

//   useEffect(() => {
//     fetchDashboardAndOfflineStats()
//     // eslint-disable-next-line
//   }, [])

//   // Dashboard filter apply
//   const handleFiltersApply = (start, end, _channel, _brand) => {
//     setStartDate(start)
//     setEndDate(end)
//     setChannel(_channel)
//     setBrand(_brand)
//     setLoading(true)
//     setTimeout(fetchDashboardAndOfflineStats, 0)
//   }

//   // Offline filter apply (only dates, no channel/brand)
//   const handleOfflineFiltersApply = (start, end) => {
//     setOfflineStartDate(start)
//     setOfflineEndDate(end)
//     setOfflineLoading(true)
//     setTimeout(fetchDashboardAndOfflineStats, 0)
//   }

//   // Stat cards for the main dashboard (AWB/Return)
//   const dispatched = stats?.totalDispatched ?? 0
//   const returned = stats?.totalReturnRecords ?? 0
//   const totalOfflineRecords = stats?.totalOfflineRecords ?? 0
//   const returnPercentage = dispatched > 0 ? ((returned / dispatched) * 100) : 0

//   const statCards = [
//     { icon: RiBarcodeLine,        label: 'Total Scans',         value: stats?.totalScansToday,           color: 'orange',   bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//     { icon: RiSendPlaneLine,      label: 'Net Dispatched',      value: stats?.totalDispatched,           color: 'orange',   bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//     { icon: RiCloseCircleLine,    label: 'Total Cancelled',     value: stats?.totalCancelled,            color: 'orange',   bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//     { icon: RiExchangeDollarLine, label: 'Total Return',        value: stats?.totalReturnRecords,        color: 'orange',   bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//     { icon: TbAlertCircle,        label: 'Total Missed Packages', value: stats?.awbMissingRecordsCount,  color: 'orange',   bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//     { icon: TbAlertTriangle,      label: 'Total Missed Returns', value: stats?.returnMissingRecordsCount, color: 'orange',  bg: 'bg-white', text: 'text-[#f58021]', iconColor: 'text-[#f58021]' },
//   ]
//   // Insert Total Offline Records after Total Return
//   statCards.splice(4, 0, {
//     icon: RiTimeLine,
//     label: 'Total Offline Records',
//     value: totalOfflineRecords,
//     color: 'orange',
//     bg: 'bg-white',
//     text: 'text-[#f58021]',
//     iconColor: 'text-[#f58021]',
//   })

//   if (loading && !stats) {
//     return (
//       <div className="space-y-6">
//         <div className={`h-16 rounded-xl ${bgCard} border ${borderLight} animate-pulse`} />
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 animate-pulse">
//           {Array(7).fill(0).map((_, i) => (
//             <div key={i} className={`h-36 rounded-xl ${bgCard} border ${borderLight}`} />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // For new offline stats display
//   const totalOfflineQty = offlineAnalytics?.reduce?.((acc, row) => acc + (row.totalQty || 0), 0) || 0
//   const totalOfflineAmount = offlineAnalytics?.reduce?.((acc, row) => acc + (row.totalAmount || 0), 0) || 0

//   return (
//     <div className="space-y-6 animate-fade-in bg-white">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="page-title text-black">Dashboard</h1>
//           <p className={`text-gray-400 text-sm mt-1`}>
//             Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={() => fetchDashboardAndOfflineStats()}
//           disabled={loading}
//           className={`flex items-center gap-1.5 text-sm px-3 py-1.5 self-start rounded border ${btnBrandOutline} disabled:opacity-50`}
//         >
//           <RiRefreshLine className={loading ? 'animate-spin text-[#f58021]' : 'text-[#f58021]'} />
//           Refresh
//         </button>
//       </div>

//       {/* Date + Filters Bar */}
//       <DateAndFilterBar
//         startDate={startDate}
//         endDate={endDate}
//         onApply={handleFiltersApply}
//         loading={loading}
//         channelOptions={channelOptions}
//         brandOptions={brandOptions}
//         channel={channel}
//         setChannel={setChannel}
//         brand={brand}
//         setBrand={setBrand}
//         showBrandAndChannel={true}
//       />

//       {/* Stat cards */}
//       <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
//         {statCards.map((card, i) => (
//           <div key={card.label} className={`bg-white rounded-xl border border-gray-200`}>
//             <StatCard {...card} index={i}
//               iconColor={card.iconColor}
//               textColor="text-black"
//             />
//           </div>
//         ))}
//       </div>

//       {/* Percentage Dispatched Vs Returns */}
//       <div className="mt-1">
//         <div
//           className={`
//             rounded-xl border ${borderLight} ${bgCard} p-4 
//             flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4
//           `}
//         >
//           <span className="font-semibold text-black">
//             Dispatched vs Returns:
//           </span>
//           <span className="text-black text-lg font-mono">
//             {dispatched} Dispatched
//             <span className="mx-2 text-gray-400">/</span>
//             {returned} Returns
//           </span>
//           <span
//             className="sm:ml-6 px-2 py-1 rounded text-xs font-medium mt-2 sm:mt-0"
//             style={{
//               backgroundColor: orange,
//               color: '#fff',
//               border: '1px solid #f58021'
//             }}
//           >
//             {`Return % of Dispatched: ${dispatched > 0 ? returnPercentage.toFixed(2) : '0.00'}%`}
//           </span>
//         </div>
//       </div>

//       {/* Charts row */}
//       <div className={`grid grid-cols-1  gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.25 }}
//           className={`rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2`}
//         >
//           <h2 className="section-title mb-4 text-black">Scan Activity</h2>
//           <ScanActivityChart data={stats?.scanActivityGraph} />
//         </motion.div>
//       </div>

//       <div className={`grid grid-cols-1  gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className={`rounded-xl border border-gray-200 bg-white p-5`}
//         >
//           <h2 className="section-title mb-4 text-black">Brand Analytics</h2>
//           <BrandAnalyticsChart data={stats?.brandAnalytics} />
//         </motion.div>
//       </div>

//       <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.35 }}
//           className={`rounded-xl border border-gray-200 bg-white p-5`}
//         >
//           <h2 className="section-title mb-4 text-black">Dispatched Analytics</h2>
//           {stats?.channelPartnerAnalytics?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.channelPartnerAnalytics.map((cp, i) => {
//                 const total = stats.channelPartnerAnalytics.reduce((s, x) => s + (x.totalScans || x.count || 0), 0)
//                 const count = cp.totalScans || cp.count || 0
//                 const pct   = total > 0 ? Math.round((count / total) * 100) : 0
//                 return (
//                   <div key={i}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-400">{cp.partnerName || cp.channelPartnerName || cp.name}</span>
//                       <span className="text-gray-800 font-mono">{count}</span>
//                     </div>
//                     <div className="h-2 rounded-full overflow-hidden bg-gray-100">
//                       <div
//                         className="h-full rounded-full transition-all duration-500"
//                         style={{
//                           width: `${pct}%`,
//                           background: orange
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           ) : (
//             <p className={`text-gray-400 text-sm`}>No data for selected range</p>
//           )}
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className={`rounded-xl border border-gray-200 bg-white p-5`}
//         >
//           <h2 className="section-title mb-4 text-black">Return Analytics</h2>
//           {stats?.returnAnalytics?.length > 0 ? (
//             <div className="space-y-3">
//               {stats.returnAnalytics.map((ra, i) => {
//                 const total = stats.returnAnalytics.reduce((s, x) => s + (x.totalReturns || x.count || 0), 0)
//                 const count = ra.totalReturns || ra.count || 0
//                 const pct   = total > 0 ? Math.round((count / total) * 100) : 0
//                 return (
//                   <div key={i}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-400">
//                         {ra.channelPartnerName || ra.partnerName || ra.name}
//                       </span>
//                       <span className="text-gray-800 font-mono">{count}</span>
//                     </div>
//                     <div className="h-2 rounded-full overflow-hidden bg-gray-100">
//                       <div
//                         className="h-full rounded-full transition-all duration-500"
//                         style={{
//                           width: `${pct}%`,
//                           background: orange
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           ) : (
//             <p className={`text-gray-400 text-sm`}>No return data for selected range</p>
//           )}
//         </motion.div>
//       </div>

//       {/* OFFLINE ANALYTICS (separate, by date only) */}
//       <div className="mt-7">
//         <div className="flex items-start justify-between gap-4 flex-wrap">
//           <h2 className="section-title text-black">Offline Analytics</h2>
//           {/* <button
//             type="button"
//             onClick={() => handleOfflineFiltersApply(offlineStartDate, offlineEndDate)}
//             disabled={offlineLoading}
//             className={`flex items-center gap-1.5 text-sm px-3 py-1.5 self-start rounded border ${btnBrandOutline} disabled:opacity-50`}
//           >
//             <RiRefreshLine className={offlineLoading ? 'animate-spin text-[#f58021]' : 'text-[#f58021]'} />
//             Refresh
//           </button> */}
//         </div>
//         {/* <DateAndFilterBar
//           startDate={offlineStartDate}
//           endDate={offlineEndDate}
//           onApply={(from, to) => handleOfflineFiltersApply(from, to)}
//           loading={offlineLoading}
//           showBrandAndChannel={false}
//         /> */}
//         <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity mt-10 ${offlineLoading ? 'opacity-60 pointer-events-none' : ''}`}>

//           <StatCard
//             icon={RiTimeLine}
//             label="Total Offline Records"
//             value={stats?.totalOfflineRecords ?? 0}
//             color="orange"
//             bg="bg-white"
//             text="text-[#f58021]"
//             iconColor="text-[#f58021]"
//             textColor="text-black"
//           />
//           <StatCard
//             icon={RiTimeLine}
//             label="Total Offline Quantity"
//             value={totalOfflineQty}
//             color="orange"
//             bg="bg-white"
//             text="text-[#f58021]"
//             iconColor="text-[#f58021]"
//             textColor="text-black"
//           />
//           <StatCard
//             icon={RiTimeLine}
//             label="Total Offline Amount"
//             value={totalOfflineAmount}
//             color="orange"
//             bg="bg-white"
//             text="text-[#f58021]"
//             iconColor="text-[#f58021]"
//             textColor="text-black"
//           />
//         </div>

//         {/* Breakdown by salesman/partyName/payment */}
//         {/* <div className="mt-5">
//           <h3 className="text-black font-medium mb-3 text-md">Offline Records Breakdown (Top 20)</h3>
//           {(Array.isArray(offlineAnalytics) && offlineAnalytics.length > 0) ? (
//             <div className="space-y-3">
//               {offlineAnalytics.map((rec, i) => (
//                 <div key={i} className="border-b last:border-0 border-gray-100 py-2">
//                   <div className="flex flex-wrap gap-6 justify-between text-sm">
//                     <div className="flex flex-col">
//                       <span className="font-semibold text-black">
//                         {rec.salesman || 'Unknown Salesman'}
//                         <span className="font-normal text-gray-400 ml-1">
//                           ({rec.partyName || 'Unknown Party'})
//                         </span>
//                       </span>
//                       <span className="text-xs text-gray-400">
//                         Payment: <span className="text-black">{rec.payment || '-'}</span>
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-end">
//                       <span className="text-[#f58021] font-mono">
//                         Qty: <span className="text-black">{rec.totalQty}</span>
//                       </span>
//                       <span className="text-[#f58021] font-mono">
//                         Amount: <span className="text-black">{rec.totalAmount}</span>
//                       </span>
//                       <span className="text-[#f58021] font-mono">
//                         Records: <span className="text-black">{rec.totalRecords}</span>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-gray-400 text-sm">No offline records found for selected range.</div>
//           )}
//         </div> */}
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

// Preset ranges
const PRESETS = [
  { label: 'Today',        getDates: () => ({ start: dayjs().startOf('day'),                          end: dayjs().endOf('day') }) },
  { label: 'Yesterday',    getDates: () => ({ start: dayjs().subtract(1,'day').startOf('day'),         end: dayjs().subtract(1,'day').endOf('day') }) },
  { label: 'Last 7 days',  getDates: () => ({ start: dayjs().subtract(6,'day').startOf('day'),         end: dayjs().endOf('day') }) },
  { label: 'Last 30 days', getDates: () => ({ start: dayjs().subtract(29,'day').startOf('day'),        end: dayjs().endOf('day') }) },
  { label: 'This month',   getDates: () => ({ start: dayjs().startOf('month'),                        end: dayjs().endOf('day') }) },
  { label: 'Custom',       getDates: null },
]

const FORMAT          = 'YYYY-MM-DD'
const orange          = '#f58021'
const borderLight     = 'border-gray-200'
const bgCard          = 'bg-white'
const brandIcon       = 'text-[#f58021]'
const btnBrand        = `bg-[#f58021] text-white border-[#f58021] hover:bg-[#f58021]/90`
const btnBrandOutline = `bg-white text-[#f58021] border-[#f58021] hover:bg-[#f58021]/10`
const focusRing       = 'focus:ring-2 focus:ring-[#f58021]'

// ---------------------------------------------------------------------------
// DateAndFilterBar
// ---------------------------------------------------------------------------
function DateAndFilterBar({
  startDate,
  endDate,
  onApply,
  loading,
  showBrandAndChannel,
  channelOptions = [],
  brandOptions   = [],
  channel        = '',
  setChannel     = () => {},
  brand          = '',
  setBrand       = () => {},
}) {
  const [activePreset, setActivePreset] = useState('Today')
  const [customStart,  setCustomStart]  = useState(startDate)
  const [customEnd,    setCustomEnd]    = useState(endDate)
  const [showCustom,   setShowCustom]   = useState(false)

  const handlePreset = preset => {
    setActivePreset(preset.label)
    if (preset.label === 'Custom') { setShowCustom(true); return }
    setShowCustom(false)
    const { start, end } = preset.getDates()
    onApply(start.format(FORMAT), end.format(FORMAT), channel, brand)
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return
    if (dayjs(customStart).isAfter(dayjs(customEnd))) return
    onApply(customStart, customEnd, channel, brand)
  }

  const handleChannelChange = e => {
    setChannel(e.target.value)
    setBrand('')
    onApply(startDate, endDate, e.target.value, '')
  }

  const handleBrandChange = e => {
    setBrand(e.target.value)
    onApply(startDate, endDate, channel, e.target.value)
  }

  return (
    <div className={`rounded-xl border ${borderLight} ${bgCard} p-4`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <RiCalendarLine className={`${brandIcon} text-base shrink-0`} />
        <span className="text-sm font-medium text-black mr-1">Filter by date:</span>
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => handlePreset(preset)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors border
              ${activePreset === preset.label
                ? 'bg-[#f58021] text-white border-[#f58021]'
                : 'bg-white text-[#f58021] border-gray-200 hover:bg-orange-50 hover:border-[#f58021]'}
              disabled:opacity-50
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showBrandAndChannel && (
        <div className="flex flex-wrap gap-3 mb-1 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-800 mb-1">Channel Partner</label>
            <select
              value={channel}
              disabled={loading}
              onChange={handleChannelChange}
              className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black`}
            >
              <option value="">All Channels</option>
              {channelOptions.map(cp => (
                <option value={cp._id} key={cp._id}>{cp.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-800 mb-1">Brand</label>
            <select
              value={brand}
              disabled={loading}
              onChange={handleBrandChange}
              className={`input-field text-sm px-3 py-1.5 w-48 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] ${focusRing} text-black`}
            >
              <option value="">All Brands</option>
              {brandOptions.map(b => (
                <option value={b._id} key={b._id}>{b.displayName || b.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showCustom && (
        <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-800">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd || dayjs().format(FORMAT)}
              onChange={e => setCustomStart(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-800">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={dayjs().format(FORMAT)}
              onChange={e => setCustomEnd(e.target.value)}
              className="input-field text-sm py-1.5 px-3 w-36 border-gray-200 focus:border-[#f58021] focus:ring-[#f58021] bg-white text-black"
            />
          </div>
          <button
            type="button"
            disabled={!customStart || !customEnd || loading || dayjs(customStart).isAfter(dayjs(customEnd))}
            onClick={handleCustomApply}
            className={`px-4 py-1.5 text-sm flex items-center gap-1.5 rounded ${btnBrand} disabled:opacity-50`}
          >
            <RiRefreshLine className={loading ? 'animate-spin' : ''} />
            Apply
          </button>
          {customStart && customEnd && dayjs(customStart).isAfter(dayjs(customEnd)) && (
            <p className="text-xs text-red-500 self-center">"From" must be before "To"</p>
          )}
        </div>
      )}

      {activePreset !== 'Custom' && (
        <p className="text-xs text-gray-400 mt-2">
          Showing data for&nbsp;
          <span className="text-[#f58021] font-medium">
            {startDate === endDate
              ? dayjs(startDate).format('MMM D, YYYY')
              : `${dayjs(startDate).format('MMM D, YYYY')} – ${dayjs(endDate).format('MMM D, YYYY')}`}
          </span>
          {showBrandAndChannel && channelOptions.find(cp => cp._id === channel) && (
            <> &middot; <span className="text-[#f58021]">{channelOptions.find(cp => cp._id === channel)?.name}</span></>
          )}
          {showBrandAndChannel && brandOptions.find(b => b._id === brand) && (
            <> &middot; <span className="text-[#f58021]">{brandOptions.find(b => b._id === brand)?.displayName || brandOptions.find(b => b._id === brand)?.name}</span></>
          )}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const today = dayjs().format(FORMAT)

  // Main (AWB) filter state
  const [channel,        setChannel]        = useState('')
  const [brand,          setBrand]          = useState('')
  const [channelOptions, setChannelOptions] = useState([])
  const [brandOptions,   setBrandOptions]   = useState([])
  const [stats,          setStats]          = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [startDate,      setStartDate]      = useState(today)
  const [endDate,        setEndDate]        = useState(today)

  // Offline Analytics filter state
  const [offlineStartDate, setOfflineStartDate] = useState(today)
  const [offlineEndDate,   setOfflineEndDate]   = useState(today)
  const [offlineAnalytics, setOfflineAnalytics] = useState([])
  const [offlineLoading,   setOfflineLoading]   = useState(true)

  // Load channel partners once
  useEffect(() => {
    let mounted = true
    channelPartnersAPI.list()
      .then(res => { if (mounted) setChannelOptions(res?.data?.data || []) })
      .catch(() => setChannelOptions([]))
    return () => { mounted = false }
  }, [])

  // Reload brands when channel changes
  useEffect(() => {
    let mounted = true
    Promise.resolve(brandsAPI.list(channel ? { channelPartnerId: channel } : undefined))
      .then(res => { if (mounted) setBrandOptions(res?.data?.data || []) })
      .catch(() => setBrandOptions([]))
    return () => { mounted = false }
  }, [channel])

  // ---------------------------------------------------------------------------
  // Core fetch — accepts overrides so callers can pass fresh values without
  // waiting for React state to flush.
  // ---------------------------------------------------------------------------
  const fetchAll = useCallback((overrides = {}) => {
    const p = {
      startDate,
      endDate,
      channel,
      brand,
      offlineStartDate,
      offlineEndDate,
      ...overrides,
    }

    setLoading(true)
    setOfflineLoading(true)

    dashboardAPI
      .getStats({
        startDate:         p.startDate,
        endDate:           p.endDate,
        channelPartnerId:  p.channel  || undefined,
        brandId:           p.brand    || undefined,
        offlineStartDate:  p.offlineStartDate,
        offlineEndDate:    p.offlineEndDate,
      })
      .then(r => {
        setStats(r.data?.data || null)
        setOfflineAnalytics(r.data?.data?.offlineAnalytics || [])
      })
      .catch(() => {
        setStats(null)
        setOfflineAnalytics([])
      })
      .finally(() => {
        setLoading(false)
        setOfflineLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, channel, brand, offlineStartDate, offlineEndDate])

  // Initial load
  useEffect(() => {
    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Handler: main (AWB) date + channel/brand filters
  // ---------------------------------------------------------------------------
  const handleFiltersApply = (start, end, _channel, _brand) => {
    setStartDate(start)
    setEndDate(end)
    setChannel(_channel)
    setBrand(_brand)
    fetchAll({ startDate: start, endDate: end, channel: _channel, brand: _brand })
  }

  // ---------------------------------------------------------------------------
  // Handler: offline-only date filter
  // ---------------------------------------------------------------------------
  const handleOfflineFiltersApply = (start, end) => {
    setOfflineStartDate(start)
    setOfflineEndDate(end)
    fetchAll({ offlineStartDate: start, offlineEndDate: end })
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const dispatched          = stats?.totalDispatched        ?? 0
  const returned            = stats?.totalReturnRecords      ?? 0
  const totalOfflineRecords = stats?.totalOfflineRecords     ?? 0
  const returnPercentage    = dispatched > 0 ? (returned / dispatched) * 100 : 0
  const totalOfflineQty     = offlineAnalytics?.reduce((acc, row) => acc + (row.totalQty    || 0), 0) || 0
  const totalOfflineAmount  = offlineAnalytics?.reduce((acc, row) => acc + (row.totalAmount || 0), 0) || 0

  const statCards = [
    { icon: RiBarcodeLine,        label: 'Total Scans',            value: stats?.totalScansToday,           iconColor: 'text-[#f58021]' },
    { icon: RiSendPlaneLine,      label: 'Net Dispatched',         value: stats?.totalDispatched,           iconColor: 'text-[#f58021]' },
    { icon: RiCloseCircleLine,    label: 'Total Cancelled',        value: stats?.totalCancelled,            iconColor: 'text-[#f58021]' },
    { icon: RiExchangeDollarLine, label: 'Total Return',           value: stats?.totalReturnRecords,        iconColor: 'text-[#f58021]' },
    { icon: RiTimeLine,           label: 'Total Offline Records',  value: totalOfflineRecords,              iconColor: 'text-[#f58021]' },
    { icon: TbAlertCircle,        label: 'Total Missed Packages',  value: stats?.awbMissingRecordsCount,    iconColor: 'text-[#f58021]' },
    { icon: TbAlertTriangle,      label: 'Total Missed Returns',   value: stats?.returnMissingRecordsCount, iconColor: 'text-[#f58021]' },
  ]

  // ---------------------------------------------------------------------------
  // Initial skeleton
  // ---------------------------------------------------------------------------
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className={`h-16 rounded-xl ${bgCard} border ${borderLight} animate-pulse`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 animate-pulse">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className={`h-36 rounded-xl ${bgCard} border ${borderLight}`} />
          ))}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in bg-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-black">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Live overview — {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAll()}
          disabled={loading}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 self-start rounded border ${btnBrandOutline} disabled:opacity-50`}
        >
          <RiRefreshLine className={loading ? 'animate-spin text-[#f58021]' : 'text-[#f58021]'} />
          Refresh
        </button>
      </div>

      {/* Main date + channel/brand filter bar */}
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
        showBrandAndChannel={true}
      />

      {/* Stat cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {statCards.map((card, i) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200">
            <StatCard
              {...card}
              index={i}
              color="orange"
              bg="bg-white"
              text="text-[#f58021]"
              textColor="text-black"
            />
          </div>
        ))}
      </div>

      {/* Dispatched vs Returns summary */}
      <div className="mt-1">
        <div className={`rounded-xl border ${borderLight} ${bgCard} p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4`}>
          <span className="font-semibold text-black">Dispatched vs Returns:</span>
          <span className="text-black text-lg font-mono">
            {dispatched} Dispatched
            <span className="mx-2 text-gray-400">/</span>
            {returned} Returns
          </span>
          <span
            className="sm:ml-6 px-2 py-1 rounded text-xs font-medium mt-2 sm:mt-0"
            style={{ backgroundColor: orange, color: '#fff', border: '1px solid #f58021' }}
          >
            {`Return % of Dispatched: ${dispatched > 0 ? returnPercentage.toFixed(2) : '0.00'}%`}
          </span>
        </div>
      </div>

      {/* Scan Activity chart */}
      <div className={`grid grid-cols-1 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2"
        >
          <h2 className="section-title mb-4 text-black">Scan Activity</h2>
          <ScanActivityChart data={stats?.scanActivityGraph} />
        </motion.div>
      </div>

      {/* Brand Analytics chart */}
      <div className={`grid grid-cols-1 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 className="section-title mb-4 text-black">Brand Analytics</h2>
          <BrandAnalyticsChart data={stats?.brandAnalytics} />
        </motion.div>
      </div>

      {/* Dispatched + Return analytics bars */}
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 className="section-title mb-4 text-black">Dispatched Analytics</h2>
          {stats?.channelPartnerAnalytics?.length > 0 ? (
            <div className="space-y-3">
              {stats.channelPartnerAnalytics.map((cp, i) => {
                const total = stats.channelPartnerAnalytics.reduce((s, x) => s + (x.totalScans || x.count || 0), 0)
                const count = cp.totalScans || cp.count || 0
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{cp.partnerName || cp.channelPartnerName || cp.name}</span>
                      <span className="text-gray-800 font-mono">{count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: orange }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data for selected range</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 className="section-title mb-4 text-black">Return Analytics</h2>
          {stats?.returnAnalytics?.length > 0 ? (
            <div className="space-y-3">
              {stats.returnAnalytics.map((ra, i) => {
                const total = stats.returnAnalytics.reduce((s, x) => s + (x.totalReturns || x.count || 0), 0)
                const count = ra.totalReturns || ra.count || 0
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{ra.channelPartnerName || ra.partnerName || ra.name}</span>
                      <span className="text-gray-800 font-mono">{count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: orange }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No return data for selected range</p>
          )}
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* OFFLINE ANALYTICS                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-7">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <h2 className="section-title text-black">Offline Analytics</h2>
          {/* <button
            type="button"
            onClick={() => fetchAll()}
            disabled={offlineLoading}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 self-start rounded border ${btnBrandOutline} disabled:opacity-50`}
          >
            <RiRefreshLine className={offlineLoading ? 'animate-spin text-[#f58021]' : 'text-[#f58021]'} />
            Refresh
          </button> */}
        </div>

        {/* Offline date filter (date-only, no channel/brand) */}
        {/* <DateAndFilterBar
          startDate={offlineStartDate}
          endDate={offlineEndDate}
          onApply={(from, to) => handleOfflineFiltersApply(from, to)}
          loading={offlineLoading}
          showBrandAndChannel={false}
        /> */}

        {/* Offline stat cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity mt-6 ${offlineLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          <StatCard
            icon={RiTimeLine}
            label="Total Offline Records"
            value={stats?.totalOfflineRecords ?? 0}
            color="orange" bg="bg-white" text="text-[#f58021]"
            iconColor="text-[#f58021]" textColor="text-black"
          />
          <StatCard
            icon={RiTimeLine}
            label="Total Offline Quantity"
            value={totalOfflineQty}
            color="orange" bg="bg-white" text="text-[#f58021]"
            iconColor="text-[#f58021]" textColor="text-black"
          />
          <StatCard
            icon={RiTimeLine}
            label="Total Offline Amount"
            value={totalOfflineAmount}
            color="orange" bg="bg-white" text="text-[#f58021]"
            iconColor="text-[#f58021]" textColor="text-black"
          />
        </div>

        {/* Offline breakdown table */}
        {/* <div className="mt-5">
          <h3 className="text-black font-medium mb-3 text-md">Offline Records Breakdown (Top 20)</h3>
          {Array.isArray(offlineAnalytics) && offlineAnalytics.length > 0 ? (
            <div className="space-y-3">
              {offlineAnalytics.map((rec, i) => (
                <div key={i} className="border-b last:border-0 border-gray-100 py-2">
                  <div className="flex flex-wrap gap-6 justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-black">
                        {rec.salesman || 'Unknown Salesman'}
                        <span className="font-normal text-gray-400 ml-1">
                          ({rec.partyName || 'Unknown Party'})
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        Payment: <span className="text-black">{rec.payment || '-'}</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[#f58021] font-mono">Qty: <span className="text-black">{rec.totalQty}</span></span>
                      <span className="text-[#f58021] font-mono">Amount: <span className="text-black">{rec.totalAmount}</span></span>
                      <span className="text-[#f58021] font-mono">Records: <span className="text-black">{rec.totalRecords}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No offline records found for selected range.</div>
          )}
        </div> */}
      </div>

    </div>
  )
}