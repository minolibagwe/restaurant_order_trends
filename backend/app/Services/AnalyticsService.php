<?php

namespace App\Services;

use DateInterval;
use DatePeriod;
use DateTimeImmutable;

class AnalyticsService
{
    public function __construct(private readonly DataRepository $repository) {}

    /**
     * @param string|null $q
     * @param array<string, string> $filters
     * @param array<string, string> $sort [field=>"asc"|"desc"]
     * @param int $page
     * @param int $pageSize
     * @return array{data: array<int, array<string,mixed>>, total: int}
     */
    public function getRestaurantsList(?string $q, array $filters, array $sort, int $page, int $pageSize): array
    {
        $restaurants = $this->repository->getRestaurants();

        // Search
        if ($q !== null && $q !== '') {
            $qLower = mb_strtolower($q);
            $restaurants = array_values(array_filter($restaurants, function ($r) use ($qLower) {
                return str_contains(mb_strtolower($r['name'] ?? ''), $qLower)
                    || str_contains(mb_strtolower($r['location'] ?? ''), $qLower)
                    || str_contains(mb_strtolower($r['cuisine'] ?? ''), $qLower);
            }));
        }

        // Filters (location, cuisine)
        if (!empty($filters['location'])) {
            $loc = mb_strtolower($filters['location']);
            $restaurants = array_values(array_filter($restaurants, fn ($r) => mb_strtolower($r['location'] ?? '') === $loc));
        }
        if (!empty($filters['cuisine'])) {
            $c = mb_strtolower($filters['cuisine']);
            $restaurants = array_values(array_filter($restaurants, fn ($r) => mb_strtolower($r['cuisine'] ?? '') === $c));
        }

        // Sort
        if (!empty($sort)) {
            foreach ($sort as $field => $direction) {
                usort($restaurants, function ($a, $b) use ($field, $direction) {
                    $av = $a[$field] ?? null;
                    $bv = $b[$field] ?? null;
                    if ($av == $bv) return 0;
                    $cmp = $av <=> $bv;
                    return ($direction === 'desc') ? -$cmp : $cmp;
                });
            }
        }

        $total = count($restaurants);
        $offset = max(0, ($page - 1) * $pageSize);
        $paged = array_slice($restaurants, $offset, $pageSize);

        return [
            'data' => array_values($paged),
            'total' => $total,
        ];
    }

    /**
     * @param int $restaurantId
     * @param string $start ISO date (YYYY-MM-DD)
     * @param string $end ISO date (YYYY-MM-DD)
     * @param array{amountMin?:int, amountMax?:int, hourMin?:int, hourMax?:int} $filters
     * @return array<string, array<int, array<string, mixed>>|array<int, array<string, mixed>>> metrics by day
     */
    public function getRestaurantDailyMetrics(int $restaurantId, string $start, string $end, array $filters = []): array
    {
        $orders = array_values(array_filter($this->repository->getOrders(), function ($o) use ($restaurantId) {
            return (int)($o['restaurant_id'] ?? 0) === $restaurantId;
        }));

        [$startDate, $endDate] = [$this->toDate($start), $this->toDate($end)];
        $byDay = $this->groupOrdersByDay($orders, $filters, $startDate, $endDate);

        $daily = [];
        foreach ($byDay as $day => $dayOrders) {
            $count = count($dayOrders);
            $revenue = array_sum(array_map(fn ($o) => (int)$o['order_amount'], $dayOrders));
            $aov = $count > 0 ? round($revenue / $count, 2) : 0.0;
            $peakHour = $this->computePeakHour($dayOrders);
            $daily[] = [
                'date' => $day,
                'orders' => $count,
                'revenue' => $revenue,
                'aov' => $aov,
                'peak_hour' => $peakHour,
            ];
        }

        return [
            'daily' => $daily,
        ];
    }

    /**
     * @param string $start
     * @param string $end
     * @return array<int, array{restaurant_id:int, revenue:int}>
     */
    public function getTopRestaurantsByRevenue(string $start, string $end): array
    {
        [$startDate, $endDate] = [$this->toDate($start), $this->toDate($end)];
        $orders = $this->repository->getOrders();
        $revenueByRestaurant = [];
        foreach ($orders as $o) {
            $ot = new DateTimeImmutable($o['order_time']);
            if ($ot < $startDate || $ot > $endDate) continue;
            $rid = (int)$o['restaurant_id'];
            $revenueByRestaurant[$rid] = ($revenueByRestaurant[$rid] ?? 0) + (int)$o['order_amount'];
        }
        arsort($revenueByRestaurant);
        $top = [];
        foreach (array_slice($revenueByRestaurant, 0, 3, true) as $rid => $rev) {
            $top[] = [
                'restaurant_id' => $rid,
                'revenue' => $rev,
            ];
        }
        return $top;
    }

    /**
     * @param array<int, array<string,mixed>> $orders
     * @param array{amountMin?:int, amountMax?:int, hourMin?:int, hourMax?:int} $filters
     * @param DateTimeImmutable $startDate
     * @param DateTimeImmutable $endDate
     * @return array<string, array<int, array<string,mixed>>>
     */
    private function groupOrdersByDay(array $orders, array $filters, DateTimeImmutable $startDate, DateTimeImmutable $endDate): array
    {
        $amountMin = isset($filters['amountMin']) ? (int)$filters['amountMin'] : null;
        $amountMax = isset($filters['amountMax']) ? (int)$filters['amountMax'] : null;
        $hourMin = isset($filters['hourMin']) ? (int)$filters['hourMin'] : null;
        $hourMax = isset($filters['hourMax']) ? (int)$filters['hourMax'] : null;

        $byDay = [];

        foreach ($orders as $o) {
            $ot = new DateTimeImmutable($o['order_time']);
            if ($ot < $startDate || $ot > $endDate) continue;
            $amount = (int)$o['order_amount'];
            $hour = (int)$ot->format('G');

            if ($amountMin !== null && $amount < $amountMin) continue;
            if ($amountMax !== null && $amount > $amountMax) continue;
            if ($hourMin !== null && $hour < $hourMin) continue;
            if ($hourMax !== null && $hour > $hourMax) continue;

            $day = $ot->format('Y-m-d');
            $byDay[$day] = $byDay[$day] ?? [];
            $byDay[$day][] = $o;
        }

        // Ensure empty days are included
        $period = new DatePeriod($startDate, new DateInterval('P1D'), $endDate->add(new DateInterval('P1D')));
        foreach ($period as $date) {
            $key = $date->format('Y-m-d');
            if (!array_key_exists($key, $byDay)) {
                $byDay[$key] = [];
            }
        }

        ksort($byDay);
        return $byDay;
    }

    /**
     * @param array<int, array<string,mixed>> $orders
     */
    private function computePeakHour(array $orders): ?int
    {
        if (empty($orders)) return null;
        $histogram = [];
        foreach ($orders as $o) {
            $hour = (int)(new DateTimeImmutable($o['order_time']))->format('G');
            $histogram[$hour] = ($histogram[$hour] ?? 0) + 1;
        }
        arsort($histogram);
        $topHour = array_key_first($histogram);
        return $topHour === null ? null : (int)$topHour;
    }

    private function toDate(string $date): DateTimeImmutable
    {
        return new DateTimeImmutable($date . ' 00:00:00');
    }
}


