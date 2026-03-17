import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gadai Top — Gadai Mudah, Cepat, dan Terpercaya",
  description:
    "Solusi pinjaman tunai terbaik dengan jaminan barang berharga Anda. Proses cepat, bunga transparan, aman terdaftar dan diawasi.",
  openGraph: {
    title: "Gadai Top — Gadai Mudah, Cepat, dan Terpercaya",
    description:
      "Solusi pinjaman tunai terbaik dengan jaminan barang berharga Anda. Proses cepat, bunga transparan, aman terdaftar dan diawasi.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="font-body antialiased text-dark">{children}</body>
    </html>
  );
}
