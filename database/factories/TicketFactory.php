<?php

namespace Database\Factories;

use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define o estado padrão do chamado.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'category_id' => null,
            'assigned_to' => null,

            'title' => fake()->randomElement([
                'Computador não liga',
                'Sistema apresenta erro',
                'Problema de conexão com a internet',
                'Acesso bloqueado',
                'Impressora não funciona',
                'Erro ao acessar o sistema',
                'Computador muito lento',
            ]),

            'description' => fake()->paragraph(),

            'priority' => 'media',

            'status' => 'aberto',
        ];
    }

    /**
     * Chamado com prioridade baixa.
     */
    public function baixa(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'baixa',
        ]);
    }

    /**
     * Chamado com prioridade média.
     */
    public function media(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'media',
        ]);
    }

    /**
     * Chamado com prioridade alta.
     */
    public function alta(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'alta',
        ]);
    }

    /**
     * Chamado com prioridade urgente.
     */
    public function urgente(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgente',
        ]);
    }

    /**
     * Chamado aberto.
     */
    public function aberto(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'aberto',
        ]);
    }

    /**
     * Chamado em atendimento.
     */
    public function emAtendimento(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'em_atendimento',
        ]);
    }

    /**
     * Chamado aguardando.
     */
    public function aguardando(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'aguardando',
        ]);
    }

    /**
     * Chamado resolvido.
     */
    public function resolvido(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolvido',
        ]);
    }

    /**
     * Chamado fechado.
     */
    public function fechado(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'fechado',
        ]);
    }
}
