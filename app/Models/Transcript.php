<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transcript extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'filename',
        'file_path',
        'file_type',
        'analysis_result',
        'tests',
        'test_completed',
        'test_score',
        'test_answers',
        'completed_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'analysis_result' => 'array',
        'tests' => 'array',
        'test_answers' => 'array',
        'test_completed' => 'boolean',
        'test_score' => 'integer',
        'completed_at' => 'datetime'
    ];
}
