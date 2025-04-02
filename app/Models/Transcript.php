<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transcript extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'file_path',
        'file_type',
        'analysis_result',
        'tests'
    ];

    protected $casts = [
        'analysis_result' => 'array',
        'tests' => 'array'
    ];
}
