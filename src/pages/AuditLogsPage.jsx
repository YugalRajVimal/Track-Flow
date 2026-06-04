import React, { useState, useEffect, useCallback } from 'react'
import { RiSearchLine } from 'react-icons/ri'
import dayjs from 'dayjs'
import { auditLogsAPI } from '../api/services'
import { DataTable, Pagination } from '../components/common/DataTable'
import toast from 'react-hot-toast'

// -- Orange theme for action colors, rest is black & white --
const ACTION_COLORS = {
  create: 'text-white bg-orange-500 border-orange-700',
  update: 'text-white bg-orange-400 border-orange-700',
  delete: 'text-white bg-orange-700 border-orange-700',
  cancel: 'text-white bg-orange-300 border-orange-700',
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${ACTION_COLORS[val] || 'text-gray-600 bg-white border-gray-400'}`}>
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
      render: (val) => <span className="text-black text-xs">{val || '—'}</span>,
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      render: (val) => val ? (
        <span className="font-mono text-xs text-black">{String(val).slice(-8)}</span>
      ) : '—',
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (val) => val ? (
        <span className="font-mono text-xs text-black">
          {dayjs(val).format('MMM D, YYYY HH:mm:ss')}
        </span>
      ) : '—',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in bg-white min-h-screen">
      <div>
        <h1 className="page-title text-black">Audit Logs</h1>
        <p className="text-black text-sm mt-1">Complete record of all system actions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-black">
        {/* Filters */}
        <div className="p-5 border-b border-black bg-white">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                className="pl-9 w-full border border-black bg-white text-black focus:border-orange-500 rounded-md py-2 px-3"
              />
            </div>

            <select
              value={filters.actionType}
              onChange={e => setFilters(p => ({ ...p, actionType: e.target.value, page: 1 }))}
              className="w-auto min-w-[140px] border border-black bg-white text-black rounded-md py-2 px-3"
              style={{ appearance: 'none', cursor: 'pointer' }}
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
              className="border border-black bg-white text-black rounded-md py-2 px-3 w-auto"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(p => ({ ...p, endDate: e.target.value, page: 1 }))}
              className="border border-black bg-white text-black rounded-md py-2 px-3 w-auto"
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
            buttonClassName="bg-orange-500 text-white border border-orange-700 hover:bg-orange-600 active:bg-orange-700 focus:ring-orange-300"
          />
        </div>
      </div>
    </div>
  )
}
