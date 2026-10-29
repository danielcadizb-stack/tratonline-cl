import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trato — Compra y vende autos con match garantizado",
  description:
    "Publica gratis. Encontramos al comprador ideal. Solo pagas si vendes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <body className="font-sans antialiased bg-trato-white text-trato-text">
        {children}
      </body>
    </html>
  );
}
