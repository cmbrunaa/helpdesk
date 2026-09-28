<?php

namespace Database\Factories;

use App\Models\TicketHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketHistory>
 */
class TicketHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => null,
            'user_id' => null,

            'action' => 'status_alterado',

            'old_value' => 'aberto',
            'new_value' => 'em_atendimento',

            'created_at' => fake()->dateTimeBetween(
                '-7 days',
                'now'
            ),
        ];
    }
}
