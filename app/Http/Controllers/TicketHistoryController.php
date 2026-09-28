<?php

namespace App\Http\Controllers;

use App\Http\Resources\TicketHistoryResource;
use App\Models\Ticket;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TicketHistoryController extends Controller
{
    #[OA\Get(
        path: '/api/tickets/{ticket}/history',
        operationId: 'listTicketHistory',
        summary: 'Listar histórico do chamado',
        description: 'Retorna o histórico de alterações de um chamado.',
        tags: ['History'],
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
            new OA\Response(response: 200, description: 'Histórico do chamado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Sem permissão'),
            new OA\Response(response: 404, description: 'Chamado não encontrado')
        ]
    )]
    public function index(Request $request, Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        return TicketHistoryResource::collection(
            $ticket->histories()
                ->with('user:id,name')
                ->latest('created_at')
                ->get()
        );
    }
}
