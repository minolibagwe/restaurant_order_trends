<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/restaurants', [AnalyticsController::class, 'restaurants']);
Route::get('/restaurants/{restaurantId}/daily', [AnalyticsController::class, 'restaurantDaily']);
Route::get('/top-restaurants', [AnalyticsController::class, 'topRestaurants']);
