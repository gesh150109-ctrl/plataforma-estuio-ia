"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

type Tema = {
  id: string
  nombre: string
}

type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

export default function CursoPage() {
  const params = useParams()
  const id = params.id as string

  const [curso, setCurso] = useState<Curso | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const encontrado = cursos.find((c) => c.id === id)

    setCurso(encontrado || null)
  }, [id])

  if (!curso) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        <p>Curso no encontrado</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{curso.nombre}</h1>

      <section className="space-y-4">
        {curso.temas.length === 0 && (
          <p className="text-gray-400">Aún no hay temas</p>
        )}

        {curso.temas.map((tema) => (
          <Link
            key={tema.id}
            href={`/curso/${curso.id}/tema/${tema.id}`}
            className="block bg-[#111c3a] p-4 rounded-xl hover:bg-[#1a2a5e] transition"
          >
            {tema.nombre}
          </Link>
        ))}
      </section>

      <Link
        href={`/curso/${id}/nuevo-tema`}
        className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
      >
        ➕ Añadir tema
      </Link>
      <Link
  href={`/curso/${id}/examen`}
  className="inline-block mt-6 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl font-bold"
>
  📘 Examen del curso
</Link>

    </main>
  )
}
