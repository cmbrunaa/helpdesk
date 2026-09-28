<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'nullable',
                Rule::in([
                    'aberto',
                    'em_atendimento',
                    'aguardando',
                    'resolvido',
                    'fechado',
                ]),
            ],

            'priority' => [
                'nullable',
                Rule::in([
                    'baixa',
                    'media',
                    'alta',
                ]),
            ],

            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],
        ];
    }
}
