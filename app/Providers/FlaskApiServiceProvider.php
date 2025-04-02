<?php

namespace App\Providers;

use App\Services\FlaskApiService;
use Illuminate\Support\ServiceProvider;

class FlaskApiServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(FlaskApiService::class, function ($app) {
            return new FlaskApiService();
        });
    }
} 