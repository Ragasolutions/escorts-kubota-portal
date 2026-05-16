import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ChevronDown,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react'

const Navbar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 shadow-md">

      {/* Top Bar */}
    {/* Top Bar */}
<div className="bg-[#1a1a1a] px-4 sm:px-6 py-3 border-b border-white border-opacity-5">

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

    {/* Left Branding */}
    <div className="flex items-center gap-3 min-w-0">

      {/* EK Logo Box */}
      {/* <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shrink-0">
        <span className="text-white font-black text-sm">
          EK
        </span>
      </div> */}

      {/* Main Branding */}
      {/* <div className="min-w-0">

        <div className="flex items-center gap-2 flex-wrap">

          <h1 className="text-white font-black text-sm sm:text-base leading-none truncate">
            Escorts Kubota
          </h1>

          <span className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-500 bg-opacity-10 text-amber-500 border border-amber-500 border-opacity-20">
            <ShieldCheck size={11} />
            Official Portal
          </span>
        </div>

        <p className="text-gray-400 text-[11px] sm:text-xs mt-1 truncate">
          Executive Merchandise & Uniform Portal
        </p>
      </div> */}

      {/* Divider */}
      {/* <div className="hidden lg:block w-px h-10 bg-white bg-opacity-10"></div> */}

      {/* Style4U Logo */}
      <a
        href=""
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-lg hover:scale-[1.02] transition shrink-0"
      >

        <img
          src="/Escorts-eddal.png"
          alt="Style4U"
          className="h-12 w-auto object-contain"
        />

        {/* <div className="hidden xl:block">
          <p className="text-[11px] font-black text-gray-800 leading-none">
            STYLE4U
          </p>

          <p className="text-[10px] text-gray-500 mt-1">
            Official Uniform Partner
          </p>
        </div> */}
      </a>
    </div>

    {/* Right Contact */}
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">

      {/* Call */}
      <a
        href="tel:+918076422987"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-10 transition"
      >
        <div className="w-7 h-7 rounded-lg bg-green-500 bg-opacity-10 flex items-center justify-center">
          <Phone size={14} className="text-green-400" />
        </div>

        <div className="hidden sm:block">
          <p className="text-[10px] text-gray-500 leading-none">
            Call Us
          </p>

          <p className="text-xs text-white font-semibold">
            +918076422987
          </p>
        </div>
      </a>

      {/* Mail */}
      <a
        href="mailto:style4ufbd@gmail.com"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-10 transition"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
          <Mail size={14} className="text-blue-400" />
        </div>

        <div className="hidden sm:block">
          <p className="text-[10px] text-gray-500 leading-none">
            Email Support
          </p>

          <p className="text-xs text-white font-semibold">
style4ufbd@gmail.com
          </p>
        </div>
      </a>
    </div>
  </div>
</div>

      {/* Bottom Nav Bar */}
      <div className="bg-[#111111] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">

        {/* Nav Links */}
<div className="flex items-center gap-1 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {user?.role === 'admin' ? (
            <>
              {[
                { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/admin/products', label: 'Products', icon: Package },
                { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
                { path: '/admin/users', label: 'Users', icon: Users },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition ${
                    isActive(item.path)
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-gray-400 hover:text-amber-500'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              {[
                { path: '/home', label: 'Home', icon: ShoppingBag },
                { path: '/my-orders', label: 'My Order', icon: ClipboardList },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition ${
                    isActive(item.path)
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-gray-400 hover:text-amber-500'
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}

              <Link
                to="/cart"
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition relative ${
                  isActive('/cart')
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-gray-400 hover:text-amber-500'
                }`}
              >
                <ShoppingCart size={15} />

                Cart

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        {/* Right Section */}
<div className="flex items-center gap-3 shrink-0">

  {/* Style4U Logo */}
  <a
    href="https://orange-rat-828494.hostingersite.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-md hover:scale-[1.02] transition"
  >

    <img
      src="/logo-1.jpeg"
      alt="Style4U"
      className="h-10 w-auto object-contain"
    />

    {/* <div className="hidden lg:block">
      <p className="text-[10px] font-black text-gray-800 leading-none">
        STYLE4U
      </p>

      <p className="text-[9px] text-gray-500 mt-0.5">
        Official Partner
      </p>
    </div> */}
  </a>

  {/* Divider */}
  <div className="hidden sm:block w-px h-8 bg-white bg-opacity-10"></div>

  {/* Profile Dropdown */}
  <div className="relative group shrink-0">

    <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition">

      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
        <span className="text-black font-black text-sm">
          {user?.name?.[0]}
        </span>
      </div>

      <div className="text-left hidden md:block">

        <p className="text-sm font-bold text-white leading-none truncate max-w-[120px]">
          {user?.name}
        </p>

        <p className="text-xs text-amber-500 truncate">
          {user?.code}
        </p>
      </div>

      <ChevronDown
        size={14}
        className="text-gray-400 shrink-0"
      />
    </button>

    {/* Dropdown */}
    <div className="absolute right-0 top-full mt-2 w-72 sm:w-56 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white border-opacity-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

      <div className="px-4 py-3 border-b border-white border-opacity-10">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-black font-bold">
              {user?.name?.[0]}
            </span>
          </div>

          <div className="min-w-0">

            <p className="text-sm font-bold text-white truncate">
              {user?.name}
            </p>

            <p className="text-xs text-gray-400 truncate">
              {user?.code}
            </p>

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                user?.role === 'admin'
                  ? 'bg-purple-900 text-purple-300'
                  : 'bg-amber-900 text-amber-400'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white border-opacity-10">

        <p className="text-xs text-gray-500">
          Phone
        </p>

        <p className="text-sm text-gray-300 font-medium break-all">
          +91 {user?.phone}
        </p>
      </div>

      <div className="px-3 py-2">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-xl transition font-medium"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  </div>
</div>
      </div>
    </nav>
  )
}

export default Navbar