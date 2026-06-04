import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Color palette: Only orange for bar/icons/buttons, black and white for everything else
const ORANGE = '#f58021'
const BLACK = '#191919'
const WHITE = '#ffffff'
const AXIS_TEXT = BLACK
const AXIS_LINE = BLACK
const CHART_BG = WHITE
const GRID_LINE = '#e5e5e5'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black rounded-lg shadow p-3 text-xs">
      <div className="text-[#f58021] mb-1 font-medium">{label}</div>
      <div className="text-black font-semibold">{payload[0].value} scans</div>
    </div>
  )
}

export default function BrandAnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    // Orange text on white, as required by the color rules
    return <div className="flex items-center justify-center h-40 text-[#f58021] text-sm bg-white">No data</div>
  }

  const chartData = data.map(d => ({
    name: d.brandName || d.name || 'Unknown',
    scans: d.totalScans || d.count || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={chartData}
        margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
        style={{ background: CHART_BG }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_LINE} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f5" }} />
        {/* Only the bar (and icons/buttons elsewhere) should be orange */}
        <Bar dataKey="scans" fill={ORANGE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
