<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleLargeUploads
{
    public function handle(Request $request, Closure $next): Response
    {
        $contentLength = $request->header('Content-Length');
        
        if ($contentLength > 30 * 1024 * 1024) { // 30MB in bytes
            return response()->json([
                'error' => 'File size exceeds the maximum limit of 30MB'
            ], 413);
        }

        return $next($request);
    }
} 