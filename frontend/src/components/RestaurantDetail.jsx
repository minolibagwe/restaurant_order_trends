import { useEffect, useMemo, useState } from 'react'
import { fetchRestaurantDaily } from '../api/client'
import dayjs from 'dayjs'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts'

export default function RestaurantDetail({ restaurant, onBack }) {
  const [start, setStart] = useState(dayjs('2025-06-22').format('YYYY-MM-DD'))
  const [end, setEnd] = useState(dayjs('2025-06-28').format('YYYY-MM-DD'))
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [hourMin, setHourMin] = useState('')
  const [hourMax, setHourMax] = useState('')

  const [daily, setDaily] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!restaurant) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchRestaurantDaily(restaurant.id, {
          start,
          end,
          amountMin: amountMin || undefined,
          amountMax: amountMax || undefined,
          hourMin: hourMin || undefined,
          hourMax: hourMax || undefined,
        })
        if (!cancelled) setDaily(data.daily || [])
      } catch (e) {
        if (!cancelled) setError('Failed to load metrics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [restaurant, start, end, amountMin, amountMax, hourMin, hourMax])

  const ordersSeries = useMemo(() => daily.map(d => ({ date: d.date, value: d.orders })), [daily])
  const revenueSeries = useMemo(() => daily.map(d => ({ date: d.date, value: d.revenue })), [daily])
  const aovSeries = useMemo(() => daily.map(d => ({ date: d.date, value: d.aov })), [daily])
  const peakSeries = useMemo(() => daily.map(d => ({ date: d.date, value: d.peak_hour ?? null })), [daily])

  if (!restaurant) return null

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>{restaurant.name} · Details</h2>
        <button onClick={onBack}>Back</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          Start
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          End
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <input placeholder="Amount Min" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} />
        <input placeholder="Amount Max" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} />
        <input placeholder="Hour Min (0-23)" value={hourMin} onChange={(e) => setHourMin(e.target.value)} />
        <input placeholder="Hour Max (0-23)" value={hourMax} onChange={(e) => setHourMax(e.target.value)} />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ChartBlock title="Daily Orders">
        <LineSeries data={ordersSeries} color="#3b82f6" />
      </ChartBlock>
      <ChartBlock title="Daily Revenue">
        <LineSeries data={revenueSeries} color="#10b981" />
      </ChartBlock>
      <ChartBlock title="Average Order Value">
        <LineSeries data={aovSeries} color="#a855f7" />
      </ChartBlock>
      <ChartBlock title="Peak Order Hour">
        <BarSeries data={peakSeries} color="#f59e0b" />
      </ChartBlock>
    </div>
  )
}

function ChartBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ margin: '8px 0' }}>{title}</h3>
      <div style={{ width: '100%', height: 260, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 }}>
        {children}
      </div>
    </div>
  )
}

function LineSeries({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid stroke="#efefef" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarSeries({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid stroke="#efefef" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  )
}


