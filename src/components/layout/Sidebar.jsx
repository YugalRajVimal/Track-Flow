import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine, RiBarcodeLine, RiFileListLine, RiUserLine, RiShieldCheckLine, RiLogoutBoxLine,
  RiCloseLine, RiShip2Line, RiTeamLine, RiArrowLeftSLine, RiArrowRightSLine, RiTaskLine, RiArrowDownSLine, RiArrowUpSLine
} from 'react-icons/ri'
import { useAuthStore } from '../../store/authStore'

// Only use orange for button backgrounds, icons; all other theme is black/white
const BRAND_ORANGE = "#f58021"

const NAV_ITEMS = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/awb-management', icon: RiBarcodeLine, label: 'Dispatch Management' },
  { to: '/return-management', icon: RiCloseLine, label: 'Return Management' },
  { to: '/offline-management', icon: RiShip2Line, label: 'Offline Management' },
  // Payment links removed; now live in Payment Department
  // { to: '/payment-record', icon: RiFileListLine, label: 'Payment Record' },
  // { to: '/submission-payment', icon: RiFileListLine, label: 'Submission Payment' },
]

const PAYMENT_ITEMS = [
  { to: '/payment-record', icon: RiFileListLine, label: 'Payment Record' },
  { to: '/submission-payment', icon: RiFileListLine, label: 'Submission Payment' },
  { to: '/color-chemical', icon: RiFileListLine, label: 'Color Chemical' },
]

const ADMIN_ITEMS = [ 
  { to: '/users', icon: RiUserLine, label: 'Users' },
  { to: '/channel-partners', icon: RiTeamLine, label: 'Channel Partners' },
  { to: '/brands', icon: RiShieldCheckLine, label: 'Brands' },
  { to: '/offline-data', icon: RiFileListLine, label: 'Offline Data' },
  { to: '/task-data', icon: RiTaskLine, label: 'Task Dropdowns' },
  { to: '/submission-payment-data', icon: RiFileListLine, label: 'Submission Payment Data' },
  { to: '/payment-data', icon: RiFileListLine, label: 'Payment Data' },
  { to: '/payment-record', icon: RiFileListLine, label: 'Payment Record' },
  { to: '/submission-payment', icon: RiFileListLine, label: 'Submission Payment' },
]

// Task page for handler role
const HANDLER_ITEMS = [
  { to: '/handler-dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/task', icon: RiTaskLine, label: 'Fabric In' },
  { to: '/sub-task', icon: RiTaskLine, label: 'Production Process' },
  { to: '/sub-task-submission', icon: RiTaskLine, label: 'Fabric Submission' },
]

