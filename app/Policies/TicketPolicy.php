<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Admin vê qualquer chamado.
     * Atendente vê chamados atribuídos a ele
     * ou ainda não atribuídos.
     * Usuário comum vê apenas os próprios chamados.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'atendente') {
            return $ticket->assigned_to === null
                || $ticket->assigned_to === $user->id;
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
     * Apenas admin e atendente responsável podem alterar status.
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
     * Admin pode atribuir qualquer chamado.
     * Atendente pode assumir apenas chamados sem responsável
     * ou manter/reassumir o próprio chamado.
     */
    public function assign(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'atendente'
            && (
                $ticket->assigned_to === null
                || $ticket->assigned_to === $user->id
            );
    }

    /**
     * Admin pode comentar em qualquer chamado.
     * Atendente pode comentar nos chamados atribuídos a ele
     * ou ainda não atribuídos.
     * Usuário comum pode comentar nos próprios chamados.
     */
    public function comment(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'atendente') {
            return $ticket->assigned_to === null
                || $ticket->assigned_to === $user->id;
        }

        return $ticket->user_id === $user->id;
    }
}
