"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { apiFetch } from "@/lib/api";

type Role = "usuario" | "atendente" | "admin";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

const BLUE = "#12316b";

const roleLabels: Record<Role, string> = {
  usuario: "Usuário",
  atendente: "Atendente",
  admin: "Administrador",
};

const roleStyles: Record<Role, string> = {
  usuario: "border-slate-200 bg-slate-50 text-slate-600",
  atendente: "border-blue-100 bg-blue-50 text-blue-700",
  admin: "border-violet-100 bg-violet-50 text-violet-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUserId, setEditingUserId] = useState<number | null>(
    null
  );

  const [selectedRole, setSelectedRole] = useState<Role>("usuario");

  const [savingUserId, setSavingUserId] = useState<number | null>(
    null
  );

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch("/users/assignees");

        setUsers(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os usuários."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const admins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const attendants = users.filter(
    (user) => user.role === "atendente"
  ).length;

  const regularUsers = users.filter(
    (user) => user.role === "usuario"
  ).length;

  function startEditing(user: User) {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingUserId(null);
    setSelectedRole("usuario");
  }

  async function handleRoleChange(userId: number) {
    if (savingUserId !== null) {
      return;
    }

    try {
      setSavingUserId(userId);
      setError("");
      setSuccessMessage("");

      const response = await apiFetch(
        `/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role: selectedRole,
          }),
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: response.data.role,
              }
            : user
        )
      );

      setEditingUserId(null);

      setSuccessMessage(
        "Função do usuário alterada com sucesso."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a função do usuário."
      );
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <Header />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-10">
        {/* BREADCRUMB */}

        <div className="mb-7 flex items-center gap-2 text-xs">
          <span
            className="font-medium"
            style={{ color: BLUE }}
          >
            Administração
          </span>

          <span className="text-slate-300">/</span>

          <span className="font-medium text-slate-500">
            Usuários
          </span>
        </div>

        {/* CABEÇALHO */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:flex"
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
                users.list()
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Usuários
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Gerencie os usuários e defina a função de cada
                pessoa no sistema.
              </p>
            </div>
          </div>

          <span
            className="self-start rounded-md border px-2.5 py-1.5 font-terminal text-[9px] uppercase tracking-[0.12em]"
            style={{
              color: BLUE,
              borderColor: `${BLUE}20`,
              backgroundColor: `${BLUE}08`,
            }}
          >
            GET /users
          </span>
        </div>

        {/* MENSAGEM DE SUCESSO */}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* RESUMO */}

        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
              system.users
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "—" : users.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Usuários cadastrados
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
              administrators
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "—" : admins}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Administradores
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
              attendants
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "—" : attendants}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Atendentes
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
              regular.users
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "—" : regularUsers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Usuários comuns
            </p>
          </div>
        </div>

        {/* TABELA */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-terminal text-[9px] uppercase tracking-[0.14em] text-slate-400">
                users.management
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-800">
                Gerenciamento de usuários
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Altere a função de cada usuário conforme a
                necessidade do sistema.
              </p>
            </div>

            <span className="font-terminal text-[9px] uppercase tracking-[0.1em] text-slate-300">
              {loading
                ? "loading..."
                : `${users.length} registro${
                    users.length === 1 ? "" : "s"
                  }`}
            </span>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="h-2.5 w-56 rounded bg-slate-100" />
                  </div>

                  <div className="h-7 w-24 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* ERRO */}

          {!loading && error && (
            <div className="p-8">
              <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                <p className="font-terminal text-[10px] uppercase tracking-[0.12em] text-red-500">
                  &gt;_ users.error
                </p>

                <p className="mt-2 text-sm font-semibold text-red-800">
                  Não foi possível carregar os usuários.
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* VAZIO */}

          {!loading && !error && users.length === 0 && (
            <div className="px-6 py-14 text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${BLUE}0b`,
                  color: BLUE,
                }}
              >
                #
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Nenhum usuário encontrado
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Não existem usuários cadastrados no sistema.
              </p>
            </div>
          )}

          {/* TABELA */}

          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Usuário
                    </th>

                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      E-mail
                    </th>

                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Função
                    </th>

                    <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Identificação
                    </th>

                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const isEditing =
                      editingUserId === user.id;

                    const isSaving =
                      savingUserId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                      >
                        {/* USUÁRIO */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
                              style={{
                                color: BLUE,
                                backgroundColor: `${BLUE}0b`,
                                border: `1px solid ${BLUE}12`,
                              }}
                            >
                              {user.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {user.name}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Usuário #{user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {user.email}
                          </span>
                        </td>

                        {/* FUNÇÃO */}

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={selectedRole}
                              onChange={(event) =>
                                setSelectedRole(
                                  event.target.value as Role
                                )
                              }
                              disabled={isSaving}
                              className="
                                h-9
                                rounded-lg
                                border
                                border-blue-200
                                bg-white
                                px-3
                                text-xs
                                font-medium
                                text-slate-700
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-50
                              "
                            >
                              <option value="usuario">
                                Usuário
                              </option>

                              <option value="atendente">
                                Atendente
                              </option>

                              <option value="admin">
                                Administrador
                              </option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${roleStyles[user.role]}`}
                            >
                              <span
                                className="mr-1.5 h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    user.role === "admin"
                                      ? "#8b5cf6"
                                      : user.role ===
                                          "atendente"
                                        ? BLUE
                                        : "#94a3b8",
                                }}
                              />

                              {roleLabels[user.role]}
                            </span>
                          )}
                        </td>

                        {/* ID */}

                        <td className="px-6 py-4">
                          <span className="font-terminal text-[10px] text-slate-400">
                            USER-
                            {String(user.id).padStart(4, "0")}
                          </span>
                        </td>

                        {/* AÇÃO */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  disabled={isSaving}
                                  className="
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    transition
                                    hover:border-slate-300
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  Cancelar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRoleChange(user.id)
                                  }
                                  disabled={isSaving}
                                  className="
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-white
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                  style={{
                                    backgroundColor: BLUE,
                                  }}
                                >
                                  {isSaving
                                    ? "Salvando..."
                                    : "Salvar"}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(user)
                                }
                                className="
                                  rounded-lg
                                  border
                                  border-blue-100
                                  bg-blue-50
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-blue-700
                                  transition
                                  hover:border-blue-200
                                  hover:bg-blue-100
                                "
                              >
                                Alterar função
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* INFORMAÇÃO */}

        <div
          className="mt-5 rounded-2xl border bg-white p-5"
          style={{
            borderColor: `${BLUE}18`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-terminal text-xs"
              style={{
                color: BLUE,
                backgroundColor: `${BLUE}0b`,
              }}
            >
              &gt;_
            </div>

            <div>
              <p
                className="font-terminal text-[9px] uppercase tracking-[0.14em]"
                style={{ color: BLUE }}
              >
                role.management
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Administradores podem alterar a função dos
                usuários entre Usuário, Atendente e Administrador.
                A alteração é aplicada diretamente pela API.
              </p>
            </div>
          </div>
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
