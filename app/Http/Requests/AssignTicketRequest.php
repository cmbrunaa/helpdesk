<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTicketRequest extends FormRequest
{
    /**
     * Define se o usuário pode realizar esta requisição.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Regras de validação para atribuição do chamado.
     */
    public function rules(): array
    {
        return [
            'assigned_to' => [
                'required',
                'exists:users,id',
            ],
        ];
    }
}
