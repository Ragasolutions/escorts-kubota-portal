import { useState, useEffect, useRef } from 'react'
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
  Menu,
  X,
} from 'lucide-react'

const Navbar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth()
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setShowMore(false)
  }, [location.pathname])

  return (
    <nav className="sticky top-0 z-50 shadow-md">

      {/* Top Bar */}
      <div className="bg-[#1a1a1a] px-4 sm:px-6 py-3 border-b border-white border-opacity-5">
        <div className="flex lg:flex-row lg:items-center lg:justify-between gap-3 justify-between items-center">

          {/* Left Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://orange-rat-828494.hostingersite.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-md"
              >
                <img src="/logo-1.jpeg" alt="Style4U" className="h-14 w-auto object-contain" />
              </a>
            </div>
          </div>

          {/* Right Contact */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

            <a
              href="tel:+918076422987"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-10 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-green-500 bg-opacity-10 flex items-center justify-center">
                <Phone size={14} className="text-green-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-gray-500 leading-none">Call Us</p>
                <p className="text-xs text-white font-semibold">+918076422987</p>
              </div>
            </a>

            <a
              href="mailto:style4ufbd@gmail.com"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 hover:border-amber-500 hover:bg-amber-500 hover:bg-opacity-10 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
                <Mail size={14} className="text-blue-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-gray-500 leading-none">Email Support</p>
                <p className="text-xs text-white font-semibold">style4ufbd@gmail.com</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bg-[#111111] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">

        {/* Nav Links */}
<div className="flex items-center gap-1 flex-1">
          {user?.role === 'admin' ? (
            <>
              {[
                { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/admin/products', label: 'Products', icon: Package },
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

              {/* More — mobile only */}
              <div className="relative sm:hidden" ref={moreRef}>
                <button
                  onClick={() => setShowMore(prev => !prev)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-400 hover:text-amber-500 transition"
                >
                  {showMore ? <X size={15} /> : <Menu size={15} />}
                  <span>More</span>
                  <ChevronDown size={12} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
                </button>

                {showMore && (
<div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1a1a] border border-white border-opacity-10 rounded-xl shadow-xl z-[999] overflow-hidden">                    <Link
                      to="/admin/orders"
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm transition ${isActive('/admin/orders') ? 'text-amber-500 bg-amber-500 bg-opacity-10' : 'text-gray-400 hover:text-amber-500 hover:bg-white hover:bg-opacity-5'}`}
                    >
                      <ClipboardList size={14} /> Orders
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm transition ${isActive('/admin/users') ? 'text-amber-500 bg-amber-500 bg-opacity-10' : 'text-gray-400 hover:text-amber-500 hover:bg-white hover:bg-opacity-5'}`}
                    >
                      <Users size={14} /> Users
                    </Link>
                  </div>
                )}
              </div>

              {/* Orders + Users — desktop only */}
              {[
                { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
                { path: '/admin/users', label: 'Users', icon: Users },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition ${
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
                { path: '/my-orders', label: 'My Orders', icon: ClipboardList },
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

              {/* More — mobile only */}
              <div className="relative sm:hidden" ref={moreRef}>
               
<button
  onClick={() => setShowMore(prev => !prev)}
  className="relative flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-400 hover:text-amber-500 transition"
>
  {showMore ? <X size={15} /> : <Menu size={15} />}
  <span>More</span>
  <ChevronDown size={12} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
      {cartCount}
    </span>
  )}
</button>

                {showMore && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1a1a] border border-white border-opacity-10 rounded-xl shadow-xl z-50 overflow-hidden">
                    <Link
                      to="/contact"
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm transition ${isActive('/contact') ? 'text-amber-500 bg-amber-500 bg-opacity-10' : 'text-gray-400 hover:text-amber-500 hover:bg-white hover:bg-opacity-5'}`}
                    >
                      <Phone size={14} /> Contact Us
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm transition ${isActive('/cart') ? 'text-amber-500 bg-amber-500 bg-opacity-10' : 'text-gray-400 hover:text-amber-500 hover:bg-white hover:bg-opacity-5'}`}
                    >
                      <ShoppingCart size={14} /> Cart
                      {cartCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                )}
              </div>

              {/* Contact + Cart — desktop only */}
              <Link
                to="/contact"
                className={`hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition ${
                  isActive('/contact') ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-amber-500'
                }`}
              >
                <Phone size={15} /> Contact Us
              </Link>

              <Link
                to="/cart"
                className={`hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition relative ${
                  isActive('/cart') ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-amber-500'
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

        {/* Right Section — Profile */}
        <div className="flex items-center gap-3 shrink-0">

          <div className="hidden sm:block w-px h-8 bg-white bg-opacity-10"></div>

          <div className="relative group shrink-0">
            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-black font-black text-sm">{user?.name?.[0]}</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-white leading-none truncate max-w-[120px]">{user?.name}</p>
                <p className="text-xs text-amber-500 truncate">{user?.code}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </button>

            <div className="absolute right-0 top-full mt-2 w-72 sm:w-56 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white border-opacity-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">

              <div className="px-4 py-3 border-b border-white border-opacity-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-black font-bold">{user?.name?.[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.code}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${user?.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-amber-900 text-amber-400'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-white border-opacity-10">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-300 font-medium break-all">+91 {user?.phone}</p>
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