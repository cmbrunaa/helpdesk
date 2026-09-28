<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketCommentRequest;
use App\Http\Resources\TicketCommentResource;
use App\Models\Ticket;
use App\Models\TicketComment;
use OpenApi\Attributes as OA;

class TicketCommentController extends Controller
{
    #[OA\Get(
        path: '/api/tickets/{ticket}/comments',
        operationId: 'listTicketComments',
        summary: 'Listar comentários do chamado',
        description: 'Retorna os comentários de um chamado que o usuário possui permissão para visualizar.',
        tags: ['Tickets'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'ticket',
                description: 'ID do chamado',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de comentários'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão para visualizar o chamado'),
            new OA\Response(response: 404, description: 'Chamado não encontrado')
        ]
    )]
    public function index(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        return TicketCommentResource::collection(
            $ticket->comments()
                ->with('user:id,name')
                ->latest()
                ->get()
        );
    }

    #[OA\Post(
        path: '/api/tickets/{ticket}/comments',
        operationId: 'createTicketComment',
        summary: 'Adicionar comentário ao chamado',
        description: 'Adiciona um comentário ao chamado caso o usuário possua permissão.',
        tags: ['Tickets'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'ticket',
                description: 'ID do chamado',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['message'],
                properties: [
                    new OA\Property(
                        property: 'message',
                        type: 'string',
                        example: 'Vou verificar a fonte de alimentação.'
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Comentário criado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão para comentar'),
            new OA\Response(response: 422, description: 'Dados inválidos')
        ]
    )]
    public function store(
        StoreTicketCommentRequest $request,
        Ticket $ticket
    ) {
        $this->authorize('comment', $ticket);

        $validated = $request->validated();

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
        ]);

        $comment->load('user:id,name');

        return (new TicketCommentResource($comment))
            ->response()
            ->setStatusCode(201);
    }
}
