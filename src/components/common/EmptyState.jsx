import React from 'react'

/**
 * Centered empty-state used inside cards/tables when there's no data yet.
 */
const EmptyState = ({ icon = '📭', text = 'Nothing here yet' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-4xl mb-3" role="img" aria-hidden="true">
      {icon}
    </span>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
)

export default EmptyState