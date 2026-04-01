import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Package } from 'lucide-react'

const categories = [
  'Cap', 'Jacket', 'Shirt', 'Shirt - Dealer VIP',
  'Shirt - Employees', 'Shoes', 'T-Shirt',
  'Trousers', 'Wind Jacket', 'Workshop Uniform',
]

const brands = [
  'Construction Equipment', 'Farmtrac', 'GENSET',
  'HO', 'Kubota', 'Powertrac',
]

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [showCategories, setShowCategories] = useState(true)
  const [showBrands, setShowBrands] = useState(true)
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || [])
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [search, selectedCategories, selectedBrands])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (selectedCategories.length === 1) params.category = selectedCategories[0]
      if (selectedBrands.length === 1) params.brand = selectedBrands[0]
      const res = await api.get('/products', { params })
      let filtered = res.data.products
      if (selectedCategories.length > 1) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category))
      }
      if (selectedBrands.length > 1) {
        filtered = filtered.filter(p => selectedBrands.includes(p.brand))
      }
      setProducts(filtered)
    } catch (err) {
      toast.error('Failed to load products')
    }
    setLoading(false)
  }

  const toggleCategory = (cat) => {
    if (cat === 'All') { setSelectedCategories([]); return }
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleBrand = (brand) => {
    if (brand === 'All') { setSelectedBrands([]); return }
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const CheckBox = ({ checked, onClick }) => (
    <div
      onClick={onClick}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
        checked ? 'bg-amber-500 border-amber-500' : 'border-gray-300 hover:border-amber-400'
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* Left Sidebar */}
        <div className="w-56 shrink-0">

          {/* Products Filter */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="font-black text-gray-800 text-base">Products</h3>
              <span className="text-gray-400 text-lg">{showCategories ? '∧' : '∨'}</span>
            </button>
            {showCategories && (
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <CheckBox
                    checked={selectedCategories.length === 0}
                    onClick={() => toggleCategory('All')}
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <CheckBox
                      checked={selectedCategories.includes(cat)}
                      onClick={() => toggleCategory(cat)}
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands Filter */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setShowBrands(!showBrands)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="font-black text-gray-800 text-base">Brands</h3>
              <span className="text-gray-400 text-lg">{showBrands ? '∧' : '∨'}</span>
            </button>
            {showBrands && (
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <CheckBox
                    checked={selectedBrands.length === 0}
                    onClick={() => toggleBrand('All')}
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <CheckBox
                      checked={selectedBrands.includes(brand)}
                      onClick={() => toggleBrand(brand)}
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map(cat => (
                <span
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-amber-200 font-medium"
                >
                  {cat} ✕
                </span>
              ))}
              {selectedBrands.map(brand => (
                <span
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 font-medium"
                >
                  {brand} ✕
                </span>
              ))}
              <button
                onClick={() => { setSelectedCategories([]); setSelectedBrands([]) }}
                className="text-xs text-red-500 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 h-64 rounded-lg mb-3" />
                  <div className="h-3 bg-gray-100 rounded mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try different filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="cursor-pointer group"
                >
                  {/* Image */}
                  <div className="bg-gray-50 rounded-lg overflow-hidden h-72 flex items-center justify-center relative mb-3 border border-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package size={48} className="text-gray-300" />
                    )}
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-0.5 rounded font-bold">
                        {product.badge}
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
                    <p className="text-sm text-gray-700 leading-snug mb-2 line-clamp-2">
                      {product.description || product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900">₹ {product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-xs">₹ {product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default Home