"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  active: boolean;
};

const BLUE = "#12316b";

export default function NewTicketPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState("media");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiFetch("/categories");

        setCategories(
          response.data.filter((category: Category) => category.active)
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as categorias."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          category_id: Number(categoryId),
          priority,
        }),
      });

      router.push(`/tickets/${response.data.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o chamado."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <Header />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:py-10">

        {/* CAMINHO */}
        <div className="mb-7 flex items-center gap-2 text-xs">
          <Link
            href="/tickets"
            className="font-medium text-slate-400 transition hover:text-[#12316b]"
          >
            Chamados
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-medium text-slate-600">
            Novo chamado
          </span>
        </div>

        {/* CABEÇALHO */}
        <div className="mb-8">
          <div className="flex items-start gap-4">

            <div
              className="
                hidden h-12 w-12 shrink-0
                items-center justify-center
                rounded-xl
                sm:flex
              "
              style={{
                backgroundColor: `${BLUE}0d`,
                border: `1px solid ${BLUE}20`,
              }}
            >
              <span
                className="font-terminal text-lg"
                style={{ color: BLUE }}
              >
                &gt;_
              </span>
            </div>

            <div>
              <p
                className="mb-1 font-terminal text-[10px] uppercase tracking-[0.16em]"
                style={{ color: BLUE }}
              >
                tickets.create()
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Abrir novo chamado
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Informe os detalhes da solicitação para que a equipe
                possa analisar e realizar o atendimento.
              </p>
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* FORMULÁRIO */}
          <form
            onSubmit={handleSubmit}
            className="
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            "
          >
            {/* TOPO */}
            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center justify-between">

                <div>
                  <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
                    ticket.form
                  </p>

                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Informações do chamado
                  </h2>
                </div>

                <span
                  className="
                    hidden
                    rounded-md
                    border
                    px-2 py-1
                    font-terminal
                    text-[9px]
                    uppercase
                    tracking-wider
                    sm:block
                  "
                  style={{
                    color: BLUE,
                    borderColor: `${BLUE}20`,
                    backgroundColor: `${BLUE}08`,
                  }}
                >
                  required
                </span>
              </div>
            </div>

            <div className="space-y-7 p-6 sm:p-7">

              {/* TÍTULO */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-[13px] font-semibold text-slate-700"
                >
                  Título
                  <span className="ml-1 text-red-400">*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Computador não liga"
                  required
                  maxLength={255}
                  className="
                    w-full
                    rounded-xl
                    border border-slate-200
                    bg-slate-50/50
                    px-4 py-3.5
                    text-sm text-slate-900
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    hover:border-slate-300
                    focus:border-[#12316b]
                    focus:bg-white
                    focus:ring-4 focus:ring-[#12316b]/5
                  "
                />

                <p className="mt-2 text-[11px] text-slate-400">
                  Um título curto que identifique o problema ou solicitação.
                </p>
              </div>

              {/* CATEGORIA + PRIORIDADE */}
              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-[13px] font-semibold text-slate-700"
                  >
                    Categoria
                    <span className="ml-1 text-red-400">*</span>
                  </label>

                  <select
                    id="category"
                    value={categoryId}
                    onChange={(event) =>
                      setCategoryId(event.target.value)
                    }
                    required
                    disabled={loadingCategories}
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50/50
                      px-3.5 py-3.5
                      text-sm text-slate-700
                      outline-none
                      transition-all
                      hover:border-slate-300
                      focus:border-[#12316b]
                      focus:bg-white
                      focus:ring-4 focus:ring-[#12316b]/5
                      disabled:cursor-not-allowed
                      disabled:text-slate-400
                    "
                  >
                    <option value="">
                      {loadingCategories
                        ? "Carregando..."
                        : "Selecione uma categoria"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Escolha o assunto mais próximo da solicitação.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-[13px] font-semibold text-slate-700"
                  >
                    Prioridade
                    <span className="ml-1 text-red-400">*</span>
                  </label>

                  <select
                    id="priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
                    required
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50/50
                      px-3.5 py-3.5
                      text-sm text-slate-700
                      outline-none
                      transition-all
                      hover:border-slate-300
                      focus:border-[#12316b]
                      focus:bg-white
                      focus:ring-4 focus:ring-[#12316b]/5
                    "
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Indique a urgência percebida da solicitação.
                  </p>
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="block text-[13px] font-semibold text-slate-700"
                  >
                    Descrição
                    <span className="ml-1 text-red-400">*</span>
                  </label>

                  <span className="font-terminal text-[9px] text-slate-300">
                    description
                  </span>
                </div>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Explique o que aconteceu, quando começou, o que você estava fazendo e qualquer informação que possa ajudar no atendimento..."
                  required
                  rows={8}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border border-slate-200
                    bg-slate-50/50
                    px-4 py-3.5
                    text-sm leading-6 text-slate-900
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    hover:border-slate-300
                    focus:border-[#12316b]
                    focus:bg-white
                    focus:ring-4 focus:ring-[#12316b]/5
                  "
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Quanto mais detalhes, mais fácil será identificar
                    e resolver o problema.
                  </p>

                  <span className="font-terminal text-[9px] text-slate-300">
                    {description.length}
                  </span>
                </div>
              </div>

              {/* ERRO */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3.5">
                  <div className="flex gap-3">
                    <span className="font-terminal text-xs text-red-500">
                      !
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-red-700">
                        Não foi possível criar o chamado.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AÇÕES */}
            <div
              className="
                flex flex-col-reverse gap-3
                border-t border-slate-100
                bg-slate-50/60
                px-6 py-5
                sm:flex-row sm:justify-end
                sm:px-7
              "
            >
              <Link
                href="/tickets"
                className="
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-5 py-3
                  text-center
                  text-sm font-medium
                  text-slate-600
                  transition-all
                  hover:border-slate-300
                  hover:bg-slate-50
                "
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={loading || loadingCategories}
                className="
                  rounded-xl
                  px-6 py-3
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
                style={{
                  backgroundColor: BLUE,
                }}
              >
                {loading ? "Criando chamado..." : "Criar chamado"}
              </button>
            </div>
          </form>

          {/* LATERAL */}
          <aside className="space-y-5">

            {/* RESUMO */}
            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                bg-white
                shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              "
              style={{ borderColor: `${BLUE}18` }}
            >
              <div
                className="h-1"
                style={{ backgroundColor: BLUE }}
              />

              <div className="p-5">
                <p
                  className="font-terminal text-[9px] uppercase tracking-[0.14em]"
                  style={{ color: BLUE }}
                >
                  ticket.status
                </p>

                <h3 className="mt-2 text-sm font-semibold text-slate-800">
                  Após criar
                </h3>

                <div className="mt-4 space-y-3">

                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        color: BLUE,
                        backgroundColor: `${BLUE}0b`,
                      }}
                    >
                      01
                    </span>

                    <span className="text-xs text-slate-600">
                      O chamado será registrado
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        color: BLUE,
                        backgroundColor: `${BLUE}0b`,
                      }}
                    >
                      02
                    </span>

                    <span className="text-xs text-slate-600">
                      O status inicial será <strong>Aberto</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        color: BLUE,
                        backgroundColor: `${BLUE}0b`,
                      }}
                    >
                      03
                    </span>

                    <span className="text-xs text-slate-600">
                      A equipe poderá assumir o atendimento
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* DICA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <span
                  className="font-terminal text-xs"
                  style={{ color: BLUE }}
                >
                  &gt;_
                </span>

                <p className="text-xs font-semibold text-slate-700">
                  Dica
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Se o problema apresentar uma mensagem de erro,
                inclua o texto exato na descrição. Isso ajuda a
                equipe a identificar a causa mais rapidamente.
              </p>
            </div>

            {/* IDENTIFICADOR */}
            <div className="px-1">
              <p className="font-terminal text-[9px] uppercase tracking-[0.12em] text-slate-300">
                &gt; helpdesk.ticket.new
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Todos os campos marcados com * são obrigatórios.
              </p>
            </div>
          </aside>
        </div>

        {/* RODAPÉ */}
        <div className="mt-9 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="font-terminal text-[9px] uppercase tracking-[0.1em] text-slate-300">
            &gt; api.connected
          </span>

          <span className="text-[10px] text-slate-400">
            HelpDesk · v1.0.0
          </span>
        </div>
      </main>
    </div>
  );
}
