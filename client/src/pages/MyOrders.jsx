import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  Package,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'


const statusConfig = {
  'Order Received': {
    color: 'bg-gray-100 text-gray-600',
    step: 1,
  },

  'In Process': {
    color: 'bg-yellow-100 text-yellow-700',
    step: 2,
  },

  Ready: {
    color: 'bg-blue-100 text-blue-700',
    step: 3,
  },

  Dispatched: {
    color: 'bg-purple-100 text-purple-700',
    step: 4,
  },

  Delivered: {
    color: 'bg-green-100 text-green-700',
    step: 5,
  },

  Cancelled: {
    color: 'bg-red-100 text-red-600',
    step: 0,
  },
}

const steps = [
  'Order Received',
  'In Process',
  'Ready',
  'Dispatched',
  'Delivered',
]

const MyOrders = () => {

  const [orders, setOrders] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [expanded, setExpanded] =
    useState(null)
const [downloadingInvoice, setDownloadingInvoice] =
  useState(null)
  const navigate = useNavigate()
const { token } = useAuth()
  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await api.get(
          '/orders/my'
        )

        setOrders(res.data.orders)

      } catch (err) {

        toast.error(
          'Failed to load orders' , err
        )
      }

      setLoading(false)
    }

    fetchOrders()

  }, [])

  const cart =
    JSON.parse(
      localStorage.getItem('cart')
    ) || []

  const cartCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

 const handleInvoiceDownload = async (
  orderId
) => {
  try {

    setDownloadingInvoice(orderId)

    const response = await api.get(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}/invoice`,
      {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    )

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      `Invoice-${orderId}.pdf`

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)

  } catch (error) {

    console.error(error)

    toast.error(
      'Failed to download invoice'
    )

  } finally {

    setDownloadingInvoice(null)

  }
}

  return (
    <div className="min-h-screen bg-white">

      <Navbar cartCount={cartCount} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-4">

          <h2 className="text-lg sm:text-xl font-black text-gray-800">
            My Orders
          </h2>

          <p className="text-gray-400 text-sm">
            {orders.length} orders placed
          </p>
        </div>

        {loading ? (

          <div className="space-y-4">

            {[...Array(3)].map((_, i) => (

              <div
                key={i}
                className="border border-gray-100 rounded-lg p-4 animate-pulse"
              >

                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />

                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>

        ) : orders.length === 0 ? (

          <div className="border border-gray-100 rounded-lg p-8 sm:p-16 text-center">

            <Package
              size={48}
              className="text-gray-200 mx-auto mb-4"
            />

            <p className="text-gray-700 font-bold text-base sm:text-lg">
              No orders yet
            </p>

            <p className="text-gray-400 text-sm mt-1 mb-6">
              Browse catalog and place your first
              order
            </p>

            <button
              onClick={() =>
                navigate('/home')
              }
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 sm:px-6 py-2.5 rounded font-bold text-sm transition w-full sm:w-auto"
            >
              Browse Products →
            </button>
          </div>

        ) : (

          <div className="space-y-4">

            {orders.map((order) => {

              const config =
                statusConfig[
                  order.status
                ] ||
                statusConfig[
                  'Order Received'
                ]

              const isExpanded =
                expanded === order._id

              return (

                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >

                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() =>
                      setExpanded(
                        isExpanded
                          ? null
                          : order._id
                      )
                    }
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div className="min-w-0">

                        <p className="font-black text-gray-800 break-all">
                          {order.orderId}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">

                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                        <span
                          className={`text-xs px-3 py-1 rounded font-bold ${config.color}`}
                        >
                          {order.status}
                        </span>

                        <div className="text-right">
  <p className="text-[11px] text-gray-500">
    Final Amount
  </p>

  <p className="font-black text-green-600 text-lg">
    ₹ {order.finalAmount || order.totalAmount}
  </p>
</div>

                        {order.paymentStatus === 'paid' ? (
  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
    Paid ✓
  </span>
) : (
  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
    Payment Pending
  </span>
)}

                        {isExpanded ? (

                          <ChevronUp
                            size={16}
                            className="text-gray-400 shrink-0"
                          />

                        ) : (

                          <ChevronDown
                            size={16}
                            className="text-gray-400 shrink-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* Progress Tracker */}
                    {order.status !==
                      'Cancelled' && (

                      <div className="mt-5 overflow-x-auto">

                        <div className="min-w-[500px]">

                          <div className="relative flex items-center justify-between">

                            {/* Progress BG */}
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0" />

                            {/* Progress Fill */}
                            <div
                              className="absolute top-3 left-0 h-0.5 bg-amber-500 z-0 transition-all duration-500"
                              style={{
                                width: `${
                                  ((config.step -
                                    1) /
                                    (steps.length -
                                      1)) *
                                  100
                                }%`,
                              }}
                            />

                            {steps.map(
                              (step, i) => (

                                <div
                                  key={step}
                                  className="relative z-10 flex flex-col items-center"
                                >

                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
                                      config.step >=
                                      i + 1
                                        ? 'bg-amber-500 border-amber-500 text-black'
                                        : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {config.step >=
                                    i + 1
                                      ? '✓'
                                      : i + 1}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <div className="flex justify-between mt-2">

                            {steps.map((step) => (

                              <p
                                key={step}
                                className="text-[10px] sm:text-xs text-gray-400 text-center w-20 leading-tight"
                              >
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cancelled */}
                    {order.status ===
                      'Cancelled' && (

                      <div className="mt-3 bg-red-50 border border-red-100 rounded px-3 py-2">

                        <p className="text-xs text-red-500 font-medium">
                          This order has been
                          cancelled
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (

                    <div className="border-t border-gray-100 p-4 bg-gray-50">

                      {/* Items */}
                      <div className="space-y-3 mb-4">

                        {order.items.map(
                          (item, index) => (

                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-100 rounded-lg p-3"
                            >

                              <div className="w-full sm:w-14 h-44 sm:h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">

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
                                    size={20}
                                    className="text-gray-300"
                                  />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">

                                <p className="text-sm font-bold text-gray-800 break-words">
                                  {item.name}
                                </p>

                                {item.size && (

                                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded mt-1 inline-block">

                                    Size:
                                    {item.size}
                                  </span>
                                )}
                              </div>

                             <div className="text-left sm:text-right">

  <p className="text-xs text-gray-500">
    Qty: {item.quantity}
  </p>

  <p className="text-sm font-black text-gray-800">
    ₹ {(item.price * item.quantity).toFixed(2)}
  </p>

</div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">

  <h3 className="font-bold text-gray-800 mb-3">
    Order Summary
  </h3>

  <div className="space-y-2 text-sm">


<div className="flex justify-between">
  <span>Basic Amount</span>
  <span>₹ {order.basicAmount}</span>
</div>

<div className="flex justify-between text-green-600">
  <span>
    Rebate ({order.rebatePercent}%)
  </span>
  <span>
    - ₹ {order.rebateAmount}
  </span>
</div>

<div className="flex justify-between">
  <span>{order.gstType}</span>
  <span>
    + ₹ {order.gstAmount}
  </span>
</div>

<div className="border-t pt-2 flex justify-between font-black text-base">

  <span>Final Amount</span>

  <span className="text-green-600">
    ₹ {order.finalAmount}
  </span>

</div>


  </div>

</div>


                      {/* Address */}
                     <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">

  <div className="flex items-center gap-2 mb-3">


<MapPin
  size={16}
  className="text-amber-500"
/>

<h3 className="font-bold text-gray-800">
  Delivery Address
</h3>


  </div>

  <p className="text-sm text-gray-600 leading-6">


{order.shippingAddress?.street}

<br />

{order.shippingAddress?.city},

{order.shippingAddress?.state}

<br />

{order.shippingAddress?.pincode}

<br />

Phone:

{order.shippingAddress?.phone}


  </p>

</div>

{order.paymentStatus === 'paid' && (

<button
onClick={() =>
handleInvoiceDownload(
order._id
)
}
disabled={
downloadingInvoice ===
order._id
}
className={`w-full py-3 rounded-xl font-semibold transition ${
      downloadingInvoice ===
      order._id
        ? 'bg-gray-400 cursor-not-allowed text-white'
        : 'bg-green-600 hover:bg-green-700 text-white'
    }`}

>


{downloadingInvoice ===
order._id
  ? 'Preparing Invoice...'
  : 'Download Invoice'}


  </button>

)}


                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* <footer className="border-t border-gray-200 mt-10 py-4 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center md:text-left">

        <p>
          © 2024 – Style For You – All Rights
          Reserved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">

          <span className="hover:text-gray-600 cursor-pointer">
            About us
          </span>

          <span className="hover:text-gray-600 cursor-pointer">
            Terms & Conditions
          </span>

          <span className="hover:text-gray-600 cursor-pointer">
            Privacy & Policy
          </span>
        </div>
      </footer> */}
    </div>
  )
}

export default MyOrders