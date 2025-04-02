<?php

use Illuminate\Support\Facades\Route;

// Serve React app for all non-API routes
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '^(?!api).*$');
