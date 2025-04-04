<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class FlaskApiService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('FLASK_API_URL', 'http://127.0.0.1:5000');
    }

    public function uploadTranscript(UploadedFile $file)
    {
        try {
            Log::info('Sending file to Flask API', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType()
            ]);

            $response = Http::timeout(30)
                ->withHeaders([
                    'Accept' => 'application/json'
                ])
                ->attach(
                    'transcript_file',
                    $file->get(),
                    $file->getClientOriginalName(),
                    ['Content-Type' => $file->getMimeType()]
                )
                ->post("{$this->baseUrl}/api/upload");

            Log::info('Flask API response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                Log::error('Flask API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return [
                    'success' => false,
                    'error' => 'Analysis service returned an error: ' . $response->status() . ' - ' . $response->body()
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Flask API Exception', [
                'message' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => 'Failed to communicate with analysis service: ' . $e->getMessage()
            ];
        }
    }

    public function healthCheck()
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Origin' => config('app.url')
                ])
                ->get("{$this->baseUrl}/api/health");

            if (!$response->successful()) {
                Log::error('Health Check Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return [
                    'status' => 'error',
                    'message' => 'Health check failed with status ' . $response->status()
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Health Check Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
} 