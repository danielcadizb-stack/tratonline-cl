import type { Auto, PerfilComprador, ScoreBreakdown } from "@/types";

const W = {
  marca: 30,
  presupuesto: 25,
  anio: 20,
  km: 15,
  tipo: 10,
  region: 5,
} as const;

export function calcularScore(
  auto: Auto,
  perfil: PerfilComprador,
): { score: number; breakdown: ScoreBreakdown } {
  const b: ScoreBreakdown = {
    total: 0,
    marca: 0,
    presupuesto: 0,
    anio: 0,
    km: 0,
    tipo: 0,
    region_bonus: 0,
  };

  /* ── Marca (30 pts) ──────────────────────────────────── */
  const sinMarca = perfil.marcas.length === 0;
  const marcaCalza = perfil.marcas
    .map((m) => m.toLowerCase())
    .includes(auto.marca.toLowerCase());
  if (sinMarca || marcaCalza) b.marca = W.marca;

  /* ── Presupuesto (25 pts) ────────────────────────────── */
  if (auto.precio_pedido <= perfil.presupuesto) b.presupuesto = W.presupuesto;
  else if (auto.precio_pedido <= perfil.presupuesto * 1.1)
    b.presupuesto = Math.round(W.presupuesto * 0.4);

  /* ── Año (20 pts) ────────────────────────────────────── */
  if (auto.anio >= perfil.anio_min && auto.anio <= perfil.anio_max)
    b.anio = W.anio;
  else if (auto.anio >= perfil.anio_min - 1) b.anio = Math.round(W.anio * 0.5);

  /* ── Kilometraje (15 pts) ────────────────────────────── */
  if (auto.km <= perfil.km_max) b.km = W.km;
  else if (auto.km <= perfil.km_max * 1.15) b.km = Math.round(W.km * 0.4);

  /* ── Tipo (10 pts) ───────────────────────────────────── */
  const sinTipo = perfil.tipos.length === 0;
  const tipoCalza = perfil.tipos.includes(auto.tipo);
  if (sinTipo || tipoCalza) b.tipo = W.tipo;

  /* ── Bonus región (5 pts) ────────────────────────────── */
  if (
    auto.region.toLowerCase().includes(perfil.region.toLowerCase()) ||
    perfil.region.toLowerCase().includes(auto.region.toLowerCase())
  )
    b.region_bonus = W.region;

  b.total = Math.min(
    100,
    b.marca + b.presupuesto + b.anio + b.km + b.tipo + b.region_bonus,
  );

  return { score: b.total, breakdown: b };
}

export const SCORE_MINIMO = 60;

export function encontrarMatches(
  auto: Auto,
  perfiles: PerfilComprador[],
  maxMatches = 5,
): Array<{
  perfilId: string;
  compradorId: string;
  score: number;
  breakdown: ScoreBreakdown;
}> {
  return perfiles
    .map((perfil) => {
      const { score, breakdown } = calcularScore(auto, perfil);
      return {
        perfilId: perfil.id,
        compradorId: perfil.comprador_id,
        score,
        breakdown,
      };
    })
    .filter((r) => r.score >= SCORE_MINIMO)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches);
}
