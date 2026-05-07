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

  const handlePlaceOrder = async () => {
    if (cart.length === 0)
      return toast.error('Cart is empty')

    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return toast.error(
        'Please fill all address fields'
      )
    }

    setLoading(true)

    try {
      await api.post('/orders', {
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
        })),
        shippingAddress: address,
      })

      localStorage.removeItem('cart')
      setCart([])

      toast.success('Order placed successfully!')

      navigate('/my-orders')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to place order'
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const res = await api.get('/auth/me')

        const u = res.data.user

        if (u.address) {
          setAddress({
            street: u.address || '',
            city: '',
            state: '',
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

                {/* Saved Address */}
                {user?.address && (

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">

                    <p className="text-xs font-bold text-amber-700 mb-1">
                      Saved Address
                    </p>

                    <p className="text-xs text-gray-600">
                      {user.address}
                    </p>

                    <button
                      onClick={() =>
                        setAddress({
                          ...address,
                          street: user.address,
                        })
                      }
                      className="text-xs text-amber-600 font-bold mt-1 hover:underline"
                    >
                      Use this address →
                    </button>
                  </div>
                )}

                <div className="space-y-2">

                  {[
                    {
                      key: 'street',
                      placeholder:
                        'Street / Area *',
                    },
                    {
                      key: 'city',
                      placeholder: 'City *',
                    },
                    {
                      key: 'state',
                      placeholder: 'State *',
                    },
                    {
                      key: 'pincode',
                      placeholder: 'Pincode *',
                    },
                    {
                      key: 'phone',
                      placeholder: 'Phone *',
                    },
                  ].map(({ key, placeholder }) => (

                    <input
                      key={key}
                      placeholder={placeholder}
                      value={address[key]}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  ))}
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

                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">

                  <span className="font-black text-gray-800">
                    Total
                  </span>

                  <span className="font-black text-gray-900 text-lg">
                    ₹ {total.toLocaleString()}
                  </span>
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
      </footer>
    </div>
  )
}

export default Cart