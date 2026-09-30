<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\ChangeTicketStatusRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\TicketIndexRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use OpenApi\Attributes as OA;

class TicketController extends Controller
{
    public function __construct(
        private TicketService $ticketService
    ) {
    }

    #[OA\Get(
        path: '/api/tickets',
        operationId: 'listTickets',
        summary: 'Listar chamados',
        description: 'Retorna os chamados de acordo com o perfil do usuário autenticado.',
        tags: ['Tickets'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'status',
                description: 'Filtrar chamados por status',
                in: 'query',
                required: false,
                schema: new OA\Schema(
                    type: 'string',
                    enum: [
                        'aberto',
                        'em_atendimento',
                        'aguardando',
                        'resolvido',
                        'fechado',
                    ]
                ),
                example: 'aberto'
            ),
            new OA\Parameter(
                name: 'priority',
                description: 'Filtrar chamados por prioridade',
                in: 'query',
                required: false,
                schema: new OA\Schema(
                    type: 'string',
                    enum: [
                        'baixa',
                        'media',
                        'alta',
                    ]
                ),
                example: 'alta'
            ),
            new OA\Parameter(
                name: 'category_id',
                description: 'Filtrar chamados por categoria',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de chamados'
            ),
            new OA\Response(
                response: 401,
                description: 'Não autenticado'
            ),
            new OA\Response(
                response: 422,
                description: 'Dados inválidos'
            ),
        ],
    )]
    public function index(TicketIndexRequest $request)
    {
        $user = $request->user();

        $query = Ticket::query()
            ->with([
                'category',
                'assignedTo:id,name',
            ])
            ->latest();

        /*
         * Usuários comuns visualizam apenas
         * os chamados que eles próprios criaram.
         */
        if ($user->role === 'usuario') {
            $query->where('user_id', $user->id);
        }

        /*
         * Atendentes visualizam:
         *
         * - chamados sem responsável;
         * - chamados atribuídos a eles.
         *
         * Chamados atribuídos a outros atendentes
         * continuam ocultos.
         */
        if ($user->role === 'atendente') {
            $query->where(function ($query) use ($user) {
                $query
                    ->whereNull('assigned_to')
                    ->orWhere('assigned_to', $user->id);
            });
        }

        /*
         * Administradores não recebem filtro de usuário,
         * portanto conseguem visualizar todos os chamados.
         */

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $tickets = $query->paginate(10);

        return response()->json($tickets);
    }

    #[OA\Post(
        path: '/api/tickets',
        operationId: 'createTicket',
        summary: 'Criar chamado',
        description: 'Cria um novo chamado para o usuário autenticado.',
        tags: ['Tickets'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['category_id', 'title', 'description', 'priority'],
                properties: [
                    new OA\Property(
                        property: 'category_id',
                        type: 'integer',
                        example: 1
                    ),
                    new OA\Property(
                        property: 'title',
                        type: 'string',
                        example: 'Computador não liga'
                    ),
                    new OA\Property(
                        property: 'description',
                        type: 'string',
                        example: 'O computador não apresenta nenhum sinal.'
                    ),
                    new OA\Property(
                        property: 'priority',
                        type: 'string',
                        example: 'media'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Chamado criado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 422, description: 'Dados inválidos'),
        ]
    )]
    public function store(StoreTicketRequest $request)
    {
        $ticket = $this->ticketService->create(
            $request->validated(),
            $request->user()
        );

        return (new TicketResource(
            $ticket->load([
                'category',
                'assignedTo:id,name',
            ])
        ))->response()->setStatusCode(201);
    }

    #[OA\Get(
        path: '/api/tickets/{ticket}',
        operationId: 'showTicket',
        summary: 'Buscar chamado',
        description: 'Retorna um chamado específico.',
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
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Chamado encontrado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
            new OA\Response(response: 404, description: 'Chamado não encontrado'),
        ]
    )]
    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'category',
            'assignedTo:id,name',
            'user:id,name',
        ]);

        return new TicketResource($ticket);
    }

    #[OA\Patch(
        path: '/api/tickets/{ticket}',
        operationId: 'updateTicket',
        summary: 'Atualizar chamado',
        description: 'Atualiza os dados básicos de um chamado.',
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
            ),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'title',
                        type: 'string',
                        example: 'Computador não liga'
                    ),
                    new OA\Property(
                        property: 'description',
                        type: 'string',
                        example: 'Descrição atualizada.'
                    ),
                    new OA\Property(
                        property: 'priority',
                        type: 'string',
                        example: 'alta'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Chamado atualizado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
            new OA\Response(response: 422, description: 'Dados inválidos'),
        ]
    )]
    public function update(
        UpdateTicketRequest $request,
        Ticket $ticket
    ) {
        $this->authorize('update', $ticket);

        $validated = $request->validated();

        $ticket->update($validated);

        return new TicketResource(
            $ticket->fresh()->load([
                'category',
                'assignedTo:id,name',
            ])
        );
    }

    #[OA\Patch(
        path: '/api/tickets/{ticket}/status',
        operationId: 'changeTicketStatus',
        summary: 'Alterar status do chamado',
        description: 'Altera o status seguindo o fluxo definido do HelpDesk.',
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
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['status'],
                properties: [
                    new OA\Property(
                        property: 'status',
                        type: 'string',
                        example: 'resolvido'
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Status alterado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
            new OA\Response(response: 422, description: 'Transição inválida'),
        ]
    )]
    public function changeStatus(
        ChangeTicketStatusRequest $request,
        Ticket $ticket
    ) {
        $this->authorize('changeStatus', $ticket);

        $validated = $request->validated();

        $ticket = $this->ticketService->changeStatus(
            $ticket,
            $validated['status'],
            $request->user()
        );

        return new TicketResource(
            $ticket->load([
                'category',
                'assignedTo:id,name',
            ])
        );
    }

    #[OA\Patch(
        path: '/api/tickets/{ticket}/assign',
        operationId: 'assignTicket',
        summary: 'Atribuir ou assumir chamado',
        description: 'Administradores podem atribuir chamados a atendentes ou administradores. Atendentes podem assumir chamados disponíveis para si.',
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
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['assigned_to'],
                properties: [
                    new OA\Property(
                        property: 'assigned_to',
                        type: 'integer',
                        example: 2
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Chamado atribuído ou assumido'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
            new OA\Response(response: 422, description: 'Dados inválidos'),
        ]
    )]
    public function assign(
        AssignTicketRequest $request,
        Ticket $ticket
    ) {
        $this->authorize('assign', $ticket);

        $validated = $request->validated();

        $ticket = $this->ticketService->assign(
            $ticket,
            $validated['assigned_to'],
            $request->user()
        );

        return new TicketResource(
            $ticket->load([
                'category',
                'assignedTo:id,name',
            ])
        );
    }
}
