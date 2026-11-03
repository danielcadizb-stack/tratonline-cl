import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  createServerClientInstance,
} from "@/lib/supabase-server";
import { formatCLP } from "@/lib/autofact";

const ADMIN_EMAIL = "daniel.cadiz.b@gmail.com";

export default async function AutoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.email !== ADMIN_EMAIL) redirect("/matches");

  const supabase = await createServerClientInstance();

  const { data: auto } = await supabase
    .from("autos")
    .select(
      "*, vendedor:usuarios!autos_vendedor_id_fkey(nombre, email, telefono)",
    )
    .eq("id", params.id)
    .single();

  if (!auto) redirect("/admin");

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "*, comprador:usuarios!matches_comprador_id_fkey(nombre, email, telefono)",
    )
    .eq("auto_id", params.id)
    .order("score", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="text-trato-text2 hover:text-trato-text transition-colors"
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
        </Link>
        <h1 className="text-xl font-semibold text-trato-text">
          {auto.marca} {auto.modelo} {auto.anio}
        </h1>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${
            auto.estado === "disponible"
              ? "bg-trato-green-bg text-trato-green"
              : auto.estado === "vendido"
                ? "bg-trato-gray1 text-trato-gray3"
                : "bg-trato-amber-bg text-trato-amber"
          }`}
        >
          {auto.estado}
        </span>
      </div>

      {/* Fotos */}
      {auto.fotos && auto.fotos.length > 0 && (
        <div className="mb-6">
          <p className="section-label mb-2">Fotos ({auto.fotos.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {auto.fotos.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`foto ${i + 1}`}
                  className="aspect-square rounded-xl object-cover w-full
                    hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Datos del auto */}
      <div className="card-trato mb-4">
        <p className="section-label mb-3">Datos del vehículo</p>
        <div className="grid grid-cols-2 gap-y-3">
          {[
            ["Marca", auto.marca],
            ["Modelo", auto.modelo],
            ["Año", auto.anio],
            ["Kilometraje", `${Number(auto.km).toLocaleString("es-CL")} km`],
            ["Tipo", auto.tipo],
            ["Transmisión", auto.transmision],
            ["Combustible", auto.combustible],
            ["Color", auto.color || "—"],
            ["Región", auto.region],
            ["Precio pedido", formatCLP(auto.precio_pedido)],
            ["Precio mínimo", formatCLP(auto.precio_minimo)],
            [
              "Publicado",
              new Date(auto.created_at).toLocaleDateString("es-CL"),
            ],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <p className="text-trato-text2 text-xs">{lbl}</p>
              <p className="text-trato-text text-sm font-medium capitalize">
                {val}
              </p>
            </div>
          ))}
        </div>
        {auto.descripcion && (
          <div className="mt-3 pt-3 border-t border-trato-border">
            <p className="text-trato-text2 text-xs mb-1">Descripción</p>
            <p className="text-trato-text text-sm">{auto.descripcion}</p>
          </div>
        )}
      </div>

      {/* Vendedor */}
      <div className="card-trato mb-4">
        <p className="section-label mb-3">Vendedor</p>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-trato-green-bg flex items-center
            justify-center text-trato-green font-semibold"
          >
            {auto.vendedor?.nombre?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-trato-text font-medium text-sm">
              {auto.vendedor?.nombre}
            </p>
            <p className="text-trato-text2 text-xs">{auto.vendedor?.email}</p>
            {auto.vendedor?.telefono && (
              <a
                href={`tel:${auto.vendedor.telefono}`}
                className="text-trato-green text-xs hover:underline"
              >
                {auto.vendedor.telefono}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Matches de este auto */}
      <div className="card-trato">
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">Matches ({matches?.length || 0})</p>
        </div>
        {!matches || matches.length === 0 ? (
          <p className="text-trato-text2 text-sm text-center py-4">
            Sin matches todavía
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((match: any) => (
              <div
                key={match.id}
                className="flex items-center justify-between py-2
                border-b border-trato-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-trato-text">
                    {match.comprador?.nombre}
                  </p>
                  <p className="text-xs text-trato-text2">
                    {match.comprador?.email}
                  </p>
                  {match.comprador?.telefono && (
                    <a
                      href={`tel:${match.comprador.telefono}`}
                      className="text-trato-green text-xs hover:underline"
                    >
                      {match.comprador.telefono}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className="score-pill">{match.score}/100</span>
                    <p className="text-trato-text2 text-[10px] mt-1">
                      {match.estado.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Link
                    href={`/chat/${match.id}`}
                    className="text-trato-green text-xs hover:underline"
                  >
                    Chat →
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
