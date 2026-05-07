import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import {
  Package,
  ChevronLeft,
  ShoppingCart,
  Zap,
} from 'lucide-react'

const ProductDetail = () => {

  const { id } = useParams()

  const navigate = useNavigate()

  const [product, setProduct] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [sizeQtys, setSizeQtys] =
    useState({})

  const [cart, setCart] = useState(
    JSON.parse(
      localStorage.getItem('cart')
    ) || []
  )

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const res = await api.get(
          `/products/${id}`
        )

        setProduct(res.data.product)

        // Initialize all sizes to 0
        const initial = {}

        res.data.product.sizes?.forEach(
          (s) => (initial[s] = 0)
        )

        setSizeQtys(initial)

      } catch (err) {

        toast.error(
          'Product not found'
        )

        navigate('/home')
      }

      setLoading(false)
    }

    fetchProduct()

  }, [id])

  const totalQty = Object.values(
    sizeQtys
  ).reduce((a, b) => a + b, 0)

  const totalPrice = product
    ? totalQty * product.price
    : 0

  const handleQtyChange = (
    size,
    value
  ) => {

    const val = Math.max(
      0,
      parseInt(value) || 0
    )

    setSizeQtys((prev) => ({
      ...prev,
      [size]: val,
    }))
  }

  const handleAddToCart = () => {

    if (totalQty === 0)
      return toast.error(
        'Please enter quantity for at least one size'
      )

    let updatedCart = [...cart]

    // Add each size as separate cart item
    Object.entries(sizeQtys).forEach(
      ([size, qty]) => {

        if (qty === 0) return

        const existingIndex =
          updatedCart.findIndex(
            (item) =>
              item.product ===
                product._id &&
              item.size === size
          )

        if (existingIndex >= 0) {

          updatedCart[
            existingIndex
          ].quantity += qty

        } else {

          updatedCart.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image:
              product.images?.[0]
                ?.url || '',
            size,
            quantity: qty,
          })
        }
      }
    )

    setCart(updatedCart)

    localStorage.setItem(
      'cart',
      JSON.stringify(updatedCart)
    )

    toast.success('Added to cart!')
  }

  const cartCount = cart.reduce(
    (acc, item) =>
      acc + item.quantity,
    0
  )

  const discount =
    product?.originalPrice
      ? Math.round(
          (1 -
            product.price /
              product.originalPrice) *
            100
        )
      : null

  if (loading)
    return (

      <div className="min-h-screen bg-white">

        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">

            <div className="w-full lg:w-96 h-72 sm:h-96 bg-gray-100 rounded-lg shrink-0" />

            <div className="flex-1 space-y-4">

              <div className="h-4 bg-gray-100 rounded w-1/4" />

              <div className="h-6 bg-gray-100 rounded w-3/4" />

              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-white">

      <Navbar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6">

          <button
            onClick={() =>
              navigate('/home')
            }
            className="flex items-center gap-1 hover:text-amber-500 transition"
          >

            <ChevronLeft size={16} />

            Back to Catalog
          </button>

          <span>/</span>

          <span className="text-gray-500">
            {product.category}
          </span>

          <span>/</span>

          <span className="text-gray-800 font-medium break-all">
            {product.name}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* Left — Images */}
          <div className="w-full lg:w-2/5">

            <div className="bg-gray-50 rounded-lg overflow-hidden h-72 sm:h-96 flex items-center justify-center relative border border-gray-100 mb-3">

              {product.images?.[0] ? (

                <img
                  src={
                    product.images[0]
                      .url
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

              ) : (

                <Package
                  size={64}
                  className="text-gray-200"
                />
              )}

              {product.badge && (

                <span className="absolute top-3 left-3 bg-amber-500 text-black text-xs px-2 py-1 rounded font-bold">

                  {product.badge}
                </span>
              )}

              {discount && (

                <span className="absolute top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded font-bold">

                  {discount}% OFF
                </span>
              )}
            </div>

            {product.images?.length >
              1 && (

              <div className="flex gap-2 overflow-x-auto">

                {product.images.map(
                  (img, i) => (

                    <div
                      key={i}
                      className="w-16 h-16 rounded border border-gray-200 overflow-hidden shrink-0"
                    >

                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="flex-1 min-w-0">

            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">

              {product.category}
            </p>

            {product.brand && (

              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium inline-block">

                {product.brand}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-2 break-words">

              {product.name}
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-3 break-words">

              {product.description}
            </p>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">

              <span className="text-2xl sm:text-3xl font-black text-gray-900">

                ₹ {product.price}
              </span>

              {product.originalPrice && (

                <span className="text-gray-400 line-through text-base sm:text-lg">

                  ₹{' '}
                  {
                    product.originalPrice
                  }
                </span>
              )}

              {discount && (

                <span className="bg-amber-100 text-amber-800 text-xs sm:text-sm px-2 py-0.5 rounded font-bold">

                  Save ₹
                  {product.originalPrice -
                    product.price}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">

              <div
                className={`w-2 h-2 rounded-full ${
                  product.stock > 0
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              />

              <p className="text-sm text-gray-500">

                {product.stock > 0
                  ? `${product.stock} units in stock`
                  : 'Out of stock'}
              </p>
            </div>

            <div className="border-t border-gray-100 mb-5" />

            {/* Size + Qty Grid */}
            {product.sizes?.length >
              0 && (

              <div className="mb-6">

                <p className="text-sm font-bold text-gray-700 mb-3">

                  Select Size &
                  Quantity
                </p>

                <div className="border border-gray-200 rounded-lg overflow-x-auto">

                  <div className="min-w-[400px]">

                    {/* Size row */}
                    <div
                      className="grid border-b border-gray-200"
                      style={{
                        gridTemplateColumns: `repeat(${product.sizes.length}, 1fr)`,
                      }}
                    >

                      {product.sizes.map(
                        (size) => (

                          <div
                            key={size}
                            className="text-center py-2 text-sm font-bold text-gray-700 border-r last:border-r-0 border-gray-200 bg-gray-50"
                          >

                            {size}
                          </div>
                        )
                      )}
                    </div>

                    {/* Qty row */}
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${product.sizes.length}, 1fr)`,
                      }}
                    >

                      {product.sizes.map(
                        (size) => (

                          <div
                            key={size}
                            className="border-r last:border-r-0 border-gray-200 p-2 flex items-center justify-center"
                          >

                            <input
                              type="number"
                              min="0"
                              value={
                                sizeQtys[
                                  size
                                ] || 0
                              }
                              onChange={(
                                e
                              ) =>
                                handleQtyChange(
                                  size,
                                  e.target
                                    .value
                                )
                              }
                              className="w-full text-center border border-gray-200 rounded py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Total */}
                {totalQty > 0 && (

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">

                    <p className="text-sm text-gray-600">

                      Total Qty:{' '}

                      <span className="font-black text-gray-800">

                        {totalQty} items
                      </span>
                    </p>

                    <p className="text-sm font-black text-gray-900">

                      ₹{' '}
                      {totalPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No sizes product */}
            {(!product.sizes ||
              product.sizes.length ===
                0) && (

              <div className="mb-6">

                <p className="text-sm font-bold text-gray-700 mb-2">

                  Quantity
                </p>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      setSizeQtys({
                        'Free Size':
                          Math.max(
                            0,
                            (sizeQtys[
                              'Free Size'
                            ] || 0) - 1
                          ),
                      })
                    }
                    className="w-9 h-9 rounded border-2 border-gray-200 flex items-center justify-center font-bold hover:border-amber-500 transition"
                  >
                    −
                  </button>

                  <span className="text-lg font-black w-8 text-center">

                    {sizeQtys[
                      'Free Size'
                    ] || 0}
                  </span>

                  <button
                    onClick={() =>
                      setSizeQtys({
                        'Free Size':
                          (sizeQtys[
                            'Free Size'
                          ] || 0) + 1,
                      })
                    }
                    className="w-9 h-9 rounded border-2 border-gray-200 flex items-center justify-center font-bold hover:border-amber-500 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={
                  handleAddToCart
                }
                disabled={
                  product.stock === 0
                }
                className="flex-1 flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white disabled:border-gray-200 disabled:text-gray-300 py-3 rounded font-bold text-sm transition"
              >

                <ShoppingCart
                  size={16}
                />

                Add to Cart
              </button>

              <button
                onClick={() => {

                  handleAddToCart()

                  if (totalQty > 0)
                    navigate('/cart')
                }}
                disabled={
                  product.stock === 0
                }
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-black py-3 rounded font-bold text-sm transition"
              >

                <Zap size={16} />

                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-10 py-4 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center md:text-left">

        <p>
          © 2024 – Style For You –
          All Rights Reserved.
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

export default ProductDetail