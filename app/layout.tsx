import "./globals.css"

export const metadata = {
  title: "Estudio IA",
  description: "Plataforma de estudio inteligente",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#0a1124] text-white">
        {children}
      </body>
    </html>
  )
}
