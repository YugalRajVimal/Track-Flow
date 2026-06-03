import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

// White and #f58021 color theme for tooltip/items
const ORANGE = '#f58021'
const LIGHT_ORANGE_BG = '#fff8f2'
const GRAY_TEXT = '#b35c23'    // Muted orange for axis/legend ticks
const DARK_TEXT = '#191919'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-orange-200 rounded-lg shadow p-3 text-xs">
      <div className="text-[#f58021] mb-2 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#f58021] capitalize">{p.name}:</span>
          <span className="text-[#191919] font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ScanActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-orange-200 text-sm">
        No activity data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ORANGE} stopOpacity={0.17} />
            <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDispatched" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFB16A" stopOpacity={0.13} />
            <stop offset="95%" stopColor="#FFB16A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffe1cc" />
        <XAxis
          dataKey="date"
          stroke="#fed7aa"
          tick={{
            fontSize: 11,
            fill: GRAY_TEXT,
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: '#fff4ec' }}
        />
        <YAxis
          stroke="#fed7aa"
          tick={{
            fontSize: 11,
            fill: GRAY_TEXT,
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: '#fff4ec' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(val) => (
            <span style={{ color: ORANGE, textTransform: 'capitalize' }}>{val}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="scans"
          name="scans"
          stroke={ORANGE}
          strokeWidth={2}
          fill="url(#colorScans)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="dispatched"
          name="dispatched"
          stroke="#FFB16A"
          strokeWidth={2}
          fill="url(#colorDispatched)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
