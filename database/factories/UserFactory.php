<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * A senha padrão utilizada pela factory.
     */
    protected static ?string $password = null;

    /**
     * Define os dados padrão de um usuário.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'usuario',
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Cria um usuário administrador.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Cria um usuário atendente.
     */
    public function atendente(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'atendente',
        ]);
    }

    /**
     * Indica que o e-mail não foi verificado.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
