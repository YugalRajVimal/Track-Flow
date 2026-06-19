import React from 'react'

const TONE_CLASSES = {
  neutral: 'bg-gray-100 text-gray-500',
  progress: 'bg-orange-50 text-orange-600',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
}

/**
 * Small rounded status pill. Pass `tone` to pick the color family —
 * keeps every status indicator across the app visually consistent.
 */
const StatusBadgeTask = ({ label, tone = 'neutral' }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
      TONE_CLASSES[tone] || TONE_CLASSES.neutral
    }`}
  >
    {label}
  </span>
)

export default StatusBadgeTask