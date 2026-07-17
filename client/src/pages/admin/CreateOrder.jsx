import { useState, useEffect  } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Navbar from '../../components/Navbar'

import {
  ArrowLeft,
  Search,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Package,
} from 'lucide-react'

const CreateOrder = () => {

  const [keyword, setKeyword] = useState('')

  const [searchLoading, setSearchLoading] =
    useState(false)

  const [dealers, setDealers] =
    useState([])

  const [selectedDealer, setSelectedDealer] =
    useState(null)

  const [products, setProducts] =
    useState([])
const [loadingProducts, setLoadingProducts] =
  useState(false)
  const [productRows, setProductRows] =
    useState([])

  const [creating, setCreating] =
    useState(false)
const [debouncedKeyword, setDebouncedKeyword] =
  useState('')
const [summary, setSummary] = useState({
  basicAmount: 0,
  rebatePercent: 0,
  rebateAmount: 0,
  gstPercent: 0,
  gstAmount: 0,
  finalAmount: 0,
})

  // ------------------------------------
  // Search Dealers
  // ------------------------------------


useEffect(() => {

  const timer = setTimeout(() => {

    setDebouncedKeyword(keyword)

  }, 500)

  return () => clearTimeout(timer)

}, [keyword])



useEffect(() => {

  if (debouncedKeyword.trim().length < 2) {
  setDealers([])

fetchProducts()

setProductRows([
  {
    id: Date.now(),
    productId: '',
    sizes: {},
  },
])
    return
  }

  const fetchDealers = async () => {

    try {

      setSearchLoading(true)

      const res = await api.get(
        `/users/search?keyword=${debouncedKeyword}`
      )

      setDealers(res.data.dealers)

    } catch (error) {

      console.log(error)

      toast.error('Failed to search dealers')

    } finally {

      setSearchLoading(false)

    }

  }

  fetchDealers()

}, [debouncedKeyword])

  // ------------------------------------
  // Select Dealer
  // ------------------------------------

 const handleSelectDealer = async (dealer) => {

  setSelectedDealer(dealer)

  setKeyword(dealer.name)

  setDealers([])

  await fetchProducts()

  setProductRows([
    {
      id: Date.now(),
      productId: '',
      sizes: {},
    },
  ])

}

const fetchProducts = async () => {

  try {

    setLoadingProducts(true)

    const res = await api.get(
      '/products?limit=500'
    )

    setProducts(res.data.products)

  } catch (error) {

    toast.error(
      'Failed to load products'
    )

  } finally {

    setLoadingProducts(false)

  }

}

const addProductRow = () => {

  setProductRows((prev) => [

    ...prev,

    {
      id: Date.now(),
      productId: '',
      sizes: {},
    },

  ])

}

const removeProductRow = (id) => {

  setProductRows((prev) =>
    prev.filter((row) => row.id !== id)
  )

}

const updateProduct = (
  id,
  productId
) => {

  const alreadyExists =
    productRows.some(
      row =>
        row.id !== id &&
        row.productId === productId
    )

  if (alreadyExists) {
    toast.error(
      'Product already added'
    )
    return
  }

  setProductRows(prev =>
    prev.map(row =>
      row.id === id
        ? {
            ...row,
            productId,
            sizes: {},
          }
        : row
    )
  )

}

const updateQuantity = (
  rowId,
  size,
  quantity
) => {

  setProductRows((prev) =>
    prev.map((row) => {

      if (row.id !== rowId) return row

      const product = products.find(
        (p) => p._id === row.productId
      )

      if (!product) return row

      const qty = Number(quantity) || 0

      if (qty > product.stock) {

        toast.error(
          `Only ${product.stock} items available in stock`
        )

        return row
      }

      return {

        ...row,

        sizes: {

          ...row.sizes,

          [size]: qty,

        },

      }

    })
  )

}

const calculateSummary = () => {

  let basicAmount = 0

  productRows.forEach((row) => {

    const product = products.find(
      p => p._id === row.productId
    )

    if (!product) return

    Object.entries(row.sizes).forEach(
      ([size, qty]) => {

        if (Number(qty) > 0) {

          basicAmount +=
            product.price * Number(qty)

        }

      }
    )

  })

  const rebatePercent = 60

  const rebateAmount =
    (basicAmount * rebatePercent) / 100

  const gstPercent = 5

  const gstAmount =
    (basicAmount * gstPercent) / 100

  const finalAmount =
    basicAmount -
    rebateAmount +
    gstAmount

  setSummary({

    basicAmount,

    rebatePercent,

    rebateAmount,

    gstPercent,

    gstAmount,

    finalAmount,

  })

}

useEffect(() => {

  calculateSummary()

}, [productRows])


const buildItems = () => {

  const items = []

  productRows.forEach((row) => {

    Object.entries(row.sizes).forEach(
      ([size, qty]) => {

        if (Number(qty) > 0) {

          items.push({
            product: row.productId,
            size,
            quantity: Number(qty),
          })

        }

      }
    )

  })

  return items

}

const handleCreateOrder = async () => {

  if (!selectedDealer) {
    return toast.error('Select a dealer')
  }

  const items = buildItems()

  if (!items.length) {
    return toast.error(
      'Please add at least one product'
    )
  }

  try {

    setCreating(true)

    const res = await api.post(
      '/orders/admin/create',
      {
        dealerId: selectedDealer._id,
        items,
      }
    )

    toast.success(
      'Sponsored order created successfully'
    )

    console.log(res.data)

    setSelectedDealer(null)

    setKeyword('')

    setDealers([])

    setProducts([])

    setProductRows([])

    setSummary({
      basicAmount: 0,
      rebatePercent: 0,
      rebateAmount: 0,
      gstPercent: 0,
      gstAmount: 0,
      finalAmount: 0,
    })

  } catch (error) {

    console.log(error)

    toast.error(
      error.response?.data?.message ||
      'Failed to create order'
    )

  } finally {

    setCreating(false)

  }

}
  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-3"
            >
              <ArrowLeft size={18} />

              Back to Orders
            </Link>

            <h1 className="text-3xl font-black text-gray-800">

              Create Sponsored Order

            </h1>

            <p className="text-gray-500 mt-2">

              Search dealer and create a sponsored order.

            </p>

          </div>

        </div>

        {/* Dealer Search */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h2 className="font-black text-lg mb-5">

            Dealer Search

          </h2>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={keyword}
              onChange={(e) =>
                 setKeyword(e.target.value)
              
              }
              placeholder="Search by Dealer Name, Dealer Code or Phone Number"
              className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none"
            />

          </div>

          {searchLoading && (

            <p className="text-sm text-gray-500 mt-3">

              Searching dealers...

            </p>

          )}

          {
            dealers.length > 0 && (

              <div className="mt-5 border border-gray-200 rounded-xl overflow-hidden">

                {
                  dealers.map((dealer) => (

                    <button
                      key={dealer._id}
                      onClick={() =>
                        handleSelectDealer(
                          dealer
                        )
                      }
                      className="w-full text-left px-5 py-4 hover:bg-green-50 transition border-b last:border-b-0"
                    >

                      <p className="font-bold">

                        {dealer.name}

                      </p>

                      <p className="text-sm text-gray-500">

                        {dealer.code}

                        {' • '}

                        {dealer.phone}

                      </p>

                    </button>

                  ))
                }

              </div>

            )
          }

        </div>

                {/* Selected Dealer */}

        {
          selectedDealer && (

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">

              <h2 className="font-black text-lg mb-6">

                Selected Dealer

              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div className="flex gap-3">

                  <User
                    className="text-green-700"
                    size={22}
                  />

                  <div>

                    <p className="text-xs text-gray-500">

                      Dealer Name

                    </p>

                    <p className="font-bold">

                      {selectedDealer.name}

                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <Phone
                    className="text-green-700"
                    size={22}
                  />

                  <div>

                    <p className="text-xs text-gray-500">

                      Phone

                    </p>

                    <p className="font-bold">

                      {selectedDealer.phone}

                    </p>

                  </div>

                </div>

                <div>

                  <p className="text-xs text-gray-500">

                    Dealer Code

                  </p>

                  <p className="font-bold">

                    {selectedDealer.code}

                  </p>

                </div>

                <div className="flex gap-3">

                  <MapPin
                    className="text-green-700"
                    size={20}
                  />

                  <div>

                    <p className="text-xs text-gray-500">

                      Address

                    </p>

                    <p>

                      {selectedDealer.address || '-'}

                    </p>

                    <p>

                      {selectedDealer.city || ''}

                      {' '}

                      {selectedDealer.state || ''}

                    </p>

                  </div>

                </div>

              </div>

            </div>
            

          )
        }


        {
  selectedDealer && (

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="font-black text-lg flex items-center gap-2">

          <Package size={20} />

          Products

        </h2>

        <button
          onClick={addProductRow}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >

          <Plus size={18} />

          Add Product

        </button>

      </div>

      {
        loadingProducts && (

          <p className="text-gray-500">

            Loading products...

          </p>

        )
      }

      {
        productRows.map((row,index)=>{

          const product = products.find(
            p=>p._id===row.productId
          )

          return(

            <div
              key={row.id}
              className="border rounded-xl p-5 mb-5"
            >

              <div className="flex justify-between items-center mb-5">

                <h3 className="font-bold">

                  Product {index+1}

                </h3>

                {
                  productRows.length>1 && (

                    <button
                      onClick={()=>
                        removeProductRow(row.id)
                      }
                      className="text-red-500"
                    >

                      <Trash2 size={18} />

                    </button>

                  )
                }

              </div>

              <select
                value={row.productId}
                onChange={(e)=>
                  updateProduct(
                    row.id,
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >

                <option value="">

                  Select Product

                </option>

                {
                  products.map(product=>(

                    <option
                      key={product._id}
                      value={product._id}
                    >

                      {product.name}

                    </option>

                  ))
                }

              </select>

              {
                product && (

                  <div className="mt-6">

                    <p className="font-semibold mb-3">

                      Sizes

                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      {
                        product.sizes.map(size=>(

                          <div
                            key={size}
                            className="border rounded-lg p-3"
                          >

                            <p className="font-semibold mb-2">

                              {size}

                            </p>

                            <input
                              type="number"
                              min="0"
                              value={
                                row.sizes[size] || ''
                              }
                              onChange={(e)=>
                                updateQuantity(
                                  row.id,
                                  size,
                                  e.target.value
                                )
                              }
                              placeholder="Qty"
                              className="w-full border rounded-lg p-2"
                            />

                          </div>

                        ))
                      }

                    </div>

                  </div>

                )
              }

              

            </div>



          )

        })
      }

<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">

  <h2 className="font-black text-lg mb-5">

    Order Summary

  </h2>

  <div className="space-y-4">

    <div className="flex justify-between">

      <span>Basic Amount</span>

      <span className="font-semibold">

        ₹ {summary.basicAmount}

      </span>

    </div>

    <div className="flex justify-between">

      <span>

        Rebate ({summary.rebatePercent}%)

      </span>

      <span className="text-red-600 font-semibold">

        - ₹ {summary.rebateAmount}

      </span>

    </div>

    <div className="flex justify-between">

      <span>

        GST ({summary.gstPercent}%)

      </span>

      <span className="font-semibold">

        ₹ {summary.gstAmount}

      </span>

    </div>

    <hr />

    <div className="flex justify-between text-xl font-black">

      <span>

        Final Amount

      </span>

      <span className="text-green-700">

        ₹ {summary.finalAmount}

      </span>

    </div>

  </div>

</div>


<div className="flex justify-end mt-6">

  <button
    onClick={handleCreateOrder}
    disabled={creating}
    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold shadow"
  >

    {
      creating
        ? 'Creating Order...'
        : 'Create Sponsored Order'
    }

  </button>

</div>

    </div>

  )
}


      </div>

    </div>
  )
}

        export default CreateOrder