import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <main className="container-app py-16">
      <div className="rounded-3xl bg-white p-12 shadow-sm text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-600">404</p>
        <h1 className="mt-4 text-5xl font-semibold text-slate-900">Página não encontrada</h1>
        <p className="mt-4 text-slate-600">A página que você tentou acessar não existe.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-teal-600 px-6 py-3 text-white transition hover:bg-teal-700">Voltar ao início</Link>
      </div>
    </main>
  )
}

export default NotFound
