import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Package, MapPin, ChevronDown, ChevronUp } from 'lucide-react'

const statusConfig = {
  'Order Received': { color: 'bg-gray-100 text-gray-600', step: 1 },
  'In Process':     { color: 'bg-yellow-100 text-yellow-700', step: 2 },
  'Ready':          { color: 'bg-blue-100 text-blue-700', step: 3 },
  'Dispatched':     { color: 'bg-purple-100 text-purple-700', step: 4 },
  'Delivered':      { color: 'bg-green-100 text-green-700', step: 5 },
  'Cancelled':      { color: 'bg-red-100 text-red-600', step: 0 },
}

const steps = ['Order Received', 'In Process', 'Ready', 'Dispatched', 'Delivered']

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my')
        setOrders(res.data.orders)
      } catch (err) {
        toast.error('Failed to load orders')
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-black text-gray-800">My Orders</h2>
          <p className="text-gray-400 text-sm">{orders.length} orders placed</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-gray-100 rounded-lg p-16 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-700 font-bold text-lg">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Browse catalog and place your first order</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded font-bold text-sm transition"
            >
              Browse Products →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig['Order Received']
              const isExpanded = expanded === order._id

              return (
                <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">

                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-gray-800">{order.orderId}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded font-bold ${config.color}`}>
                          {order.status}
                        </span>
                        <span className="font-black text-gray-900">₹ {order.totalAmount}</span>
                        {isExpanded
                          ? <ChevronUp size={16} className="text-gray-400" />
                          : <ChevronDown size={16} className="text-gray-400" />
                        }
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    {order.status !== 'Cancelled' && (
                      <div className="mt-5">
                        <div className="relative flex items-center justify-between">
                          {/* Progress line background */}
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                          {/* Progress line filled */}
                          <div
                            className="absolute top-3 left-0 h-0.5 bg-amber-500 z-0 transition-all duration-500"
                            style={{ width: `${((config.step - 1) / (steps.length - 1)) * 100}%` }}
                          />
                          {steps.map((step, i) => (
                            <div key={step} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                                config.step >= i + 1
                                  ? 'bg-amber-500 border-amber-500 text-black'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}>
                                {config.step >= i + 1 ? '✓' : i + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2">
                          {steps.map((step) => (
                            <p key={step} className="text-xs text-gray-400 text-center w-20 leading-tight">{step}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.status === 'Cancelled' && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded px-3 py-2">
                        <p className="text-xs text-red-500 font-medium">This order has been cancelled</p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">

                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3">
                            <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">{item.name}</p>
                              {item.size && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded mt-1 inline-block">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-gray-800">₹ {item.price}</p>
                              <p className="text-xs text-gray-400">x{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      <div className="bg-white border border-gray-100 rounded-lg p-3 flex items-start gap-2">
                        <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                          {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10 py-4 px-6 flex items-center justify-between text-xs text-gray-400">
        <p>© 2024 – Style For You – All Rights Reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-gray-600 cursor-pointer">About us</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms & Conditions</span>
          <span className="hover:text-gray-600 cursor-pointer">Privacy & Policy</span>
        </div>
      </footer>
    </div>
  )
}

export default MyOrders