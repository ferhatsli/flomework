<?php

namespace App\Http\Controllers;

use App\Models\Transcript;
use App\Services\FlaskApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscriptController extends Controller
{
    protected $flaskApiService;

    public function __construct(FlaskApiService $flaskApiService)
    {
        $this->flaskApiService = $flaskApiService;
    }

    public function upload(Request $request)
    {
        try {
            Log::info('Starting transcript upload process');
            
            if (!$request->hasFile('transcript_file')) {
                Log::error('No file was uploaded');
                return response()->json([
                    'error' => 'No file was uploaded'
                ], 400);
            }

            $request->validate([
                'transcript_file' => 'required|file|mimes:txt,pdf,doc,docx|max:10240'
            ]);

            $file = $request->file('transcript_file');
            Log::info('File received', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType()
            ]);

            // Ensure storage directory exists
            Storage::disk('public')->makeDirectory('transcripts');
            
            $path = $file->store('transcripts', 'public');
            Log::info('File stored successfully', ['path' => $path]);

            // Create transcript record
            $transcript = Transcript::create([
                'filename' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension()
            ]);
            Log::info('Transcript record created', ['id' => $transcript->id]);

            // Send to Flask API for analysis
            $analysisResult = $this->flaskApiService->uploadTranscript($file);
            Log::info('Flask API response received', ['result' => $analysisResult]);

            if (!empty($analysisResult['error'])) {
                Log::error('Flask API returned error', ['error' => $analysisResult['error']]);
                return response()->json([
                    'error' => $analysisResult['error']
                ], 400);
            }

            // Extract analysis from markdown code block if present
            $analysis = null;
            if (!empty($analysisResult['data']['analysis'])) {
                $matches = [];
                if (preg_match('/```json\s*(.*?)\s*```/s', $analysisResult['data']['analysis'], $matches)) {
                    $analysis = $matches[1];
                } else {
                    $analysis = $analysisResult['data']['analysis'];
                }
            }

            // Update transcript with analysis results
            $transcript->update([
                'analysis_result' => $analysis,
                'tests' => $analysisResult['data']['tests'] ?? null
            ]);

            return response()->json([
                'success' => true,
                'transcript_id' => $transcript->id,
                'message' => 'Transcript uploaded and analyzed successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json([
                'error' => 'Invalid file: ' . implode(', ', array_map(function($arr) { 
                    return implode(', ', $arr); 
                }, $e->errors()))
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to process transcript', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to process transcript: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAnalysis($id)
    {
        try {
            $transcript = Transcript::findOrFail($id);
            
            // Parse the analysis_result JSON string
            $analysisResult = null;
            if ($transcript->analysis_result) {
                try {
                    $analysisResult = json_decode($transcript->analysis_result, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('Failed to parse analysis result JSON', [
                            'error' => json_last_error_msg(),
                            'analysis_result' => $transcript->analysis_result
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to parse analysis result', [
                        'error' => $e->getMessage(),
                        'analysis_result' => $transcript->analysis_result
                    ]);
                }
            }

            // Parse the tests JSON
            $tests = null;
            if ($transcript->tests) {
                try {
                    $tests = is_string($transcript->tests) ? json_decode($transcript->tests, true) : $transcript->tests;
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('Failed to parse tests JSON', [
                            'error' => json_last_error_msg(),
                            'tests' => $transcript->tests
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to parse tests', [
                        'error' => $e->getMessage(),
                        'tests' => $transcript->tests
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $transcript->id,
                    'filename' => $transcript->filename,
                    'file_path' => $transcript->file_path,
                    'file_type' => $transcript->file_type,
                    'analysis_result' => $analysisResult,
                    'tests' => $tests,
                    'created_at' => $transcript->created_at,
                    'updated_at' => $transcript->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get analysis', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to get analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function healthCheck()
    {
        try {
            $status = $this->flaskApiService->healthCheck();
            return response()->json($status);
        } catch (\Exception $e) {
            Log::error('Health check failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
