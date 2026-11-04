"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MARCAS_CHILE = [
  "Abarth",
  "Alfa Romeo",
  "Audi",
  "BMW",
  "BYD",
  "Changan",
  "Chery",
  "Chevrolet",
  "Citröen",
  "Dacia",
  "Dfsk",
  "Dodge",
  "Fiat",
  "Ford",
  "Foton",
  "GAC",
  "Geely",
  "GWM",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Isuzu",
  "JAC",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lifan",
  "Maserati",
  "Maxus",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Ram",
  "Renault",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Zotye",
  "Otra",
];

const REGIONES: Record<string, string[]> = {
  "RM — Santiago": [
    "Santiago Centro",
    "Providencia",
    "Las Condes",
    "Vitacura",
    "Lo Barnechea",
    "Nunoa",
    "La Reina",
    "Macul",
    "Penalolen",
    "La Florida",
    "San Miguel",
    "Maipu",
    "Quilicura",
    "Puente Alto",
    "Cerrillos",
    "Estacion Central",
    "Renca",
    "Conchali",
    "Huechuraba",
    "Independencia",
    "Recoleta",
    "Cerro Navia",
    "Lo Espejo",
    "Lo Prado",
    "Pudahuel",
    "San Joaquin",
    "San Ramon",
    "El Bosque",
    "La Cisterna",
    "La Granja",
    "La Pintana",
    "Pedro Aguirre Cerda",
    "San Bernardo",
    "Buin",
    "Paine",
    "Colina",
    "Lampa",
    "Tiltil",
  ],
  Valparaiso: [
    "Valparaiso",
    "Vina del Mar",
    "Quilpue",
    "Villa Alemana",
    "Concon",
    "San Antonio",
    "Los Andes",
    "La Calera",
  ],
  Biobio: [
    "Concepcion",
    "Talcahuano",
    "San Pedro de la Paz",
    "Hualpen",
    "Coronel",
    "Lota",
    "Chiguayante",
    "Tome",
  ],
  Araucania: ["Temuco", "Padre Las Casas", "Villarrica", "Pucon"],
  Maule: ["Talca", "Curico", "Linares", "Constitucion"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro", "Ancud"],
  Coquimbo: ["La Serena", "Coquimbo", "Ovalle"],
  Antofagasta: ["Antofagasta", "Calama", "Tocopilla"],
  Atacama: ["Copiapo", "Vallenar"],
  OHiggins: ["Rancagua", "San Fernando", "Rengo"],
  "Los Rios": ["Valdivia", "La Union"],
  "Arica y Parinacota": ["Arica", "Putre"],
  Tarapaca: ["Iquique", "Alto Hospicio"],
  Magallanes: ["Punta Arenas", "Puerto Natales"],
  Aysen: ["Coihaique", "Puerto Aysen"],
};

interface Props {
  defaultValues: {
    q?: string;
    marca?: string;
    region?: string;
    comuna?: string;
    precio_min?: string;
    precio_max?: string;
  };
}

export default function FiltrosExplorar({ defaultValues }: Props) {
  const router = useRouter();
  const [region, setRegion] = useState(defaultValues.region || "");
  const [comuna, setComuna] = useState(defaultValues.comuna || "");

  const comunasDeRegion = region ? REGIONES[region] || [] : [];

  function handleRegionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRegion(e.target.value);
    setComuna("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();
    data.forEach((val, key) => {
      if (val) params.set(key, val.toString());
    });
    router.push(`/explorar?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-trato-mid border border-trato-steel/30
      rounded-2xl p-4 mb-6 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="section-label">Buscar</label>
          <input
            name="q"
            defaultValue={defaultValues.q || ""}
            placeholder="Marca o modelo..."
            className="input-trato"
          />
        </div>

        <div>
          <label className="section-label">Marca</label>
          <select
            name="marca"
            defaultValue={defaultValues.marca || ""}
            className="input-trato"
          >
            <option value="">Todas las marcas</option>
            {MARCAS_CHILE.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="section-label">Region</label>
          <select
            name="region"
            value={region}
            onChange={handleRegionChange}
            className="input-trato"
          >
            <option value="">Todo Chile</option>
            {Object.keys(REGIONES).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="section-label">
            Comuna
            {!region && (
              <span className="normal-case font-normal text-trato-gray3 ml-1">
                (selecciona una region primero)
              </span>
            )}
          </label>
          <select
            name="comuna"
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            disabled={comunasDeRegion.length === 0}
            className="input-trato disabled:opacity-40"
          >
            <option value="">Todas las comunas</option>
            {comunasDeRegion.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="section-label">Precio minimo (CLP)</label>
          <input
            type="number"
            name="precio_min"
            defaultValue={defaultValues.precio_min || ""}
            placeholder="Ej: 3.000.000"
            min="0"
            step="500000"
            className="input-trato"
          />
        </div>

        <div>
          <label className="section-label">Precio maximo (CLP)</label>
          <input
            type="number"
            name="precio_max"
            defaultValue={defaultValues.precio_max || ""}
            placeholder="Ej: 15.000.000"
            min="0"
            step="500000"
            className="input-trato"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg
            font-medium hover:bg-trato-green-l transition-colors"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={() => router.push("/explorar")}
          className="text-trato-text2 text-sm px-4 py-2 rounded-lg
            hover:text-trato-text transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
