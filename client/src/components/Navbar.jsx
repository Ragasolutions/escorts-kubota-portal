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
      <div className="bg-[#1a1a1a] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">

        {/* Left — EK Branding */}
        <div className="flex items-center gap-2 min-w-0">

          {/* EK Box */}
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">EK</span>
          </div>

          {/* Text + Logo */}
          <div className="flex items-center gap-2 min-w-0">

            <div className="min-w-0">
              <p className="text-white font-black text-xs leading-none truncate">
                Escorts Kubota
              </p>

              <p className="text-gray-400 text-[10px] sm:text-xs truncate">
                Merchandise Portal
              </p>
            </div>

            {/* S4U Logo */}
            <a
              href="https://orange-rat-828494.hostingersite.com/"
              className="inline-block shrink-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/logo-1.jpeg"
                alt="S4U Style For You"
                className="h-10 sm:h-12 w-auto object-contain bg-white rounded-xl px-2 sm:px-3 py-1.5 shadow-lg"
              />
            </a>
          </div>
        </div>

        {/* Right — Contact info */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-gray-400 shrink-0">
          <span>+91 96500 76390</span>
          <span>client.support@s4u.com</span>
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

            <ChevronDown size={14} className="text-gray-400 shrink-0" />
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
              <p className="text-xs text-gray-500">Phone</p>

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
    </nav>
  )
}

export default Navbar