import { useState, useEffect } from 'react'
import api from '../../services/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({
  name: '', description: '', category: '', brand: '',
  price: '', originalPrice: '', stock: '', badge: '', sizes: ''
})


  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } catch (err) {
      toast.error('Failed to load products' , err)
    }
    setLoading(false)
  }


  
  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price) {
      return toast.error('Name, category and price are required')
    }
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || undefined,
        stock: Number(form.stock) || 0,
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()) : [],
      }
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload)
        toast.success('Product updated!')
      } else {
        await api.post('/products', payload)
        toast.success('Product created!')
      }
      setShowForm(false)
      setEditProduct(null)
setForm({ name: '', description: '', category: '', price: '', originalPrice: '', stock: '', badge: '', sizes: '' })    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    }
  }

    useEffect(() => { fetchProducts() }, [])


  const handleEdit = (product) => {
  setEditProduct(product)
  setForm({
    name: product.name,
    description: product.description || '',
    category: product.category,
    brand: product.brand || '',
    price: product.price,
    originalPrice: product.originalPrice || '',
    stock: product.stock,
    badge: product.badge || '',
    sizes: product.sizes?.join(', ') || '',
  })
  setShowForm(true)
}
  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deactivated!')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to deactivate' , err)
    }
  }

  const categories = [
  'Cap', 'Jacket', 'Shirt', 'Shirt - Dealer VIP',
  'Shirt - Employees', 'Shoes', 'T-Shirt',
  'Trousers', 'Wind Jacket', 'Workshop Uniform',
]

const brands = [
  'Construction Equipment', 'Farmtrac', 'GENSET',
  'HO', 'Kubota', 'Powertrac',
]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-gray-800">Manage Products</h2>
            <p className="text-gray-400 text-sm">{products.length} products total</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditProduct(null)
              setForm({ name: '', description: '', category: '', price: '', originalPrice: '', stock: '', badge: '', sizes: '' })
            }}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-green-100"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-800">{editProduct ? 'Edit Product' : 'New Product'}</h3>
                <button
                  onClick={() => { setShowForm(false); setEditProduct(null) }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
  <input
    placeholder="Product Name *"
    value={form.name}
    onChange={e => setForm({ ...form, name: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 col-span-2"
  />
  <select
    value={form.category}
    onChange={e => setForm({ ...form, category: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
  >
    <option value="">Select Category *</option>
    {categories.map(c => <option key={c} value={c}>{c}</option>)}
  </select>
  <select
    value={form.brand}
    onChange={e => setForm({ ...form, brand: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
  >
    <option value="">Select Brand</option>
    {brands.map(b => <option key={b} value={b}>{b}</option>)}
  </select>
  <input
    placeholder="Price *"
    type="number"
    value={form.price}
    onChange={e => setForm({ ...form, price: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
  <input
    placeholder="Original Price"
    type="number"
    value={form.originalPrice}
    onChange={e => setForm({ ...form, originalPrice: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
  <input
    placeholder="Stock"
    type="number"
    value={form.stock}
    onChange={e => setForm({ ...form, stock: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
  <input
    placeholder="Badge (e.g. New, Hot)"
    value={form.badge}
    onChange={e => setForm({ ...form, badge: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
  <input
    placeholder="Sizes (e.g. S, M, L, XL)"
    value={form.sizes}
    onChange={e => setForm({ ...form, sizes: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 col-span-2"
  />
  <input
    placeholder="Description"
    value={form.description}
    onChange={e => setForm({ ...form, description: e.target.value })}
    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 col-span-2"
  />
</div>
              <div className="flex gap-2 px-6 pb-6">
                <button
                  onClick={handleSubmit}
className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-100"                >
                  {editProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditProduct(null) }}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No products yet</p>
            <p className="text-gray-400 text-sm mt-1">Click Add Product to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Badge</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{product.name}</p>
                          {product.sizes?.length > 0 && (
                            <p className="text-xs text-gray-400">{product.sizes.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{product.category}</td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-green-700">₹{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {product.badge && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                          {product.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products