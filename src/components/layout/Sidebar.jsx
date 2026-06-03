import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine, RiBarcodeLine, RiFileListLine, RiUserLine, RiShieldCheckLine, RiLogoutBoxLine,
  RiCloseLine, RiShip2Line, RiTeamLine, RiArrowLeftSLine, RiArrowRightSLine
} from 'react-icons/ri'
import { useAuthStore } from '../../store/authStore'

const BRAND_ORANGE = "#f58021"

const NAV_ITEMS = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/awb-management', icon: RiBarcodeLine, label: 'Dispatch Management' },
  { to: '/return-management', icon: RiCloseLine, label: 'Return Management' },
  // { to: '/audit-logs', icon: RiFileListLine, label: 'Audit Logs' },
]

const ADMIN_ITEMS = [ 
  { to: '/users', icon: RiUserLine, label: 'Users' },
  { to: '/channel-partners', icon: RiTeamLine, label: 'Channel Partners' },
  { to: '/brands', icon: RiShieldCheckLine, label: 'Brands' },
]

// Orange-White theme color map for accent colors
const sidebarColors = {
  background: "bg-white",
  border: "border-gray-200",
  logoBg: "bg-white",
  navActiveBg: "bg-[#fff7f2]", // very light orange-ish background
  navActiveText: "text-[#f58021] font-semibold",
  navHoverText: "hover:text-[#f58021]",
  navHoverBg: "hover:bg-[#fff7f2]",
  navInactiveText: "text-gray-700",
  sectionHeader: "text-gray-500",
  userBoxBg: "bg-gray-100",
  userInitialsBg: "bg-[#ffe1c0] text-[#f58021]",
  userText: "text-gray-900",
  roleText: "text-gray-500",
  logoutBtn: "text-gray-500 hover:text-red-500 hover:bg-red-50",
  closeBtn: "text-gray-400 hover:text-[#f58021]",
  borderBrand: "border-[#f58021]",
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  // --- Collapsible state for desktop ---
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + Collapse/Expand toggle */}
      <div className={`flex items-center justify-between p-5 border-b ${sidebarColors.border} bg-white relative`}>
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div
              className="w-16 h-16 flex items-center justify-center transition-all"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain transition-all"
              />
            </div>
          )}
          {!collapsed && (
            <div>
              <div className="font-bold text-gray-900 text-sm leading-none">Ammiy London</div>
              <div className="text-xs text-slate-500 mt-0.5">AWB Platform</div>
            </div>
          )}
        </div>

        {/* Desktop collapse/expand button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center text-xl rounded-full p-1.5 border border-transparent hover:border-[#ffe1c0] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ marginLeft: !collapsed ? 8 : 0 }}
        >
          {collapsed ? <RiArrowRightSLine color={BRAND_ORANGE} /> : <RiArrowLeftSLine color={BRAND_ORANGE} />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className={`lg:hidden ${sidebarColors.closeBtn} transition-colors p-1`}
        >
          <RiCloseLine className="text-xl" />
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 p-4 space-y-1 overflow-y-auto bg-white transition-all ${collapsed ? "px-2" : ""}`}>
        <div className="mb-3">
          {!collapsed && (
            <p className={`text-xs font-semibold ${sidebarColors.sectionHeader} uppercase tracking-wider px-3 mb-2`}>Main</p>
          )}
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.navActiveBg} ${sidebarColors.navActiveText} border ${sidebarColors.borderBrand} mb-1 ${collapsed ? "justify-center px-2" : ""}`
                  : `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.navInactiveText} ${sidebarColors.navHoverBg} ${sidebarColors.navHoverText} transition-colors mb-1 ${collapsed ? "justify-center px-2" : ""}`
              }
              style={collapsed ? { justifyContent: "center" } : {}}
            >
              <Icon
                className="text-lg flex-shrink-0"
                color={BRAND_ORANGE}
              />
              {!collapsed && label}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="pt-2">
            {!collapsed && (
              <p className={`text-xs font-semibold ${sidebarColors.sectionHeader} uppercase tracking-wider px-3 mb-2`}>Admin</p>
            )}
            {ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive
                    ? `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.navActiveBg} ${sidebarColors.navActiveText} border ${sidebarColors.borderBrand} mb-1 ${collapsed ? "justify-center px-2" : ""}`
                    : `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.navInactiveText} ${sidebarColors.navHoverBg} ${sidebarColors.navHoverText} transition-colors mb-1 ${collapsed ? "justify-center px-2" : ""}`
                }
                style={collapsed ? { justifyContent: "center" } : {}}
              >
                <Icon
                  className="text-lg flex-shrink-0"
                  color={BRAND_ORANGE}
                />
                {!collapsed && label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User section - hide name in collapsed mode */}
      <div className={`p-4 border-t ${sidebarColors.border} bg-white`}>
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${sidebarColors.userBoxBg} mb-2`}>
          <div className={`w-8 h-8 rounded-lg ${sidebarColors.userInitialsBg} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className={`text-sm font-medium ${sidebarColors.userText} truncate`}>{user?.name || 'User'}</div>
              <div className={`text-xs ${sidebarColors.roleText} truncate capitalize`}>{user?.role || 'user'}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.logoutBtn} transition-all duration-200 ${collapsed ? "justify-center px-2" : ""}`}
        >
          <RiLogoutBoxLine className="text-lg" color={BRAND_ORANGE} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 ${sidebarColors.background} ${sidebarColors.border} border-r h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (full, no collapse) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed left-0 top-0 bottom-0 w-64 ${sidebarColors.background} ${sidebarColors.border} border-r z-50 lg:hidden flex flex-col`}
            >
              {/* Force expanded mode on mobile */}
              <div className="flex flex-col h-full">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
