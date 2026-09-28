<?php

namespace Database\Factories;

use App\Models\TicketComment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketComment>
 */
class TicketCommentFactory extends Factory
{
    /**
     * Define o estado padrão do comentário.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => null,
            'user_id' => null,

            'message' => fake()->randomElement([
                'Vou verificar o problema e retorno em seguida.',
                'O problema foi identificado. Estou realizando os procedimentos necessários.',
                'Realizei alguns testes e encontrei a causa do problema.',
                'Precisamos de mais informações para continuar a análise.',
                'O procedimento foi realizado e o problema foi resolvido.',
                'Estou aguardando o retorno do usuário para continuar.',
                'Foi realizada uma nova tentativa de acesso ao sistema.',
            ]),
        ];
    }
}
