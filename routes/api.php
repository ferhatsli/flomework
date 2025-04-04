<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TranscriptController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/transcripts', [TranscriptController::class, 'index']);

Route::prefix('transcript')->group(function () {
    Route::post('/upload', [TranscriptController::class, 'upload']);
    Route::get('/{id}', [TranscriptController::class, 'getAnalysis']);
    Route::post('/{id}/generate-tests', [TranscriptController::class, 'generateTests']);
});

Route::get('/health', [TranscriptController::class, 'healthCheck']); 