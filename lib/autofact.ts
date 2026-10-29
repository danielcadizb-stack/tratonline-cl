import type { PrecioMercado } from "@/types";

export async function getPrecioMercado(
  marca: string,
  modelo: string,
  anio: number,
  km: number,
): Promise<PrecioMercado | null> {
  if (!marca || !modelo || !anio) return null;
  return estimarPrecioLocal(marca, modelo, anio, km);
}

function estimarPrecioLocal(
  marca: string,
  modelo: string,
  anio: number,
  km: number,
): PrecioMercado {
  const anioActual = new Date().getFullYear();
  const edad = anioActual - anio;

  const precios: Record<string, number> = {
    toyota: 14,
    mazda: 13,
    kia: 11,
    hyundai: 11,
    chevrolet: 10,
    nissan: 11,
    honda: 13,
    mitsubishi: 12,
    ford: 12,
    suzuki: 9,
    volkswagen: 13,
    subaru: 14,
    volvo: 18,
    bmw: 22,
    mercedes: 24,
    default: 11,
  };

  const base = (precios[marca.toLowerCase()] ?? precios.default) * 1_000_000;
  const depreciacion = Math.min(0.7, edad * 0.08 + (edad > 0 ? 0.04 : 0));
  const porKm = Math.min(0.15, (km / 200_000) * 0.15);

  const mediana =
    Math.round((base * (1 - depreciacion - porKm)) / 50_000) * 50_000;
  const varianza = mediana * 0.1;

  return {
    min: Math.round((mediana - varianza) / 50_000) * 50_000,
    max: Math.round((mediana + varianza) / 50_000) * 50_000,
    mediana,
    fuente: "estimado",
    actualizado_at: new Date().toISOString(),
  };
}

export function formatCLP(valor: number): string {
  return "$" + valor.toLocaleString("es-CL");
}

export function evaluarPrecio(
  precioPedido: number,
  mercado: PrecioMercado,
): "bajo" | "competitivo" | "alto" {
  if (precioPedido <= mercado.min) return "bajo";
  if (precioPedido <= mercado.max) return "competitivo";
  return "alto";
}
