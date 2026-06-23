import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { auth } from '../config/firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import { Link } from 'react-router-dom'

// ─── Zod Schemas ─────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[6-9]\d{9}$/,
      'Enter a valid 10-digit Indian mobile number'
    ),
})

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

const Login = () => {

  const [step, setStep] = useState(1)

  const [phone, setPhoneState] = useState('')

  const [loading, setLoading] = useState(false)

  const [selectedRole, setSelectedRole] =
    useState('Dealer')

  const [showModal, setShowModal] =
    useState(null)

  const [confirmationResult, setConfirmationResult] =
    useState(null)

  const [useFirebase, setUseFirebase] =
    useState(
      import.meta.env.VITE_FIREBASE_API_KEY
        ? true
        : false
    )

  const { login } = useAuth()

  const navigate = useNavigate()

  const recaptchaRef = useRef(null)

  // Phone Form
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm({
    resolver: zodResolver(phoneSchema),
  })

  // OTP Form
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  })

 const onSendOtp = async (data) => {

  setLoading(true)

  try {

    await api.post('/auth/send-otp', {
      phone: data.phone,
    })

    setPhoneState(data.phone)

    if (useFirebase) {

      // Create reCAPTCHA only once
      if (!window.recaptchaVerifier) {

        window.recaptchaVerifier =
          new RecaptchaVerifier(
            auth,
            recaptchaRef.current,
            {
              size: 'invisible',
            }
          )

        await window.recaptchaVerifier.render()
      }

      const result =
        await signInWithPhoneNumber(
          auth,
          `+91${data.phone}`,
          window.recaptchaVerifier
        )

      setConfirmationResult(result)

      toast.success(
        'OTP sent successfully!'
      )

    } else {

      toast.success(
        'OTP sent! Use 123456 for demo'
      )
    }

    setStep(2)

  } catch (err) {

    console.log(err)

    if (
      err.code ===
      'auth/too-many-requests'
    ) {

      toast.error(
        'Too many attempts. Try again later.'
      )

    } else if (
      err.code ===
      'auth/invalid-phone-number'
    ) {

      toast.error(
        'Invalid phone number.'
      )

    } else if (
      err.code ===
      'auth/network-request-failed'
    ) {

      toast.error(
        'Network error. Check your internet.'
      )

    } else if (
      err.code ===
      'auth/invalid-app-credential'
    ) {

      toast.error(
        'Verification failed. Please refresh and try again.'
      )

    } else if (
      err.message?.includes(
        'reCAPTCHA client element has been removed'
      )
    ) {

      toast.error(
        'Session expired. Please refresh the page.'
      )

    } else if (
      err.message?.includes(
        'reCAPTCHA has already been rendered'
      )
    ) {

      toast.error(
        'Verification already initialized. Please refresh.'
      )

    } else {

      toast.error(
        err.response?.data?.message ||
        'Failed to send OTP'
      )
    }
  }

  setLoading(false)
}



  const onVerifyOtp = async (data) => {

  setLoading(true)

  try {

    let firebaseToken = null

    if (
      useFirebase &&
      confirmationResult
    ) {

      // Verify OTP with Firebase
      const result =
        await confirmationResult.confirm(
          data.otp
        )

      firebaseToken =
        await result.user.getIdToken()
    }

    const res = await api.post(
      '/auth/verify-otp',
      {
        phone,
        otp: data.otp,
        firebaseToken,
      }
    )

    login(
      res.data.user,
      res.data.token
    )

    toast.success(
      `Welcome ${res.data.user.name}!`
    )

    // Clear old reCAPTCHA
    window.recaptchaVerifier = null

    navigate(
      res.data.user.role === 'admin'
        ? '/admin'
        : '/home'
    )

  } catch (err) {

    console.log(err)

    if (
      err.code ===
      'auth/invalid-verification-code'
    ) {

      toast.error(
        'Invalid OTP. Please try again.'
      )

    } else if (
      err.code ===
      'auth/code-expired'
    ) {

      toast.error(
        'OTP expired. Request a new OTP.'
      )

    } else if (
      err.code ===
      'auth/session-expired'
    ) {

      toast.error(
        'Session expired. Please resend OTP.'
      )

    } else if (
      err.code ===
      'auth/network-request-failed'
    ) {

      toast.error(
        'Network error. Check your internet.'
      )

    } else if (
      err.message?.includes(
        'reCAPTCHA client element has been removed'
      )
    ) {

      toast.error(
        'Verification session expired. Refresh page and try again.'
      )

    } else {

      toast.error(
        err.response?.data?.message ||
        'OTP verification failed'
      )
    }
  }

  setLoading(false)
}

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111111] flex-col justify-between p-8 xl:p-12 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10" />

        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500 rounded-full translate-y-1/2 -translate-x-1/2 opacity-10" />

        {/* Top Logos */}
        <div className="relative z-10 flex items-center justify-between gap-4">

           <div className="hidden sm:flex items-center gap-3 shrink-0">

  <div className="bg-white rounded-xl px-4 py-2 shadow-lg hover:scale-[1.02] transition">
    <img
      src="/eddal-logo.png"
      alt="EDDAL"
      className="h-12 w-auto object-contain"
    />
  </div>

  <div className="bg-white rounded-xl px-4 py-2 shadow-lg hover:scale-[1.02] transition">
    <img
      src="/escorts-kubota-logo.png"
      alt="Escorts Kubota Limited"
      className="h-12 w-auto object-contain"
    />
  </div>

