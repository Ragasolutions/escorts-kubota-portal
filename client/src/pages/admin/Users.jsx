import { useState, useEffect } from 'react'
import api from '../../services/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Users as UsersIcon, X, ToggleLeft, ToggleRight } from 'lucide-react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterRole, setFilterRole] = useState('')
  const [form, setForm] = useState({
    code: '', name: '', phone: '', email: '', role: 'dealer'
  })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data.users)
    } catch (err) {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.phone || !form.role) {
      return toast.error('Code, name, phone and role are required')
    }
    try {
      await api.post('/users', form)
      toast.success('User created!')
      setShowForm(false)
      setForm({ code: '', name: '', phone: '', email: '', role: 'dealer' })
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleToggle = async (id, isActive) => {
    try {
      await api.patch(`/users/${id}/toggle-status`)
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !isActive } : u))
      toast.success(isActive ? 'User deactivated' : 'User activated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users

  const roleConfig = {
    admin:    { color: 'bg-purple-100 text-purple-700' },
    dealer:   { color: 'bg-blue-100 text-blue-700' },
    employee: { color: 'bg-orange-100 text-orange-700' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-gray-800">Manage Users</h2>
            <p className="text-gray-400 text-sm">{users.length} users registered</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-green-100"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['', 'admin', 'dealer', 'employee'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filterRole === role
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-green-500'
              }`}
            >
              {role === '' ? `All (${users.length})` : `${role.charAt(0).toUpperCase() + role.slice(1)} (${users.filter(u => u.role === role).length})`}
            </button>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-800">Add New User</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <input
                  placeholder="Dealer Code * (e.g. EK-004)"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Phone Number *"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="dealer">Dealer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 px-6 pb-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-bold transition"
                >
                  Create User
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <UsersIcon size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-black text-sm">{user.name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">+91 {user.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${roleConfig[user.role]?.color}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(user._id, user.isActive)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                          user.isActive
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive
                          ? <><ToggleRight size={14} /> Deactivate</>
                          : <><ToggleLeft size={14} /> Activate</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users