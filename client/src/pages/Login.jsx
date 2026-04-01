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
      <div className="hidden lg:flex w-1/2 bg-green-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-800 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-green-700 font-black text-xl">EK</span>
          </div>
          <h1 className="text-white text-4xl font-black leading-tight">
            Escorts<br />Kubota
          </h1>
          <p className="text-green-200 mt-2 text-lg">Merchandise Portal</p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '🛍️', title: 'Order Merchandise', desc: 'Browse and order branded products' },
            { icon: '📦', title: 'Track Orders', desc: 'Real-time order status updates' },
            { icon: '👥', title: 'Dealer Network', desc: 'Exclusive portal for EK dealers' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-green-200 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-green-300 text-xs">© 2024 Escorts Kubota Ltd.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-xl">EK</span>
            </div>
            <h1 className="text-xl font-black text-gray-800">Escorts Kubota</h1>
            <p className="text-gray-500 text-sm">Merchandise Portal</p>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-2xl font-black text-gray-800">Welcome back 👋</h2>
              <p className="text-gray-500 text-sm mt-1 mb-8">Sign in with your registered phone number</p>

              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <div className="flex mt-2 shadow-sm">
                  <span className="bg-white border border-r-0 rounded-l-xl px-4 flex items-center text-gray-500 text-sm font-medium">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="Enter your phone number"
                    className="flex-1 bg-white border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 active:scale-95 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200"
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

              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
  <p className="text-xs text-yellow-700 text-center">
    Demo mode — use OTP <span className="font-black">123456</span>
  </p>
</div>

<p className="text-center text-xs text-gray-400 mt-4">
  Don't have an account?{' '}
  <span className="text-green-700 font-bold">
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
                  className="w-full bg-white border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 active:scale-95 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200"
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
                className="w-full mt-3 text-sm text-gray-400 hover:text-green-700 transition py-2"
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