"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

type Role = "usuario" | "atendente" | "admin";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: "baixa" | "media" | "alta" | "urgente";
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
  assigned_to?: {
    id: number;
    name: string;
  } | null;
};

type PaginatedResponse = {
  data: Ticket[];
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
  urgente: "Urgente",
};

const statusStyles: Record<Ticket["status"], string> = {
  aberto: "border-blue-200 bg-blue-50 text-blue-700",
  em_atendimento: "border-indigo-200 bg-indigo-50 text-indigo-700",
  aguardando: "border-amber-200 bg-amber-50 text-amber-700",
  resolvido: "border-emerald-200 bg-emerald-50 text-emerald-700",
  fechado: "border-slate-200 bg-slate-100 text-slate-600",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  baixa: "text-slate-500",
  media: "text-blue-600",
  alta: "text-orange-600",
  urgente: "text-red-600",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function StatCard({
  label,
  value,
  description,
  number,
}: {
  label: string;
  value: number;
  description: string;
  number: string;
}) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        px-5 py-5
        shadow-[0_4px_20px_rgba(15,23,42,0.035)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-[0_10px_30px_rgba(15,23,42,0.07)]
      "
    >
      {/* detalhe azul */}
      <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-[30px] font-bold leading-none tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-[12px] text-slate-400">
            {description}
          </p>
        </div>

        <span
          className="
            font-terminal
            text-[11px]
            font-bold
            text-blue-200
            transition-colors
            group-hover:text-blue-500
          "
        >
          {number}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [resolved, setResolved] = useState(0);

  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          allResponse,
          openResponse,
          progressResponse,
          resolvedResponse,
        ] = await Promise.all([
          apiFetch("/tickets"),
          apiFetch("/tickets?status=aberto"),
          apiFetch("/tickets?status=em_atendimento"),
          apiFetch("/tickets?status=resolvido"),
        ]);

        const all = allResponse as PaginatedResponse;

        setTotal(all.total);
        setOpen((openResponse as PaginatedResponse).total);
        setInProgress((progressResponse as PaginatedResponse).total);
        setResolved((resolvedResponse as PaginatedResponse).total);

        setRecentTickets(all.data.slice(0, 5));
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const dashboardTitle =
    user?.role === "admin"
      ? "Visão geral"
      : user?.role === "atendente"
        ? "Central de atendimento"
        : "Meus chamados";

  const dashboardDescription =
    user?.role === "admin"
      ? "Acompanhe a operação do suporte."
      : user?.role === "atendente"
        ? "Acompanhe os chamados disponíveis para atendimento."
        : "Acompanhe suas solicitações de suporte.";

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Header />

      <main className="mx-auto max-w-[1400px] px-5 py-7 sm:px-7 lg:px-8">

        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <section
          className="
            relative overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            px-6 py-7
            shadow-[0_4px_20px_rgba(15,23,42,0.035)]
            sm:px-8
          "
        >
          {/* decoração */}

          <div className="absolute right-7 top-7 hidden sm:flex">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-[1px] ${
                    index % 4 === 0
                      ? "bg-blue-500"
                      : "bg-blue-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative">

            <div className="flex items-center gap-2">
              <span className="font-terminal text-sm font-bold text-blue-600">
                &gt;_
              </span>

              <span className="font-terminal text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                dashboard
              </span>

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </div>

            <h1 className="mt-4 text-[28px] font-bold tracking-tight text-[#12316b] sm:text-[32px]">
              {dashboardTitle}
            </h1>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              {dashboardDescription}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />

            <span className="font-terminal text-[9px] uppercase tracking-[0.12em] text-slate-300">
              system.ready
            </span>

            <span className="h-1.5 w-1.5 rounded-[1px] bg-blue-500" />
          </div>
        </section>

        {/* =====================================================
            ERRO
        ====================================================== */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            RESUMO
        ====================================================== */}

        <section className="mt-7">

          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-[14px] font-semibold text-slate-700">
              Resumo
            </h2>

            <div className="h-px flex-1 bg-slate-200" />

            <span className="font-terminal text-[9px] text-slate-300">
              OVERVIEW
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              label="Chamados"
              value={loading ? 0 : total}
              description="Total disponível"
              number="01"
            />

            <StatCard
              label="Abertos"
              value={loading ? 0 : open}
              description="Aguardando atendimento"
              number="02"
            />

            <StatCard
              label="Em atendimento"
              value={loading ? 0 : inProgress}
              description="Sendo acompanhados"
              number="03"
            />

            <StatCard
              label="Resolvidos"
              value={loading ? 0 : resolved}
              description="Atendimentos concluídos"
              number="04"
            />

          </div>
        </section>

        {/* =====================================================
            CHAMADOS RECENTES
        ====================================================== */}

        <section className="mt-8">

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-semibold text-slate-700">
                Chamados recentes
              </h2>

              <span className="hidden font-terminal text-[9px] uppercase tracking-wider text-slate-300 sm:block">
                latest
              </span>
            </div>

            <Link
              href="/tickets"
              className="
                text-[12px]
                font-semibold
                text-blue-600
                transition-colors
                hover:text-blue-800
              "
            >
              Ver todos →
            </Link>
          </div>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-[0_4px_20px_rgba(15,23,42,0.035)]
            "
          >

            {/* loading */}

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[68px] animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : recentTickets.length === 0 ? (

              /* vazio */

              <div className="px-6 py-16 text-center">

                <div
                  className="
                    mx-auto flex h-12 w-12
                    items-center justify-center
                    rounded-xl
                    bg-blue-50
                    font-terminal
                    text-sm
                    text-blue-500
                  "
                >
                  &gt;_
                </div>

                <p className="mt-4 text-[14px] font-semibold text-slate-700">
                  Nenhum chamado encontrado
                </p>

                <p className="mt-1 text-[12px] text-slate-400">
                  Os chamados aparecerão aqui quando forem criados.
                </p>

              </div>

            ) : (

              /* lista */

              <div className="divide-y divide-slate-100">

                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="
                      group
                      flex items-center gap-4
                      px-5 py-4
                      transition-colors duration-200
                      hover:bg-blue-50/40
                    "
                  >

                    {/* ID */}

                    <div
                      className="
                        hidden h-10 w-10 shrink-0
                        items-center justify-center
                        rounded-lg
                        border border-blue-100
                        bg-blue-50
                        font-terminal
                        text-[10px]
                        font-bold
                        text-blue-500
                        sm:flex
                      "
                    >
                      #{String(ticket.id).padStart(3, "0")}
                    </div>

                    {/* informações */}

                    <div className="min-w-0 flex-1">

                      <p
                        className="
                          truncate
                          text-[14px]
                          font-semibold
                          text-slate-800
                          transition-colors
                          group-hover:text-blue-700
                        "
                      >
                        {ticket.title}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2 text-[12px] text-slate-400">
                        <span>
                          {ticket.category?.name ?? "Sem categoria"}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>

                    </div>

                    {/* prioridade */}

                    <div className="hidden min-w-[70px] text-right sm:block">
                      <span
                        className={`
                          font-terminal
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          ${priorityStyles[ticket.priority]}
                        `}
                      >
                        {priorityLabels[ticket.priority]}
                      </span>
                    </div>

                    {/* status */}

                    <span
                      className={`
                        rounded-full
                        border
                        px-3 py-1.5
                        text-[10px]
                        font-semibold
                        ${statusStyles[ticket.status]}
                      `}
                    >
                      {statusLabels[ticket.status]}
                    </span>

                    {/* seta */}

                    <span
                      className="
                        text-slate-300
                        transition-all duration-200
                        group-hover:translate-x-1
                        group-hover:text-blue-500
                      "
                    >
                      →
                    </span>

                  </Link>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            RODAPÉ
        ====================================================== */}

        <footer
          className="
            mt-8
            flex items-center justify-between
            border-t border-slate-200
            pt-4
          "
        >
          <span className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
            helpdesk / dashboard
          </span>

          <span className="flex items-center gap-2 font-terminal text-[9px] text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            online
          </span>
        </footer>

      </main>
    </div>
  );
}
