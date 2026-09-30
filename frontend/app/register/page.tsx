"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== passwordConfirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="h-1.5 bg-[#1764f5]" />

      <div className="flex min-h-[calc(100vh-6px)] items-center justify-center px-5 py-10 lg:px-8">
        <div className="w-full max-w-[1100px]">

          {/* LOGO */}
          <div className="mb-7 flex justify-center">
            <Link
              href="/login"
              className="transition-transform duration-200 hover:-translate-y-0.5"
            >
              <img
                src="/logo.png"
                alt="HelpDesk"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CONTAINER */}
          <div
            className="
              grid overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-[0_18px_55px_rgba(15,23,42,0.07)]
              lg:grid-cols-[0.82fr_1.18fr]
            "
          >

            {/* =================================================
                PAINEL ESQUERDO
            ================================================== */}

            <section
              className="
                relative hidden overflow-hidden
                bg-[#0757d5]
                text-white
                lg:flex
              "
            >
              {/* detalhes pixelados */}

              <div className="absolute right-9 top-9 grid grid-cols-4 gap-1 opacity-40">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-[1px] ${
                      index % 3 === 0
                        ? "bg-cyan-200"
                        : "bg-blue-300"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute bottom-20 left-0 h-px w-2/3 bg-blue-400/30" />

              <div className="absolute bottom-24 left-0 h-px w-1/3 bg-cyan-300/30" />

              <div className="relative flex w-full flex-col justify-between px-11 py-12">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-terminal text-sm text-blue-200">
                      &gt;_
                    </span>

                    <span className="font-terminal text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                      new account
                    </span>

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                  </div>

                  <h1 className="mt-10 text-[32px] font-bold leading-[1.15] tracking-tight">
                    Faça parte do
                    <br />
                    <span className="text-blue-100">
                      HelpDesk.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[320px] text-[14px] leading-7 text-blue-100">
                    Crie sua conta para abrir chamados, acompanhar
                    atendimentos e manter suas solicitações organizadas.
                  </p>
                </div>

                {/* informação */}

                <div>
                  <div className="mb-5 h-px w-full bg-blue-400/30" />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 font-terminal text-xs text-blue-100">
                      &gt;_
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Conta gratuita
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />

                        <span className="font-terminal text-[9px] uppercase tracking-wide text-blue-200">
                          registration.available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* =================================================
                FORMULÁRIO
            ================================================== */}

            <section className="flex items-center bg-white px-7 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-14">
              <div className="w-full max-w-[470px]">

                {/* título */}

                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-terminal text-sm font-bold text-blue-600">
                      &gt;_
                    </span>

                    <span className="font-terminal text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      registration
                    </span>
                  </div>

                  <h2 className="text-[28px] font-bold tracking-tight text-[#12316b]">
                    Criar sua conta
                  </h2>

                  <p className="mt-2 text-[14px] leading-6 text-slate-500">
                    Preencha os dados abaixo para começar.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* NOME */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Nome completo
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Digite seu nome completo"
                      autoComplete="name"
                      required
                      className="
                        h-12 w-full
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-4
                        text-[14px] text-slate-800
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className="
                        h-12 w-full
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-4
                        text-[14px] text-slate-800
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />
                  </div>

                  {/* SENHA */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Senha
                    </label>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite uma senha"
                      autoComplete="new-password"
                      required
                      className="
                        h-12 w-full
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-4
                        text-[14px] text-slate-800
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />

                    <p className="mt-2 text-[11px] text-slate-400">
                      Use uma senha segura para proteger sua conta.
                    </p>
                  </div>

                  {/* CONFIRMAR */}

                  <div>
                    <label
                      htmlFor="password_confirmation"
                      className="mb-2 block text-[13px] font-semibold text-slate-700"
                    >
                      Confirmar senha
                    </label>

                    <input
                      id="password_confirmation"
                      type="password"
                      value={passwordConfirmation}
                      onChange={(event) =>
                        setPasswordConfirmation(event.target.value)
                      }
                      placeholder="Digite a senha novamente"
                      autoComplete="new-password"
                      required
                      className="
                        h-12 w-full
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-4
                        text-[14px] text-slate-800
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />
                  </div>

                  {/* ERRO */}

                  {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  {/* BOTÃO */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex h-12 w-full
                      items-center justify-center gap-2
                      rounded-lg
                      bg-[#1764f5]
                      text-[14px] font-semibold text-white
                      shadow-[0_5px_15px_rgba(23,100,245,0.18)]
                      transition-all duration-200
                      hover:-translate-y-0.5
                      hover:bg-[#0f56db]
                      hover:shadow-[0_8px_20px_rgba(23,100,245,0.22)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Criando conta..." : "Criar conta"}

                    {!loading && (
                      <span className="font-terminal text-xs">
                        →
                      </span>
                    )}
                  </button>
                </form>

                {/* LOGIN */}

                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                  <p className="text-[13px] text-slate-500">
                    Já possui uma conta?
                  </p>

                  <Link
                    href="/login"
                    className="
                      mt-2 inline-block
                      text-[13px] font-semibold
                      text-blue-600
                      transition-colors
                      hover:text-blue-800
                    "
                  >
                    Voltar para o login
                  </Link>
                </div>

                {/* FOOTER */}

                <div className="mt-8 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-blue-100" />

                  <span className="font-terminal text-[9px] uppercase tracking-[0.15em] text-slate-300">
                    secure / helpdesk
                  </span>

                  <span className="h-px w-8 bg-blue-100" />
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
