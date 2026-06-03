import React from 'react'

export default function StatusBadge({ status }) {
  // Orange (#f58021) and white theme
  if (status === 'dispatched') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#fff8f2] text-[#f58021] border border-orange-200">
        <span className="w-2 h-2 rounded-full bg-[#f58021] mr-1 animate-pulse"></span>
        Dispatched
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#fff8f2] text-[#f58021] border border-orange-200">
        <span className="w-2 h-2 rounded-full bg-[#f58021]/60 mr-1"></span>
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white text-[#f58021] border border-orange-200">
      {status}
    </span>
  )
}
