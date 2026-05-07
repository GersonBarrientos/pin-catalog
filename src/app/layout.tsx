import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Catálogo de Pines Premium",
  description: "Explora nuestra colección exclusiva de pines con disponibilidad en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased bg-[#fffdf7] text-slate-800`}>
        {children}
      </body>
    </html>
  );
}
