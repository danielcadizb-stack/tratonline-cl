"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatCLP } from "@/lib/autofact";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const supabase = createClient();

  const [match, setMatch] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else router.push("/login");
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function cargar() {
      const { data: matchData } = await supabase
        .from("matches")
        .select(
          "*, auto:autos(*), comprador:usuarios!matches_comprador_id_fkey(nombre)",
        )
        .eq("id", matchId)
        .single();

      setMatch(matchData);

      const { data: msgs } = await supabase
        .from("mensajes")
        .select("*, autor:usuarios(nombre)")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMensajes(msgs || []);
      setLoading(false);
    }

    cargar();
  }, [userId, matchId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMensajes((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviarMensaje() {
    if (!texto.trim() || !userId) return;
    const textoEnviar = texto.trim();
    setTexto("");

    await supabase.from("mensajes").insert({
      match_id: matchId,
      autor_id: userId,
      texto: textoEnviar,
      tipo: "texto",
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-trato-gray1 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-trato-text2">Match no encontrado.</p>
      </div>
    );
  }

  const auto = match.auto;
  const esComprador = userId === match.comprador_id;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div
        className="bg-trato-dark rounded-xl p-4 mb-4 flex items-center
        justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-trato-gray2 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 4l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <p className="text-white font-medium text-sm">
              {auto?.marca} {auto?.modelo} {auto?.anio}
            </p>
            <p className="text-trato-gray3 text-xs">
              {formatCLP(auto?.precio_pedido || 0)} ·
              {Number(auto?.km).toLocaleString("es-CL")} km
            </p>
          </div>
        </div>
        <span className="badge-green">Match activo</span>
      </div>

      <div className="bg-trato-gray1 rounded-xl p-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {[
            { label: "Match", done: true },
            { label: "Contacto", done: true },
            {
              label: "Visita",
              done: [
                "visita_agendada",
                "inspeccion_solicitada",
                "cerrado",
              ].includes(match.estado),
            },
            { label: "Cierre", done: match.estado === "cerrado" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center
                  justify-center text-[10px] font-semibold
                  ${
                    s.done
                      ? "bg-trato-green text-white"
                      : "bg-trato-border text-trato-gray3"
                  }`}
                >
                  {s.done ? "✓" : i + 1}
                </div>
                <span className="text-[10px] text-trato-text2 mt-1">
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className={`h-px w-12 mx-1 mb-4
                  ${s.done ? "bg-trato-green" : "bg-trato-border"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 px-1">
        {mensajes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-trato-text2 text-sm">
              Coordinense aqui para la visita del auto.
            </p>
          </div>
        )}
        {mensajes.map((msg: any) => {
          const esMio = msg.autor_id === userId;
          const esSistema = msg.tipo === "sistema";

          if (esSistema)
            return (
              <div key={msg.id} className="text-center">
                <span
                  className="text-[10px] text-trato-text2 bg-trato-gray1
                px-3 py-1 rounded-full border border-trato-border"
                >
                  {msg.texto}
                </span>
              </div>
            );

          return (
            <div
              key={msg.id}
              className={`flex ${esMio ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm
                ${
                  esMio
                    ? "bg-trato-green text-white rounded-br-sm"
                    : "bg-trato-gray1 text-trato-text rounded-bl-sm border border-trato-border"
                }`}
              >
                {!esMio && (
                  <p className="text-[10px] font-medium mb-1 opacity-70">
                    {msg.autor?.nombre?.split(" ")[0] || "Usuario"}
                  </p>
                )}
                <p>{msg.texto}</p>
                <p
                  className={`text-[10px] mt-1
                  ${esMio ? "opacity-70" : "text-trato-gray3"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {["aceptado_comprador", "aceptado_vendedor"].includes(match.estado) && (
        <div className="flex-shrink-0 mb-2">
          <button
            onClick={() => router.push(`/inspeccion?match_id=${matchId}`)}
            className="w-full bg-trato-amber-bg border border-trato-amber/30
              text-trato-amber text-sm font-medium py-2.5 rounded-[9px]
              hover:bg-trato-amber/10 transition-colors"
          >
            Solicitar inspeccion mecanica antes de visitar
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          className="input-trato flex-1"
        />
        <button
          onClick={enviarMensaje}
          disabled={!texto.trim()}
          className="bg-trato-green text-white px-4 rounded-[9px]
            hover:bg-trato-green-l transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 9L3 3l2 6-2 6 12-6z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
