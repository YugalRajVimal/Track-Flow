import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiToggleLine } from 'react-icons/ri'
import { usersAPI } from '../api/services'
import { DataTable, Pagination } from '../components/common/DataTable'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EntityFormModal from '../components/admin/EntityFormModal'
import dayjs from 'dayjs'

// Black & white theme, with orange buttons/icons
const styles = {
  labelSecondary: 'text-black',                  // Black text
  labelSecondaryStrong: 'text-black font-semibold',
  border: 'border-black/10',                     // Faint black border
  cardBg: 'bg-white shadow-sm border border-black/10',
  neutral: 'text-black',                         // Black text for main content
  muted: 'text-black/30',                        // Light black for muted/disabled
  btnPrimary: 'bg-orange-500 text-white hover:bg-orange-600', // Orange button, white text
  btn: 'p-1.5 text-orange-500 hover:text-white hover:bg-orange-500 rounded-lg transition-all', // Orange icon/buttons
  tagAdmin: 'text-black bg-white border-black/20',   // Black/white
  tagUser: 'text-black bg-white border-black/10',    // Black/white
  tagActive: 'text-black bg-white border-black/10',  // Black/white
  tagInactive: 'text-black bg-white border-black/10' // Black/white
}

const USER_FIELDS = [
  { name: 'name', label: 'Full Name', required: true, placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john@example.com' },
  {
    name: 'password', label: 'Password', type: 'password', placeholder: '••••••••',
    validation: { minLength: { value: 6, message: 'Min 6 characters' } }
  },
  {
    name: 'passcode', label: 'Passcode', type: 'text', required: true, placeholder: 'e.g. 12345',
    validation: { pattern: { value: /^\d{5}$/, message: 'Passcode must be exactly 5 digits' } }
  },
  {
    name: 'role', label: 'Role', type: 'select', required: true,
    options: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersAPI.list({ page, limit: 10 })
      if (res.data?.success) {
        setUsers(res.data.data || [])
        setPagination(res.data.pagination || null)
      }
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        const payload = { ...data }
        if (!payload.password) delete payload.password
        if (!payload.passcode) delete payload.passcode
        await usersAPI.update(editing._id, payload)
        toast.success('User updated')
      } else {
        await usersAPI.create(data)
        toast.success('User created')
      }
      setModalOpen(false)
      setEditing(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      await usersAPI.delete(deleteItem._id)
      toast.success('User deleted')
      fetchUsers()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false); setDeleteItem(null) }
  }

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      await usersAPI.toggleStatus(user._id, { status: newStatus })
      toast.success(`User ${newStatus}`)
      fetchUsers()
    } catch { toast.error('Failed to update status') }
  }

  const columns = [
    { key: 'name', label: 'Name', render: v => <span className={styles.neutral}>{v}</span> },
    { key: 'email', label: 'Email', render: v => <span className={`${styles.labelSecondary} text-xs`}>{v}</span> },
    {
      key: 'passcode', label: 'Passcode',
      render: v => <span className="text-xs">{v ? v : <span className={styles.muted}>—</span>}</span>
    },
    {
      key: 'role', label: 'Role',
      render: v => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          v === 'admin'
            ? styles.tagAdmin
            : styles.tagUser
        }`}>{v}</span>
      )
    },
    {
      key: 'status', label: 'Status',
      render: v => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          v === 'active'
            ? styles.tagActive
            : styles.tagInactive
        }`}>{v || 'active'}</span>
      )
    },
    {
      key: 'createdAt', label: 'Created',
      render: v => v ? <span className="text-xs text-black/30">{dayjs(v).format('MMM D, YYYY')}</span> : '—'
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setEditing(row); setModalOpen(true) }}
            className={styles.btn}>
            <RiEditLine className="text-orange-500" />
          </button>
          <button onClick={() => handleToggleStatus(row)}
            className={styles.btn}>
            <RiToggleLine className="text-orange-500" />
          </button>
          <button onClick={() => setDeleteItem(row)}
            className={styles.btn}>
            <RiDeleteBinLine className="text-orange-500" />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete User"
        message={`Delete user "${deleteItem?.name}"?`} />
      <EntityFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSave}
        title={editing ? 'Edit User' : 'Add User'}
        fields={editing
          ? USER_FIELDS.map(f =>
              f.name === 'password'
                ? { ...f, required: false }
                : f.name === 'passcode'
                ? { ...f, required: false }
                : f
            )
          : USER_FIELDS
        }
        defaultValues={editing || {}}
        loading={saving}
      />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-black">Users</h1>
            <p className={`${styles.labelSecondary} text-sm mt-1`}>Manage platform users</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className={`btn-primary flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm ${styles.btnPrimary}`}
          >
            <RiAddLine className="text-white" /> Add User
          </button>
        </div>
        <div className={`overflow-hidden rounded-2xl ${styles.cardBg}`}>
          <div className="p-5">
            <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" />
            <Pagination pagination={pagination} onChange={setPage} />
          </div>
        </div>
      </div>
    </>
  )
}
