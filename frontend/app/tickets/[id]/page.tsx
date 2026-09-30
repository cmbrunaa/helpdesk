"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

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
  updated_at: string;
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

type Comment = {
  id: number;
  message: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
};

type HistoryItem = {
  id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
};

type Assignee = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "atendente";
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "usuario" | "atendente" | "admin";
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
  aguardando: "bg-slate-100 text-slate-600 border-slate-200",
  resolvido: "bg-emerald-50 text-emerald-700 border-emerald-100",
  fechado: "bg-slate-100 text-slate-500 border-slate-200",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-amber-50 text-amber-700",
  alta: "bg-red-50 text-red-700",
};

const nextStatus: Partial<Record<Ticket["status"], Ticket["status"]>> = {
  aberto: "em_atendimento",
  em_atendimento: "aguardando",
  aguardando: "resolvido",
  resolvido: "fechado",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function historyActionLabel(action: string) {
  const labels: Record<string, string> = {
    chamado_criado: "Chamado criado",
    status_alterado: "Status alterado",
    chamado_atribuido: "Chamado atribuído",
    chamado_assumido: "Chamado assumido",
  };

  return labels[action] ?? action;
}

export default function TicketDetailsPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [commentMessage, setCommentMessage] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        setError("");

        const [
          ticketResponse,
          commentsResponse,
          historyResponse,
        ] = await Promise.all([
          apiFetch(`/tickets/${ticketId}`),
          apiFetch(`/tickets/${ticketId}/comments`),
          apiFetch(`/tickets/${ticketId}/history`),
        ]);

        const loadedTicket = ticketResponse.data;

        setTicket(loadedTicket);
        setComments(commentsResponse.data);
        setHistory(historyResponse.data);

        setSelectedAssignee(
          loadedTicket.assigned_to?.id
            ? String(loadedTicket.assigned_to.id)
            : ""
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o chamado."
        );
      } finally {
        setLoading(false);
      }
    }

    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    async function loadAssignees() {
      if (!currentUser || currentUser.role !== "admin") {
        return;
      }

      try {
        const response = await apiFetch("/users/assignees");
        setAssignees(response.data);
      } catch {
        setAssignees([]);
      }
    }

    loadAssignees();
  }, [currentUser]);

  async function handleAssign() {
    if (!selectedAssignee) {
      setAssignError("Selecione um usuário.");
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");

      const response = await apiFetch(
        `/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_to: Number(selectedAssignee),
          }),
        }
      );

      setTicket(response.data);

      const historyResponse = await apiFetch(
        `/tickets/${ticketId}/history`
      );

      setHistory(historyResponse.data);
    } catch (error) {
      setAssignError(
        error instanceof Error
          ? error.message
          : "Não foi possível atribuir o chamado."
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleTakeTicket() {
    if (!currentUser) {
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");

      const response = await apiFetch(
        `/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_to: currentUser.id,
          }),
        }
      );

      setTicket(response.data);
      setSelectedAssignee(String(currentUser.id));

      const historyResponse = await apiFetch(
        `/tickets/${ticketId}/history`
      );

      setHistory(historyResponse.data);
    } catch (error) {
      setAssignError(
        error instanceof Error
          ? error.message
          : "Não foi possível assumir o chamado."
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleAddComment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!commentMessage.trim()) {
      setCommentError("Digite uma mensagem antes de enviar.");
      return;
    }

    try {
      setSendingComment(true);
      setCommentError("");

      const response = await apiFetch(
        `/tickets/${ticketId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            message: commentMessage.trim(),
          }),
        }
      );

      setComments((currentComments) => [
        ...currentComments,
        response.data,
      ]);

      setCommentMessage("");
    } catch (error) {
      setCommentError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a mensagem."
      );
    } finally {
      setSendingComment(false);
    }
  }

  async function handleChangeStatus() {
    if (!ticket || !nextStatus[ticket.status]) {
      return;
    }

    const newStatus = nextStatus[ticket.status];

    try {
      setChangingStatus(true);
      setStatusError("");

      const response = await apiFetch(
        `/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      setTicket(response.data);

      const historyResponse = await apiFetch(
        `/tickets/${ticketId}/history`
      );

      setHistory(historyResponse.data);
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status."
      );
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-8 w-2/3 rounded bg-slate-200" />
              <div className="h-24 rounded bg-slate-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-xl border border-red-100 bg-red-50 p-6">
            <p className="font-mono text-xs text-red-500">
              &gt;_ ticket.error
            </p>

            <h1 className="mt-2 text-lg font-semibold text-red-800">
              Não foi possível carregar o chamado
            </h1>

            <p className="mt-1 text-sm text-red-700">
              {error || "Chamado não encontrado."}
            </p>

            <Link
              href="/tickets"
              className="mt-5 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Voltar para chamados
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";
  const isAttendant = currentUser?.role === "atendente";

  const isAssignedToCurrentUser =
    isAttendant &&
    ticket.assigned_to?.id === currentUser?.id;

  const canAssume =
    isAttendant && !ticket.assigned_to;

  const canChangeStatus =
    Boolean(nextStatus[ticket.status]) &&
    (
      isAdmin ||
      (
        isAttendant &&
        ticket.assigned_to?.id === currentUser?.id
      )
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <Link
            href="/tickets"
            className="text-xs font-medium text-slate-400 transition hover:text-blue-600"
          >
            ← Voltar para chamados
          </Link>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-blue-600">
                &gt;_ ticket.details()
              </p>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {ticket.title}
                </h1>

                <span className="font-mono text-xs text-slate-400">
                  #{ticket.id}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Criado em {formatDate(ticket.created_at)}
              </p>
            </div>

            <div className="flex gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles[ticket.status]}`}
              >
                {statusLabels[ticket.status]}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${priorityStyles[ticket.priority]}`}
              >
                {priorityLabels[ticket.priority]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* DESCRIÇÃO */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.description
                </p>

                <h2 className="mt-1 text-base font-semibold text-slate-800">
                  Descrição
                </h2>
              </div>

              <div className="px-6 py-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {ticket.description}
                </p>
              </div>
            </section>

            {/* CONVERSA */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.conversation
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      Conversa
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Comunicação sobre este chamado
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                    {comments.length}{" "}
                    {comments.length === 1
                      ? "mensagem"
                      : "mensagens"}
                  </span>
                </div>
              </div>

              <div className="max-h-[520px] space-y-5 overflow-y-auto bg-slate-50/60 px-5 py-6">
                {comments.length === 0 ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                        💬
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        Nenhuma mensagem ainda
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Inicie a conversa sobre este chamado.
                      </p>
                    </div>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const isCurrentUser =
                      currentUser?.id === comment.user?.id;

                    return (
                      <div
                        key={comment.id}
                        className={`flex ${
                          isCurrentUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="max-w-[80%]">
                          <div
                            className={`mb-1 flex items-center gap-2 ${
                              isCurrentUser
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {!isCurrentUser && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                                {comment.user?.name
                                  ?.charAt(0)
                                  .toUpperCase() ?? "A"}
                              </span>
                            )}

                            <span className="text-xs font-medium text-slate-500">
                              {isCurrentUser
                                ? "Você"
                                : comment.user?.name ?? "Usuário"}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {formatTime(comment.created_at)}
                            </span>
                          </div>

                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                              isCurrentUser
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleAddComment}
                className="border-t border-slate-200 bg-white p-4"
              >
                <div className="flex items-end gap-3">
                  <textarea
                    value={commentMessage}
                    onChange={(event) =>
                      setCommentMessage(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (
                          commentMessage.trim() &&
                          !sendingComment
                        ) {
                          event.currentTarget.form?.requestSubmit();
                        }
                      }
                    }}
                    placeholder="Escreva uma mensagem..."
                    rows={2}
                    disabled={sendingComment}
                    className="min-h-11 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />

                  <button
                    type="submit"
                    disabled={
                      sendingComment || !commentMessage.trim()
                    }
                    className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingComment ? "..." : "Enviar"}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Enter para enviar · Shift + Enter para nova linha
                  </p>

                  {commentError && (
                    <p className="text-xs text-red-600">
                      {commentError}
                    </p>
                  )}
                </div>
              </form>
            </section>

            {/* HISTÓRICO */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.history
                </p>

                <h2 className="mt-1 text-base font-semibold text-slate-800">
                  Histórico
                </h2>
              </div>

              <div className="p-6">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhum registro no histórico.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {historyActionLabel(item.action)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.user?.name ?? "Sistema"} ·{" "}
                            {formatDate(item.created_at)}
                          </p>

                          {(item.old_value || item.new_value) && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {item.old_value && (
                                <span className="rounded bg-slate-100 px-2 py-1 text-slate-500">
                                  {item.old_value}
                                </span>
                              )}

                              {item.old_value && item.new_value && (
                                <span className="text-slate-300">
                                  →
                                </span>
                              )}

                              {item.new_value && (
                                <span className="rounded bg-blue-50 px-2 py-1 text-blue-600">
                                  {item.new_value}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* LATERAL */}
          <aside className="space-y-6">
            {/* INFORMAÇÕES */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.info
                </p>

                <h2 className="mt-1 text-sm font-semibold text-slate-800">
                  Informações
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Categoria
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {ticket.category?.name ?? "Não informada"}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Solicitante
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {ticket.user?.name ?? "Não informado"}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Criado em
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400">
                    Última atualização
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatDate(ticket.updated_at)}
                  </p>
                </div>
              </div>
            </section>

            {/* ATRIBUIÇÃO */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.assignment
                </p>

                <h2 className="mt-1 text-sm font-semibold text-slate-800">
                  Atendente
                </h2>
              </div>

              <div className="p-5">
                {/* ADMIN */}
                {isAdmin && (
                  <>
                    <label
                      htmlFor="assignee"
                      className="text-xs font-medium text-slate-500"
                    >
                      Responsável pelo chamado
                    </label>

                    <select
                      id="assignee"
                      value={selectedAssignee}
                      onChange={(event) =>
                        setSelectedAssignee(event.target.value)
                      }
                      disabled={assigning}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    >
                      <option value="">
                        Selecione um atendente
                      </option>

                      {assignees.map((assignee) => (
                        <option
                          key={assignee.id}
                          value={assignee.id}
                        >
                          {assignee.name}{" "}
                          {assignee.role === "admin"
                            ? "(Admin)"
                            : "(Atendente)"}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAssign}
                      disabled={
                        assigning ||
                        !selectedAssignee ||
                        selectedAssignee ===
                          String(ticket.assigned_to?.id ?? "")
                      }
                      className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assigning
                        ? "Atribuindo..."
                        : ticket.assigned_to
                          ? "Alterar responsável"
                          : "Atribuir chamado"}
                    </button>

                    {assignError && (
                      <p className="mt-3 text-xs leading-5 text-red-600">
                        {assignError}
                      </p>
                    )}
                  </>
                )}

                {/* ATENDENTE */}
                {isAttendant && (
                  <>
                    {canAssume ? (
                      <>
                        <p className="text-xs text-slate-400">
                          Responsável atual
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-sm font-semibold text-amber-600">
                            ?
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Nenhum atendente
                            </p>

                            <p className="text-xs text-slate-400">
                              Este chamado está disponível na fila
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleTakeTicket}
                          disabled={assigning}
                          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {assigning
                            ? "Assumindo..."
                            : "Assumir chamado"}
                        </button>

                        {assignError && (
                          <p className="mt-3 text-xs leading-5 text-red-600">
                            {assignError}
                          </p>
                        )}
                      </>
                    ) : isAssignedToCurrentUser ? (
                      <>
                        <p className="text-xs text-slate-400">
                          Responsável atual
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                            {currentUser?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {currentUser?.name}
                            </p>

                            <p className="text-xs text-emerald-600">
                              Você é o responsável
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400">
                          Responsável atual
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                            {ticket.assigned_to?.name
                              ?.charAt(0)
                              .toUpperCase() ?? "—"}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {ticket.assigned_to?.name ??
                                "Não atribuído"}
                            </p>

                            <p className="text-xs text-slate-400">
                              Responsável pelo atendimento
                            </p>
                          </div>
                        </div>

                        {assignError && (
                          <p className="mt-3 text-xs leading-5 text-red-600">
                            {assignError}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* USUÁRIO COMUM */}
                {currentUser?.role === "usuario" && (
                  <>
                    <p className="text-xs text-slate-400">
                      Responsável atual
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {ticket.assigned_to?.name
                          ?.charAt(0)
                          .toUpperCase() ?? "—"}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {ticket.assigned_to?.name ??
                            "Não atribuído"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {ticket.assigned_to
                            ? "Responsável pelo atendimento"
                            : "Aguardando atribuição"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* STATUS */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="font-mono text-xs text-slate-400">
                  &gt; ticket.status
                </p>

                <h2 className="mt-1 text-sm font-semibold text-slate-800">
                  Status do chamado
                </h2>
              </div>

              <div className="p-5">
                <p className="text-xs text-slate-400">
                  Status atual
                </p>

                <div
                  className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles[ticket.status]}`}
                >
                  {statusLabels[ticket.status]}
                </div>

                {canChangeStatus ? (
                  <>
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Próxima etapa do fluxo:
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {statusLabels[nextStatus[ticket.status]!]}
                    </p>

                    <button
                      type="button"
                      onClick={handleChangeStatus}
                      disabled={changingStatus}
                      className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changingStatus
                        ? "Atualizando..."
                        : `Avançar para ${statusLabels[nextStatus[ticket.status]!]}`}
                    </button>

                    {statusError && (
                      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                        <p className="text-xs leading-5 text-red-700">
                          {statusError}
                        </p>
                      </div>
                    )}
                  </>
                ) : ticket.status === "fechado" ? (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Este chamado está fechado e não possui mais
                    alterações de status disponíveis.
                  </p>
                ) : currentUser?.role === "usuario" ? (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    O status deste chamado é atualizado pela equipe
                    de atendimento.
                  </p>
                ) : currentUser?.role === "atendente" &&
                  !ticket.assigned_to ? (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Assuma este chamado para poder avançar o status.
                  </p>
                ) : currentUser?.role === "atendente" ? (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Apenas o responsável pelo chamado pode alterar
                    o status.
                  </p>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Este chamado não possui mais alterações de
                    status disponíveis.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-mono text-xs text-blue-500">
                &gt;_ system.status
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-700">
                Este chamado está atualmente em{" "}
                <strong>
                  {statusLabels[ticket.status].toLowerCase()}
                </strong>
                .
              </p>
            </section>
          </aside>
        </div>

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
