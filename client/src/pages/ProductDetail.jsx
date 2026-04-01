import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Package, ChevronLeft, ShoppingCart, Zap } from 'lucide-react'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data.product)
      } catch (err) {
        toast.error('Product not found')
        navigate('/home')
      }
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      return toast.error('Please select a size')
    }
    const existingIndex = cart.findIndex(
      (item) => item.product === product._id && item.size === selectedSize
    )
    let updatedCart = [...cart]
    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += quantity
    } else {
      updatedCart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '',
        size: selectedSize,
        quantity,
      })
    }
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    toast.success('Added to cart!')
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex gap-8 animate-pulse">
          <div className="w-96 h-96 bg-gray-100 rounded-lg shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 hover:text-amber-500 transition"
          >
            <ChevronLeft size={16} />
            Back to Catalog
          </button>
          <span>/</span>
          <span className="text-gray-500">{product.category}</span>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {/* Left — Images */}
          <div className="md:w-2/5">
            {/* Main Image */}
            <div className="bg-gray-50 rounded-lg overflow-hidden h-96 flex items-center justify-center relative border border-gray-100 mb-3">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={64} className="text-gray-200" />
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

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === i ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="flex-1">
            {/* Category + Brand */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">{product.category}</span>
              {product.brand && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{product.brand}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{product.description}</p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-black text-gray-900">₹ {product.price}</span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-lg">₹ {product.originalPrice}</span>
              )}
              {discount && (
                <span className="bg-amber-100 text-amber-800 text-sm px-2 py-0.5 rounded font-bold">
                  Save ₹{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-sm text-gray-500">
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-5" />

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">Select Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border-2 text-sm font-medium transition ${
                        selectedSize === size
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 text-gray-600 hover:border-amber-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-amber-500 font-bold transition"
                >
                  −
                </button>
                <span className="text-lg font-black text-gray-800 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 rounded border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-amber-500 font-bold transition"
                >
                  +
                </button>
                <span className="text-sm text-gray-400 ml-2">
                  Total: <span className="font-black text-gray-800">₹ {product.price * quantity}</span>
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white disabled:border-gray-200 disabled:text-gray-300 py-3 rounded font-bold text-sm transition"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/cart') }}
                disabled={product.stock === 0}
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

export default ProductDetail