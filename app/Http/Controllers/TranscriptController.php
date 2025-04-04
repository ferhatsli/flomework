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

    protected function extractCsvCell($file)
    {
        if ($file->getClientOriginalExtension() !== 'csv') {
            Log::info('File is not CSV, skipping cell extraction', [
                'extension' => $file->getClientOriginalExtension()
            ]);
            return $file;
        }

        try {
            Log::info('Starting CSV transcript extraction', [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);

            // Verify file exists and is readable
            if (!file_exists($file->getRealPath())) {
                throw new \Exception('CSV file does not exist at path: ' . $file->getRealPath());
            }

            if (!is_readable($file->getRealPath())) {
                throw new \Exception('CSV file is not readable at path: ' . $file->getRealPath());
            }

            // Set CSV reading options
            setlocale(LC_ALL, 'en_US.UTF-8');
            ini_set('auto_detect_line_endings', true);
            
            // Read the entire file content first
            $content = file_get_contents($file->getRealPath());
            $content = $this->removeBOM($content); // Remove BOM if present
            
            // Create a temporary file handle with proper encoding
            $handle = fopen('php://memory', 'r+');
            fwrite($handle, $content);
            rewind($handle);

            // Read header row to get column indices
            $headers = fgetcsv($handle);
            if (!$headers) {
                throw new \Exception('Could not read CSV headers');
            }

            Log::info('CSV Headers found', ['headers' => $headers]);

            // Find indices of transcript columns
            $gladiaIndex = array_search('gladia_response', $headers);
            $openaiIndex = array_search('openai_response', $headers);
            $zoomIndex = array_search('zoom_transcription', $headers);

            Log::info('Column indices', [
                'gladia_index' => $gladiaIndex,
                'openai_index' => $openaiIndex,
                'zoom_index' => $zoomIndex
            ]);

            if ($gladiaIndex === false && $openaiIndex === false && $zoomIndex === false) {
                throw new \Exception('Could not find any transcript columns in CSV');
            }

            $transcriptText = '';
            $rowCount = 0;
            $conversationData = [];

            // Read all rows to find non-NULL data
            while (($row = fgetcsv($handle)) !== false) {
                $rowCount++;

                // Try to extract transcript from gladia_response
                if ($gladiaIndex !== false && !empty($row[$gladiaIndex]) && $row[$gladiaIndex] !== 'NULL') {
                    $gladiaData = json_decode($row[$gladiaIndex], true);
                    if ($gladiaData && is_array($gladiaData)) {
                        foreach ($gladiaData as $utterance) {
                            if (isset($utterance['transcription']) && isset($utterance['time_begin'])) {
                                $conversationData[] = [
                                    'time' => $utterance['time_begin'],
                                    'speaker' => isset($utterance['speaker']) ? "Speaker " . $utterance['speaker'] : "Speaker",
                                    'text' => $utterance['transcription']
                                ];
                            }
                        }
                    }
                }

                // Try to extract transcript from zoom_transcription
                if ($zoomIndex !== false && !empty($row[$zoomIndex]) && $row[$zoomIndex] !== '""') {
                    $zoomText = trim($row[$zoomIndex], '"');
                    if (!empty($zoomText)) {
                        $zoomData = json_decode($zoomText, true);
                        if ($zoomData) {
                            if (isset($zoomData['transcript'])) {
                                $conversationData[] = [
                                    'time' => 0,
                                    'speaker' => "Speaker",
                                    'text' => $zoomData['transcript']
                                ];
                            } elseif (is_array($zoomData)) {
                                foreach ($zoomData as $utterance) {
                                    if (isset($utterance['text'])) {
                                        $conversationData[] = [
                                            'time' => isset($utterance['timestamp']) ? strtotime($utterance['timestamp']) : 0,
                                            'speaker' => isset($utterance['speaker']) ? $utterance['speaker'] : "Speaker",
                                            'text' => $utterance['text']
                                        ];
                                    }
                                }
                            }
                        } else {
                            // If not JSON, try using raw text
                            $conversationData[] = [
                                'time' => 0,
                                'speaker' => "Speaker",
                                'text' => $zoomText
                            ];
                        }
                    }
                }
            }

            fclose($handle);

            // Sort conversation data by timestamp
            usort($conversationData, function($a, $b) {
                return $a['time'] <=> $b['time'];
            });

            // Format conversation into text
            foreach ($conversationData as $utterance) {
                $transcriptText .= $utterance['speaker'] . ": " . $utterance['text'] . "\n\n";
            }

            if (empty($transcriptText)) {
                Log::warning('No transcript text found in any column', [
                    'file_name' => $file->getClientOriginalName(),
                    'rows_processed' => $rowCount
                ]);
                return $file;
            }

            // Create a temporary file with the transcript text
            $tempPath = tempnam(sys_get_temp_dir(), 'transcript_');
            file_put_contents($tempPath, $transcriptText);

            // Create a new UploadedFile instance
            $newFile = new \Illuminate\Http\UploadedFile(
                $tempPath,
                pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.txt',
                'text/plain',
                null,
                true
            );

            Log::info('Successfully extracted transcript text', [
                'original_file' => $file->getClientOriginalName(),
                'new_file' => $newFile->getClientOriginalName(),
                'text_length' => strlen($transcriptText),
                'rows_processed' => $rowCount
            ]);

            return $newFile;

        } catch (\Exception $e) {
            Log::error('Failed to extract transcript text', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $file;
        }
    }

    protected function detectDelimiter($line) {
        $delimiters = [',', ';', "\t", '|'];
        $counts = [];
        
        foreach ($delimiters as $delimiter) {
            try {
                $count = count(str_getcsv($line, $delimiter));
                $counts[$delimiter] = $count;
                
                Log::info('Tried delimiter', [
                    'delimiter' => $delimiter === "\t" ? 'TAB' : $delimiter,
                    'resulting_columns' => $count
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to parse with delimiter', [
                    'delimiter' => $delimiter === "\t" ? 'TAB' : $delimiter,
                    'error' => $e->getMessage()
                ]);
                $counts[$delimiter] = 0;
            }
        }
        
        $maxCount = max($counts);
        $bestDelimiter = array_search($maxCount, $counts);
        
        Log::info('Selected best delimiter', [
            'delimiter' => $bestDelimiter === "\t" ? 'TAB' : $bestDelimiter,
            'column_count' => $maxCount,
            'all_counts' => array_map(function($delimiter, $count) {
                return ($delimiter === "\t" ? 'TAB' : $delimiter) . ': ' . $count;
            }, array_keys($counts), $counts)
        ]);
        
        return $bestDelimiter;
    }

    protected function removeBOM($text) {
        $bom = pack('H*','EFBBBF');
        return preg_replace("/^$bom/", '', $text);
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
                'transcript_file' => 'required|file|mimes:txt,csv,pdf,doc,docx|max:30720'
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

            // Extract specific cell if it's a CSV file
            $processedFile = $this->extractCsvCell($file);
            
            try {
                // Send to Flask API for analysis
                $analysisResult = $this->flaskApiService->uploadTranscript($processedFile);
                Log::info('Flask API response received', ['result' => $analysisResult]);

                // Clean up temporary file if it was created
                if ($processedFile !== $file && file_exists($processedFile->getPathname())) {
                    unlink($processedFile->getPathname());
                }

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
                        // If no JSON code block found, try to parse as JSON directly
                        $analysis = $analysisResult['data']['analysis'];
                    }
                    
                    // Validate JSON structure
                    $decodedAnalysis = json_decode($analysis, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('Invalid analysis JSON structure', [
                            'error' => json_last_error_msg(),
                            'analysis' => $analysis
                        ]);
                        $analysis = json_encode([
                            'error' => 'Invalid analysis format',
                            'raw_response' => $analysis
                        ]);
                    }
                } else {
                    Log::warning('No analysis data in response', [
                        'response' => $analysisResult
                    ]);
                    $analysis = json_encode([
                        'error' => 'No analysis data available'
                    ]);
                }

                // Update transcript with analysis results
                $transcript->update([
                    'analysis_result' => $analysis,
                    'tests' => $analysisResult['data']['tests'] ?? null
                ]);

                Log::info('Transcript updated with analysis', [
                    'transcript_id' => $transcript->id,
                    'has_analysis' => !empty($analysis),
                    'has_tests' => !empty($analysisResult['data']['tests'])
                ]);

                return response()->json([
                    'success' => true,
                    'transcript_id' => $transcript->id,
                    'message' => 'Transcript uploaded and analyzed successfully'
                ]);
            } finally {
                // Ensure temporary file is cleaned up even if an error occurs
                if ($processedFile !== $file && file_exists($processedFile->getPathname())) {
                    unlink($processedFile->getPathname());
                }
            }

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

    public function index()
    {
        try {
            $transcripts = Transcript::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $transcripts
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get transcripts', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to get transcripts: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $transcript = Transcript::findOrFail($id);
            
            // Delete the file from storage
            if (Storage::disk('public')->exists($transcript->file_path)) {
                Storage::disk('public')->delete($transcript->file_path);
            }
            
            // Delete the database record
            $transcript->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Transcript deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete transcript', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to delete transcript: ' . $e->getMessage()
            ], 500);
        }
    }
}
