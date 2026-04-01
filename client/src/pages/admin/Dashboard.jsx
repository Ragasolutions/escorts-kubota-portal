import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import {
  ShoppingBag, Package, Users, ClipboardList,
  Plus, ArrowRight, TrendingUp
} from 'lucide-react'

const statusColors = {
  'Order Received': 'bg-gray-100 text-gray-600',
  'In Process':     'bg-yellow-100 text-yellow-700',
  'Ready':          'bg-blue-100 text-blue-700',
  'Dispatched':     'bg-purple-100 text-purple-700',
  'Delivered':      'bg-green-100 text-green-700',
  'Cancelled':      'bg-red-100 text-red-600',
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders?limit=5'),
          api.get('/products?limit=1'),
          api.get('/users?limit=1'),
        ])
        setStats({
          totalOrders: ordersRes.data.total,
          totalProducts: productsRes.data.total,
          totalUsers: usersRes.data.total,
          recentOrders: ordersRes.data.orders,
        })
      } catch (err) {
        toast.error('Failed to load dashboard')
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ClipboardList,
      bg: 'bg-blue-50',
      color: 'text-blue-700',
      path: '/admin/orders',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      bg: 'bg-green-50',
      color: 'text-green-700',
      path: '/admin/products',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      bg: 'bg-purple-50',
      color: 'text-purple-700',
      path: '/admin/users',
    },
  ]

  const quickActions = [
    { label: 'Add Product', icon: Plus, path: '/admin/products', bg: 'bg-green-50 hover:bg-green-100', color: 'text-green-700' },
    { label: 'View Orders', icon: ClipboardList, path: '/admin/orders', bg: 'bg-blue-50 hover:bg-blue-100', color: 'text-blue-700' },
    { label: 'Manage Users', icon: Users, path: '/admin/users', bg: 'bg-purple-50 hover:bg-purple-100', color: 'text-purple-700' },
    { label: 'View Catalog', icon: ShoppingBag, path: '/home', bg: 'bg-orange-50 hover:bg-orange-100', color: 'text-orange-700' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header Banner */}
        <div className="bg-green-700 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-green-800 rounded-full translate-y-1/2 opacity-30" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Welcome back, Admin</p>
              <h1 className="text-2xl font-black mt-1">Escorts Kubota Portal</h1>
              <p className="text-green-200 text-sm mt-1">Here's what's happening today</p>
            </div>
            <div className="hidden md:flex w-16 h-16 bg-white bg-opacity-10 rounded-2xl items-center justify-center">
              <TrendingUp size={32} className="text-white" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-green-700 transition" />
              </div>
              {loading ? (
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-black text-gray-800">{card.value}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.bg} ${action.color} rounded-2xl p-4 text-center transition`}
            >
              <div className="flex justify-center mb-2">
                <action.icon size={22} />
              </div>
              <p className="text-xs font-bold">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-green-700 font-bold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <ClipboardList size={40} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Dealer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-black text-gray-800">{order.orderId}</td>
                    <td className="px-5 py-3 text-gray-500">{order.user?.name || 'N/A'}</td>
                    <td className="px-5 py-3 font-bold text-green-700">₹{order.totalAmount}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard