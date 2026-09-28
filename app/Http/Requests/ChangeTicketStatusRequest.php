<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeTicketStatusRequest extends FormRequest
{
    /**
     * Define se o usuário pode realizar esta requisição.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Regras de validação para alteração de status.
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'in:aberto,em_atendimento,aguardando,resolvido,fechado',
            ],
        ];
    }
}
