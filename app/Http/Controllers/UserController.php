<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/api/users/assignees',
        operationId: 'listTicketAssignees',
        summary: 'Listar usuários que podem receber chamados',
        description: 'Retorna administradores e atendentes disponíveis para atribuição de chamados.',
        tags: ['Users'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista de usuários'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
        ]
    )]
    public function assignees(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'atendente'], true)) {
            abort(403);
        }

        $users = User::query()
            ->whereIn('role', ['admin', 'atendente'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json([
            'data' => $users,
        ]);
    }

    #[OA\Patch(
        path: '/api/users/{user}/role',
        operationId: 'updateUserRole',
        summary: 'Alterar função de um usuário',
        description: 'Permite que um administrador altere a função de um usuário.',
        tags: ['Users'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'user',
                description: 'ID do usuário',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 3
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['role'],
                properties: [
                    new OA\Property(
                        property: 'role',
                        description: 'Nova função do usuário',
                        type: 'string',
                        enum: ['usuario', 'atendente', 'admin'],
                        example: 'atendente'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Função alterada com sucesso'
            ),
            new OA\Response(
                response: 401,
                description: 'Não autenticado'
            ),
            new OA\Response(
                response: 403,
                description: 'Apenas administradores podem alterar funções'
            ),
            new OA\Response(
                response: 404,
                description: 'Usuário não encontrado'
            ),
            new OA\Response(
                response: 422,
                description: 'Dados inválidos'
            ),
        ]
    )]
    public function updateRole(
        Request $request,
        User $user
    ): JsonResponse {
        $validated = $request->validate([
            'role' => [
                'required',
                'in:usuario,atendente,admin',
            ],
        ]);

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'message' => 'Função do usuário alterada com sucesso.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
