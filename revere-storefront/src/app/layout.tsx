import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Revere - Comida de verdade, explicada",
  description:
    "Pratos equilibrados, ingredientes selecionados e entrega agendada em Blumenau e regiao.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="text-text-main flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  )
}
