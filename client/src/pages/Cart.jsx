import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ChevronLeft, Package, MapPin, ShoppingBag } from 'lucide-react'

const Cart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || [])
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
  })

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleRemove = (index) => {
    const updated = cart.filter((_, i) => i !== index)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    toast.success('Item removed')
  }

  const handleQtyChange = (index, delta) => {
    const updated = [...cart]
    updated[index].quantity = Math.max(1, updated[index].quantity + delta)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all address fields')
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
      toast.error(err.response?.data?.message || 'Failed to place order')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 text-gray-400 hover:text-amber-500 transition text-sm"
          >
            <ChevronLeft size={16} />
            Continue Shopping
          </button>
          <span className="text-gray-300">|</span>
          <h2 className="text-xl font-black text-gray-800">Your Cart</h2>
          {cartCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">
              {cartCount} items
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="border border-gray-100 rounded-lg p-16 text-center">
            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-700 font-bold text-lg">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Browse our catalog and add products</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded font-bold text-sm transition"
            >
              Browse Products →
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items */}
            <div className="flex-1">
              <div className="border-b border-gray-200 pb-2 mb-4 grid grid-cols-12 text-xs text-gray-400 uppercase tracking-wide">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 items-center gap-2 pb-4 border-b border-gray-100">
                    {/* Product */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                        {item.size && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded mt-1 inline-block">
                            Size: {item.size}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemove(index)}
                          className="block text-xs text-red-400 hover:text-red-600 mt-1 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center text-sm font-bold text-gray-700">
                      ₹ {item.price}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleQtyChange(index, -1)}
                        className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:border-amber-500 transition text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-black w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(index, 1)}
                        className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:border-amber-500 transition text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 text-right font-black text-gray-900 text-sm">
                      ₹ {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-72 space-y-4">

              {/* Shipping Address */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-amber-500" />
                  Shipping Address
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'street', placeholder: 'Street / Area *' },
                    { key: 'city', placeholder: 'City *' },
                    { key: 'state', placeholder: 'State *' },
                    { key: 'pincode', placeholder: 'Pincode *' },
                    { key: 'phone', placeholder: 'Phone *' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={address[key]}
                      onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-black text-gray-800 mb-3 text-sm">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-500">
                      <span className="truncate flex-1 mr-2">{item.name} x{item.quantity}</span>
                      <span>₹ {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                  <span className="font-black text-gray-800">Total</span>
                  <span className="font-black text-gray-900 text-lg">₹ {total}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-black py-3 rounded font-bold text-sm transition active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Placing Order...
                    </span>
                  ) : 'Place Order →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10 py-4 px-6 flex items-center justify-between text-xs text-gray-400">
        <p>© 2024 – Style For You – All Rights Reserved. Powered by S4U</p>
        <div className="flex gap-4">
          <span className="hover:text-gray-600 cursor-pointer">About us</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms & Conditions</span>
          <span className="hover:text-gray-600 cursor-pointer">Privacy & Policy</span>
        </div>
      </footer>
    </div>
  )
}

export default Cart