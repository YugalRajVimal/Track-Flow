import React from 'react'
import { useLocation } from 'react-router-dom'
import { RiMenuLine, RiBellLine } from 'react-icons/ri'
import dayjs from 'dayjs'

const BREADCRUMBS = {
  '/dashboard': ['Dashboard'],
  '/awb-management': ['Dispatch Management'],
  '/audit-logs': ['Audit Logs'],
  '/users': ['Admin', 'Users'],
  '/channel-partners': ['Admin', 'Channel Partners'],
  '/brands': ['Admin', 'Brands'],
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const crumbs = BREADCRUMBS[pathname] || ['Dashboard']

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
        >
          <RiMenuLine className="text-xl" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <span className="text-gray-400">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-xs text-gray-500 font-mono">
          {dayjs().format('ddd, MMM D YYYY')}
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all relative">
          <RiBellLine className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