</div>

          <a
            href="https://orange-rat-828494.hostingersite.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <img
              src="/logo-1.jpeg"
              alt="S4U"
              className="h-16 xl:h-20 w-auto object-contain bg-white rounded-xl px-3 py-1.5 shadow-lg"
            />
          </a>
        </div>

        {/* Middle */}
        <div className="relative z-10">

          <div className="w-16 h-1 bg-amber-500 mb-6 rounded-full" />

         <h1 className="text-white text-3xl lg:text-4xl xl:text-5xl font-black leading-tight">
  Welcome to
  <br />

  <span className="text-amber-500">
    Escorts Kubota Limited
  </span>

  <br />

  Dealership Manpower
  <br />

  Uniform Portal
</h1>

          {/* <p className="text-gray-400 mt-4 text-sm leading-relaxed max-w-md">

            Browse and order official Escorts Kubota
            branded merchandise exclusively for
            dealers and employees.
          </p> */}

         <div className="mt-8 space-y-3">

  {[
    {
      name: 'About Style4U',
      path: '/about-style4u',
    },
    {
      name: 'Privacy Policy',
      path: '/privacy-policy',
    },
    {
      name: 'Terms & Conditions',
      path: '/terms-and-conditions',
    },
    {
      name: 'Shipping & Delivery Policy',
      path: '/shipping-delivery-policy',
    },
  ].map((item) => (

    <Link
      key={item.name}
      to={item.path}
      className="flex items-center gap-3 group"
    >

      <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shrink-0">

        <svg
          className="w-3 h-3 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>

      </div>

      <p className="text-gray-300 text-base font-medium group-hover:text-amber-400 transition-colors">
        {item.name}
      </p>

    </Link>

  ))}

</div>
        </div>

        {/* Footer */}
        <div className="relative z-10">

          <p className="text-center text-md text-white mb-2">
            © 2024 Escorts Kubota Ltd. Powered by
            Style4u
          </p>

          <p className="text-center text-md text-white">
            All Rights Reserved
          </p>
         
        </div>

        
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 py-8 sm:py-10">

        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-between gap-3 mb-8">

  <div className="flex items-center gap-2">

    <img
      src="/eddal-logo.png"
      alt="EDDAL"
      className="h-12 w-auto object-contain"
    />

    <img
      src="/escorts-kubota-logo.png"
      alt="Escorts Kubota"
      className="h-12 w-auto object-contain"
    />

  </div>

  <img
    src="/logo-1.jpeg"
    alt="Style4U"
    className="h-12 w-auto object-contain"
  />

