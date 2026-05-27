import React, { useEffect, useState } from 'react'
import { RiSearchLine, RiDownloadLine, RiRefreshLine, RiFileDownloadLine, RiUpload2Fill } from 'react-icons/ri'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import { returnAPI } from '../../api/return'
import toast from 'react-hot-toast'

// Generate light theme utility styles (override Tailwind's dark palette)
const lightTheme = {
  container: "space-y-3 bg-white p-4 rounded-md shadow-sm",
  label: "text-gray-700 font-medium",
  input: "input-field pl-9 w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-200",
  select: "select-field w-auto min-w-[140px] bg-white border border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-200",
  selectPartner: "select-field w-auto min-w-[160px] bg-white border border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-200",
  button: "btn-secondary bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200",
  buttonDisabled: "opacity-60 cursor-not-allowed",
  dateInput: "input-field w-auto bg-white border border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-200",
  icon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
  to: "text-gray-500 text-sm"
}

export default function AWBFilterBar({ filters, onChange, onRefresh }) {
  const [partners, setPartners] = useState([])
  const [brands, setBrands] = useState([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    channelPartnersAPI.list().then(r => setPartners(r.data?.data || []))
    brandsAPI.list().then(r => setBrands(r.data?.data || []))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await returnAPI.exportCsv(filters)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `awb-export-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={lightTheme.container}>
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className={lightTheme.icon} />
          <input
            type="text"
            placeholder="Search AWB..."
            value={filters.search || ''}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            className={lightTheme.input}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={e => onChange({ status: e.target.value, page: 1 })}
          className={lightTheme.select}
        >
          <option value="">All Status</option>
          <option value="dispatched">Dispatched</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Channel Partner */}
        <select
          value={filters.channelPartnerId || ''}
          onChange={e => onChange({ channelPartnerId: e.target.value, page: 1 })}
          className={lightTheme.selectPartner}
        >
          <option value="">All Partners</option>
          {partners.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={filters.brandId || ''}
          onChange={e => onChange({ brandId: e.target.value, page: 1 })}
          className={lightTheme.select}
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => onChange({ startDate: e.target.value, page: 1 })}
            className={lightTheme.dateInput}
          />
          <span className={lightTheme.to}>to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => onChange({ endDate: e.target.value, page: 1 })}
            className={lightTheme.dateInput}
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={onRefresh}
            className={lightTheme.button}
            type="button"
          >
            <RiRefreshLine />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`${lightTheme.button} ${exporting ? lightTheme.buttonDisabled : ''}`}
            type="button"
          >
            <RiUpload2Fill/>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
