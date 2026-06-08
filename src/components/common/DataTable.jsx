import React from 'react'
import { RiArrowLeftLine, RiArrowRightLine, RiLoader4Line } from 'react-icons/ri'

// Black & white theme overrides for table elements (except orange buttons/icons)
const orange = "#f58021"
const tableHeader =
  "px-4 py-3 text-left text-xs font-semibold text-black bg-white border-b border-black/10"
const tableRow = "bg-white even:bg-[#f6f6f6] border-b border-black/10 hover:bg-black/5 transition"
const tableCell = "px-4 py-3 text-sm text-black"
const loaderClass = "animate-spin text-[#f58021] text-3xl"
const emptyArea =
  "flex flex-col items-center justify-center py-20 text-black/25"
const emptyIcon = "text-4xl mb-3"
const emptyMsg = "text-sm"
const paginationContainer =
  "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-black/10"
const paginationSpan = "text-xs text-black/40"
const btnSecondary =
  "btn-secondary px-3 py-2  border border-[#f58021] text-white hover:bg-white hover:text-[#f58021] hover:border-[#f58021] disabled:opacity-40 disabled:cursor-not-allowed transition"
const pageNumActive =
  "w-8 h-8 rounded-lg text-xs font-medium bg-[#f58021] text-white ring-2 ring-[#f58021]"
const pageNum =
  "w-8 h-8 rounded-lg text-xs font-medium text-[#f58021] hover:bg-black/10 hover:text-[#f58021] transition-all"

// Helper to format date as YYYY-MM-DD
function formatDate(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    // Pad month and day
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch (e) {
    return String(val)
  }
}

// Helper to transform status
function getDisplayStatus(value) {
  // If value is exactly "-" (explicit string), show "Returned"
  return value === '-' ? 'Returned' : (value ?? '—')
}

export function DataTable({ columns, data, loading, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className={loaderClass} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={emptyArea}>
        <div className={emptyIcon}>📭</div>
        <div className={emptyMsg}>{emptyMessage}</div>
      </div>
    )
  }

  // We need to know which column (if any) is "status"
  // `columns` is an array of { key, label, ... }
  // Patch the render function for the column with key === 'status'
  // so that if value is '-', we display 'Returned'
  const patchedColumns = columns.map(col => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (value, row) => getDisplayStatus(value)
      }
    }
    return col
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] bg-white border border-black/10 rounded-xl shadow-sm">
        <thead>
          <tr>
            {patchedColumns.map((col) => (
              <th
                key={col.key}
                className={tableHeader}
                style={{ width: col.width }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
            {/* If any row has missingFromDate or missingToDate, add headers if not already present in columns */}
            {data.some(r => r.missingFromDate) && !patchedColumns.find(col => col.key === 'missingFromDate') && (
              <th className={tableHeader} scope="col" style={{width: 130}}>Missing From</th>
            )}
            {data.some(r => r.missingToDate) && !patchedColumns.find(col => col.key === 'missingToDate') && (
              <th className={tableHeader} scope="col" style={{width: 130}}>Missing To</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} className={tableRow}>
              {patchedColumns.map((col) => (
                <td key={col.key} className={tableCell}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
              {/* Show missingFromDate if present and not already rendered by column */}
              {data.some(r => r.missingFromDate) && !patchedColumns.find(col => col.key === 'missingFromDate') && (
                <td className={tableCell}>
                  {row.missingFromDate ? formatDate(row.missingFromDate) : '—'}
                </td>
              )}
              {/* Show missingToDate if present and not already rendered by column */}
              {data.some(r => r.missingToDate) && !patchedColumns.find(col => col.key === 'missingToDate') && (
                <td className={tableCell}>
                  {row.missingToDate ? formatDate(row.missingToDate) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  // Generate page buttons (orange theme)
  const getPageNumbers = () => {
    let nums = []
    const max = Math.min(pages, 7)
    if (pages <= 7 || page <= 4) {
      for (let i = 1; i <= max; i++) nums.push(i)
    } else if (page > 4 && page < pages - 3) {
      for (let i = page - 3 + 1; i <= page + 3; i++) nums.push(i)
    } else {
      for (let i = pages - 6 + 1; i <= pages; i++) nums.push(i)
    }
    return nums
  }

  return (
    <div className={paginationContainer}>
      <span className={paginationSpan}>
        Showing {from}–{to} of {total} records
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={btnSecondary}
          aria-label="Previous"
        >
          <RiArrowLeftLine color={orange} />
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={p === page ? pageNumActive : pageNum}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className={btnSecondary}
          aria-label="Next"
        >
          <RiArrowRightLine color={orange} />
        </button>
      </div>
    </div>
  )
}
