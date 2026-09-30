"use client";

import { FormEvent, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "usuario" | "atendente" | "admin";
};

export default function CategoriesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [changingStatus, setChangingStatus] = useState<number | null>(
    null
  );

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

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/categories");

      setCategories(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as categorias."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const isAdmin = user?.role === "admin";

  function openCreateModal() {
    setEditingCategory(null);
    setName("");
    setActive(true);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setActive(category.active);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCategory(null);
    setName("");
    setActive(true);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingCategory) {
        const response = await apiFetch(
          `/categories/${editingCategory.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: name.trim(),
              active,
            }),
          }
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === editingCategory.id
              ? response.data
              : category
          )
        );
      } else {
        const response = await apiFetch("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            active,
          }),
        });

        setCategories((currentCategories) => [
          ...currentCategories,
          response.data,
        ]);
      }

      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a categoria."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(category: Category) {
    try {
      setChangingStatus(category.id);

      const response = await apiFetch(
        `/categories/${category.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: category.name,
            active: !category.active,
          }),
        }
      );

      setCategories((currentCategories) =>
        currentCategories.map((item) =>
          item.id === category.id ? response.data : item
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status da categoria."
      );
    } finally {
      setChangingStatus(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa]">
      <Header />

      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-6 lg:py-10">

        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <section className="mb-7">
          <div
            className="
              relative overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              px-6 py-6
              shadow-[0_4px_20px_rgba(18,49,107,0.05)]
              sm:px-8
            "
          >
            {/* detalhe decorativo */}

            <div
              className="
                absolute right-0 top-0
                h-full w-1
                bg-[#12316b]
              "
            />

            <div className="relative">
              <div className="flex items-center gap-2">
                <span
                  className="
                    font-mono
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#12316b]
                  "
                >
                  &gt;_ categories
                </span>

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>

              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-[#12316b]">
                    Categorias
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Gerencie as categorias utilizadas nos chamados.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="
                      inline-flex items-center justify-center
                      rounded-lg
                      bg-[#12316b]
                      px-4 py-2.5
                      text-sm font-semibold
                      text-white
                      shadow-[0_4px_12px_rgba(18,49,107,0.18)]
                      transition-all duration-200
                      hover:-translate-y-0.5
                      hover:bg-[#0d2858]
                      hover:shadow-[0_7px_18px_rgba(18,49,107,0.22)]
                    "
                  >
                    <span className="mr-2 font-mono text-sm">+</span>
                    Nova categoria
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTEÚDO
        ====================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-[0_4px_20px_rgba(18,49,107,0.05)]
          "
        >
          {/* Header da tabela */}

          <div
            className="
              flex flex-col gap-3
              border-b border-slate-200
              bg-[#f8fafc]
              px-6 py-5
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#12316b]">
                  Categorias cadastradas
                </span>

                {!loading && (
                  <span
                    className="
                      rounded-md
                      bg-[#12316b]/[0.07]
                      px-2 py-0.5
                      font-mono
                      text-[10px]
                      font-semibold
                      text-[#12316b]
                    "
                  >
                    {categories.length}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {loading
                  ? "Carregando categorias..."
                  : "Categorias disponíveis no sistema."}
              </p>
            </div>

            <span
              className="
                self-start
                rounded-md
                border border-slate-200
                bg-white
                px-2.5 py-1.5
                font-mono
                text-[10px]
                text-slate-400
                sm:self-auto
              "
            >
              GET /categories
            </span>
          </div>

          {/* Loading */}

          {loading && (
            <div className="px-6 py-16 text-center">
              <div
                className="
                  mx-auto mb-3
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-[#12316b]/[0.06]
                  text-[#12316b]
                "
              >
                <span className="font-mono text-sm animate-pulse">
                  &gt;_
                </span>
              </div>

              <p className="font-mono text-xs text-slate-400">
                loading.categories()
              </p>
            </div>
          )}

          {/* Erro */}

          {!loading && error && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                !
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Não foi possível carregar as categorias.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadCategories}
                className="
                  mt-5
                  rounded-lg
                  border border-slate-200
                  bg-white
                  px-4 py-2
                  text-xs font-semibold
                  text-slate-600
                  transition
                  hover:border-[#12316b]/20
                  hover:bg-[#12316b]/[0.04]
                  hover:text-[#12316b]
                "
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Vazio */}

          {!loading && !error && categories.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div
                className="
                  mx-auto mb-4
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl
                  bg-[#12316b]/[0.06]
                  font-mono
                  text-[#12316b]
                "
              >
                #
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Nenhuma categoria cadastrada.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Crie uma categoria para começar a organizar os chamados.
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="
                    mt-5
                    rounded-lg
                    bg-[#12316b]
                    px-4 py-2.5
                    text-xs font-semibold
                    text-white
                    transition
                    hover:bg-[#0d2858]
                  "
                >
                  Criar primeira categoria
                </button>
              )}
            </div>
          )}

          {/* Tabela */}

          {!loading && !error && categories.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="
                      border-b border-slate-200
                      bg-[#f8fafc]
                      text-left
                    "
                  >
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Categoria
                    </th>

                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Identificador
                    </th>

                    {isAdmin && (
                      <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="
                        border-b border-slate-100
                        transition-colors
                        last:border-0
                        hover:bg-[#f8fafc]
                      "
                    >
                      {/* Categoria */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex h-9 w-9
                              shrink-0
                              items-center justify-center
                              rounded-lg
                              bg-[#12316b]/[0.07]
                              font-mono
                              text-xs font-bold
                              text-[#12316b]
                            "
                          >
                            #
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Categoria de chamado
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            rounded-md
                            border
                            px-2.5 py-1
                            text-[11px]
                            font-semibold
                            ${
                              category.active
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            }
                          `}
                        >
                          <span
                            className={`
                              h-1.5 w-1.5 rounded-full
                              ${
                                category.active
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }
                            `}
                          />

                          {category.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>

                      {/* ID */}

                      <td className="px-6 py-4">
                        <span
                          className="
                            rounded-md
                            bg-slate-100
                            px-2 py-1
                            font-mono
                            text-[10px]
                            font-medium
                            text-slate-400
                          "
                        >
                          #{String(category.id).padStart(4, "0")}
                        </span>
                      </td>

                      {/* Ações */}

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(category)
                              }
                              className="
                                rounded-lg
                                border border-slate-200
                                bg-white
                                px-3 py-1.5
                                text-xs font-semibold
                                text-slate-600
                                transition-all
                                hover:border-[#12316b]/20
                                hover:bg-[#12316b]/[0.04]
                                hover:text-[#12316b]
                              "
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(category)
                              }
                              disabled={
                                changingStatus === category.id
                              }
                              className="
                                rounded-lg
                                border border-slate-200
                                bg-white
                                px-3 py-1.5
                                text-xs font-semibold
                                text-slate-500
                                transition-all
                                hover:border-slate-300
                                hover:bg-slate-50
                                hover:text-slate-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {changingStatus === category.id
                                ? "..."
                                : category.active
                                  ? "Desativar"
                                  : "Ativar"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            INFORMAÇÃO
        ====================================================== */}

        <div
          className="
            mt-5
            flex gap-3
            rounded-xl
            border border-[#12316b]/10
            bg-[#12316b]/[0.045]
            px-5 py-4
          "
        >
          <div
            className="
              mt-0.5
              flex h-7 w-7
              shrink-0
              items-center justify-center
              rounded-lg
              bg-white
              font-mono
              text-[10px]
              font-bold
              text-[#12316b]
              shadow-sm
            "
          >
            &gt;_
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#12316b]">
              category.status
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Categorias inativas não aparecem como opção ao criar
              novos chamados.
            </p>
          </div>
        </div>

        {/* =====================================================
            RODAPÉ
        ====================================================== */}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            &gt;_ api.connected
          </span>

          <span className="text-[11px] text-slate-400">
            HelpDesk · v1.0.0
          </span>
        </div>
      </main>

      {/* =====================================================
          MODAL
      ====================================================== */}

      {modalOpen && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-[#07152f]/45
            px-5 py-8
            backdrop-blur-[2px]
          "
        >
          <div
            className="
              w-full max-w-md
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-[0_25px_70px_rgba(7,21,47,0.20)]
            "
          >
            {/* Modal header */}

            <div
              className="
                border-b border-slate-200
                bg-[#f8fafc]
                px-6 py-5
              "
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#12316b]">
                &gt;_ category.{editingCategory ? "edit" : "create"}()
              </p>

              <h2 className="mt-2 text-lg font-bold text-[#12316b]">
                {editingCategory
                  ? "Editar categoria"
                  : "Nova categoria"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingCategory
                  ? "Atualize os dados da categoria."
                  : "Cadastre uma nova categoria para os chamados."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">

                {/* Nome */}

                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Nome da categoria
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Ex.: Hardware"
                    maxLength={100}
                    autoFocus
                    required
                    disabled={saving}
                    className="
                      w-full
                      rounded-lg
                      border border-slate-200
                      bg-white
                      px-4 py-3
                      text-sm text-slate-800
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-[#12316b]
                      focus:ring-4
                      focus:ring-[#12316b]/[0.08]
                      disabled:bg-slate-50
                      disabled:opacity-70
                    "
                  />
                </div>

                {/* Ativo */}

                <label
                  className="
                    flex cursor-pointer items-start gap-3
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    p-4
                    transition
                    hover:border-[#12316b]/20
                    hover:bg-[#12316b]/[0.025]
                  "
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(event) =>
                      setActive(event.target.checked)
                    }
                    disabled={saving}
                    className="
                      mt-0.5
                      h-4 w-4
                      rounded
                      border-slate-300
                      text-[#12316b]
                      focus:ring-[#12316b]
                    "
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Categoria ativa
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-400">
                      Categorias ativas podem ser utilizadas em novos
                      chamados.
                    </p>
                  </div>
                </label>

                {/* Erro */}

                {formError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-xs leading-5 text-red-700">
                      {formError}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal footer */}

              <div
                className="
                  flex flex-col-reverse gap-3
                  border-t border-slate-200
                  bg-[#f8fafc]
                  px-6 py-4
                  sm:flex-row sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    rounded-lg
                    border border-slate-200
                    bg-white
                    px-4 py-2.5
                    text-sm font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="
                    rounded-lg
                    bg-[#12316b]
                    px-5 py-2.5
                    text-sm font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#0d2858]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Salvando..."
                    : editingCategory
                      ? "Salvar alterações"
                      : "Criar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
