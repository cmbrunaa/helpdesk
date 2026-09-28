<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuários
        $admin = User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@helpdesk.test',
            'password' => 'senha1234',
            'role' => 'admin',
        ]);

        $atendente = User::factory()->atendente()->create([
            'name' => 'João Atendente',
            'email' => 'joao@helpdesk.test',
            'password' => 'senha1234',
        ]);

        $bruna = User::factory()->create([
            'name' => 'Bruna Usuária',
            'email' => 'bruna@helpdesk.test',
            'password' => 'senha1234',
        ]);

        // Categorias
        $hardware = Category::factory()->create([
            'name' => 'Hardware',
        ]);

        $software = Category::factory()->create([
            'name' => 'Software',
        ]);

        $rede = Category::factory()->create([
            'name' => 'Rede',
        ]);

        $acesso = Category::factory()->create([
            'name' => 'Acesso',
        ]);

        $outros = Category::factory()->create([
            'name' => 'Outros',
        ]);

        // Chamado 1
        $ticket1 = Ticket::factory()->create([
            'user_id' => $bruna->id,
            'category_id' => $hardware->id,
            'assigned_to' => $atendente->id,
            'title' => 'Computador não liga',
            'description' => 'O computador não apresenta nenhum sinal ao pressionar o botão de ligar.',
            'priority' => 'alta',
            'status' => 'em_atendimento',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket1->id,
            'user_id' => $bruna->id,
            'message' => 'O computador parou de funcionar hoje pela manhã.',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket1->id,
            'user_id' => $atendente->id,
            'message' => 'Vou verificar a fonte de alimentação.',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket1->id,
            'user_id' => $atendente->id,
            'action' => 'status_alterado',
            'old_value' => 'aberto',
            'new_value' => 'em_atendimento',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket1->id,
            'user_id' => $atendente->id,
            'action' => 'chamado_atribuido',
            'old_value' => null,
            'new_value' => (string) $atendente->id,
        ]);

        // Chamado 2
        $ticket2 = Ticket::factory()->create([
            'user_id' => $bruna->id,
            'category_id' => $software->id,
            'assigned_to' => $atendente->id,
            'title' => 'Sistema apresenta erro',
            'description' => 'O sistema apresenta uma mensagem de erro ao tentar abrir.',
            'priority' => 'media',
            'status' => 'aberto',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket2->id,
            'user_id' => $bruna->id,
            'message' => 'O erro começou depois da última atualização.',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket2->id,
            'user_id' => $bruna->id,
            'action' => 'chamado_atribuido',
            'old_value' => null,
            'new_value' => (string) $atendente->id,
        ]);

        // Chamado 3
        $ticket3 = Ticket::factory()->create([
            'user_id' => $bruna->id,
            'category_id' => $rede->id,
            'assigned_to' => null,
            'title' => 'Problema de conexão com a internet',
            'description' => 'A conexão está instável e cai várias vezes durante o dia.',
            'priority' => 'urgente',
            'status' => 'aberto',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket3->id,
            'user_id' => $bruna->id,
            'message' => 'A conexão está caindo a cada poucos minutos.',
        ]);

        // Chamado 4
        $ticket4 = Ticket::factory()->create([
            'user_id' => $bruna->id,
            'category_id' => $acesso->id,
            'assigned_to' => $atendente->id,
            'title' => 'Acesso bloqueado',
            'description' => 'O usuário não consegue acessar sua conta corporativa.',
            'priority' => 'alta',
            'status' => 'aguardando',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket4->id,
            'user_id' => $atendente->id,
            'message' => 'Estou aguardando a confirmação dos dados do usuário.',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket4->id,
            'user_id' => $atendente->id,
            'action' => 'status_alterado',
            'old_value' => 'aberto',
            'new_value' => 'em_atendimento',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket4->id,
            'user_id' => $atendente->id,
            'action' => 'status_alterado',
            'old_value' => 'em_atendimento',
            'new_value' => 'aguardando',
        ]);

        // Chamado 5
        $ticket5 = Ticket::factory()->create([
            'user_id' => $bruna->id,
            'category_id' => $outros->id,
            'assigned_to' => $admin->id,
            'title' => 'Solicitação de suporte',
            'description' => 'Usuário precisa de auxílio com um procedimento interno.',
            'priority' => 'baixa',
            'status' => 'resolvido',
        ]);

        TicketComment::factory()->create([
            'ticket_id' => $ticket5->id,
            'user_id' => $admin->id,
            'message' => 'O procedimento foi realizado com sucesso.',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket5->id,
            'user_id' => $admin->id,
            'action' => 'status_alterado',
            'old_value' => 'aberto',
            'new_value' => 'em_atendimento',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket5->id,
            'user_id' => $admin->id,
            'action' => 'status_alterado',
            'old_value' => 'em_atendimento',
            'new_value' => 'aguardando',
        ]);

        TicketHistory::factory()->create([
            'ticket_id' => $ticket5->id,
            'user_id' => $admin->id,
            'action' => 'status_alterado',
            'old_value' => 'aguardando',
            'new_value' => 'resolvido',
        ]);
    }
}
