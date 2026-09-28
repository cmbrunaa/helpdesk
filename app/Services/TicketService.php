<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TicketService
{
    private const STATUS_FLOW = [
        'aberto' => 'em_atendimento',
        'em_atendimento' => 'aguardando',
        'aguardando' => 'resolvido',
        'resolvido' => 'fechado',
    ];

    public function create(
        array $data,
        User $user
    ): Ticket {
        return DB::transaction(function () use ($data, $user) {
            $ticket = Ticket::create([
                'user_id' => $user->id,
                'category_id' => $data['category_id'],
                'title' => $data['title'],
                'description' => $data['description'],
                'priority' => $data['priority'],
                'status' => 'aberto',
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'chamado_criado',
                'old_value' => null,
                'new_value' => 'aberto',
            ]);

            return $ticket->fresh();
        });
    }

    public function changeStatus(
        Ticket $ticket,
        string $newStatus,
        User $user
    ): Ticket {
        $currentStatus = $ticket->status;

        if (!isset(self::STATUS_FLOW[$currentStatus])) {
            throw ValidationException::withMessages([
                'status' => 'Este chamado não pode mais ter o status alterado.',
            ]);
        }

        if (self::STATUS_FLOW[$currentStatus] !== $newStatus) {
            throw ValidationException::withMessages([
                'status' => "Não é permitido alterar de {$currentStatus} para {$newStatus}.",
            ]);
        }

        return DB::transaction(function () use (
            $ticket,
            $newStatus,
            $user,
            $currentStatus
        ) {
            $ticket->update([
                'status' => $newStatus,
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'status_alterado',
                'old_value' => $currentStatus,
                'new_value' => $newStatus,
            ]);

            return $ticket->fresh();
        });
    }

    public function assign(
        Ticket $ticket,
        int $assignedUserId,
        User $performedBy
    ): Ticket {
        $assignedUser = User::find($assignedUserId);

        if (!$assignedUser) {
            throw ValidationException::withMessages([
                'assigned_to' => 'Usuário não encontrado.',
            ]);
        }

        if (!in_array($assignedUser->role, ['admin', 'atendente'], true)) {
            throw ValidationException::withMessages([
                'assigned_to' => 'O chamado só pode ser atribuído a um atendente ou administrador.',
            ]);
        }

        $oldAssignedTo = $ticket->assigned_to;

        return DB::transaction(function () use (
            $ticket,
            $assignedUser,
            $performedBy,
            $oldAssignedTo
        ) {
            $ticket->update([
                'assigned_to' => $assignedUser->id,
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $performedBy->id,
                'action' => 'chamado_atribuido',
                'old_value' => $oldAssignedTo
                    ? (string) $oldAssignedTo
                    : null,
                'new_value' => (string) $assignedUser->id,
            ]);

            return $ticket->fresh();
        });
    }
}
