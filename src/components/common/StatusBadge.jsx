import React from 'react'

// Only use orange for icons and background, otherwise black and white
export default function StatusBadge({ status }) {
  const ORANGE = '#f58021';

  if (status === 'dispatched') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white text-black border border-black">
        <span
          className="w-2 h-2 rounded-full mr-1 animate-pulse"
          style={{ backgroundColor: ORANGE }}
        ></span>
        Dispatched
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white text-black border border-black">
        <span
          className="w-2 h-2 rounded-full mr-1"
          style={{ backgroundColor: ORANGE, opacity: 0.5 }}
        ></span>
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white text-black border border-black">
      {status}
    </span>
  )
}
