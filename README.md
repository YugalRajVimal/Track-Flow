# TrackFlow — Enterprise AWB Barcode Tracking SaaS

A production-grade frontend for enterprise AWB (Air Waybill) barcode tracking built with React + Vite.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + Vite | Framework & build tool |
| Tailwind CSS | Utility-first styling |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Framer Motion | Animations & transitions |
| React Icons (Remix) | Icon set |
| html5-qrcode | Barcode/QR scanner |
| Recharts | Charts & analytics |
| React Hook Form | Form state & validation |
| React Hot Toast | Toast notifications |
| Zustand | Auth state management |
| Day.js | Date formatting |

---

## Project Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance + JWT interceptor + 401 auto-logout
│   ├── auth.js           # Auth endpoints
│   ├── awb.js            # AWB endpoints
│   └── services.js       # Dashboard, Users, Channel Partners, Brands, Audit Logs
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx  # Root layout shell
│   │   ├── Sidebar.jsx    # Desktop + mobile sidebar w/ role-based nav
│   │   └── Navbar.jsx     # Top bar w/ breadcrumbs
│   ├── common/
│   │   ├── Modal.jsx          # Accessible modal wrapper
│   │   ├── DataTable.jsx      # Table + Pagination
│   │   ├── StatusBadge.jsx    # AWB status badge
│   │   └── ConfirmDialog.jsx  # Delete confirmation
│   ├── dashboard/
│   │   ├── StatCard.jsx          # Animated stat cards
│   │   ├── ScanActivityChart.jsx # Area chart (Recharts)
│   │   └── BrandAnalyticsChart.jsx # Bar chart (Recharts)
│   ├── awb/
│   │   ├── BarcodeScanner.jsx  # html5-qrcode scanner
│   │   ├── AWBScanForm.jsx     # Scan submission form
│   │   ├── AWBCancelForm.jsx   # Cancel AWB form
│   │   └── AWBFilterBar.jsx    # Filters, search, date range, CSV export
│   └── admin/
│       └── EntityFormModal.jsx # Generic CRUD form modal
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── AWBManagementPage.jsx
│   ├── AuditLogsPage.jsx
│   ├── UsersPage.jsx
│   ├── ChannelPartnersPage.jsx
│   └── BrandsPage.jsx
│
├── store/
│   └── authStore.js   # Zustand store (token, user, login, logout)
│
├── App.jsx            # Router + Protected/Admin/Public routes
├── main.jsx           # React entry point
└── index.css          # Tailwind base + component classes
```

---

## Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure API proxy (optional — edit vite.config.js)
# Default proxy: /api → http://localhost:5000

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

---

## API Contract Integration

All endpoints match the contract exactly:

### Auth
- `POST /api/v1/auth/login` → JWT stored in localStorage

### AWB
- `POST /api/v1/awb/scan` — scan with channelPartnerId + brandId + awbId
- `PUT /api/v1/awb/cancel/:awbId` — cancel by AWB ID string
- `GET /api/v1/awb` — paginated list with all filters
- `DELETE /api/v1/awb/:id`
- `GET /api/v1/export/awb-csv` — uses same filter params, downloads blob

### Dashboard
- `GET /api/v1/dashboard/stats`

### Admin (requires admin role)
- `GET/POST/PUT/DELETE /api/v1/users`
- `PATCH /api/v1/users/:id/status`
- `GET/POST/PUT/DELETE /api/v1/channel-partners`
- `GET/POST/PUT/DELETE /api/v1/brands`
- `GET /api/v1/brands/channel-partner/:channelPartnerId`

### Audit Logs
- `GET /api/v1/audit-logs`

---

## Auth Flow

1. User submits `/login` form → `POST /api/v1/auth/login`
2. JWT + user object stored in `localStorage` via Zustand
3. Axios request interceptor attaches `Authorization: Bearer <token>` to every request
4. Axios response interceptor catches `401` → clears storage → redirects to `/login`
5. Protected routes check `isAuthenticated`, admin routes also check `user.role === 'admin'`

---

## AWB Validation

Applied client-side in all forms:
- Required
- Alphanumeric: `/^[a-zA-Z0-9]+$/`
- Min length: 6
- Max length: 30

---

## Barcode Scanner

Uses `html5-qrcode` (`Html5QrcodeScanner`):
- Supports **camera** scanning (mobile + desktop)
- Supports **file upload** (image with barcode/QR)
- On decode: auto-fills AWB ID field + shows toast
- Properly cleaned up on modal close to release camera

---

## Design System

**Color palette:** Deep navy surface + indigo brand (`#6366f1`) + emerald/red status
**Typography:** Sora (UI) + JetBrains Mono (codes/timestamps)
**Component classes** defined in `index.css`:
- `.glass-card` — dark frosted card
- `.btn-primary/secondary/danger/success` — button variants
- `.input-field`, `.select-field`, `.label` — form elements
- `.badge-dispatched`, `.badge-cancelled` — status pills
- `.sidebar-link`, `.sidebar-link-active` — nav items
- `.table-header`, `.table-cell`, `.table-row` — table styling
