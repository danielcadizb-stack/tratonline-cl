import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  createServerClientInstance,
} from "@/lib/supabase-server";
import { formatCLP } from "@/lib/autofact";

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente respuesta", color: "badge-amber" },
  notificado: { label: "Esperando al comprador", color: "badge-amber" },
  aceptado_comprador: { label: "Comprador interesado", color: "badge-green" },
  aceptado_vendedor: { label: "Match confirmado", color: "badge-green" },
  visita_agendada: { label: "Visita agendada", color: "badge-green" },
  inspeccion_solicitada: {
    label: "Inspeccion solicitada",
    color: "badge-green",
  },
  cerrado: { label: "Venta cerrada", color: "badge-green" },
  cancelado: { label: "Cancelado", color: "" },
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { nuevo?: string; perfil?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createServerClientInstance();
  let matches: any[] = [];

  if (user.rol === "vendedor") {
    const { data: autos } = await supabase
      .from("autos")
      .select("id")
      .eq("vendedor_id", user.id);

    const autoIds = autos?.map((a: any) => a.id) || [];

    if (autoIds.length > 0) {
      const { data } = await supabase
        .from("matches")
        .select("*, auto:autos(*), comprador:usuarios(nombre, telefono)")
        .in("auto_id", autoIds)
        .neq("estado", "cancelado")
        .order("created_at", { ascending: false });
      matches = data || [];
    }
  } else if (user.rol === "comprador") {
    const { data } = await supabase
      .from("matches")
      .select("*, auto:autos(*)")
      .eq("comprador_id", user.id)
      .neq("estado", "cancelado")
      .order("score", { ascending: false });
    matches = data || [];
  }

  return (
    <div className="max-w-2xl mx-auto">
      {searchParams.nuevo && (
        <div
          className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-full bg-trato-green flex items-center
            justify-center flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7l3.5 3.5L12 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-trato-green font-medium text-sm">
              Auto publicado
            </p>
            <p className="text-trato-green/70 text-xs">
              El motor de matching esta buscando compradores. Te avisamos si hay
              resultados.
            </p>
          </div>
        </div>
      )}

      {searchParams.perfil && (
        <div
          className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-full bg-trato-green flex items-center
            justify-center flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7l3.5 3.5L12 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-trato-green font-medium text-sm">
              Perfil de busqueda guardado
            </p>
            <p className="text-trato-green/70 text-xs">
              Te avisaremos cuando aparezca un auto compatible.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-trato-text">Mis matches</h1>
          <p className="text-trato-text2 text-sm mt-0.5">
            {matches.length === 0
              ? "Todavia no hay matches"
              : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
          </p>
        </div>
        {user.rol === "vendedor" && (
          <Link
            href="/publicar"
            className="text-trato-green text-sm font-medium hover:underline"
          >
            + Publicar otro auto
          </Link>
        )}
        {user.rol === "comprador" && (
          <Link
            href="/buscar"
            className="text-trato-green text-sm font-medium hover:underline"
          >
            Editar busqueda
          </Link>
        )}
      </div>

      {matches.length === 0 && (
        <div
          className="text-center py-16 border border-dashed
          border-trato-border rounded-2xl"
        >
          <div
            className="w-14 h-14 rounded-full bg-trato-gray1 flex items-center
            justify-center mx-auto mb-4"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-trato-gray3"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-trato-text font-medium mb-1">
            Todavia sin matches
          </p>
          <p className="text-trato-text2 text-sm mb-5 max-w-xs mx-auto">
            {user.rol === "vendedor"
              ? "Publica tu auto y el motor buscara compradores automaticamente."
              : "Configura tu perfil y te avisamos cuando aparezca un auto que calce."}
          </p>
          <Link
            href={user.rol === "vendedor" ? "/publicar" : "/buscar"}
            className="inline-block bg-trato-green text-white px-6 py-2.5
              rounded-[9px] text-sm font-medium hover:bg-trato-green-l transition-colors"
          >
            {user.rol === "vendedor" ? "Publicar mi auto" : "Definir que busco"}
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {matches.map((match: any) => {
          const auto = match.auto;
          const estadoInfo = ESTADO_LABEL[match.estado] ?? {
            label: match.estado,
            color: "",
          };
          const puedeChat = [
            "aceptado_comprador",
            "aceptado_vendedor",
            "visita_agendada",
            "inspeccion_solicitada",
          ].includes(match.estado);

          return (
            <div
              key={match.id}
              className="card-trato hover:border-trato-steel/50
              transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-trato-text">
                    {auto?.marca} {auto?.modelo} {auto?.anio}
                  </p>
                  <p className="text-trato-text2 text-xs mt-0.5">
                    {Number(auto?.km).toLocaleString("es-CL")} km
                    {auto?.transmision === "automatico"
                      ? " · Automatico"
                      : " · Manual"}
                    {" · "}
                    {auto?.region}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-trato-green text-sm">
                    {formatCLP(auto?.precio_pedido || 0)}
                  </p>
                  <span className="score-pill mt-1 inline-block">
                    {match.score}/100
                  </span>
                </div>
              </div>

              <div
                className="flex items-center justify-between border-t
                border-trato-border pt-3"
              >
                <div className="flex items-center gap-2">
                  {estadoInfo.color && (
                    <span className={estadoInfo.color}>{estadoInfo.label}</span>
                  )}
                  {match.comprador && user.rol === "vendedor" && (
                    <span className="text-trato-text2 text-[10px]">
                      · {match.comprador.nombre?.split(" ")[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.rol === "comprador" &&
                    ["pendiente", "notificado"].includes(match.estado) && (
                      <form
                        action={`/api/matches/${match.id}/aceptar`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="bg-trato-green text-white text-xs px-3 py-1.5
                          rounded-lg font-medium hover:bg-trato-green-l transition-colors"
                        >
                          Me interesa
                        </button>
                      </form>
                    )}
                  {puedeChat && (
                    <Link
                      href={`/chat/${match.id}`}
                      className="text-trato-green text-xs font-medium hover:underline"
                    >
                      Abrir chat
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
