<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /*
    |--------------------------------------------------------------------------
    | Visualização de chamados
    |--------------------------------------------------------------------------
    */

    public function test_usuario_pode_visualizar_seu_proprio_chamado(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}");

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.id', $ticket->id);
    }

    public function test_usuario_nao_pode_visualizar_chamado_de_outro_usuario(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $outroUsuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $outroUsuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}");

        $response->assertStatus(403);
    }

    public function test_atendente_pode_visualizar_chamado_atribuido_a_ele(): void
    {
        $atendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $atendente->id,
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}");

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.id', $ticket->id);
    }

    public function test_atendente_nao_pode_visualizar_chamado_atribuido_a_outro_atendente(): void
    {
        $atendente = User::factory()->atendente()->create();

        $outroAtendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $outroAtendente->id,
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}");

        $response->assertStatus(403);
    }

    public function test_administrador_pode_visualizar_qualquer_chamado(): void
    {
        $admin = User::factory()->admin()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => null,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}");

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.id', $ticket->id);
    }

    /*
    |--------------------------------------------------------------------------
    | Alteração de status
    |--------------------------------------------------------------------------
    */

    public function test_atendente_atribuido_pode_alterar_status_do_chamado(): void
    {
        $atendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $atendente->id,
            'status' => 'aberto',
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'em_atendimento',
            ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'em_atendimento');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'em_atendimento',
        ]);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'user_id' => $atendente->id,
            'action' => 'status_alterado',
            'old_value' => 'aberto',
            'new_value' => 'em_atendimento',
        ]);
    }

    public function test_atendente_nao_pode_alterar_status_de_chamado_nao_atribuido_a_ele(): void
    {
        $atendente = User::factory()->atendente()->create();

        $outroAtendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $outroAtendente->id,
            'status' => 'aberto',
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'em_atendimento',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'aberto',
        ]);
    }

    public function test_usuario_nao_pode_alterar_status_do_proprio_chamado(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'status' => 'aberto',
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'em_atendimento',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'aberto',
        ]);
    }

    public function test_administrador_pode_alterar_status_de_qualquer_chamado(): void
    {
        $admin = User::factory()->admin()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => null,
            'status' => 'aberto',
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'em_atendimento',
            ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'em_atendimento');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'em_atendimento',
        ]);
    }

    public function test_nao_pode_pular_etapas_do_fluxo_de_status(): void
    {
        $atendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $atendente->id,
            'status' => 'aberto',
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'resolvido',
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'aberto',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Comentários
    |--------------------------------------------------------------------------
    */

    public function test_usuario_pode_comentar_no_proprio_chamado(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->postJson("/api/tickets/{$ticket->id}/comments", [
                'message' => 'Tenho mais informações sobre o problema.',
            ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('data.message', 'Tenho mais informações sobre o problema.');

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $usuario->id,
            'message' => 'Tenho mais informações sobre o problema.',
        ]);
    }

    public function test_usuario_nao_pode_comentar_no_chamado_de_outro_usuario(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $outroUsuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $outroUsuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->postJson("/api/tickets/{$ticket->id}/comments", [
                'message' => 'Comentário indevido.',
            ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $usuario->id,
            'message' => 'Comentário indevido.',
        ]);
    }

    public function test_atendente_atribuido_pode_comentar_no_chamado(): void
    {
        $atendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $atendente->id,
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->postJson("/api/tickets/{$ticket->id}/comments", [
                'message' => 'Vou analisar o chamado.',
            ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('data.message', 'Vou analisar o chamado.');

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $atendente->id,
            'message' => 'Vou analisar o chamado.',
        ]);
    }

    public function test_atendente_nao_atribuido_nao_pode_comentar_no_chamado(): void
    {
        $atendente = User::factory()->atendente()->create();

        $outroAtendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => $outroAtendente->id,
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->postJson("/api/tickets/{$ticket->id}/comments", [
                'message' => 'Não deveria conseguir comentar.',
            ]);

        $response->assertStatus(403);
    }

    public function test_administrador_pode_comentar_em_qualquer_chamado(): void
    {
        $admin = User::factory()->admin()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->postJson("/api/tickets/{$ticket->id}/comments", [
                'message' => 'Comentário administrativo.',
            ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('data.message', 'Comentário administrativo.');

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'message' => 'Comentário administrativo.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Atribuição de chamados
    |--------------------------------------------------------------------------
    */

    public function test_administrador_pode_atribuir_chamado(): void
    {
        $admin = User::factory()->admin()->create();

        $atendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => null,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/assign", [
                'assigned_to' => $atendente->id,
            ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.assigned_to.id', $atendente->id);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assigned_to' => $atendente->id,
        ]);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'action' => 'chamado_atribuido',
            'new_value' => (string) $atendente->id,
        ]);
    }

    public function test_atendente_pode_atribuir_chamado(): void
    {
        $atendente = User::factory()->atendente()->create();

        $outroAtendente = User::factory()->atendente()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => null,
        ]);

        $response = $this
            ->actingAs($atendente, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/assign", [
                'assigned_to' => $outroAtendente->id,
            ]);

        $response
            ->assertStatus(200)
            ->assertJsonPath('data.assigned_to.id', $outroAtendente->id);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assigned_to' => $outroAtendente->id,
        ]);
    }

    public function test_usuario_nao_pode_atribuir_chamado(): void
    {
        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $atendente = User::factory()->atendente()->create();

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
        ]);

        $response = $this
            ->actingAs($usuario, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/assign", [
                'assigned_to' => $atendente->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_nao_pode_atribuir_chamado_a_usuario_comum(): void
    {
        $admin = User::factory()->admin()->create();

        $usuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $outroUsuario = User::factory()->create([
            'role' => 'usuario',
        ]);

        $categoria = Category::factory()->create();

        $ticket = Ticket::factory()->create([
            'user_id' => $usuario->id,
            'category_id' => $categoria->id,
            'assigned_to' => null,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/assign", [
                'assigned_to' => $outroUsuario->id,
            ]);
$response
    ->assertStatus(422)
    ->assertJson([
        'message' => 'Os dados fornecidos são inválidos.',
        'errors' => [
            'assigned_to' => [
                'O chamado só pode ser atribuído a um atendente ou administrador.',
            ],
        ],
    ]);
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assigned_to' => null,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Autenticação
    |--------------------------------------------------------------------------
    */

    public function test_usuario_nao_autenticado_nao_pode_acessar_chamados(): void
    {
        $response = $this->getJson('/api/tickets');

        $response->assertStatus(401);
    }

    public function test_criacao_de_chamado_registra_historico(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $this->actingAs($usuario)
        ->postJson('/api/tickets', [
            'category_id' => $category->id,
            'title' => 'Computador não liga',
            'description' => 'O computador não apresenta nenhum sinal.',
            'priority' => 'media',
        ])
        ->assertStatus(201);

    $ticket = Ticket::latest('id')->first();

    $this->assertDatabaseHas('ticket_histories', [
        'ticket_id' => $ticket->id,
        'user_id' => $usuario->id,
        'action' => 'chamado_criado',
        'old_value' => null,
        'new_value' => 'aberto',
    ]);
}

public function test_usuario_pode_filtrar_chamados_por_status(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'status' => 'aberto',
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'status' => 'resolvido',
    ]);

    $response = $this->actingAs($usuario)
        ->getJson('/api/tickets?status=aberto')
        ->assertOk();

    $response->assertJsonCount(1, 'data');

    $response->assertJsonPath('data.0.status', 'aberto');
}

