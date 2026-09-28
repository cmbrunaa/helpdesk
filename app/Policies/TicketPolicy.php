<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Admin pode visualizar qualquer chamado.
     * Usuário comum pode visualizar os próprios chamados.
     * Atendente pode visualizar chamados atribuídos a ele.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'atendente') {
            return $ticket->assigned_to === $user->id;
        }

        return $ticket->user_id === $user->id;
    }

    /**
     * Admin pode atualizar qualquer chamado.
     * Atendente pode atualizar chamados atribuídos a ele.
     * Usuário comum pode atualizar os próprios chamados.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'atendente') {
            return $ticket->assigned_to === $user->id;
        }

        return $ticket->user_id === $user->id;
    }

    /**
     * Apenas administradores e atendentes podem alterar status.
     */
    public function changeStatus(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'atendente'
            && $ticket->assigned_to === $user->id;
    }

    /**
     * Apenas administradores e atendentes podem atribuir chamados.
     */
    public function assign(User $user, Ticket $ticket): bool
    {
        return in_array($user->role, ['admin', 'atendente']);
    }

    /**
     * Define quem pode comentar no chamado.
     */
    public function comment(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'atendente') {
            return $ticket->assigned_to === $user->id;
        }

        return $ticket->user_id === $user->id;
    }
}
