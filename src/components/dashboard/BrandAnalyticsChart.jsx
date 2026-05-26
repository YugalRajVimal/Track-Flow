import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-3 text-xs">
      <div className="text-gray-500 mb-1">{label}</div>
      <div className="text-gray-800 font-semibold">{payload[0].value} scans</div>
    </div>
  )
}

export default function BrandAnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
  }

  const chartData = data.map(d => ({
    name: d.brandName || d.name || 'Unknown',
    scans: d.totalScans || d.count || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          stroke="#94a3b8"
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.07)" }} />
        <Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
