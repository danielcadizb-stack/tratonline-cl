"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { UserRole } from "@/types";

const ROLES: { value: UserRole; label: string; desc: string; icon: string }[] =
  [
    {
      value: "vendedor",
      label: "Quiero vender",
      desc: "Publico mi auto y espero el match",
      icon: "🚗",
    },
    {
      value: "comprador",
      label: "Quiero comprar",
      desc: "Defino qué busco y me avisan",
      icon: "🔍",
    },
    {
      value: "mecanico",
      label: "Soy mecánico",
      desc: "Ofrezco inspecciones en mi zona",
      icon: "🔧",
    },
  ];

export default function RegistroPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [rol, setRol] = useState<UserRole | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    if (!rol) return;
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    });

    if (authError || !data.user) {
      setError(authError?.message || "Error al crear la cuenta.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("usuarios").insert({
      id: data.user.id,
      nombre,
      email,
      telefono: telefono || null,
      rol,
      activo: true,
    });

    if (dbError) {
      setError("Error al guardar el perfil. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    const destino =
      rol === "vendedor"
        ? "/publicar"
        : rol === "comprador"
          ? "/buscar"
          : "/inspeccion";
    router.push(destino);
  }

  return (
    <div className="min-h-screen bg-trato-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            trato<span className="text-trato-green-l">.</span>
          </h1>
          <p className="text-trato-gray3 text-sm mt-2">Crear cuenta gratis</p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-trato-green" />
          <div
            className={`flex-1 h-1 rounded-full transition-colors
            ${step === 2 ? "bg-trato-green" : "bg-trato-steel/40"}`}
          />
        </div>

        <div className="bg-trato-mid border border-trato-steel/50 rounded-2xl p-6">
          {step === 1 && (
            <div>
              <p className="text-white font-medium text-sm mb-4">
                ¿Para qué vas a usar Trato?
              </p>
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRol(r.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl
                      border text-left transition-all
                      ${
                        rol === r.value
                          ? "border-trato-green bg-trato-green/10"
                          : "border-trato-steel/50 hover:border-trato-steel"
                      }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <p
                        className={`text-sm font-medium
                        ${rol === r.value ? "text-trato-green-l" : "text-white"}`}
                      >
                        {r.label}
                      </p>
                      <p className="text-trato-gray3 text-[10px]">{r.desc}</p>
                    </div>
                    {rol === r.value && (
                      <div
                        className="ml-auto w-4 h-4 rounded-full bg-trato-green
                        flex items-center justify-center flex-shrink-0"
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1 4l2 2 4-4"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (rol) setStep(2);
                }}
                disabled={!rol}
                className="btn-primary mt-5"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegistro} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-trato-gray3 text-[10px] flex items-center gap-1
                  mb-2 hover:text-trato-gray2 transition-colors"
              >
                ← Cambiar rol
              </button>

              {[
                {
                  label: "Nombre completo",
                  type: "text",
                  val: nombre,
                  set: setNombre,
                  ph: "Juan Martínez",
                  req: true,
                },
                {
                  label: "Email",
                  type: "email",
                  val: email,
                  set: setEmail,
                  ph: "tu@email.com",
                  req: true,
                },
                {
                  label: "Teléfono (opcional)",
                  type: "tel",
                  val: telefono,
                  set: setTelefono,
                  ph: "+56 9 1234 5678",
                  req: false,
                },
                {
                  label: "Contraseña",
                  type: "password",
                  val: password,
                  set: setPassword,
                  ph: "Mínimo 8 caracteres",
                  req: true,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="section-label">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    required={f.req}
                    minLength={f.type === "password" ? 8 : undefined}
                    className="w-full bg-white/5 border border-white/20 rounded-[9px]
                      px-3 py-2.5 text-sm text-white placeholder:text-trato-gray3
                      focus:border-trato-green focus:outline-none transition-colors"
                  />
                </div>
              ))}

              {error && (
                <p
                  className="text-trato-danger text-xs bg-red-500/10 border
                  border-trato-danger/30 rounded-lg px-3 py-2"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-trato-gray3 text-sm mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-trato-green-l hover:underline font-medium"
          >
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
