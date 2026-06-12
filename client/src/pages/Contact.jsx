import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

import Navbar from '../components/Navbar'
const Contact = () => {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const res = await api.post(
        '/contact',
        formData
      )

      if (res.data.success) {
        toast.success(
          'Inquiry sent successfully'
        )

        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          message: '',
        })
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to send inquiry'
      )
    }

    setLoading(false)
  }

  const cart =
  JSON.parse(
    localStorage.getItem('cart')
  ) || []

const cartCount = cart.reduce(
  (acc, item) => acc + item.quantity,
  0
)

  
    return (
  <div className="min-h-screen bg-white">

    <Navbar cartCount={cartCount} />

    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

      <div className="mb-6 border-b border-gray-200 pb-4">

  <h2 className="text-xl sm:text-2xl font-black text-gray-800">
    Contact Us
  </h2>

  <p className="text-gray-400 text-sm mt-1">
    Get support for orders, products, account access and general inquiries.
  </p>

</div>

        <div className="grid lg:grid-cols-2 gap-8 p-6">

          {/* Contact Info */}

          <div>

  <div className="grid sm:grid-cols-2 gap-4">

    <div className="border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Support Phone
      </p>

      <p className="mt-2 font-bold text-gray-800">
        +91 9876543210
      </p>
    </div>

    <div className="border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Support Email
      </p>

      <p className="mt-2 font-bold text-gray-800">
        support@style4u.com
      </p>
    </div>

    <div className="border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Corporate Office
      </p>

      <p className="mt-2 text-gray-700">
        Escorts Kubota Limited
      </p>
    </div>

    <div className="border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Working Hours
      </p>

      <p className="mt-2 text-gray-700">
        Monday - Saturday
        <br />
        9:00 AM - 6:00 PM
      </p>
    </div>

  </div>

</div>

          {/* Contact Form */}

<div className="bg-white border border-gray-200 rounded-2xl p-6">

            <h3 className="text-lg font-black text-gray-800 mb-1">
  Send Inquiry
</h3>

<p className="text-sm text-gray-500 mb-6">
  Fill out the form below and our team will get back to you shortly.
</p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <textarea
                rows="5"
                name="message"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl transition"
              >

                {loading
                  ? 'Sending...'
                  : 'Send Inquiry'}
              </button>

            </form>
          </div>

        </div>
      </div>
      {/* <footer className="border-t border-gray-200 mt-10 py-4 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">

  <p>
    © 2024 – Style For You – All Rights Reserved.
  </p>

  <div className="flex flex-wrap items-center gap-4">

    <span className="hover:text-gray-600 cursor-pointer">
      About Us
    </span>

    <span className="hover:text-gray-600 cursor-pointer">
      Terms & Conditions
    </span>

    <span className="hover:text-gray-600 cursor-pointer">
      Privacy Policy
    </span>

  </div>

</footer> */}
    </div>
  )
}

export default Contact