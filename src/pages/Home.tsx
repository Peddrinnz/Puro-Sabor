import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import type { Pizza } from '../types'

const Home: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [favoritePending, setFavoritePending] = useState<string | null>(null)
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null)
  const [cartMessage, setCartMessage] = useState<string | null>(null)

  useEffect(() => {
    if (cartMessage) {
      const timer = setTimeout(() => setCartMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [cartMessage])

  const { addToCart } = useCart()
  const { user, updateUser } = useAuth()
  const nav = useNavigate()

  const extractFavoriteId = (item: unknown): string | undefined => {
    if (typeof item === 'string') return item

    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>
      const pizza = record.pizza

      if (typeof record.pizzaId === 'string') return record.pizzaId
      if (typeof record._id === 'string') return record._id
      if (typeof record.id === 'string') return record.id
      if (pizza && typeof pizza === 'object') {
        const pizzaRecord = pizza as Record<string, unknown>
        if (typeof pizzaRecord._id === 'string') return pizzaRecord._id
        if (typeof pizzaRecord.id === 'string') return pizzaRecord.id
      }
    }

    return undefined
  }

  const normalizeFavoriteIds = (data: unknown): string[] => {
    if (Array.isArray(data)) {
      return data
        .map((item: unknown) => extractFavoriteId(item))
        .filter((value): value is string => typeof value === 'string')
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      const nestedUser = record.user
      const nestedCandidates = [
        nestedUser,
        record.favoritePizzas,
        record.favorites,
        record.items,
        record.data,
      ]

      for (const candidate of nestedCandidates) {
        if (candidate && typeof candidate === 'object') {
          const candidateRecord = candidate as Record<string, unknown>
          const nestedArray = candidateRecord.favoritePizzas ?? candidateRecord.favorites ?? candidateRecord.items ?? candidateRecord.data
          if (Array.isArray(nestedArray)) {
            return nestedArray
              .map((item: unknown) => extractFavoriteId(item))
              .filter((value): value is string => typeof value === 'string')
          }
        }

        if (Array.isArray(candidate)) {
          return candidate
            .map((item: unknown) => extractFavoriteId(item))
            .filter((value): value is string => typeof value === 'string')
        }
      }
    }

    return []
  }

  const favoriteStorageKey = user?._id ? `puro_sabor_favorites_${user._id}` : 'puro_sabor_favorites_guest'

  const readStoredFavorites = () => {
    try {
      const raw = localStorage.getItem(favoriteStorageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const persistFavorites = (ids: string[]) => {
    localStorage.setItem(favoriteStorageKey, JSON.stringify(ids))
  }

  const syncFavoritesToProfile = async (ids: string[]) => {
    const uniqueIds = [...new Set(ids)]
    const routes = ['/users/profile', '/users/me']
    let latestError: unknown = null

    for (const route of routes) {
      try {
        await api.patch(route, { favoritePizzas: uniqueIds })
        return uniqueIds
      } catch (err) {
        latestError = err
      }

      try {
        await api.put(route, { favoritePizzas: uniqueIds })
        return uniqueIds
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const loadFavorites = async () => {
    if (!user) {
      setFavoriteIds([])
      persistFavorites([])
      return
    }

    const fallback = readStoredFavorites()
    setFavoriteIds(fallback)

    const endpoints = ['/users/profile', '/favorites', '/favorite', '/favorites/me']
    let lastError: unknown = null

    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint)
        const profilePayload = endpoint === '/users/profile' ? (res.data.user ?? res.data) : res.data
        const remoteIds = normalizeFavoriteIds(profilePayload)
        const uniqueIds = [...new Set(remoteIds)]

        setFavoriteIds(uniqueIds)
        persistFavorites(uniqueIds)
        updateUser({ ...user, favoritePizzas: uniqueIds })
        return
      } catch (err) {
        lastError = err
      }
    }

    if (lastError) {
      console.warn('Falha ao sincronizar favoritos com a API, usando cache local.', lastError)
    }
  }

  useEffect(() => {
    setLoading(true)
    api
      .get('/pizzas')
      .then((res) => setPizzas(res.data))
      .catch((err) => {
        setError('Erro ao carregar o cardápio. Verifique se a API está rodando em localhost:3000.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void loadFavorites()
  }, [user])

  return (
    <main className="container-app py-10">
      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-4xl bg-slate-950/90 p-8 text-white shadow-[0_25px_60px_-30px_rgba(0,0,0,0.45)]">
          <span className="inline-flex rounded-full bg-cyan-500/15 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-200">Cardápio moderno</span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">Explore nossas pizzas artesanais e peça em poucos segundos.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-cyan-100/80">Filtros rápidos, favoritos salvos e um carrinho pensado para a melhor experiência de pedido no app.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Disponíveis</p>
              <p className="mt-3 text-3xl font-semibold">{pizzas.length}</p>
              <p className="mt-2 text-sm text-slate-300">sabores no cardápio</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Favoritos</p>
              <p className="mt-3 text-3xl font-semibold">{favoriteIds.length}</p>
              <p className="mt-2 text-sm text-slate-300">pizzas salvas</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/checkout" className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Ir ao carrinho</Link>
            <Link to="/orders" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Ver pedidos</Link>
          </div>
        </div>

        <aside className="rounded-4xl bg-white/95 p-8 text-slate-950 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.25)]">
          <h2 className="text-2xl font-semibold">Nosso local</h2>
          <p className="mt-3 text-sm text-slate-600">Localizado no coração da cidade, nosso espaço oferece atendimento rápido e ambiente descontraído.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Endereço</p>
              <p className="mt-2 font-semibold">Rua das Pizzas, 123</p>
              <p className="text-sm text-slate-500">São Paulo - SP</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Seg-sex</p>
                <p className="mt-2 font-semibold">11:00 - 23:00</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Sábado</p>
                <p className="mt-2 font-semibold">12:00 - 00:00</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {cartMessage && (
        <div className="mt-8 rounded-[1.75rem] border border-emerald-200/60 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm">
          {cartMessage}
        </div>
      )}

      {favoriteMessage && (
        <div className="mt-4 rounded-[1.75rem] border border-teal-200/60 bg-teal-50 px-5 py-4 text-sm text-teal-900 shadow-sm">
          {favoriteMessage}
        </div>
      )}

      <section className="mt-10 rounded-4xl bg-white p-8 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-teal-600">Menu principal</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Descubra a sua próxima pizza</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500">Navegue pelo cardápio completo, veja detalhes das receitas e encontre combinações que combinam com seu gosto.</p>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 rounded-4xl bg-white p-12 text-center text-slate-500 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.12)]">Carregando pizzas...</div>
      ) : error ? (
        <div className="mt-8 rounded-4xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">{error}</div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pizzas.map((p) => {
            const isFavorite = favoriteIds.includes(p._id)

            return (
              <article key={p._id} className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/90 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_25px_80px_-30px_rgba(0,0,0,0.55)]">
                <div className="bg-linear-to-r from-cyan-500 to-teal-400 p-6 text-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-700">Especial</p>
                      <h2 className="mt-2 text-2xl font-semibold">{p.name}</h2>
                    </div>
                    <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white shadow-sm">{p.available === false ? 'Indisponível' : 'Disponível'}</span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.ingredients.slice(0, 5).map((ing) => (
                      <span key={ing} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">{ing}</span>
                    ))}
                    {p.ingredients.length > 5 && (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">+{p.ingredients.length - 5} mais</span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Preço</p>
                      <p className="text-2xl font-bold text-white">R$ {p.price.toFixed(2)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isFavorite ? 'bg-teal-100 text-teal-800' : 'bg-slate-800 text-slate-200'}`}>
                      {isFavorite ? 'Favorita' : 'Nova'}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1)
                        setCartMessage('Pizza adicionada ao carrinho!')
                      }}
                      className="rounded-full bg-linear-to-r from-cyan-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                    >
                      Adicionar
                    </button>
                    <Link to={`/pizzas/${p._id}`} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                      Detalhes
                    </Link>
                    <button
                      type="button"
                      disabled={favoritePending === p._id}
                      onClick={async () => {
                        if (!user) {
                          nav('/login')
                          return
                        }

                        setFavoritePending(p._id)
                        const nextValue = !isFavorite
                        const previous = [...favoriteIds]
                        const updatedIds = nextValue
                          ? [...new Set([...favoriteIds, p._id])]
                          : favoriteIds.filter((id) => id !== p._id)

                        setFavoriteIds(updatedIds)
                        persistFavorites(updatedIds)

                        try {
                          await syncFavoritesToProfile(updatedIds)
                          updateUser({ ...user, favoritePizzas: updatedIds })
                          setFavoriteMessage(nextValue ? 'Pizza adicionada aos favoritos com sucesso.' : 'Pizza removida dos favoritos.')
                        } catch (err) {
                          console.error(err)
                          setFavoriteIds(previous)
                          persistFavorites(previous)
                          setFavoriteMessage('Não foi possível sincronizar o favorito. Tente novamente.')
                        } finally {
                          setFavoritePending(null)
                        }
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${isFavorite ? 'border border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
                    >
                      {favoritePending === p._id ? 'Salvando...' : isFavorite ? 'Favorito' : 'Favoritar'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Home
