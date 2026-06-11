import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ChevronLeft,
  Package,
  MapPin,
  ShoppingBag,
} from 'lucide-react'

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart')) || []
  )

  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
  })


const [showAddressModal, setShowAddressModal] = useState(false)

const [customAddress, setCustomAddress] = useState({
  street: '',
  city: '',
  state: '',
  pincode: '',
  phone: user?.phone || '',
})

const [useCustomAddress, setUseCustomAddress] =
  useState(false)
const [pricing, setPricing] = useState(null)
const [savedAddress, setSavedAddress] = useState('')
const [savedAddressData, setSavedAddressData] =
  useState(null)
  // Group cart items by product
  const groupedCart = useMemo(() => {
    const groups = {}

    cart.forEach((item) => {
      if (!groups[item.product]) {
        groups[item.product] = {
          product: item.product,
          name: item.name,
          price: item.price,
          image: item.image,
          sizes: {},
        }
      }

      groups[item.product].sizes[item.size] = item.quantity
    })

    return Object.values(groups)
  }, [cart])

  const cartCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const handleRemoveProduct = (productId) => {
    const updated = cart.filter(
      (item) => item.product !== productId
    )

    setCart(updated)

    localStorage.setItem(
      'cart',
      JSON.stringify(updated)
    )

    toast.success('Item removed')
  }


const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const handlePayment = async (order) => {
  const loaded = await loadRazorpay()
  if (!loaded) {
    toast.error('Failed to load payment gateway')
    return
  }

  try {
    const res = await api.post('/payments/create-order', { orderId: order._id })

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: res.data.amount,
      currency: res.data.currency,
      name: 'Escorts Kubota',
      description: `Order ${order.orderId}`,
      image: '/logo-1.jpeg',
      order_id: res.data.razorpayOrderId,
      handler: async (response) => {
        try {
          await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: order._id,
          })
          toast.success('Payment successful! 🎉')
          navigate('/my-orders')
        } catch (err) {
          toast.error('Payment verification failed')
        }
      },
      prefill: {
        name: user?.name,
        contact: user?.phone,
        email: user?.email,
      },
      theme: { color: '#f59e0b' },
      modal: {
        ondismiss: () => toast.error('Payment cancelled'),
      }
    }

    const razor = new window.Razorpay(options)
    razor.open()

  } catch (err) {
    toast.error(err.response?.data?.message || 'Payment failed')
  }
}

const fetchPricing = async () => {
  try {

    const res = await api.post(
      '/orders/calculate',
      {
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      }
    )

    setPricing(res.data)

  } catch (error) {
    console.log(error)
  }
}

 const handlePlaceOrder = async () => {
  if (cart.length === 0) return toast.error('Cart is empty')
  if (
  useCustomAddress &&
  (
    !customAddress.street ||
    !customAddress.city ||
    !customAddress.state ||
    !customAddress.pincode
  )
) {
  return toast.error('Please fill all address fields')
}

  setLoading(true)

  const loaded = await loadRazorpay()
  if (!loaded) {
    toast.error('Failed to load payment gateway')
    setLoading(false)
    return
  }

  try {
    // 1. Create temp Razorpay order (NO DB order yet)
   const razorpayRes = await api.post(
  '/payments/create-temp-order',
  {
    amount: pricing.finalAmount,
  }
)
    setLoading(false)

    // 2. Open Razorpay
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayRes.data.amount,
      currency: 'INR',
      name: 'Escorts Kubota',
      description: 'Merchandise Order',
      image: '/logo-1.jpeg',
      order_id: razorpayRes.data.razorpayOrderId,
      handler: async (response) => {
        // 3. Payment SUCCESS → now create order in DB
        try {
        const finalAddress = useCustomAddress
  ? customAddress
 : {
    street: savedAddressData?.street || '',
    city: savedAddressData?.city || '',
    state: savedAddressData?.state || '',
    pincode: savedAddressData?.pincode || '',
    phone: savedAddressData?.phone || user?.phone || '',
  }
console.log("USER", user)
console.log("FINAL ADDRESS", finalAddress)

          const orderRes = await api.post('/orders', {
            items: cart.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              size: item.size,
            })),
            shippingAddress: finalAddress,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          // 4. Verify payment
          await api.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: orderRes.data.order._id,
          })

          // 5. Clear cart only after successful payment
          localStorage.removeItem('cart')
          setCart([])
          toast.success('Payment successful! Order placed 🎉')
          navigate('/my-orders')

        } catch (err) {
          toast.error('Order creation failed after payment. Contact support.')
        }
      },
      prefill: {
        name: user?.name,
        contact: user?.phone,
        email: user?.email || '',
      },
      theme: { color: '#f59e0b' },
      modal: {
        ondismiss: () => {
          // Payment cancelled — cart stays intact
          toast.error('Payment cancelled. Your cart is saved.')
          setLoading(false)
        }
      }
    }

    const razor = new window.Razorpay(options)
    razor.open()

  } catch (err) {
    toast.error(err.response?.data?.message || 'Something went wrong')
    setLoading(false)
  }
}

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const res = await api.get('/auth/me')

        const u = res.data.user

    if (u.address) {
  setSavedAddress(u.address)

  setSavedAddressData({
    street: u.address,
    city: u.city || '',
    state: u.state || '',
    pincode: '',
    phone: u.phone || '',
  })

  setAddress({
    street: u.address,
    city: u.city || '',
    state: u.state || '',
    pincode: '',
    phone: u.phone || '',
  })
}
      } catch (err) {
        console.log(
          'Could not fetch user address',
          err
        )
      }
    }

    fetchUserAddress()
  }, [])


