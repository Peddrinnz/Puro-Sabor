import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const nav = useNavigate()

  const isDark = theme === 'dark'
  const headerClasses = 'border-b border-slate-200 bg-white/90 text-slate-900 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100'
  const linkClasses = 'text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
  const accentLinkClasses = 'text-cyan-600 dark:text-cyan-300'
  const themeToggleClasses = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'

  return (
    <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-xl shadow-sm p-2 ${headerClasses}`}>
      <div className="container-app flex flex-wrap items-center justify-between gap-4 py-4 px-4 sm:px-0">
        <Link to="/" className={`text-2xl font-bold tracking-tight ${accentLinkClasses}`}>Puro Sabor</Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-3 sm:text-base">
          <Link to="/menu" className={`rounded-full px-4 py-2 ${linkClasses}`}>Menu</Link>
          <Link to="/checkout" className={`rounded-full px-4 py-2 ${linkClasses}`}>Carrinho ({itemCount})</Link>
          {user && <Link to="/orders" className={`rounded-full px-4 py-2 ${linkClasses}`}>Meus Pedidos</Link>}
          {user && user.role === 'admin' && (
            <Link to="/admin" className={`rounded-full px-4 py-2 ${linkClasses}`}>Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className={`rounded-full px-4 py-2 font-medium ${linkClasses}`}>{user.name ?? 'Perfil'}</Link>
              <button
                type="button"
                onClick={toggleTheme}
                className={themeToggleClasses}
                aria-label="Alternar tema"
              >
                {isDark ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => {
                  logout()
                  nav('/login')
                }}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`rounded-full px-3 py-1 transition ${isDark ? 'hover:text-teal-200' : 'hover:text-teal-600'}`}>Entrar</Link>
              <Link to="/register" className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-cyan-700">Registrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header