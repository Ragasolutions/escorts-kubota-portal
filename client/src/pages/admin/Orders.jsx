import { useState, useEffect } from 'react'
import api from '../../services/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react'

const statusColors = {
  'Order Received':
    'bg-gray-100 text-gray-600',

  'In Process':
    'bg-yellow-100 text-yellow-700',

  Ready:
    'bg-blue-100 text-blue-700',

  Dispatched:
    'bg-purple-100 text-purple-700',

  Delivered:
    'bg-green-100 text-green-700',

  Cancelled:
    'bg-red-100 text-red-600',
}

const allStatuses = [
  'Order Received',
  'In Process',
  'Ready',
  'Dispatched',
  'Delivered',
  'Cancelled',
]

const Orders = () => {

  const [orders, setOrders] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [updatingId, setUpdatingId] =
    useState(null)

  const [expanded, setExpanded] =
    useState(null)

  const [filterStatus, setFilterStatus] =
    useState('')

  useEffect(() => {

    fetchOrders()

  }, [])

  const fetchOrders = async () => {

    try {

      const res = await api.get(
        '/orders'
      )

      setOrders(res.data.orders)

    } catch (err) {

      toast.error(
        'Failed to load orders'
      )
    }

    setLoading(false)
  }

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {

    setUpdatingId(orderId)

    try {

      await api.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      )

      setOrders(
        orders.map((o) =>
          o._id === orderId
            ? {
                ...o,
                status: newStatus,
              }
            : o
        )
      )

      toast.success(
        'Status updated!'
      )

    } catch (err) {

      toast.error(
        err.response?.data
          ?.message ||
          'Failed to update'
      )
    }

    setUpdatingId(null)
  }

  const filtered = filterStatus
    ? orders.filter(
        (o) =>
          o.status === filterStatus
      )
    : orders

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <div>

            <h2 className="text-lg sm:text-xl font-black text-gray-800">

              Manage Orders
            </h2>

            <p className="text-gray-400 text-sm">

              {orders.length} total
              orders
            </p>
          </div>
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">

          <button
            onClick={() =>
              setFilterStatus('')
            }
            className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              !filterStatus
                ? 'bg-green-700 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-500'
            }`}
          >

            All ({orders.length})
          </button>

          {allStatuses.map((s) => {

            const count =
              orders.filter(
                (o) =>
                  o.status === s
              ).length

            if (count === 0)
              return null

            return (

              <button
                key={s}
                onClick={() =>
                  setFilterStatus(s)
                }
                className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                  filterStatus === s
                    ? 'bg-green-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-green-500'
                }`}
              >

                {s} ({count})
              </button>
            )
          })}
        </div>

        {/* Orders */}
        {loading ? (

          <div className="space-y-3">

            {[...Array(4)].map(
              (_, i) => (

                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 animate-pulse h-20"
                />
              )
            )}
          </div>

        ) : filtered.length ===
          0 ? (

          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">

            <ClipboardList
              size={40}
              className="text-gray-200 mx-auto mb-3"
            />

            <p className="text-gray-500 font-bold">

              No orders found
            </p>
          </div>

        ) : (

          <div className="space-y-3">

            {filtered.map((order) => {

              const isExpanded =
                expanded ===
                order._id

              return (

                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >

                  {/* Order Row */}
                  <div className="px-4 sm:px-5 py-4">

                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                      {/* Left */}
                      <div
                        className="flex items-start gap-4 flex-1 cursor-pointer min-w-0"
                        onClick={() =>
                          setExpanded(
                            isExpanded
                              ? null
                              : order._id
                          )
                        }
                      >

                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">

                          <ClipboardList
                            size={18}
                            className="text-green-700"
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="font-black text-gray-800 break-all">

                            {
                              order.orderId
                            }
                          </p>

                          <p className="text-xs text-gray-400 break-words">

                            {
                              order.user
                                ?.name
                            }{' '}
                            ·{' '}
                            {
                              order.user
                                ?.code
                            }{' '}
                            ·{' '}
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              'en-IN'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

                        <p className="font-black text-green-700 text-sm sm:text-base whitespace-nowrap">

                          ₹
                          {
                            order.totalAmount
                          }
                        </p>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap ${statusColors[order.status]}`}
                        >

                          {
                            order.status
                          }
                        </span>

                        {/* Status Dropdown */}
                        <select
                          value={
                            order.status
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              e.target
                                .value
                            )
                          }
                          className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium w-full sm:w-auto"
                        >

                          {allStatuses.map(
                            (s) => (

                              <option
                                key={s}
                                value={s}
                              >

                                {s}
                              </option>
                            )
                          )}
                        </select>

                        <button
                          onClick={() =>
                            setExpanded(
                              isExpanded
                                ? null
                                : order._id
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition shrink-0"
                        >

                          {isExpanded ? (

                            <ChevronUp
                              size={16}
                              className="text-gray-400"
                            />

                          ) : (

                            <ChevronDown
                              size={16}
                              className="text-gray-400"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (

                    <div className="border-t border-gray-100 px-4 sm:px-5 py-4">

                      <div className="space-y-3 mb-4">

                        {order.items.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center gap-3"
                            >

                              <div className="w-full sm:w-12 h-40 sm:h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">

                                {item.image ? (

                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name
                                    }
                                    className="w-full h-full object-cover"
                                  />

                                ) : (

                                  <Package
                                    size={
                                      18
                                    }
                                    className="text-gray-300"
                                  />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">

                                <p className="text-sm font-bold text-gray-800 break-words">

                                  {
                                    item.name
                                  }
                                </p>

                                {item.size && (

                                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full inline-block mt-1">

                                    Size:{' '}
                                    {
                                      item.size
                                    }
                                  </span>
                                )}
                              </div>

                              <div className="text-left sm:text-right">

                                <p className="text-sm font-black text-gray-800">

                                  ₹
                                  {
                                    item.price
                                  }
                                </p>

                                <p className="text-xs text-gray-400">

                                  x
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-50 rounded-xl p-3">

                        <p className="text-xs font-bold text-gray-500 mb-1">

                          SHIPPING
                          ADDRESS
                        </p>

                        <p className="text-sm text-gray-600 break-words leading-relaxed">

                          {
                            order
                              .shippingAddress
                              ?.street
                          }
                          ,{' '}
                          {
                            order
                              .shippingAddress
                              ?.city
                          }
                          ,{' '}
                          {
                            order
                              .shippingAddress
                              ?.state
                          }{' '}
                          -{' '}
                          {
                            order
                              .shippingAddress
                              ?.pincode
                          }
                        </p>

                        <p className="text-sm text-gray-500 mt-0.5 break-all">

                          📞{' '}
                          {
                            order
                              .shippingAddress
                              ?.phone
                          }
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
    </div>
  )
}

export default Orders