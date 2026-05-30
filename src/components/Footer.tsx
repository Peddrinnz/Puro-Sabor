import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300 pt-4">
      <div className="container-app px-4 py-12 sm:px-0">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <p className="text-2xl font-bold text-white">Puro Sabor</p>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              Pizza artesanal com entrega rápida, cardápio inteligente e experiência moderna para clientes e administradores.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Links úteis</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/menu" className="transition hover:text-white">Menu</Link>
              </li>
              <li>
                <Link to="/checkout" className="transition hover:text-white">Carrinho</Link>
              </li>
              <li>
                <Link to="/orders" className="transition hover:text-white">Meus pedidos</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Contato</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Rua das Pizzas, 123</li>
              <li>(11) 99999-0000</li>
              <li>contato@purosabor.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-500 pb-4">
          © {new Date().getFullYear()} Puro Sabor. Experiência de pedido otimizada para todos.
        </div>
      </div>
    </footer>
  )
}

export default Footer
