import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export async function fetchRestaurants(params = {}) {
  const response = await api.get('/restaurants', { params })
  return response.data
}

export async function fetchRestaurantDaily(restaurantId, params = {}) {
  const response = await api.get(`/restaurants/${restaurantId}/daily`, { params })
  return response.data
}

export async function fetchTopRestaurants(params = {}) {
  const response = await api.get('/top-restaurants', { params })
  return response.data
}

export default api