public function test_usuario_pode_filtrar_chamados_por_prioridade(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'priority' => 'alta',
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'priority' => 'baixa',
    ]);

    $response = $this->actingAs($usuario)
        ->getJson('/api/tickets?priority=alta')
        ->assertOk();

    $response->assertJsonCount(1, 'data');

    $response->assertJsonPath('data.0.priority', 'alta');
}

public function test_usuario_pode_combinar_filtros(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $outraCategory = Category::factory()->create([
        'active' => true,
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'status' => 'aberto',
        'priority' => 'alta',
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'status' => 'aberto',
        'priority' => 'baixa',
    ]);

    Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $outraCategory->id,
        'status' => 'resolvido',
        'priority' => 'alta',
    ]);

    $response = $this->actingAs($usuario)
        ->getJson(
            "/api/tickets?status=aberto&priority=alta&category_id={$category->id}"
        )
        ->assertOk();

    $response->assertJsonCount(1, 'data');

    $response->assertJsonPath('data.0.status', 'aberto');
    $response->assertJsonPath('data.0.priority', 'alta');
    $response->assertJsonPath('data.0.category.id', $category->id);
}

public function test_usuario_pode_visualizar_historico_do_proprio_chamado(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $ticket = Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
    ]);

    TicketHistory::factory()->create([
        'ticket_id' => $ticket->id,
        'user_id' => $usuario->id,
        'action' => 'chamado_criado',
        'old_value' => null,
        'new_value' => 'aberto',
    ]);

    $this->actingAs($usuario)
        ->getJson("/api/tickets/{$ticket->id}/history")
        ->assertOk()
        ->assertJsonCount(1, 'data');
}

public function test_atendente_atribuido_pode_visualizar_historico(): void
{
    $atendente = User::factory()->create([
        'role' => 'atendente',
    ]);

    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $ticket = Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
        'assigned_to' => $atendente->id,
    ]);

    TicketHistory::factory()->create([
        'ticket_id' => $ticket->id,
        'user_id' => $usuario->id,
        'action' => 'chamado_criado',
        'old_value' => null,
        'new_value' => 'aberto',
    ]);

    $this->actingAs($atendente)
        ->getJson("/api/tickets/{$ticket->id}/history")
        ->assertOk()
        ->assertJsonCount(1, 'data');
}

public function test_admin_pode_visualizar_historico_de_qualquer_chamado(): void
{
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $ticket = Ticket::factory()->create([
        'user_id' => $usuario->id,
        'category_id' => $category->id,
    ]);

    TicketHistory::factory()->create([
        'ticket_id' => $ticket->id,
        'user_id' => $usuario->id,
        'action' => 'chamado_criado',
        'old_value' => null,
        'new_value' => 'aberto',
    ]);

    $this->actingAs($admin)
        ->getJson("/api/tickets/{$ticket->id}/history")
        ->assertOk()
        ->assertJsonCount(1, 'data');
}

public function test_api_retorna_401_para_usuario_nao_autenticado(): void
{
    $this->getJson('/api/tickets')
        ->assertStatus(401)
        ->assertJson([
            'message' => 'Não autenticado.',
        ]);
}

public function test_api_retorna_403_para_usuario_sem_permissao(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $outroUsuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $category = Category::factory()->create([
        'active' => true,
    ]);

    $ticket = Ticket::factory()->create([
        'user_id' => $outroUsuario->id,
        'category_id' => $category->id,
    ]);

    $this->actingAs($usuario)
        ->getJson("/api/tickets/{$ticket->id}")
        ->assertStatus(403)
        ->assertJson([
            'message' => 'Você não possui permissão para realizar esta ação.',
        ]);
}

public function test_api_retorna_404_para_chamado_inexistente(): void
{
    $usuario = User::factory()->create([
        'role' => 'usuario',
    ]);

    $this->actingAs($usuario)
        ->getJson('/api/tickets/999999')
        ->assertStatus(404)
        ->assertJson([
            'message' => 'Recurso não encontrado.',
        ]);
}
}
