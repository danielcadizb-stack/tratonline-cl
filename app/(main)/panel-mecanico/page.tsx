import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  createServerClientInstance,
} from "@/lib/supabase-server";

export default async function PanelMecanicoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.rol !== "mecanico") redirect("/matches");

  const supabase = await createServerClientInstance();

  const { data: mecanico } = await supabase
    .from("mecanicos")
    .select("*")
    .eq("usuario_id", user.id)
    .single();

  const { data: inspecciones } = await supabase
    .from("matches")
    .select(
      "*, auto:autos(*), comprador:usuarios!matches_comprador_id_fkey(nombre, telefono)",
    )
    .eq("mecanico_id", mecanico?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Mi panel de inspecciones
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          {mecanico?.nombre_taller || "Mi Taller"}
        </p>
      </div>

      {/* Estado suscripcion */}
      <div
        className={`rounded-xl p-4 mb-6 flex items-center justify-between
        ${
          mecanico?.suscripcion_activa
            ? "bg-trato-green-bg border border-trato-green/20"
            : "bg-trato-amber-bg border border-trato-amber/20"
        }`}
      >
        <div>
          <p
            className={`font-medium text-sm
            ${mecanico?.suscripcion_activa ? "text-trato-green" : "text-trato-amber"}`}
          >
            {mecanico?.suscripcion_activa
              ? "Suscripcion activa"
              : "Suscripcion inactiva"}
          </p>
          {mecanico?.suscripcion_activa && mecanico?.suscripcion_vence && (
            <p className="text-trato-green/70 text-xs mt-0.5">
              Vence:{" "}
              {new Date(mecanico.suscripcion_vence).toLocaleDateString("es-CL")}
            </p>
          )}
        </div>
        <Link
          href="/inspeccion"
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
            ${
              mecanico?.suscripcion_activa
                ? "bg-trato-green text-white hover:bg-trato-green-l"
                : "bg-trato-amber text-white hover:opacity-90"
            }`}
        >
          {mecanico?.suscripcion_activa ? "Renovar" : "Activar plan"}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { v: mecanico?.total_inspecciones || 0, l: "Inspecciones totales" },
          { v: mecanico?.rating || 5.0, l: "Rating promedio" },
          { v: inspecciones?.length || 0, l: "Asignadas activas" },
        ].map((s) => (
          <div key={s.l} className="card-trato text-center">
            <p className="text-2xl font-bold text-trato-green">{s.v}</p>
            <p className="text-trato-text2 text-xs mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Zonas */}
      <div className="card-trato mb-6">
        <p className="section-label mb-3">Mis zonas de trabajo</p>
        <div className="flex flex-wrap gap-2">
          {mecanico?.comunas?.length > 0 ? (
            mecanico.comunas.map((c: string) => (
              <span key={c} className="tag-filter active">
                {c}
              </span>
            ))
          ) : (
            <p className="text-trato-text2 text-sm">
              No tienes zonas configuradas.{" "}
              <Link
                href="/inspeccion"
                className="text-trato-green hover:underline"
              >
                Configura tu perfil
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Inspecciones asignadas */}
      <div>
        <h2 className="font-semibold text-trato-text mb-4">
          Inspecciones asignadas
        </h2>

        {!inspecciones || inspecciones.length === 0 ? (
          <div
            className="text-center py-12 border border-dashed
            border-trato-border rounded-2xl"
          >
            <p className="text-trato-text2 text-sm mb-2">
              Todavia no tienes inspecciones asignadas
            </p>
            <p className="text-trato-text2 text-xs max-w-xs mx-auto">
              Cuando un comprador solicite una inspeccion en tu zona, aparecera
              aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspecciones.map((insp: any) => (
              <div key={insp.id} className="card-trato">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-trato-text">
                      {insp.auto?.marca} {insp.auto?.modelo} {insp.auto?.anio}
                    </p>
                    <p className="text-trato-text2 text-xs mt-0.5">
                      {Number(insp.auto?.km).toLocaleString("es-CL")} km ·
                      {insp.auto?.region}
                    </p>
                  </div>
                  <span className="badge-amber">Inspeccion solicitada</span>
                </div>
                <div
                  className="border-t border-trato-border pt-3
                  flex items-center justify-between"
                >
                  <div>
                    <p className="text-trato-text2 text-xs">Comprador</p>
                    <p className="text-trato-text text-sm font-medium">
                      {insp.comprador?.nombre}
                    </p>
                    {insp.comprador?.telefono && (
                      <a
                        href={`tel:${insp.comprador.telefono}`}
                        className="text-trato-green text-xs hover:underline"
                      >
                        {insp.comprador.telefono}
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/chat/${insp.id}`}
                    className="bg-trato-green text-white text-xs px-3 py-1.5
                      rounded-lg font-medium hover:bg-trato-green-l transition-colors"
                  >
                    Abrir chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
