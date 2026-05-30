import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Pizza } from '../types'

const initialPizzaForm = {
  name: '',
  description: '',
  price: '',
  ingredients: '',
  available: true,
}

const extractCollection = (payload: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(payload)) return payload

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    for (const key of keys) {
      const candidate = record[key]
      if (Array.isArray(candidate)) return candidate
    }

    if (Array.isArray(record.data)) return record.data
  }

  return []
}

const AdminPizzas: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingPizza, setSavingPizza] = useState(false)
  const [deletingPizzaId, setDeletingPizzaId] = useState<string | null>(null)
  const [adminMessage, setAdminMessage] = useState<string | null>(null)
  const [form, setForm] = useState(initialPizzaForm)
  const [editingPizzaId, setEditingPizzaId] = useState<string | null>(null)

  const loadPizzas = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pizzas')
      const nextPizzas = extractCollection(res.data, ['pizzas', 'items', 'data']) as Pizza[]
      setPizzas(nextPizzas)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar pizzas. Verifique a API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPizzas()
  }, [])

  const createPizza = async (pizzaData: Omit<Pizza, '_id'>) => {
    const routes = ['/pizzas', '/admin/pizzas']
    let latestError: unknown = null

    for (const route of routes) {
      try {
        const res = await api.post(route, pizzaData)
        return res.data
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const updatePizza = async (pizzaId: string, pizzaData: Partial<Pizza>) => {
    const routes = [`/pizzas/${pizzaId}`, `/admin/pizzas/${pizzaId}`]
    let latestError: unknown = null

    for (const route of routes) {
      try {
        const res = await api.put(route, pizzaData)
        return res.data
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const deletePizza = async (pizzaId: string) => {
    const routes = [`/pizzas/${pizzaId}`, `/admin/pizzas/${pizzaId}`]
    let latestError: unknown = null

    for (const route of routes) {
      try {
        await api.delete(route)
        return
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const resetForm = () => {
    setForm(initialPizzaForm)
    setEditingPizzaId(null)
  }

  const handlePizzaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingPizza(true)
    setAdminMessage(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      ingredients: form.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      available: form.available,
    }

    try {
      if (editingPizzaId) {
        await updatePizza(editingPizzaId, payload)
        setAdminMessage('Pizza atualizada com sucesso.')
      } else {
        await createPizza(payload)
        setAdminMessage('Pizza cadastrada com sucesso.')
      }

      resetForm()
      await loadPizzas()
    } catch (err) {
      console.error(err)
      setAdminMessage('Não foi possível salvar a pizza. Verifique a API e tente novamente.')
    } finally {
      setSavingPizza(false)
    }
  }

  const handleEditPizza = (pizza: Pizza) => {
    setEditingPizzaId(pizza._id)
    setForm({
      name: pizza.name,
      description: pizza.description,
      price: String(pizza.price),
      ingredients: pizza.ingredients.join(', '),
      available: pizza.available ?? true,
    })
  }

  const handleDeletePizza = async (pizzaId: string) => {
    setAdminMessage(null)
    setDeletingPizzaId(pizzaId)

    try {
      await deletePizza(pizzaId)
      setAdminMessage('Pizza removida com sucesso.')
      await loadPizzas()
    } catch (err) {
      console.error(err)
      setAdminMessage('Não foi possível remover a pizza. Verifique a API e tente novamente.')
    } finally {
      setDeletingPizzaId(null)
    }
  }

  if (loading) {
    return (
      <main className="container-app py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Carregando pizzas...</div>
      </main>
    )
  }

  return (
    <main className="container-app py-8">
      <section className="rounded-4xl bg-linear-to-r from-slate-950 via-teal-700 to-cyan-600 p-8 text-white shadow-[0_30px_80px_-40px_rgba(8,47,73,0.85)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/80">Admin</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Pizzas</h1>
            <p className="mt-3 max-w-2xl text-cyan-50/90">Cadastre, edite e remova sabores em uma tela específica.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/admin" className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">Voltar ao painel</Link>
            <Link to="/admin/orders" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-slate-100">Gerenciar pedidos</Link>
          </div>
        </div>
      </section>

      {adminMessage && (
        <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {adminMessage}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr] items-start">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Cadastro</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Formulário de sabor</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{editingPizzaId ? 'Editando' : 'Novo'}</span>
          </div>

          <form onSubmit={handlePizzaSubmit} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Nome</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  placeholder="Ex: Marguerita"
                  className="w-full"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Preço</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  required
                  placeholder="Ex: 49.90"
                  className="w-full"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Descrição</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
                placeholder="Conte o sabor e diferencial da pizza"
                className="w-full"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Ingredientes</span>
              <textarea
                rows={2}
                value={form.ingredients}
                onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
                required
                placeholder="Separe por vírgulas"
                className="w-full"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) => setForm((current) => ({ ...current, available: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Pizza disponível para venda
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingPizza}
                className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                {savingPizza ? 'Salvando...' : editingPizzaId ? 'Atualizar pizza' : 'Cadastrar pizza'}
              </button>
              {editingPizzaId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </article>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Menu</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sabores cadastrados</h2>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">{pizzas.length} sabores</span>
          </div>

          <div className="mt-5 space-y-3">
            {pizzas.map((pizza) => (
              <article key={pizza._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{pizza.name}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${pizza.available === false ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {pizza.available === false ? 'Indisponível' : 'Disponível'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{pizza.description}</p>
                    <p className="mt-2 text-sm text-slate-600">Ingredientes: {pizza.ingredients.join(', ')}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-slate-900">R$ {pizza.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditPizza(pizza)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeletePizza(pizza._id)}
                    disabled={deletingPizzaId === pizza._id}
                    className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingPizzaId === pizza._id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default AdminPizzas
