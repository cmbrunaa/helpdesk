"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (remember) {
        localStorage.setItem("remember", "true");
      } else {
        localStorage.removeItem("remember");
      }

      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4fb] p-1.5">
      <div className="flex min-h-[calc(100vh-12px)] overflow-hidden rounded-md border border-blue-200 bg-white shadow-[0_2px_15px_rgba(15,23,42,0.08)]">
        {/* =====================================================
            PAINEL ESQUERDO
        ====================================================== */}

        <section className="relative hidden w-[42%] overflow-hidden bg-[#0757d5] text-white lg:flex">
          {/* detalhe pixelado superior */}

          <div className="absolute right-8 top-8 grid grid-cols-4 gap-1.5 opacity-40">
            {Array.from({ length: 16 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-[1px] ${
                  index % 4 === 0
                    ? "bg-cyan-200"
                    : "bg-blue-300"
                }`}
              />
            ))}
          </div>

          {/* marca */}

          <div className="absolute left-10 top-9">
            <div className="font-terminal text-[11px] font-bold tracking-[0.12em]">
              <span className="mr-1 text-cyan-200">&gt;_</span>
              HELPDESK
            </div>
          </div>

          <div className="flex h-full w-full flex-col px-10 pb-7 pt-24 xl:px-12">
            {/* texto */}

            <div className="relative z-10 max-w-[410px]">
              <h1 className="font-pixel text-[20px] font-normal leading-[1.7] tracking-tight text-white xl:text-[22px]">
                Chamados,
                <br />
                pessoas e soluções
                <br />
                em um só lugar.
              </h1>

              <p className="font-terminal mt-5 max-w-[300px] text-[11px] leading-5 text-blue-100 xl:text-xs">
                Suporte simples, organizado
                <br />
                e eficiente.
              </p>

              <div className="mt-4 h-[3px] w-9 bg-cyan-300" />
            </div>

            {/* arte */}

            <div className="flex flex-1 items-center justify-center px-2 py-8">
              <img
                src="/login-art.png"
                alt=""
                className="
                  w-full
                  max-w-[430px]
                  object-contain
                "
              />
            </div>

            {/* rodapé */}

            <div className="font-terminal flex items-center justify-between pt-4 text-[8px] text-blue-200">
              <div className="flex items-center gap-2">
                <span>v1.0.0</span>
                <span className="opacity-40">|</span>
                <span>HelpDesk</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>system.online</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PAINEL DIREITO
        ====================================================== */}

        <section className="flex flex-1 items-center justify-center bg-white px-8 py-12 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[520px]">
            {/* logo */}

            <div className="mb-10">
              <Link
                href="/login"
                className="inline-flex transition-transform duration-200 hover:-translate-y-0.5"
              >
                <img
                  src="/logo.png"
                  alt="HelpDesk"
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* título */}

            <div className="mb-9">
              <h2 className="text-[25px] font-bold tracking-tight text-[#102f68]">
                Faça login para continuar
              </h2>

              <p className="mt-2.5 text-sm text-slate-500">
                Acesse sua conta para acompanhar seus chamados.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* E-MAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  E-mail
                </label>

                <div className="relative">
                  <span className="font-terminal pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-blue-400">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className="
                      h-12
                      w-full
                      rounded-md
                      border
                      border-blue-100
                      bg-white
                      pl-10
                      pr-4
                      text-sm
                      text-slate-800
                      shadow-[0_1px_3px_rgba(15,23,42,0.03)]
                      outline-none
                      transition
                      placeholder:text-slate-300
                      hover:border-blue-200
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />
                </div>
              </div>

              {/* SENHA */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Senha
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <div className="relative">
                  <span className="font-terminal pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-blue-400">
                    #
                  </span>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    required
                    className="
                      h-12
                      w-full
                      rounded-md
                      border
                      border-blue-100
                      bg-white
                      pl-10
                      pr-4
                      text-sm
                      text-slate-800
                      shadow-[0_1px_3px_rgba(15,23,42,0.03)]
                      outline-none
                      transition
                      placeholder:text-slate-300
                      hover:border-blue-200
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />
                </div>
              </div>

              {/* lembrar */}

              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(event.target.checked)
                    }
                    className="
                      h-4
                      w-4
                      rounded
                      border-slate-300
                      text-blue-600
                      focus:ring-blue-500
                    "
                  />

                  <span className="text-sm text-slate-500">
                    Lembrar de mim
                  </span>
                </label>
              </div>

              {/* erro */}

              {error && (
                <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* botão */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-md
                  bg-[#1764f5]
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_5px_15px_rgba(23,100,245,0.20)]
                  transition-all
                  duration-200
                  hover:bg-[#0f56db]
                  hover:shadow-[0_7px_20px_rgba(23,100,245,0.25)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? "Entrando..." : "Entrar"}

                {!loading && (
                  <span className="text-base leading-none">→</span>
                )}
              </button>
            </form>

            {/* separador */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />

              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                ou
              </span>

              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* SSO */}

            <button
              type="button"
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-md
                border
                border-blue-100
                bg-white
                text-sm
                font-medium
                text-slate-500
                transition
                hover:border-blue-200
                hover:bg-blue-50/40
              "
            >
              <span className="text-blue-500">◈</span>
              Entrar com SSO
            </button>

            {/* cadastro */}

            <div className="mt-9 border-t border-slate-100 pt-7 text-center">
              <p className="text-sm text-slate-500">
                Ainda não possui uma conta?
              </p>

              <Link
                href="/register"
                className="
                  mt-2
                  inline-block
                  text-sm
                  font-semibold
                  text-blue-600
                  transition-colors
                  hover:text-blue-800
                "
              >
                Criar uma conta
              </Link>
            </div>

            {/* rodapé */}

            <div className="mt-9 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-100" />

              <span className="font-terminal text-[9px] uppercase tracking-[0.15em] text-slate-300">
                secure / helpdesk
              </span>

              <span className="h-px w-8 bg-blue-100" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
