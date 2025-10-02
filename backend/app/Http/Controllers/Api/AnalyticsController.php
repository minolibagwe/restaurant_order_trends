<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function restaurants(Request $request)
    {
        $q = $request->query('q');
        $sortField = $request->query('sortField');
        $sortDir = $request->query('sortDir', 'asc');
        $page = (int)$request->query('page', 1);
        $pageSize = (int)$request->query('pageSize', 10);

        $filters = [
            'location' => $request->query('location'),
            'cuisine' => $request->query('cuisine'),
        ];
        $sort = [];
        if ($sortField) {
            $sort[$sortField] = $sortDir === 'desc' ? 'desc' : 'asc';
        }

        return response()->json($this->analytics->getRestaurantsList($q, $filters, $sort, $page, $pageSize));
    }

    public function restaurantDaily(int $restaurantId, Request $request)
    {
        $start = (string)$request->query('start');
        $end = (string)$request->query('end');
        $filters = [
            'amountMin' => $request->query('amountMin'),
            'amountMax' => $request->query('amountMax'),
            'hourMin' => $request->query('hourMin'),
            'hourMax' => $request->query('hourMax'),
        ];
        return response()->json($this->analytics->getRestaurantDailyMetrics($restaurantId, $start, $end, $filters));
    }

    public function topRestaurants(Request $request)
    {
        $start = (string)$request->query('start');
        $end = (string)$request->query('end');
        return response()->json($this->analytics->getTopRestaurantsByRevenue($start, $end));
    }
}


