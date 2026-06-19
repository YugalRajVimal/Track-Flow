import React from 'react'
import { RiArrowRightLine } from 'react-icons/ri'

/**
 * Sits at the bottom of a page and points to the next step in the
 * Task → SubTask → Submission flow. Omit on the last step.
 */
const NextStepBanner = ({ text, ctaLabel, href }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-orange-200 bg-orange-50 px-6 sm:px-8 py-5 mt-2 mb-12">
    <p className="text-sm font-medium text-orange-900">{text}</p>
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 shadow-sm transition flex-shrink-0"
    >
      {ctaLabel}
      <RiArrowRightLine size={16} />
    </a>
  </div>
)

export default NextStepBanner