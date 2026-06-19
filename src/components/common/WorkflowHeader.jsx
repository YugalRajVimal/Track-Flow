import React from 'react'
import { RiFileAddLine, RiStackLine, RiSendPlaneLine, RiArrowRightSLine } from 'react-icons/ri'

/**
 * The three steps of the fabric task workflow, in order.
 * `href` values are placeholders — point them at your actual routes
 * (e.g. wired up to react-router's <Link> instead of <a>, if you use it).
 */
export const WORKFLOW_STEPS = [
  { key: 'task', label: 'Create Task', href: '/task', icon: RiFileAddLine },
  { key: 'subtask', label: 'Manage SubTasks', href: '/sub-task', icon: RiStackLine },
  { key: 'submission', label: 'Submission', href: '/sub-task-submission', icon: RiSendPlaneLine },
]

function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Shared header used at the top of every page in the Task → SubTask → Submission
 * workflow. Keeps the brand bar, page heading, and step navigation visually
 * identical across all three screens.
 *
 * @param {('task'|'subtask'|'submission')} activeStep - which step is currently open
 * @param {string} title - big page heading
 * @param {string} subtitle - small gray line under the heading
 * @param {string} [topLabel] - text shown in the thin top bar (defaults to title)
 */
const WorkflowHeader = ({ activeStep, title, subtitle, topLabel }) => {
  const activeIndex = WORKFLOW_STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="bg-white">
      {/* Thin brand bar */}
      <div className="w-full border-b-2 border-gray-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900 tracking-tight">
            {topLabel || title}
          </span>
          <span className="font-mono text-sm text-gray-400">
            {formatHeaderDate()}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Page heading */}
        <div className="pt-10 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-gray-500 text-base">{subtitle}</p>}
        </div>

        {/* Step navigation */}
        <div className="flex items-center gap-2 sm:gap-3 pb-8 overflow-x-auto">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex
            const isPast = idx < activeIndex
            const Icon = step.icon
            return (
              <React.Fragment key={step.key}>
                <a
                  href={step.href}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                      : isPast
                      ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Icon size={16} />
                  {step.label}
                </a>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <RiArrowRightSLine className="text-gray-300 flex-shrink-0" size={18} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WorkflowHeader