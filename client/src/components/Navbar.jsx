import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, ClipboardList, Users,
  ShoppingBag, ShoppingCart, LogOut, ChevronDown,
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
      <div className="bg-[#1a1a1a] px-6 py-2.5 flex items-center justify-between">
        {/* Left — EK Branding */}
       <div className="flex items-center gap-2">
  
  {/* Left EK Box (keep if you want) */}
  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
    <span className="text-white font-black text-xs">EK</span>
  </div>

  {/* Text + Logo */}
  <div className="flex items-center gap-2">
    <div>
      <p className="text-white font-black text-xs leading-none">
        Escorts Kubota
      </p>
      <p className="text-gray-400 text-xs">
        Merchandise Portal
      </p>
    </div>

    {/* Style4You Logo */}
     {/* S4U Logo */}
          <a href="https://orange-rat-828494.hostingersite.com/" className="inline-block" target="_blank" rel="noopener noreferrer">
  <img
    src="/logo-1.jpeg"
    alt="S4U Style For You"
    className="h-12 w-auto object-contain bg-white rounded-xl px-3 py-1.5 shadow-lg"
  />
</a>
  </div>

</div>

        {/* Right — Contact info */}
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
          <span>+91 96500 76390</span>
          <span>client.support@s4u.com</span>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bg-[#111111] px-6 py-2.5 flex items-center justify-between">

        {/* Nav Links */}
        <div className="flex items-center gap-1 flex-1">
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
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${
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
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${
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
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition relative ${
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
        <div className="relative group">
          <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-black font-black text-sm">{user?.name?.[0]}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
              <p className="text-xs text-amber-500">{user?.code}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white border-opacity-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="px-4 py-3 border-b border-white border-opacity-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold">{user?.name?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.code}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user?.role === 'admin'
                      ? 'bg-purple-900 text-purple-300'
                      : 'bg-amber-900 text-amber-400'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 border-b border-white border-opacity-10">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-300 font-medium">+91 {user?.phone}</p>
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