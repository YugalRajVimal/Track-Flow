import React, { useState, useEffect, useCallback } from 'react'
import { RiSearchLine } from 'react-icons/ri'
import dayjs from 'dayjs'
import { auditLogsAPI } from '../api/services'
import { DataTable, Pagination } from '../components/common/DataTable'
import toast from 'react-hot-toast'

// -- Light theme color mappings --
const ACTION_COLORS = {
  create: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  update: 'text-blue-700 bg-blue-100 border-blue-200',
  delete: 'text-red-700 bg-red-100 border-red-200',
  cancel: 'text-amber-700 bg-amber-100 border-amber-200',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', actionType: '', startDate: '', endDate: '' })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const res = await auditLogsAPI.list(params)
      if (res.data?.success) {
        setLogs(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const columns = [
    {
      key: 'actionType',
      label: 'Action',
      render: (val) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${ACTION_COLORS[val] || 'text-gray-400 bg-gray-100 border-gray-200'}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'userId',
      label: 'User',
      render: (val) => val?.name || val?.email || '—',
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <span className="text-gray-600 text-xs">{val || '—'}</span>,
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      render: (val) => val ? (
        <span className="font-mono text-xs text-gray-500">{String(val).slice(-8)}</span>
      ) : '—',
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (val) => val ? (
        <span className="font-mono text-xs text-gray-500">
          {dayjs(val).format('MMM D, YYYY HH:mm:ss')}
        </span>
      ) : '—',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in bg-gray-50 min-h-screen">
      <div>
        <h1 className="page-title text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Complete record of all system actions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                className="input-field pl-9 w-full border-gray-200 bg-white text-gray-800 focus:border-blue-400"
              />
            </div>

            <select
              value={filters.actionType}
              onChange={e => setFilters(p => ({ ...p, actionType: e.target.value, page: 1 }))}
              className="select-field w-auto min-w-[140px] border-gray-200 bg-white text-gray-800"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="cancel">Cancel</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(p => ({ ...p, startDate: e.target.value, page: 1 }))}
              className="input-field w-auto border-gray-200 bg-white text-gray-800"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(p => ({ ...p, endDate: e.target.value, page: 1 }))}
              className="input-field w-auto border-gray-200 bg-white text-gray-800"
            />
          </div>
        </div>

        <div className="p-5 bg-white">
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyMessage="No audit logs found"
          />
          <Pagination
            pagination={pagination}
            onChange={(page) => setFilters(p => ({ ...p, page }))}
          />
        </div>
      </div>
    </div>
  )
}
