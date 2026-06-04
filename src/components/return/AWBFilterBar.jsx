
import React, { useEffect, useState } from 'react'
import { RiSearchLine, RiRefreshLine, RiUpload2Fill } from 'react-icons/ri'
import { channelPartnersAPI, brandsAPI } from '../../api/services'
import { returnAPI } from '../../api/return'
import toast from 'react-hot-toast'

// Theme colors
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
    `select-field w-full sm:w-auto min-w-[140px] bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
  selectPartner:
    `select-field w-full sm:w-auto min-w-[160px] bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
  button:
    `btn-secondary flex items-center gap-2 bg-[${orangeLight}] hover:bg-[${orange}] hover:text-white text-[${orangeText}] border border-[${orangeBorder}] transition-all duration-100`,
  buttonDisabled: "opacity-60 cursor-not-allowed",
  dateInput:
    `input-field w-full sm:w-auto bg-white border border-[${orangeBorder}] text-gray-900 focus:border-[${orange}] focus:ring-[${orange}]`,
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
      const exportFilters = {
        ...(filters.search        && { search:          filters.search }),
        ...(filters.status        && { status:          filters.status }),
        ...(filters.channelPartnerId && { channelPartnerId: filters.channelPartnerId }),
        ...(filters.brandId       && { brandId:         filters.brandId }),
        ...(filters.startDate     && { startDate:        filters.startDate }),
        ...(filters.endDate       && { endDate:          filters.endDate }),
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
      {/* Filters and search row - Responsive */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 w-full items-stretch md:items-center">

        <div className="relative flex-1 min-w-[180px]">
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

        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <select
            value={filters.status || ''}
            onChange={e => onChange({ status: e.target.value, page: 1 })}
            className={orangeTheme.select + " flex-1"}
            style={{
              borderColor: orange,
              outlineColor: orange,
            }}
          >
            <option value="">All Status</option>
            <option value="missing">Missing</option>
            <option value="-">Returned</option>
          </select>
          
          <select
            value={filters.channelPartnerId || ''}
            onChange={e => onChange({ channelPartnerId: e.target.value, page: 1 })}
            className={orangeTheme.selectPartner + " flex-1"}
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

          <select
            value={filters.brandId || ''}
            onChange={e => onChange({ brandId: e.target.value, page: 1 })}
            className={orangeTheme.select + " flex-1"}
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
      </div>

      {/* Date and Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full mt-2">
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
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
          <span className={orangeTheme.to + " sm:px-1"}>to</span>
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

        {/* Right-aligned buttons, stacked on mobile */}
        <div className="flex flex-row gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
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
            <RiRefreshLine className="shrink-0" />
            <span className="hidden xs:inline">Refresh</span>
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
            <RiUpload2Fill className="shrink-0" />
            <span className="hidden xs:inline">{exporting ? 'Exporting...' : 'Export CSV'}</span>
            <span className="inline xs:hidden">{exporting ? '...' : 'CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
