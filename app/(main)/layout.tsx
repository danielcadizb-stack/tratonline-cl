import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/supabase-server";

const ADMIN_EMAIL = "daniel.cadiz.b@gmail.com";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const esAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-trato-white">
      <Navbar
        userName={user.nombre}
        userRole={user.rol}
        userEmail={user.email}
        esAdmin={esAdmin}
      />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
