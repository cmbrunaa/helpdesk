<p align="center">
  <img src="frontend/public/logo.png" alt="HelpDesk" width="280">
</p>

<p align="center">
  Sistema de gerenciamento de chamados de suporte técnico
</p>

<p align="center">
  Laravel 13 • PHP 8.4 • PostgreSQL • Next.js • TypeScript
</p>

---

## Sobre o projeto

O **HelpDesk** é um sistema de gerenciamento de chamados de suporte técnico desenvolvido para organizar solicitações de atendimento, permitindo que usuários registrem chamados, acompanhem seu andamento e interajam com a equipe de suporte.

O sistema possui diferentes níveis de acesso para usuários, atendentes e administradores, além de controle de atribuição, histórico de alterações, comentários e fluxo de status.

O projeto foi desenvolvido com foco em:

- organização de código;
- separação de responsabilidades;
- regras de negócio;
- controle de acesso;
- APIs REST;
- validação;
- testes automatizados;
- documentação da API.

---

## Funcionalidades

### Autenticação

- Cadastro de usuários
- Login
- Logout
- Autenticação utilizando Laravel Sanctum
- Controle de acesso por perfil

### Chamados

- Criação de chamados
- Visualização de chamados
- Atualização de chamados
- Definição de prioridade
- Definição de categoria
- Atribuição de chamados
- Acompanhamento do status
- Filtros
- Paginação

### Atendimento

- Atendentes podem visualizar chamados não atribuídos
- Atendentes podem assumir chamados
- Após assumir um chamado, ele passa a ser associado ao atendente
- Outros atendentes não podem assumir chamados já atribuídos
- Administradores podem realizar atribuições

### Categorias

- Listagem de categorias
- Criação de categorias
- Atualização de categorias
- Exclusão de categorias
- Controle de acesso para administradores

### Comentários

Usuários autorizados podem adicionar comentários aos chamados.

Cada comentário possui:

- usuário responsável;
- chamado relacionado;
- mensagem;
- data de criação;
- data de atualização.

### Histórico

Alterações importantes realizadas nos chamados são registradas automaticamente.

O histórico armazena:

- ação realizada;
- valor anterior;
- novo valor;
- usuário responsável;
- data da alteração.

Entre os eventos registrados estão:

- criação do chamado;
- alteração de status;
- atribuição;
- assunção do chamado.

---

## Perfis de acesso

O sistema possui três tipos de usuário:

| Perfil | Permissões |
|---|---|
| `usuario` | Criar chamados e visualizar, atualizar e comentar em seus próprios chamados |
| `atendente` | Visualizar chamados não atribuídos e chamados atribuídos a ele |
| `admin` | Acesso administrativo aos chamados, categorias, usuários e atribuições |

As permissões são controladas através de **Policies** e **Middleware**.

---

## Fluxo de chamados

Os chamados seguem uma sequência controlada de status:

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

As transições são controladas pelas regras de negócio.

Não é permitido pular etapas do fluxo.

---

## Atribuição de chamados

Os chamados podem ser atribuídos a administradores ou atendentes.

O sistema possui regras para garantir que:

- administradores possam atribuir chamados;
- atendentes possam assumir chamados não atribuídos;
- atendentes possam trabalhar nos chamados atribuídos a eles;
- um atendente não possa assumir um chamado atribuído a outro atendente;
- a atribuição seja registrada no histórico.

---

## Gerenciamento de usuários

Administradores possuem acesso ao gerenciamento de usuários.

É possível alterar a função de um usuário entre:

```text
usuario
atendente
admin
```

Endpoint:

```http
PATCH /api/users/{user}/role
```

---

## Filtros

A listagem de chamados permite filtrar por:

- status;
- prioridade;
- categoria.

Os filtros podem ser utilizados individualmente ou combinados.

Exemplo:

```http
GET /api/tickets?status=aberto
```

```http
GET /api/tickets?priority=alta
```

```http
GET /api/tickets?category_id=1
```

---

## Paginação

A listagem de chamados utiliza paginação.

Exemplo:

```http
GET /api/tickets?page=1
```

---

## Tecnologias

### Backend

- PHP 8.4
- Laravel 13
- PostgreSQL
- Laravel Sanctum
- OpenAPI / Swagger
- Pest
- Composer

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Ferramentas

- Git
- GitHub
- Swagger UI
- Pest

---

## Arquitetura

O backend utiliza uma estrutura baseada na separação de responsabilidades.

```text
app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
│
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

### Controllers

Responsáveis por receber as requisições HTTP, autorizar as ações e retornar as respostas.

### Form Requests

Concentram as regras de validação das entradas recebidas pela API.

### Policies

Controlam as permissões de acesso aos recursos de acordo com o perfil do usuário.

### Services

Concentram regras de negócio que não devem ficar diretamente nos Controllers.

Exemplos:

- alteração do fluxo de status;
- atribuição de chamados;
- registro de histórico.

### Resources

Padronizam os dados retornados pela API.

### Models

Representam as entidades do sistema e seus relacionamentos com o banco de dados.

---

## Principais entidades

```text
User
 │
 ├── Tickets
 ├── Comments
 └── History