</div>
          {step === 1 ? (

            <form
              onSubmit={handlePhoneSubmit(
                onSendOtp
              )}
              noValidate
            >

              <h2 className="text-3xl font-black text-gray-800 leading-tight">
  Access Your
  <span className="block text-amber-500">
    Uniform Portal
  </span>
</h2>

              <p className="text-gray-500 text-md mt-1 mb-6">
                Sign in with your registered
                phone number
              </p>

              {/* Role Selector */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">

                {[
                  'Dealer',
                  'Employee',
                ].map((role) => (

                  <div
                    key={role}
                    onClick={() =>
                      setSelectedRole(role)
                    }
                    className={`flex-1 flex items-center gap-2 border-2 rounded-xl px-4 py-2.5 cursor-pointer transition ${
                      selectedRole === role
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >

                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedRole === role
                          ? 'border-amber-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRole === role && (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        selectedRole === role
                          ? 'text-amber-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Phone Input */}
              <div className="mb-5">

                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">

                  Phone Number{' '}

                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <div
                  className={`flex mt-2 ${
                    phoneErrors.phone
                      ? 'ring-2 ring-red-400 rounded-xl'
                      : ''
                  }`}
                >

                  <span className="bg-gray-50 border border-r-0 rounded-l-xl px-3 sm:px-4 flex items-center text-gray-500 text-sm font-medium shrink-0">

                    🇮🇳 +91
                  </span>

                  <input
                    {...registerPhone('phone')}
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className={`flex-1 min-w-0 bg-white border rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      phoneErrors.phone
                        ? 'border-red-400 focus:ring-red-400'
                        : 'focus:ring-amber-400'
                    }`}
                  />
                </div>

                {phoneErrors.phone && (

                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">

                    <svg
                      className="w-3 h-3 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {
                      phoneErrors.phone
                        .message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-black py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-100 disabled:opacity-70 disabled:cursor-not-allowed"
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

                    Sending OTP...
                  </span>

                ) : (
                  'Send OTP →'
                )}
              </button>

              {/* <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">

                <p className="text-xs text-amber-700 text-center">

                  Demo mode — use OTP{' '}

                  <span className="font-black">
                    123456
                  </span>
                </p>
              </div> */}

              <p className="text-center text-md text-gray-400 mt-4 leading-relaxed">

                Don't have an account?{' '}

                <span className="text-amber-600 font-bold">
                  Contact your Escorts Kubota
                  representative
                </span>
              </p>
            </form>

          ) : (

            <form
              onSubmit={handleOtpSubmit(
                onVerifyOtp
              )}
              noValidate
            >

              <h2 className="text-2xl font-black text-gray-800">
                Enter OTP 🔐
              </h2>

              <p className="text-gray-500 text-md mt-1 mb-8 leading-relaxed">

                Sent to{' '}

                <span className="font-bold text-gray-700 break-all">
                  +91 {phone}
                </span>
              </p>

              {/* OTP Input */}
              <div className="mb-5">

                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">

                  One Time Password{' '}

                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  {...registerOtp('otp')}
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-center text-xl sm:text-2xl font-black tracking-[0.4em] mt-2 focus:outline-none focus:ring-2 shadow-sm ${
                    otpErrors.otp
                      ? 'border-red-400 focus:ring-red-400'
                      : 'focus:ring-amber-400'
                  }`}
                />

                {otpErrors.otp && (

                  <p className="text-red-500 text-xs mt-1.5 flex items-center justify-center gap-1">

                    <svg
                      className="w-3 h-3 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-black py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-100 disabled:opacity-70 disabled:cursor-not-allowed"
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

                    Verifying...
                  </span>

                ) : (
                  'Login to Portal →'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-3 text-sm text-gray-400 hover:text-amber-600 transition py-2"
              >
                ← Change number
              </button>
            </form>
          )}
        </div>
      </div>

      <div ref={recaptchaRef} />
    </div>
  )
}

export default Login