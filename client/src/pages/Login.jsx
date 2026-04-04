import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    if (!phone) return toast.error('Enter phone number')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { phone })
      toast.success('OTP sent! Use 123456 for demo')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp })
      login(res.data.user, res.data.token)
      toast.success(`Welcome ${res.data.user.name}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#111111] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-10" />

        {/* Top — Both logos */}
        <div className="relative z-10 flex items-center justify-between">
          {/* EK Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">EK</span>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">Escorts Kubota</p>
              <p className="text-gray-500 text-xs">Merchandise Portal</p>
            </div>
          </div>

          {/* S4U Logo */}
          <a href="https://orange-rat-828494.hostingersite.com/" className="inline-block" target="_blank" rel="noopener noreferrer">
  <img
    src="/logo-1.jpeg"
    alt="S4U Style For You"
    className="h-12 w-auto object-contain bg-white rounded-xl px-3 py-1.5 shadow-lg"
  />
</a>
        </div>

        {/* Middle Content */}
        <div className="relative z-10">
          <div className="w-16 h-1 bg-amber-500 mb-6 rounded-full" />
          <h1 className="text-white text-4xl font-black leading-tight">
            Welcome to the<br />
            <span className="text-amber-500">Exclusive Portal</span><br />
            For Escorts<br />
            Dealership Uniform
          </h1>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">
            Browse and order official Escorts Kubota branded merchandise exclusively for dealers and employees.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3">
            {[
              'Official branded merchandise',
              'Exclusive dealer pricing',
              'Real-time order tracking',
              'Secure OTP-based login',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-gray-600 text-xs">
          © 2024 Escorts Kubota Ltd. Powered by Style For You
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">EK</span>
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">Escorts Kubota</p>
                <p className="text-gray-400 text-xs">Merchandise Portal</p>
              </div>
            </div>
            <img src="/logo-1.jpeg" alt="S4U" className="h-20 w-auto object-contain" />
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-black text-gray-800">Welcome back 👋</h2>
              <p className="text-gray-500 text-sm mt-1 mb-8">Sign in with your registered phone number</p>

              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <div className="flex mt-2">
                  <span className="bg-gray-50 border border-r-0 rounded-l-xl px-4 flex items-center text-gray-500 text-sm font-medium">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="Enter your phone number"
                    className="flex-1 bg-white border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-black py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending OTP...
                  </span>
                ) : 'Send OTP →'}
              </button>

              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 text-center">
                  Demo mode — use OTP <span className="font-black">123456</span>
                </p>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Don't have an account?{' '}
                <span className="text-amber-600 font-bold">
                  Contact your Escorts Kubota representative
                </span>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-800">Enter OTP 🔐</h2>
              <p className="text-gray-500 text-sm mt-1 mb-8">
                Sent to <span className="font-bold text-gray-700">+91 {phone}</span>
              </p>

              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">One Time Password</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full bg-white border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest mt-2 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-black py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Login to Portal →'}
              </button>

              <button
                onClick={() => { setStep(1); setOtp('') }}
                className="w-full mt-3 text-sm text-gray-400 hover:text-amber-600 transition py-2"
              >
                ← Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login