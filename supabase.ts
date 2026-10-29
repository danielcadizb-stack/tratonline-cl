import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* ── Cliente para componentes cliente (browser) ─────────── */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

/* ── Cliente para Server Components ─────────────────────── */
export async function createServerClientInstance() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* ignorado en Server Components */
        }
      },
    },
  });
}

/* ── Helpers ─────────────────────────────────────────────── */
export async function getSession() {
  const supabase = await createServerClientInstance();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
