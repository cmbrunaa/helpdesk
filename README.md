# HelpDesk API

API REST para gerenciamento de chamados de suporte técnico, desenvolvida com Laravel e PostgreSQL.

O sistema permite que usuários abram chamados, acompanhem seu andamento e interajam com o atendimento. Atendentes podem trabalhar nos chamados atribuídos a eles, enquanto administradores possuem acesso às funcionalidades administrativas.

## Funcionalidades

- Autenticação de usuários com Laravel Sanctum
- Controle de acesso por perfil
- Criação e gerenciamento de chamados
- Categorias de atendimento
- Definição de prioridade
- Atribuição de chamados a atendentes
- Fluxo controlado de status
- Comentários nos chamados
- Histórico de alterações
- Filtros de chamados
- Paginação
- Validação das requisições
- Respostas padronizadas da API
- Documentação com OpenAPI / Swagger
- Testes automatizados

## Perfis de acesso

O sistema possui três tipos de usuário:

| Perfil | Permissões |
|---|---|
| `usuario` | Criar chamados e visualizar, atualizar e comentar em seus próprios chamados |
| `atendente` | Visualizar e trabalhar nos chamados atribuídos a ele |
| `admin` | Gerenciar chamados, atribuições e categorias |

As permissões são controladas através de Policies e Middleware.

## Chamados

Cada chamado possui:

- título
- descrição
- categoria
- prioridade
- status
- usuário que realizou a abertura
- atendente responsável
- datas de criação e atualização

### Fluxo de status

Os chamados seguem uma sequência definida:

```text
aberto
   ↓
em_atendimento
   ↓
aguardando
   ↓
resolvido
   ↓
fechado
```

As transições são controladas pelas regras de negócio e não é permitido pular etapas.

## Histórico

Alterações importantes realizadas em um chamado são registradas automaticamente.

O histórico armazena:

- ação realizada
- valor anterior
- novo valor
- usuário responsável
- data da alteração

Entre os eventos registrados estão a criação, alteração de status e atribuição de chamados.

## Comentários

Usuários autorizados podem adicionar comentários aos chamados.

Cada comentário está associado ao usuário que o criou e ao chamado correspondente.

## Filtros

A listagem de chamados permite filtrar por:

- status
- prioridade
- categoria

Os filtros podem ser utilizados individualmente ou combinados.

## Tecnologias

- PHP 8.4
- Laravel 13
- PostgreSQL
- Laravel Sanctum
- OpenAPI / Swagger
- Pest
- Composer

## Estrutura

```text
app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

routes/
└── api.php

tests/
├── Feature/
└── Unit/
```

### Principais componentes

**Controllers**  
Responsáveis por receber as requisições e retornar as respostas da API.

**Form Requests**  
Concentram as regras de validação das entradas.

**Policies**  
Controlam as permissões de acesso aos recursos.

**Services**  
Concentram regras de negócio, como alteração de status e atribuição de chamados.

**Resources**  
Padronizam os dados retornados pela API.

## Documentação

A API possui documentação interativa através do Swagger.

Com a aplicação em execução, acesse:

```text
http://127.0.0.1:8000/api/documentation
```

A documentação apresenta os endpoints, parâmetros, autenticação, exemplos de requisições e respostas.

## Instalação

### Requisitos

- PHP 8.4+
- Composer
- PostgreSQL
- Laravel 13

### Configuração

Clone o projeto e instale as dependências:

```bash
composer install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Gere a chave da aplicação:

```bash
php artisan key:generate
```

Configure as informações do PostgreSQL no `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=helpdesk
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

Execute as migrations e os seeders:

```bash
php artisan migrate --seed
```

Para recriar o banco de dados:

```bash
php artisan migrate:fresh --seed
```

Inicie a aplicação:

```bash
php artisan serve
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

## Testes

Para executar os testes automatizados:

```bash
php artisan test
```

O projeto possui testes cobrindo principalmente:

- autenticação
- autorização por perfil
- visualização de chamados
- alteração de status
- fluxo de status
- atribuição
- comentários
- histórico
- filtros
- respostas de erro da API
