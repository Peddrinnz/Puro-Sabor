import React from 'react'
import { Link } from 'react-router-dom'

const Landing: React.FC = () => {
  return (
    <main className="container-app py-10">
      <section className="overflow-hidden rounded-[2.5rem] bg-linear-to-r from-slate-950 via-cyan-900 to-teal-700 p-8 text-white shadow-[0_30px_80px_-40px_rgba(8,47,73,0.85)] sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">Pizzaria moderna</span>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Sabor artesanal, pedido rápido e ambiente acolhedor.</h1>
            <p className="max-w-2xl text-lg leading-8 text-cyan-100/90">Descubra nosso cardápio premium, experimente sabores exclusivos e acompanhe cada etapa do seu pedido com design limpo e simples.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                Ver cardápio
              </Link>
              <Link to="/checkout" className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20">
                Meu carrinho
              </Link>
            </div>
          </div>

          <div className="rounded-4xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-900/70">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/95 p-5 text-slate-950 dark:bg-slate-900/95 dark:text-slate-100">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Nosso espaço</p>
                <p className="mt-3 text-3xl font-bold">Conforto</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Ambiente convidativo para apreciar sua pizza com estilo.</p>
              </div>
              <div className="rounded-3xl bg-white/95 p-5 text-slate-950 dark:bg-slate-900/95 dark:text-slate-100">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Tempo</p>
                <p className="mt-3 text-3xl font-bold">Rápido</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Pedido preparado e entregue com processo otimizado.</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950/85 p-5 text-cyan-100">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Endereço</p>
              <p className="mt-3 text-xl font-semibold">Rua das Pizzas, 123</p>
              <p className="mt-1 text-sm text-slate-400">São Paulo - SP</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Seg-Sex</p>
                  <p className="mt-2 text-sm">11:00 - 23:00</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 dark:bg-slate-900/50">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Sábado</p>
                  <p className="mt-2 text-sm">12:00 - 00:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="rounded-4xl bg-white/95 p-8 text-slate-950 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.12)] dark:bg-slate-950/90 dark:text-white dark:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)]">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Experiência</p>
          <h2 className="mt-4 text-2xl font-semibold">Receitas exclusivas</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Combinações criadas para quem valoriza pizza artesanal com ingredientes frescos e toques especiais.</p>
        </article>
        <article className="rounded-4xl bg-white p-8 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.15)] dark:bg-slate-900 dark:text-slate-100">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Conveniência</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-slate-100">Pedido fácil</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Adicione ao carrinho, salve favoritos e confira o status sem sair do app.</p>
        </article>
        <article className="rounded-4xl bg-white p-8 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.15)] dark:bg-slate-900 dark:text-slate-100">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Controle</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-slate-100">Admin completo</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Painel administrativo para atualizar cardápio, status de pedido e gerenciar entregas.</p>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-4xl bg-white p-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)] dark:bg-slate-900 dark:text-slate-100">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-600">Sobre o local</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-slate-100">Um lugar pensado para quem ama pizza</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-7">Nossa pizzaria combina decoração aconchegante, cardápio autoral e atendimento atencioso. A cada pedido, você recebe um produto fresco e uma experiência de compra simples.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-100/90 p-5 text-slate-950 dark:bg-slate-950/95 dark:text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Qualidade</p>
              <p className="mt-3 font-semibold">Massa crocante e recheio generoso</p>
            </div>
            <div className="rounded-3xl bg-slate-100/90 p-5 text-slate-950 dark:bg-slate-950/95 dark:text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Atenção</p>
              <p className="mt-3 font-semibold">Entrega alinhada com seu tempo</p>
            </div>
          </div>
        </div>
        <div className="rounded-4xl bg-white/95 p-10 text-slate-950 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] dark:bg-slate-950/90 dark:text-white dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Destaques</p>
          <h2 className="mt-4 text-3xl font-semibold">O que você encontra aqui</h2>
          <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-200">
            <li className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">Menu atualizado com sabores exclusivos e ingredientes premium.</li>
            <li className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">Área de pedidos com favoritos, carrinho rápido e checagem de status.</li>
            <li className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">Localização estratégica no coração da cidade, com atendimento express.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default Landing