useEffect(() => {

  if (cart.length > 0) {
    fetchPricing()
  }

}, [cart])

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">

          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 text-gray-400 hover:text-amber-500 transition text-xs sm:text-sm"
          >
            <ChevronLeft size={16} />
            Continue Shopping
          </button>

          <span className="text-gray-300 hidden sm:block">
            |
          </span>

          <h2 className="text-lg sm:text-xl font-black text-gray-800">
            Cart
          </h2>

          {cartCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">
              {cartCount} items
            </span>
          )}
        </div>

        {cart.length === 0 ? (

          <div className="border border-gray-100 rounded-lg p-8 sm:p-16 text-center">

            <ShoppingBag
              size={48}
              className="text-gray-200 mx-auto mb-4"
            />

            <p className="text-gray-700 font-bold text-base sm:text-lg">
              Your cart is empty
            </p>

            <p className="text-gray-400 text-sm mt-1 mb-6">
              Browse our catalog and add products
            </p>

            <button
              onClick={() => navigate('/home')}
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 sm:px-6 py-2.5 rounded font-bold text-sm transition w-full sm:w-auto"
            >
              Browse Products →
            </button>
          </div>

        ) : (

          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">

            {/* Cart Items */}
            <div className="flex-1">

              <div className="space-y-4">

                {groupedCart.map((group) => {

                  const totalQty = Object.values(
                    group.sizes
                  ).reduce((a, b) => a + b, 0)

                  const totalItemPrice =
                    totalQty * group.price

                  const sizes = Object.keys(
                    group.sizes
                  )

                  return (

                    <div
                      key={group.product}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4"
                    >

                      <div className="flex flex-col sm:flex-row gap-4">

                        {/* Image */}
                        <div className="w-full sm:w-20 h-52 sm:h-20 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">

                          {group.image ? (
                            <img
                              src={group.image}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              size={20}
                              className="text-gray-300"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                            <div>
                              <p className="font-bold text-gray-800 text-sm sm:text-base">
                                {group.name}
                              </p>

                              <p className="text-sm text-gray-500 mt-0.5">
                                Qty: {totalQty} x ₹
                                {group.price}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-xs text-gray-400">
                                Basic Price:
                              </p>

                              <p className="font-black text-gray-900 text-sm sm:text-base">
                                ₹
                                {totalItemPrice.toLocaleString()}
                                .00
                              </p>
                            </div>
                          </div>

                          {/* Size Grid */}
                          {sizes.length > 0 && (

                            <div className="mt-3 overflow-x-auto">

                              <div className="border border-gray-200 rounded overflow-hidden inline-block min-w-max">

                                <div className="flex">

                                  <div className="bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                                    Size
                                  </div>

                                  {sizes.map((size) => (
                                    <div
                                      key={size}
                                      className="px-4 py-1 text-xs font-bold text-gray-700 border-r last:border-r-0 border-gray-200 text-center bg-gray-50 min-w-[40px]"
                                    >
                                      {size}
                                    </div>
                                  ))}
                                </div>

                                <div className="flex border-t border-gray-200">

                                  <div className="bg-white px-3 py-1.5 text-xs font-bold text-gray-600 border-r border-gray-200 flex items-center">
                                    Qty
                                  </div>

                                  {sizes.map((size) => (
                                    <div
                                      key={size}
                                      className="px-4 py-1.5 text-sm font-black text-gray-800 border-r last:border-r-0 border-gray-200 text-center min-w-[40px]"
                                    >
                                      {group.sizes[size]}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() =>
                              handleRemoveProduct(
                                group.product
                              )
                            }
                            className="text-xs text-red-400 hover:text-red-600 mt-2 block transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-72 xl:w-80 space-y-4">

              {/* Shipping Address */}
<div className="border border-gray-200 rounded-lg p-4">

  <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-sm">
    <MapPin
      size={16}
      className="text-amber-500"
    />
    Shipping Address
  </h3>

{savedAddress && (
  <div className="border border-green-200 bg-green-50 rounded-lg p-3">

    <div className="flex items-center justify-between mb-2">

      <p className="font-bold text-green-700 text-sm">
        Registered Address
      </p>

      {!useCustomAddress && (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Selected
        </span>
      )}

    </div>

    <p className="text-sm text-gray-700 whitespace-pre-line">
      {savedAddress}
    </p>

    {savedAddressData && (
      <p className="text-sm text-gray-700 mt-1">
        {savedAddressData.city}, {savedAddressData.state}
      </p>
    )}

  </div>
)}

  {useCustomAddress && (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 mt-3">

      <div className="flex items-center justify-between mb-2">

        <p className="font-bold text-amber-700 text-sm">
          Different Address
        </p>

        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
          Selected
        </span>
      </div>

      <p className="text-sm text-gray-700">
        {customAddress.street}
      </p>

      <p className="text-sm text-gray-700">
        {customAddress.city}, {customAddress.state}
      </p>

      <p className="text-sm text-gray-700">
        {customAddress.pincode}
      </p>

      <p className="text-sm text-gray-700">
        {customAddress.phone}
      </p>
    </div>
  )}

  <div className="mt-3 flex gap-2">

    <button
      onClick={() => setShowAddressModal(true)}
      className="text-sm text-amber-600 font-semibold hover:underline"
    >
      + Add Different Address
    </button>

    {useCustomAddress && (
      <button
        onClick={() =>
          setUseCustomAddress(false)
        }
        className="text-sm text-gray-500 hover:underline"
      >
        Use Registered Address
      </button>
    )}
  </div>
</div>

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-4">

                <h3 className="font-black text-gray-800 mb-3 text-sm">
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm">

                  {groupedCart.map((group) => {

                    const totalQty = Object.values(
                      group.sizes
                    ).reduce((a, b) => a + b, 0)

                    return (
                      <div
                        key={group.product}
                        className="flex justify-between text-gray-500 gap-2"
                      >

                        <span className="truncate flex-1">
                          {group.name} x{totalQty}
                        </span>

                        <span className="shrink-0">
                          ₹{' '}
                          {(
                            totalQty * group.price
                          ).toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">

  <div className="flex justify-between text-sm">
    <span>Basic Amount</span>
    <span>
      ₹ {pricing?.basicAmount?.toFixed(2) || '0.00'}
    </span>
  </div>

  <div className="flex justify-between text-sm text-green-600">
    <span>
      Rebate ({pricing?.rebatePercent || 0}%)
    </span>

    <span>
      - ₹ {pricing?.rebateAmount?.toFixed(2) || '0.00'}
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span>
      GST ({pricing?.gstPercent || 0}%)
    </span>

    <span>
      + ₹ {pricing?.gstAmount?.toFixed(2) || '0.00'}
    </span>
  </div>

  <div className="border-t pt-3 flex justify-between">

    <span className="font-black text-gray-800">
      Final Payable
    </span>

    <span className="font-black text-lg text-green-700">
      ₹ {pricing?.finalAmount?.toFixed(2) || '0.00'}
    </span>

  </div>

</div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-black py-3 rounded font-bold text-sm transition active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>

                      Placing Order...
                    </span>
                  ) : (
                    'Place Order →'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10 py-4 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center md:text-left">

        <p>
          © 2024 – Style For You – All Rights Reserved.
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

        {showAddressModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

    <div className="bg-white rounded-2xl w-full max-w-md p-5">

      <h3 className="text-lg font-bold mb-4">
        Add Different Address
      </h3>

      <div className="space-y-3">

        <input
          placeholder="Street / Area"
          value={customAddress.street}
          onChange={(e) =>
            setCustomAddress({
              ...customAddress,
              street: e.target.value,
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="City"
          value={customAddress.city}
          onChange={(e) =>
            setCustomAddress({
              ...customAddress,
              city: e.target.value,
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="State"
          value={customAddress.state}
          onChange={(e) =>
            setCustomAddress({
              ...customAddress,
              state: e.target.value,
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Pincode"
          value={customAddress.pincode}
          onChange={(e) =>
            setCustomAddress({
              ...customAddress,
              pincode: e.target.value,
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Phone"
          value={customAddress.phone}
          onChange={(e) =>
            setCustomAddress({
              ...customAddress,
              phone: e.target.value,
            })
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-2 mt-5">

        <button
          onClick={() =>
            setShowAddressModal(false)
          }
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setUseCustomAddress(true)
            setShowAddressModal(false)
          }}
          className="px-4 py-2 bg-amber-500 text-black rounded font-semibold"
        >
          Save Address
        </button>
      </div>
    </div>
  </div>
)}
      </footer>
    </div>
  )
}

export default Cart