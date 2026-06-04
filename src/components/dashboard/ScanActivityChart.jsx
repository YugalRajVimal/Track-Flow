import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

// Orange only for chart lines/legend, b/w everywhere else
const ORANGE = '#f58021'
const GRAY_TEXT = '#222'     // Use black for axis/legend ticks/text
const CHART_BORDER = '#e5e5e5'
const BG_WHITE = '#fff'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black/10 rounded-lg shadow p-3 text-xs">
      <div className="text-black mb-2 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-black capitalize">{p.name}:</span>
          <span className="text-black font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ScanActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-black/25 text-sm">
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
            <stop offset="5%" stopColor={ORANGE} stopOpacity={0.10} />
            <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER} />
        <XAxis
          dataKey="date"
          stroke={CHART_BORDER}
          tick={{
            fontSize: 11,
            fill: GRAY_TEXT,
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: CHART_BORDER }}
        />
        <YAxis
          stroke={CHART_BORDER}
          tick={{
            fontSize: 11,
            fill: GRAY_TEXT,
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: CHART_BORDER }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(val) => (
            <span style={{ color: ORANGE, textTransform: 'capitalize' }}>{val}</span>
          )}
          iconType="circle"
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
          stroke={ORANGE}
          strokeDasharray="5 4"
          strokeWidth={2}
          fill="url(#colorDispatched)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
