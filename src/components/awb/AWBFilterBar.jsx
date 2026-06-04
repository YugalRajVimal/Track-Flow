import React, { useEffect, useState } from 'react'
import { RiSearchLine, RiRefreshLine, RiUpload2Fill } from 'react-icons/ri'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import { awbAPI } from '../../api/awb'
import toast from 'react-hot-toast'

// Orange & white theme utility styles (#f58021)
const orange = "#f58021"
const orangeBorder = "border-orange-200"
const orangeFocus = "focus:border-[#f58021] focus:ring-[#f58021]/20"
const lightTheme = {
  container: "space-y-3 bg-white p-4 rounded-md shadow-sm",
  label: "text-[#f58021] font-medium",
  input: `input-field pl-9 w-full bg-white border ${orangeBorder} text-[#191919] placeholder-orange-200 ${orangeFocus}`,
  select: `select-field w-full sm:w-auto min-w-[140px] bg-white border ${orangeBorder} text-[#f58021] ${orangeFocus}`,
  selectPartner: `select-field w-full sm:w-auto min-w-[160px] bg-white border ${orangeBorder} text-[#f58021] ${orangeFocus}`,
  button: `btn-secondary bg-[#fff8f2] hover:bg-[#f58021] hover:text-white text-[#f58021] border ${orangeBorder} font-medium transition whitespace-nowrap`,
  buttonDisabled: "opacity-60 cursor-not-allowed",
  dateInput: `input-field w-full sm:w-auto bg-white border ${orangeBorder} text-[#191919] ${orangeFocus}`,
  icon: "absolute left-3 top-1/2 -translate-y-1/2 text-orange-200",
  to: "text-orange-400 text-sm"
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
      const res = await awbAPI.exportCsv(filters)
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
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
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
        <div className="w-full sm:w-auto">
          <select
            value={filters.status || ''}
            onChange={e => onChange({ status: e.target.value, page: 1 })}
            className={lightTheme.select}
          >
            <option value="">All Status</option>
            <option value="dispatched">Dispatched</option>
            <option value="cancelled">Cancelled</option>
            <option value="missing">Missing</option>
          </select>
        </div>

        {/* Channel Partner */}
        <div className="w-full sm:w-auto">
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
        </div>

        {/* Brand */}
        <div className="w-full sm:w-auto">
          <select
            value={filters.brandId || ''}
            onChange={e => onChange({ brandId: e.target.value, page: 1 })}
            className={lightTheme.select}
          >
            <option value="">All Brands</option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.displayName ? b.displayName : b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        {/* Date range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => onChange({ startDate: e.target.value, page: 1 })}
            className={lightTheme.dateInput}
          />
          <span className={lightTheme.to + " self-center"}>to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => onChange({ endDate: e.target.value, page: 1 })}
            className={lightTheme.dateInput}
          />
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className={lightTheme.button}
            type="button"
          >
            <RiRefreshLine />
            <span className="sr-only sm:not-sr-only">Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`${lightTheme.button} ${exporting ? lightTheme.buttonDisabled : ''}`}
            type="button"
          >
            <RiUpload2Fill />
            <span className="sr-only sm:not-sr-only">{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
