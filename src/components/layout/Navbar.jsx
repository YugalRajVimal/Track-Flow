import React from 'react'
import { useLocation } from 'react-router-dom'
import { RiMenuLine, RiBellLine } from 'react-icons/ri'
import dayjs from 'dayjs'

const ORANGE = "#f58021";

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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black px-4 lg:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg focus:ring-2 focus:ring-[#f58021] bg-white border border-[#f58021] hover:bg-[#f58021] transition-all"
        >
          <RiMenuLine className="text-xl" style={{ color: ORANGE }} />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <span className="text-black/30">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-black font-medium' : 'text-black/70'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-xs text-black/50 font-mono">
          {dayjs().format('ddd, MMM D YYYY')}
        </div>
        <button className="p-2 rounded-lg transition-all relative bg-white border border-[#f58021] hover:bg-[#f58021] group focus:ring-2 focus:ring-[#f58021]">
          <RiBellLine className="text-lg" style={{ color: ORANGE }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f58021] rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
