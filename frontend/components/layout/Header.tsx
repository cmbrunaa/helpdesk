"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Role = "usuario" | "atendente" | "admin";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

const roleLabels: Record<Role, string> = {
  usuario: "Usuário",
  atendente: "Atendente",
  admin: "Administrador",
};

type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    roles: ["usuario", "atendente", "admin"],
  },
  {
    label: "Chamados",
    href: "/tickets",
    roles: ["usuario", "atendente", "admin"],
  },
  {
    label: "Novo chamado",
    href: "/tickets/new",
    roles: ["usuario", "admin"],
  },
  {
    label: "Categorias",
    href: "/categories",
    roles: ["admin"],
  },
  {
    label: "Usuários",
    href: "/users",
    roles: ["admin"],
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const initial = user?.name?.charAt(0).toUpperCase() ?? "U";

  const visibleNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Mesmo que a API falhe, a sessão local será encerrada.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/login");
    }
  }

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-slate-200
        bg-slate-50/95
        font-sans
        backdrop-blur-md
      "
    >
      <div
        className="
          relative mx-auto flex h-[82px] max-w-[1400px]
          items-center justify-end
          px-5 sm:px-6
        "
      >
        {/* =====================================================
            NAVEGAÇÃO CENTRAL
        ====================================================== */}

        <nav
          className="
            absolute left-1/2
            hidden -translate-x-1/2
            items-center justify-center gap-1
            rounded-2xl
            border border-blue-100
            bg-blue-50/70
            p-1.5
            md:flex
          "
        >
          {visibleNavigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  rounded-xl
                  px-4 py-2.5
                  text-[13px]
                  font-medium
                  transition-all duration-200

                  ${
                    isActive
                      ? `
                        bg-white
                        text-blue-600
                        shadow-[0_2px_8px_rgba(37,99,235,0.10)]
                      `
                      : `
                        text-slate-500
                        hover:bg-white/80
                        hover:text-blue-600
                      `
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* =====================================================
            USUÁRIO
        ====================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notificações */}

          <button
            type="button"
            aria-label="Notificações"
            className="
              relative
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-400
              shadow-sm
              transition-all duration-200
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-600
            "
          >
            <span className="font-terminal text-sm">
              ◌
            </span>

            <span
              className="
                absolute right-2.5 top-2.5
                h-1.5 w-1.5
                rounded-full
                bg-blue-500
                animate-pulse
              "
            />
          </button>

          {/* Perfil */}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="
                flex items-center gap-2.5
                rounded-xl
                border border-slate-200
                bg-white
                px-2.5 py-1.5
                text-left
                shadow-sm
                outline-none
                transition-all duration-200
                hover:border-blue-200
                hover:shadow-md
              "
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {/* Avatar */}

              <div
                className="
                  flex h-9 w-9
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-blue-600
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                {initial}
              </div>

              {/* Nome */}

              <div className="hidden min-w-[80px] sm:block">
                <p className="text-[13px] font-semibold text-slate-800">
                  {firstName}
                </p>

                <p className="font-terminal text-[9px] uppercase tracking-[0.08em] text-blue-500">
                  {user ? roleLabels[user.role] : "Usuário"}
                </p>
              </div>

              {/* Seta */}

              <span
                className={`
                  ml-0.5
                  text-xs
                  text-slate-400
                  transition-transform duration-200
                  ${menuOpen ? "rotate-180" : ""}
                `}
              >
                ⌄
              </span>
            </button>

            {/* =================================================
                DROPDOWN
            ================================================== */}

            {menuOpen && (
              <div
                className="
                  absolute right-0 top-[calc(100%+10px)]
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  shadow-[0_18px_45px_rgba(15,23,42,0.12)]
                "
                role="menu"
              >
                {/* Dados */}

                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10
                        shrink-0
                        items-center justify-center
                        rounded-lg
                        bg-blue-600
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-slate-800">
                        {user?.name ?? "Usuário"}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {user?.email ?? ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="font-terminal text-[8px] uppercase tracking-[0.12em] text-slate-400">
                      {user ? roleLabels[user.role] : "Sessão ativa"}
                    </span>
                  </div>
                </div>

                {/* Atalhos */}

                {user?.role === "admin" && (
                  <div className="border-b border-slate-100 p-2">
                    <Link
                      href="/users"
                      onClick={() => setMenuOpen(false)}
                      className="
                        flex items-center gap-3
                        rounded-xl
                        px-3 py-2.5
                        text-[13px]
                        font-medium
                        text-slate-600
                        transition-colors
                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                    >
                      <span
                        className="
                          flex h-7 w-7
                          items-center justify-center
                          rounded-lg
                          bg-blue-50
                          font-terminal
                          text-[10px]
                          text-blue-500
                        "
                      >
                        #
                      </span>

                      Gerenciar usuários
                    </Link>

                    <Link
                      href="/categories"
                      onClick={() => setMenuOpen(false)}
                      className="
                        mt-1
                        flex items-center gap-3
                        rounded-xl
                        px-3 py-2.5
                        text-[13px]
                        font-medium
                        text-slate-600
                        transition-colors
                        hover:bg-blue-50
                        hover:text-blue-600
                      "
                    >
                      <span
                        className="
                          flex h-7 w-7
                          items-center justify-center
                          rounded-lg
                          bg-blue-50
                          font-terminal
                          text-[10px]
                          text-blue-500
                        "
                      >
                        /
                      </span>

                      Categorias
                    </Link>
                  </div>
                )}

                {/* Logout */}

                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    role="menuitem"
                    className="
                      flex w-full items-center gap-3
                      rounded-xl
                      px-3 py-2.5
                      text-left
                      text-[13px]
                      font-medium
                      text-slate-600
                      transition-colors
                      hover:bg-red-50
                      hover:text-red-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <span
                      className="
                        flex h-7 w-7
                        items-center justify-center
                        rounded-lg
                        bg-red-50
                        font-terminal
                        text-[10px]
                        text-red-500
                      "
                    >
                      &gt;
                    </span>

                    <span>
                      {loggingOut ? "Saindo..." : "Sair da conta"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
