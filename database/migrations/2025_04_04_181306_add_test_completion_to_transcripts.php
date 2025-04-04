<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transcripts', function (Blueprint $table) {
            $table->boolean('test_completed')->default(false);
            $table->integer('test_score')->nullable();
            $table->json('test_answers')->nullable();
            $table->timestamp('completed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transcripts', function (Blueprint $table) {
            $table->dropColumn('test_completed');
            $table->dropColumn('test_score');
            $table->dropColumn('test_answers');
            $table->dropColumn('completed_at');
        });
    }
};
