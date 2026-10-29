"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { UserRole } from "@/types";

interface NavbarProps {
  userName?: string;
  userRole?: UserRole;
}

const NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  vendedor: [
    { href: "/publicar", label: "Publicar auto" },
    { href: "/matches", label: "Mis matches" },
  ],
  comprador: [
    { href: "/buscar", label: "Mi búsqueda" },
    { href: "/matches", label: "Mis matches" },
  ],
  mecanico: [{ href: "/inspeccion", label: "Inspecciones" }],
};

export function Navbar({ userName, userRole }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = userRole ? NAV_LINKS[userRole] : [];

  return (
    <nav className="bg-trato-dark border-b border-trato-steel/30 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/matches"
          className="text-xl font-bold text-white tracking-tight"
        >
          trato<span className="text-trato-green-l">.</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors
                ${
                  pathname === link.href
                    ? "bg-trato-steel/50 text-white font-medium"
                    : "text-trato-gray2 hover:text-white hover:bg-trato-steel/20"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-trato-gray3 text-sm hidden sm:block">
              {userName.split(" ")[0]}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="btn-ghost-dark text-xs px-3 py-1.5"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
