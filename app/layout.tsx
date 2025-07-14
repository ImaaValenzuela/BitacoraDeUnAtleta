import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bitacora de entrenamiento',
  description: 'Bitacora de entrenamiento de un atleta. Anotar rutinas, ejercicios, series, repeticiones, peso, descansos, etc.',
  generator: 'ImaaValenzuela',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
