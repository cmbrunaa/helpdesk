<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CategoryController extends Controller
{
    #[OA\Get(
        path: '/api/categories',
        operationId: 'listCategories',
        summary: 'Listar categorias',
        description: 'Retorna todas as categorias ativas.',
        tags: ['Categories'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de categorias'
            )
        ]
    )]
    public function index()
    {
        return CategoryResource::collection(
            Category::where('active', true)->get()
        );
    }

    #[OA\Post(
        path: '/api/categories',
        operationId: 'createCategory',
        summary: 'Criar categoria',
        description: 'Cria uma nova categoria. Requer perfil de administrador.',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'Hardware'
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Categoria criada com sucesso'
            ),
            new OA\Response(
                response: 401,
                description: 'Não autenticado'
            ),
            new OA\Response(
                response: 403,
                description: 'Apenas administradores podem gerenciar categorias'
            ),
            new OA\Response(
                response: 422,
                description: 'Dados inválidos'
            )
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create($validated);

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    #[OA\Get(
        path: '/api/categories/{category}',
        operationId: 'showCategory',
        summary: 'Buscar categoria',
        description: 'Retorna uma categoria específica.',
        tags: ['Categories'],
        parameters: [
            new OA\Parameter(
                name: 'category',
                description: 'ID da categoria',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Categoria encontrada'
            ),
            new OA\Response(
                response: 404,
                description: 'Categoria não encontrada'
            )
        ]
    )]
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    #[OA\Patch(
        path: '/api/categories/{category}',
        operationId: 'updateCategory',
        summary: 'Atualizar categoria',
        description: 'Atualiza o nome ou status de uma categoria. Requer perfil de administrador.',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'category',
                description: 'ID da categoria',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'Software'
                    ),
                    new OA\Property(
                        property: 'active',
                        type: 'boolean',
                        example: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Categoria atualizada'
            ),
            new OA\Response(
                response: 401,
                description: 'Não autenticado'
            ),
            new OA\Response(
                response: 403,
                description: 'Apenas administradores podem gerenciar categorias'
            ),
            new OA\Response(
                response: 404,
                description: 'Categoria não encontrada'
            ),
            new OA\Response(
                response: 422,
                description: 'Dados inválidos'
            )
        ]
    )]
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'active' => 'sometimes|boolean',
        ]);

        $category->update($validated);

        return new CategoryResource(
            $category->fresh()
        );
    }

    #[OA\Delete(
        path: '/api/categories/{category}',
        operationId: 'deleteCategory',
        summary: 'Desativar categoria',
        description: 'Desativa uma categoria sem removê-la do banco de dados. Requer perfil de administrador.',
        tags: ['Categories'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'category',
                description: 'ID da categoria',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Categoria desativada com sucesso'
            ),
            new OA\Response(
                response: 401,
                description: 'Não autenticado'
            ),
            new OA\Response(
                response: 403,
                description: 'Apenas administradores podem gerenciar categorias'
            ),
            new OA\Response(
                response: 404,
                description: 'Categoria não encontrada'
            )
        ]
    )]
    public function destroy(Category $category)
    {
        $category->update([
            'active' => false,
        ]);

        return response()->json([
            'message' => 'Categoria desativada com sucesso.',
        ]);
    }
}
