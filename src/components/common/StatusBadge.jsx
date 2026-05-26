import React from 'react'

export default function StatusBadge({ status }) {
  if (status === 'dispatched') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
        Dispatched
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  )
}
