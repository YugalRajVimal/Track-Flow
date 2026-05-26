import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

// Light theme tooltip and colors
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-xs">
      <div className="text-gray-500 mb-2 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="text-gray-900 font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ScanActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No activity data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.13} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDispatched" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.13} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          stroke="#cbd5e1"
          tick={{
            fontSize: 11,
            fill: '#64748b', // gray-500/600
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          stroke="#cbd5e1"
          tick={{
            fontSize: 11,
            fill: '#64748b',
            fontFamily: 'JetBrains Mono, monospace'
          }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(val) => <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{val}</span>}
        />
        <Area
          type="monotone"
          dataKey="scans"
          name="scans"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorScans)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="dispatched"
          name="dispatched"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorDispatched)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
