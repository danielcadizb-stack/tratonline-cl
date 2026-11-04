import { createServerClientInstance } from "@/lib/supabase-server";
import Link from "next/link";
import { formatCLP } from "@/lib/autofact";
import FiltrosExplorar from "./FiltrosExplorar";

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: {
    marca?: string;
    precio_min?: string;
    precio_max?: string;
    region?: string;
    comuna?: string;
    q?: string;
  };
}) {
  const supabase = await createServerClientInstance();

  let query = supabase
    .from("autos")
    .select("*")
    .eq("estado", "disponible")
    .order("created_at", { ascending: false });

  if (searchParams.marca)
    query = query.ilike("marca", `%${searchParams.marca}%`);
  if (searchParams.comuna)
    query = query.ilike("region", `%${searchParams.comuna}%`);
  else if (searchParams.region)
    query = query.ilike("region", `%${searchParams.region}%`);
  if (searchParams.precio_min)
    query = query.gte("precio_pedido", Number(searchParams.precio_min));
  if (searchParams.precio_max)
    query = query.lte("precio_pedido", Number(searchParams.precio_max));
  if (searchParams.q)
    query = query.or(
      `marca.ilike.%${searchParams.q}%,modelo.ilike.%${searchParams.q}%`,
    );

  const { data: autos } = await query.limit(50);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Explorar autos
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          {autos?.length || 0} autos disponibles
        </p>
      </div>

      <FiltrosExplorar defaultValues={searchParams} />

      {!autos || autos.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed
          border-trato-border rounded-2xl"
        >
          <p className="text-trato-text font-medium mb-2">
            No hay autos con esos filtros
          </p>
          <Link
            href="/explorar"
            className="text-trato-green text-sm hover:underline"
          >
            Ver todos los autos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {autos.map((auto: any) => (
            <div
              key={auto.id}
              className="bg-trato-mid border border-trato-steel/30 rounded-2xl
                overflow-hidden hover:border-trato-steel/60 transition-colors"
            >
              <div className="aspect-video bg-trato-dark relative overflow-hidden">
                {auto.fotos?.[0] ? (
                  <img
                    src={auto.fotos[0]}
                    alt={`${auto.marca} ${auto.modelo}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🚗</span>
                  </div>
                )}
                {auto.fotos?.length > 1 && (
                  <div
                    className="absolute bottom-2 right-2 bg-black/60 text-white
                    text-[10px] px-2 py-0.5 rounded-full"
                  >
                    +{auto.fotos.length - 1} fotos
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">
                      {auto.marca} {auto.modelo}
                    </p>
                    <p className="text-trato-gray3 text-xs mt-0.5">
                      {auto.anio} · {Number(auto.km).toLocaleString("es-CL")} km
                      · {auto.transmision === "automatico" ? "Aut." : "Man."}
                    </p>
                  </div>
                  <p className="text-trato-green font-bold text-sm flex-shrink-0 ml-2">
                    {formatCLP(auto.precio_pedido)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-trato-gray3 text-xs">
                    📍 {auto.region}
                  </span>
                  <Link
                    href={`/explorar/${auto.id}`}
                    className="bg-trato-green text-white text-xs px-3 py-1.5
                      rounded-lg font-medium hover:bg-trato-green-l transition-colors"
                  >
                    Ver auto
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
