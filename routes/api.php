<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketHistoryController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas públicas
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Rotas autenticadas
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Autenticação
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Categorias — somente administradores podem alterar
    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('role:admin');

    Route::patch('/categories/{category}', [CategoryController::class, 'update'])
        ->middleware('role:admin');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->middleware('role:admin');

    // Chamados
    Route::apiResource('tickets', TicketController::class)
        ->except(['destroy']);

    Route::patch(
        '/tickets/{ticket}/status',
        [TicketController::class, 'changeStatus']
    );

    Route::patch(
        '/tickets/{ticket}/assign',
        [TicketController::class, 'assign']
    );

    // Comentários
    Route::get(
        '/tickets/{ticket}/comments',
        [TicketCommentController::class, 'index']
    );

    Route::post(
        '/tickets/{ticket}/comments',
        [TicketCommentController::class, 'store']
    );

    // Histórico
    Route::get(
        '/tickets/{ticket}/history',
        [TicketHistoryController::class, 'index']
    );

    // Usuários
    Route::get(
        '/users/assignees',
        [UserController::class, 'assignees']
    );

    Route::patch(
        '/users/{user}/role',
        [UserController::class, 'updateRole']
    )->middleware('role:admin');
});
