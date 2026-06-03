

import React, { useEffect, useState } from 'react'
import { RiSearchLine, RiDownloadLine, RiRefreshLine, RiFileDownloadLine, RiUpload2Fill } from 'react-icons/ri'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import { returnAPI } from '../../api/return'
import toast from 'react-hot-toast'

// Generate orange theme utility styles (override Tailwind's palette)
const orange = '#f58021'
const orangeLight = '#fff5e6'
const orangeBorder = '#f58021'
const orangeText = '#f58021'

const orangeTheme = {
  container: "space-y-3 bg-white p-4 rounded-md shadow-sm",
  label: "text-gray-700 font-medium",
  input:
    `input-field pl-9 w-full bg-white border border-[${orangeBorder}] text-gray-900 placeholder-gray-400 focus:border-[${orange}] focus:ring-[${orange}]`,
  select:
    `select-field w-auto min-w-[140px] bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
  selectPartner:
    `select-field w-auto min-w-[160px] bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
  button:
    `btn-secondary flex items-center gap-2 bg-[${orangeLight}] hover:bg-[${orange}] hover:text-white text-[${orangeText}] border border-[${orangeBorder}] transition-all duration-100`,
  buttonDisabled: "opacity-60 cursor-not-allowed",
  dateInput:
    `input-field w-auto bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
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
      // Pass ALL active filters — same ones used by the table fetch
      const exportFilters = {
        ...(filters.search        && { search:          filters.search }),
        ...(filters.status        && { status:          filters.status }),
        ...(filters.channelPartnerId && { channelPartnerId: filters.channelPartnerId }),
        ...(filters.brandId       && { brandId:         filters.brandId }),
        ...(filters.startDate     && { startDate:        filters.startDate }),
        ...(filters.endDate       && { endDate:          filters.endDate }),
        // Don't send page/limit — export should return all matched records
        sortBy:    filters.sortBy    || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
      }
      const res = await returnAPI.exportCsv(exportFilters)
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
    <div className={orangeTheme.container}>
      <div className="flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className={orangeTheme.icon} />
          <input
            type="text"
            placeholder="Search AWB..."
            value={filters.search || ''}
            onChange={e => onChange({ search: e.target.value, page: 1 })}
            className={orangeTheme.input}
            style={{
              borderColor: orange,
              outlineColor: orange,
            }}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={e => onChange({ status: e.target.value, page: 1 })}
          className={orangeTheme.select}
          style={{
            borderColor: orange,
            outlineColor: orange,
          }}
        >
          <option value="">All Status</option>
          <option value="missing">Missing</option>
        </select>

        {/* Channel Partner */}
        <select
          value={filters.channelPartnerId || ''}
          onChange={e => onChange({ channelPartnerId: e.target.value, page: 1 })}
          className={orangeTheme.selectPartner}
          style={{
            borderColor: orange,
            outlineColor: orange,
          }}
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
          className={orangeTheme.select}
          style={{
            borderColor: orange,
            outlineColor: orange,
          }}
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b._id} value={b._id}>{b.displayName ? b.displayName : b.name}</option>
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
            className={orangeTheme.dateInput}
            style={{
              borderColor: orange,
              outlineColor: orange,
            }}
          />
          <span className={orangeTheme.to}>to</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => onChange({ endDate: e.target.value, page: 1 })}
            className={orangeTheme.dateInput}
            style={{
              borderColor: orange,
              outlineColor: orange,
            }}
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={onRefresh}
            className={orangeTheme.button}
            type="button"
            style={{
              backgroundColor: orangeLight,
              color: orangeText,
              borderColor: orangeBorder,
            }}
          >
            <RiRefreshLine />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`${orangeTheme.button} ${exporting ? orangeTheme.buttonDisabled : ''}`}
            type="button"
            style={{
              backgroundColor: orangeLight,
              color: orangeText,
              borderColor: orangeBorder,
            }}
          >
            <RiUpload2Fill />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
