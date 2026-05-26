import React from 'react'
import { RiArrowLeftLine, RiArrowRightLine, RiLoader4Line } from 'react-icons/ri'

// Light theme overrides for table elements
const lightTableHeader =
  "px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50 border-b border-gray-200"
const lightTableRow = "bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-blue-50 transition"
const lightTableCell = "px-4 py-3 text-sm text-gray-800"
const lightLoader = "animate-spin text-blue-500 text-3xl"
const lightEmptyArea =
  "flex flex-col items-center justify-center py-20 text-gray-400"
const lightEmptyIcon = "text-4xl mb-3"
const lightEmptyMsg = "text-sm"
const lightPaginationContainer =
  "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200"
const lightPaginationSpan = "text-xs text-gray-500"
const lightBtnSecondary =
  "btn-secondary px-3 py-2 bg-white border border-gray-300 text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
const lightPageNumActive =
  "w-8 h-8 rounded-lg text-xs font-medium bg-blue-600 text-white"
const lightPageNum =
  "w-8 h-8 rounded-lg text-xs font-medium text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-all"

export function DataTable({ columns, data, loading, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className={lightLoader} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={lightEmptyArea}>
        <div className={lightEmptyIcon}>📭</div>
        <div className={lightEmptyMsg}>{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] bg-white border border-gray-200 rounded-xl shadow-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={lightTableHeader}
                style={{ width: col.width }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id || i} className={lightTableRow}>
              {columns.map((col) => (
                <td key={col.key} className={lightTableCell}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
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

  // Generate page buttons (light theme)
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
    <div className={lightPaginationContainer}>
      <span className={lightPaginationSpan}>
        Showing {from}–{to} of {total} records
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={lightBtnSecondary}
          aria-label="Previous"
        >
          <RiArrowLeftLine />
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={p === page ? lightPageNumActive : lightPageNum}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className={lightBtnSecondary}
          aria-label="Next"
        >
          <RiArrowRightLine />
        </button>
      </div>
    </div>
  )
}
