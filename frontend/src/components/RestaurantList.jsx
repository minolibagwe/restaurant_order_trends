import { useEffect, useMemo, useState } from 'react'
import { fetchRestaurants } from '../api/client'

export default function RestaurantList({ onSelect }) {
  const [restaurants, setRestaurants] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchRestaurants({ q, location, cuisine, sortField, sortDir, page, pageSize })
        if (!cancelled) {
          setRestaurants(data.data || [])
          setTotal(data.total || 0)
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load restaurants')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [q, location, cuisine, sortField, sortDir, page, pageSize])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Restaurants</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input placeholder="Cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
        <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="name">Name</option>
          <option value="location">Location</option>
          <option value="cuisine">Cuisine</option>
        </select>
        <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Location</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 4px' }}>Cuisine</th>
            <th style={{ borderBottom: '1px solid #eee' }}></th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f3f3f3' }}>{r.name}</td>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f3f3f3' }}>{r.location}</td>
              <td style={{ padding: '8px 4px', borderBottom: '1px solid #f3f3f3' }}>{r.cuisine}</td>
              <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid #f3f3f3' }}>
                <button onClick={() => onSelect?.(r)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  )
}


