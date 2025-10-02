import { useEffect, useState } from 'react'
import { fetchTopRestaurants } from '../api/client'
import dayjs from 'dayjs'

export default function TopRestaurants() {
  const [start, setStart] = useState(dayjs('2025-06-22').format('YYYY-MM-DD'))
  const [end, setEnd] = useState(dayjs('2025-06-28').format('YYYY-MM-DD'))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTopRestaurants({ start, end })
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError('Failed to load top restaurants')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [start, end])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Top 3 Restaurants by Revenue</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          Start
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          End
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ol>
        {items.map((it) => (
          <li key={it.restaurant_id} style={{ marginBottom: 8 }}>
            <strong>Restaurant #{it.restaurant_id}</strong> — Revenue: {it.revenue}
          </li>
        ))}
      </ol>
    </div>
  )
}