const sidebarColors = {
  background: "bg-white",
  border: "border-black",
  logoBg: "bg-white",
  navActiveBg: "bg-white",
  navActiveText: "text-black font-semibold",
  navHoverText: "hover:text-black",
  navHoverBg: "hover:bg-black/5",
  navInactiveText: "text-black",
  sectionHeader: "text-black/50",
  userBoxBg: "bg-black/5",
  userInitialsBg: "bg-black/5 text-black",
  userText: "text-black",
  roleText: "text-black/50",
  logoutBtn: "bg-[#f58021] text-white hover:bg-[#f58021]/90",
  closeBtn: "text-black hover:text-[#f58021]",
  borderBrand: "border-black",
  navBtn: "bg-[#f58021] text-white hover:bg-[#f58021]/90", // Used for nav button styles
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'
  const isHandler = user?.role === 'handler'
  const [collapsed, setCollapsed] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false) // for Payment Department collapse

  // Expand Payment Department if current path is in Payment Department routes
  useEffect(() => {
    if (PAYMENT_ITEMS.some(item => location.pathname.startsWith(item.to))) {
      setPaymentOpen(false)
    }
  }, [location.pathname])

  // Redirect handler to /handler-dashboard if they land on /
  useEffect(() => {
    if (isHandler && (location.pathname === "/" || location.pathname === "/dashboard")) {
      navigate('/handler-dashboard', { replace: true })
    }
  }, [isHandler, location.pathname, navigate])

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
            <div className="w-16 h-16 flex items-center justify-center transition-all">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain transition-all"
              />
            </div>
          )}
          {!collapsed && (
            <div>
              <div className="font-bold text-black text-sm leading-none">Ammiy London</div>
              <div className="text-xs text-black/50 mt-0.5">AWB Platform</div>
            </div>
          )}
        </div>
        {/* Desktop collapse/expand button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center text-xl rounded-full p-1.5 border border-transparent hover:border-black transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ marginLeft: !collapsed ? 8 : 0, background: BRAND_ORANGE, color: "#fff" }}
        >
          {collapsed ? <RiArrowRightSLine color="#fff" /> : <RiArrowLeftSLine color="#fff" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className={`lg:hidden text-black hover:text-[#f58021] transition-colors p-1`}
        >
          <RiCloseLine className="text-xl" />
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 p-4 space-y-1 overflow-y-auto bg-white transition-all ${collapsed ? "px-2" : ""}`}>
        <div className="mb-3">
          {/* Handler: ONLY show 1 Task link */}
          {isHandler ? (
            HANDLER_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    collapsed ? "justify-center px-2" : ""
                  } ${
                    isActive
                      ? sidebarColors.navActiveBg + " " + sidebarColors.navActiveText + " border " + sidebarColors.borderBrand
                      : sidebarColors.navInactiveText + " " + sidebarColors.navHoverBg + " " + sidebarColors.navHoverText
                  }`
                }
                style={collapsed ? { justifyContent: "center" } : {}}
              >
                <span
                  className='flex items-center justify-center rounded-full p-2'
                  style={{ background: BRAND_ORANGE }}
                >
                  <Icon className="text-lg flex-shrink-0" color="#fff" />
                </span>
                {!collapsed && <span className="text-black">{label}</span>}
              </NavLink>
            ))
          ) : (
            <>
              {!collapsed && (
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wider px-3 mb-2">Main</p>
              )}
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                      collapsed ? "justify-center px-2" : ""
                    } ${
                      isActive
                        ? sidebarColors.navActiveBg + " " + sidebarColors.navActiveText + " border " + sidebarColors.borderBrand
                        : sidebarColors.navInactiveText + " " + sidebarColors.navHoverBg + " " + sidebarColors.navHoverText
                    }`
                  }
                  style={collapsed ? { justifyContent: "center" } : {}}
                >
                  <span
                    className='flex items-center justify-center rounded-full p-2'
                    style={{ background: BRAND_ORANGE }}
                  >
                    <Icon className="text-lg flex-shrink-0" color="#fff" />
                  </span>
                  {!collapsed && <span className="text-black">{label}</span>}
                </NavLink>
              ))}

              {/* Collapsable Payment Department section */}
              <div>
                <button
                  onClick={() => setPaymentOpen(o => !o)}
                  className={`
                    flex items-center w-full gap-2 px-4 py-2 rounded-xl
                    ${collapsed ? "justify-center px-2" : "justify-between"}
                    hover:bg-black/5 transition-colors mb-1 group
                  `}
                  style={{ outline: "none", border: "none", background: "transparent" }}
                  tabIndex={0}
                  aria-expanded={paymentOpen}
                  aria-controls="payment-department-nav"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex items-center justify-center rounded-full p-2"
                      style={{ background: BRAND_ORANGE }}
                    >
                      <RiFileListLine className="text-lg flex-shrink-0" color="#fff" />
                    </span>
                    {!collapsed && (
                      <span className="text-black text-left font-semibold">
                        Payment Department
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <span className="ml-auto">
                      {paymentOpen ? (
                        <RiArrowUpSLine className="text-lg text-black/50" />
                      ) : (
                        <RiArrowDownSLine className="text-lg text-black/50" />
                      )}
                    </span>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {paymentOpen && (
                    <motion.div
                      id="payment-department-nav"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`overflow-hidden ${collapsed ? 'pl-0' : 'pl-8'}`}
                    >
                      {PAYMENT_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 mt-0.5
                            ${collapsed ? "justify-center px-2" : ""}
                            ${
                              isActive
                                ? sidebarColors.navActiveBg + " " + sidebarColors.navActiveText + " border " + sidebarColors.borderBrand
                                : sidebarColors.navInactiveText + " " + sidebarColors.navHoverBg + " " + sidebarColors.navHoverText
                            }`
                          }
                          style={collapsed ? { justifyContent: "center" } : {}}
                        >
                          <span
                            className='flex items-center justify-center rounded-full p-2'
                            style={{ background: BRAND_ORANGE }}
                          >
                            <Icon className="text-lg flex-shrink-0" color="#fff" />
                          </span>
                          {!collapsed && <span className="text-black">{label}</span>}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Only show the admin section if not handler */}
        {!isHandler && isAdmin && (
          <div className="pt-2">
            {!collapsed && (
              <p className="text-xs font-semibold text-black/50 uppercase tracking-wider px-3 mb-2">Admin</p>
            )}
            {ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    collapsed ? "justify-center px-2" : ""
                  } ${
                    isActive
                      ? sidebarColors.navActiveBg + " " + sidebarColors.navActiveText + " border " + sidebarColors.borderBrand
                      : sidebarColors.navInactiveText + " " + sidebarColors.navHoverBg + " " + sidebarColors.navHoverText
                  }`
                }
                style={collapsed ? { justifyContent: "center" } : {}}
              >
                <span
                  className='flex items-center justify-center rounded-full p-2'
                  style={{ background: BRAND_ORANGE }}
                >
                  <Icon className="text-lg flex-shrink-0" color="#fff" />
                </span>
                {!collapsed && <span className="text-black">{label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User section - hide name in collapsed mode */}
      <div className={`p-4 border-t ${sidebarColors.border} bg-white`}>
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${sidebarColors.userBoxBg} mb-2`}>
          <div className="w-8 h-8 rounded-lg bg-black/10 text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium text-black truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-black/50 truncate capitalize">{user?.role || 'user'}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${sidebarColors.logoutBtn} transition-all duration-200 ${collapsed ? "justify-center px-2" : ""}`}
          style={{ background: BRAND_ORANGE, color: "#fff" }}
        >
          <RiLogoutBoxLine className="text-lg" color="#fff" />
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
