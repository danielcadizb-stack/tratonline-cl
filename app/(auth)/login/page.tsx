"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/matches";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="bg-trato-mid border border-trato-steel/50 rounded-2xl p-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="section-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full bg-white/5 border border-white/20 rounded-[9px]
              px-3 py-2.5 text-sm text-white placeholder:text-trato-gray3
              focus:border-trato-green focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="section-label">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-white/5 border border-white/20 rounded-[9px]
              px-3 py-2.5 text-sm text-white placeholder:text-trato-gray3
              focus:border-trato-green focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <p
            className="text-trato-danger text-xs bg-red-500/10 border
            border-trato-danger/30 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-trato-steel/50" />
        <span className="text-trato-gray3 text-[10px]">o</span>
        <div className="flex-1 h-px bg-trato-steel/50" />
      </div>

      <p className="text-center text-trato-gray3 text-sm">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="text-trato-green-l hover:underline font-medium"
        >
          Crear cuenta gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-trato-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            tratonline<span className="text-trato-green-l">.</span>
          </h1>
          <p className="text-trato-gray3 text-sm mt-2">Ingresa a tu cuenta</p>
        </div>

        <Suspense
          fallback={
            <div
              className="bg-trato-mid border border-trato-steel/50
            rounded-2xl p-6 animate-pulse h-48"
            />
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-trato-gray3 text-[10px] mt-6">
          Publicar es gratis · Solo pagas $100.000 si vendes tu auto
        </p>
      </div>
    </div>
  );
}
