import { useState } from 'react'
import './App.css'
import RestaurantList from './components/RestaurantList'
import RestaurantDetail from './components/RestaurantDetail'
import TopRestaurants from './components/TopRestaurants'

function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Restaurant Analytics Dashboard</h1>
      {!selected && (
        <>
          <TopRestaurants />
          <RestaurantList onSelect={setSelected} />
        </>
      )}
      {selected && (
        <RestaurantDetail restaurant={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  )
}

export default App
