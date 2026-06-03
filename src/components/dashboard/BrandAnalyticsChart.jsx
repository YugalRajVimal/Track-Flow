import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ORANGE = '#f58021'
const LIGHT_ORANGE_BG = '#fff8f2'
const AXIS_TEXT = '#b35c23'
const AXIS_LINE = '#fad6ae' // light orange border

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-orange-200 rounded-lg shadow p-3 text-xs">
      <div className="text-[#f58021] mb-1 font-medium">{label}</div>
      <div className="text-[#191919] font-semibold">{payload[0].value} scans</div>
    </div>
  )
}

export default function BrandAnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-orange-200 text-sm">No data</div>
  }

  const chartData = data.map(d => ({
    name: d.brandName || d.name || 'Unknown',
    scans: d.totalScans || d.count || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fff4ec" />
        <XAxis
          dataKey="name"
          stroke={AXIS_LINE}
          tick={{ fontSize: 10, fill: AXIS_TEXT, fontFamily: 'JetBrains Mono, monospace' }}
          tickLine={false}
          axisLine={{ stroke: AXIS_LINE }}
        />
        <YAxis
          stroke={AXIS_LINE}
          tick={{ fontSize: 10, fill: AXIS_TEXT, fontFamily: 'JetBrains Mono, monospace' }}
          tickLine={false}
          axisLine={{ stroke: AXIS_LINE }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#fff4ec" }} />
        <Bar dataKey="scans" fill={ORANGE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
