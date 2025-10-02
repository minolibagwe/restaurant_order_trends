# Frontend – Restaurant Analytics Dashboard

Dev server:

```bash
cd /home/minoli/Desktop/myprj/my-prj-resturant/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

This frontend consumes the Laravel API. A dev proxy is configured in `vite.config.js` so requests to `/api` are forwarded to `http://127.0.0.1:8000`.

Features:
- Restaurants list with search, filters (location, cuisine), sort, pagination
- Restaurant detail charts: daily orders, revenue, average order value, peak order hour
- Top 3 restaurants by revenue for a selectable date range

API endpoints used:
- `GET /api/restaurants?q=&location=&cuisine=&sortField=&sortDir=&page=&pageSize=`
- `GET /api/restaurants/{id}/daily?start=&end=&amountMin=&amountMax=&hourMin=&hourMax=`
- `GET /api/top-restaurants?start=&end=`

Backend must be running:

```bash
cd /home/minoli/Desktop/myprj/my-prj-resturant/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve --host=127.0.0.1 --port=8000
```
