<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class DataRepository
{
    private const RESTAURANTS_FILE_RELATIVE_PATH = 'data/restaurants.json';
    private const ORDERS_FILE_RELATIVE_PATH = 'data/orders.json';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getRestaurants(): array
    {
        return Cache::remember('data_repository:restaurants', 300, function () {
            $absolutePath = storage_path('app/' . self::RESTAURANTS_FILE_RELATIVE_PATH);
            if (!file_exists($absolutePath)) {
                return [];
            }
            $json = file_get_contents($absolutePath) ?: '[]';
            $decoded = json_decode($json, true);
            return is_array($decoded) ? $decoded : [];
        });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getOrders(): array
    {
        return Cache::remember('data_repository:orders', 300, function () {
            $absolutePath = storage_path('app/' . self::ORDERS_FILE_RELATIVE_PATH);
            if (!file_exists($absolutePath)) {
                return [];
            }
            $json = file_get_contents($absolutePath) ?: '[]';
            $decoded = json_decode($json, true);
            return is_array($decoded) ? $decoded : [];
        });
    }
}


