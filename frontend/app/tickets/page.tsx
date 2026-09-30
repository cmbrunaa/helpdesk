"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: "usuario" | "atendente" | "admin";
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: "baixa" | "media" | "alta";
  status:
    | "aberto"
    | "em_atendimento"
    | "aguardando"
    | "resolvido"
    | "fechado";
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  } | null;
};

type Category = {
  id: number;
  name: string;
  active: boolean;
};

type TicketsResponse = {
  data: Ticket[];
  current_page: number;
  last_page: number;
  total: number;
};

const statusLabels: Record<Ticket["status"], string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  aguardando: "Aguardando",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

const priorityLabels: Record<Ticket["priority"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const statusStyles: Record<Ticket["status"], string> = {
  aberto: "bg-blue-50 text-blue-700 border-blue-100",
  em_atendimento: "bg-amber-50 text-amber-700 border-amber-100",
  aguardando: "bg-purple-50 text-purple-700 border-purple-100",
  resolvido: "bg-green-50 text-green-700 border-green-100",
  fechado: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  alta: "text-red-600",
  media: "text-amber-600",
  baixa: "text-green-600",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";
  const isAttendant = user?.role === "atendente";
  const canCreateTicket = user?.role === "usuario" || user?.role === "admin";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status) {
        params.set("status", status);
      }

      if (priority) {
        params.set("priority", priority);
      }

      if (categoryId) {
        params.set("category_id", categoryId);
      }

      params.set("page", String(page));

      const query = params.toString();

      const response: TicketsResponse = await apiFetch(
        `/tickets?${query}`
      );

      setTickets(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os chamados."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await apiFetch("/categories");
      setCategories(response.data);
    } catch {
      // As categorias não impedem a tela de chamados de funcionar.
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [status, priority, categoryId, page]);

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handlePriorityChange(value: string) {
    setPriority(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  const pageTitle = isAdmin
    ? "Todos os chamados"
    : isAttendant
      ? "Central de chamados"
      : "Meus chamados";

  const pageDescription = isAdmin
    ? "Visualize e gerencie todos os chamados do sistema."
    : isAttendant
      ? "Acompanhe os chamados disponíveis e os atendimentos sob sua responsabilidade."
      : "Acompanhe seus chamados e o andamento dos atendimentos.";

  const listTitle = isAdmin
    ? "Todos os chamados"
    : isAttendant
      ? "Fila de atendimento"
      : "Meus chamados";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-blue-600">
              &gt;_ tickets.list()
            </p>

            <h1 className="text-2xl font-semibold text-slate-900">
              {pageTitle}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {pageDescription}
            </p>
          </div>

          {canCreateTicket && (
            <Link
              href="/tickets/new"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Novo chamado
            </Link>
          )}
        </div>

        {/* Filtros */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">
              &gt; filters
            </span>

            <span className="text-sm font-medium text-slate-700">
              Filtrar chamados
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  handleStatusChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="em_atendimento">
                  Em atendimento
                </option>
                <option value="aguardando">Aguardando</option>
                <option value="resolvido">Resolvido</option>
                <option value="fechado">Fechado</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Prioridade
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(event) =>
                  handlePriorityChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Categoria
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Lista */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {listTitle}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {loading
                  ? "Carregando..."
                  : `${total} chamado${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
              </p>
            </div>

            <span className="font-mono text-xs text-slate-400">
              GET /tickets
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="px-5 py-12 text-center">
              <p className="font-mono text-xs text-slate-400">
                &gt; loading.tickets()
              </p>
            </div>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                Não foi possível carregar os chamados.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {error}
              </p>
            </div>
          )}

          {/* Nenhum resultado */}
          {!loading && !error && tickets.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhum chamado encontrado.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {isAttendant
                  ? "Não existem chamados disponíveis para atendimento."
                  : "Tente alterar os filtros."}
              </p>

              {canCreateTicket && (
                <Link
                  href="/tickets/new"
                  className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                >
                  Criar chamado
                </Link>
              )}
            </div>
          )}

          {/* Tabela */}
          {!loading && !error && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Chamado
                    </th>

                    {isAdmin && (
                      <th className="px-5 py-3 text-xs font-medium text-slate-500">
                        Solicitante
                      </th>
                    )}

                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Categoria
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Prioridade
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Responsável
                    </th>

                    <th className="px-5 py-3 text-xs font-medium text-slate-500">
                      Data
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="group"
                        >
                          <span className="font-mono text-xs text-slate-400">
                            #{String(ticket.id).padStart(4, "0")}
                          </span>

                          <p className="mt-0.5 text-sm font-medium text-slate-800 group-hover:text-blue-600">
                            {ticket.title}
                          </p>
                        </Link>
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {ticket.user?.name ?? "—"}
                        </td>
                      )}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {ticket.category?.name ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${priorityStyles[ticket.priority]}`}
                        >
                          {priorityLabels[ticket.priority]}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}
                        >
                          {statusLabels[ticket.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {ticket.assigned_to?.name ?? "Não atribuído"}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {!loading && !error && lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <span className="text-xs text-slate-400">
                Página {page} de {lastPage}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page === lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Rodapé */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="font-mono text-xs text-slate-400">
            &gt; api.connected
          </span>

          <span className="text-xs text-slate-400">
            HelpDesk · v1.0.0
          </span>
        </div>
      </main>
    </div>
  );
}