Ticket
 │
 ├── User
 ├── Category
 ├── Assigned User
 ├── Comments
 └── History

Category
 │
 └── Tickets

TicketComment
 │
 ├── Ticket
 └── User

TicketHistory
 │
 ├── Ticket
 └── User
```

---

## Documentação da API

A API possui documentação interativa utilizando **OpenAPI / Swagger**.

Com a aplicação em execução, acesse:

```text
http://127.0.0.1:8000/api/documentation
```

A documentação apresenta:

- endpoints;
- parâmetros;
- autenticação;
- requisições;
- respostas;
- códigos HTTP;
- schemas.

---

## Principais endpoints

### Autenticação

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Categorias

```http
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/{category}
DELETE /api/categories/{category}
```

### Chamados

```http
GET   /api/tickets
POST  /api/tickets
GET   /api/tickets/{ticket}
PUT   /api/tickets/{ticket}
PATCH /api/tickets/{ticket}/status
PATCH /api/tickets/{ticket}/assign
```

### Comentários

```http
GET  /api/tickets/{ticket}/comments
POST /api/tickets/{ticket}/comments
```

### Histórico

```http
GET /api/tickets/{ticket}/history
```

### Usuários

```http
GET   /api/users/assignees
PATCH /api/users/{user}/role
```

---

## Instalação

### Requisitos

- PHP 8.4+
- Composer
- PostgreSQL
- Node.js 20+
- npm
- Git

### 1. Clonar o projeto

```bash
git clone https://github.com/SEU-USUARIO/helpdesk.git
cd helpdesk
```

### 2. Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
composer install
```

### 3. Configurar o ambiente

Crie o arquivo `.env` a partir do `.env.example`.

```bash
cp .env.example .env
```

No Windows, também é possível copiar o arquivo manualmente.

### 4. Gerar a chave

```bash
php artisan key:generate
```

### 5. Configurar o PostgreSQL

No arquivo `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=helpdesk
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### 6. Executar migrations e seeders

```bash
php artisan migrate --seed
```

Para recriar completamente o banco:

```bash
php artisan migrate:fresh --seed
```

### 7. Iniciar o backend

```bash
php artisan serve
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

---

## Frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:3000
```

---

## Testes

Para executar os testes automatizados:

```bash
php artisan test
```

Os testes cobrem principalmente:

- autenticação;
- autorização por perfil;
- visualização de chamados;
- criação de chamados;
- alteração de status;
- fluxo de status;
- atribuição;
- comentários;
- histórico;
- filtros;
- paginação;
- respostas de erro da API.

---

## Dados para desenvolvimento

Os seeders disponibilizam usuários para facilitar os testes locais.

### Administrador

```text
E-mail: admin@helpdesk.test
Senha: senha1234
```

### Atendente

```text
E-mail: joao@helpdesk.test
Senha: senha1234
```

### Usuário

```text
E-mail: bruna@helpdesk.test
Senha: senha1234
```

> As credenciais acima são destinadas apenas ao ambiente de desenvolvimento.

---

## Tratamento de erros

A API possui respostas padronizadas para erros comuns.

### Não autenticado

```json
{
  "message": "Não autenticado."
}
```

### Sem permissão

```json
{
  "message": "Você não possui permissão para realizar esta ação."
}
```

### Recurso não encontrado

```json
{
  "message": "Recurso não encontrado."
}
```

### Erro de validação

```json
{
  "message": "Os dados fornecidos são inválidos.",
  "errors": {}
}
```

---

## Segurança

O sistema utiliza:

- Laravel Sanctum para autenticação;
- Policies para autorização;
- Middleware para controle de acesso;
- validação através de Form Requests;
- proteção das rotas autenticadas;
- regras de negócio no backend;
- controle de permissões por perfil.

As permissões não dependem apenas da interface do frontend. As regras são verificadas também no backend.

---

## Objetivos técnicos

Este projeto foi desenvolvido para praticar e demonstrar conhecimentos em:

- desenvolvimento de APIs REST;
- PHP;
- Laravel;
- arquitetura de aplicações;
- orientação a objetos;
- PostgreSQL;
- autenticação;
- autorização;
- Policies;
- Middleware;
- validação;
- Resources;
- regras de negócio;
- relacionamentos entre entidades;
- testes automatizados;
- documentação de APIs;
- Git e GitHub;
- integração entre frontend e backend.

---

## Status do projeto

```text
✓ Autenticação
✓ Controle de acesso
✓ Chamados
✓ Categorias
✓ Atribuição
✓ Fluxo de status
✓ Comentários
✓ Histórico
✓ Filtros
✓ Paginação
✓ Gerenciamento de usuários
✓ Documentação Swagger
✓ Testes automatizados
✓ Frontend integrado
```

---

## Autor

**Bruna Moreira Candido**

Desenvolvedora Full-Stack em formação, com foco em desenvolvimento web, APIs REST, PHP/Laravel, C#/.NET, React, Next.js e TypeScript.

---

<p align="center">
  Desenvolvido para fins de estudo, portfólio e prática de desenvolvimento de software.
</p>
