"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

/* =====================
   TIPOS
===================== */

type Tema = {
  id: string
  nombre: string
  contenido: string
  progreso: number
}

type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

/* =====================
   COMPONENTE
===================== */

export default function AprendizajePage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId) ? params.temaId[0] : params.temaId

  const [tema, setTema] = useState<Tema | null>(null)
  const [partes, setPartes] = useState<string[]>([])
  const [parteActual, setParteActual] = useState(0)

  // IA
  const [explicacionIA, setExplicacionIA] = useState("")
  const [cargandoIA, setCargandoIA] = useState(false)

  /* =====================
     CARGAR TEMA
  ===================== */

  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const encontrado = curso.temas.find(t => t.id === temaId)
    if (!encontrado) return

    setTema(encontrado)

    const bloques = encontrado.contenido
      ? encontrado.contenido.split("\n").filter(b => b.trim() !== "")
      : []

    setPartes(bloques)
  }, [cursoId, temaId])

  /* =====================
     PROGRESO AUTOMÁTICO
  ===================== */

  useEffect(() => {
    if (!tema || partes.length === 0) return

    const nuevoProgreso = Math.round(
      ((parteActual + 1) / partes.length) * 100
    )

    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)

    const nuevosCursos = cursos.map(curso => {
      if (curso.id !== cursoId) return curso

      return {
        ...curso,
        temas: curso.temas.map(t =>
          t.id === temaId ? { ...t, progreso: nuevoProgreso } : t
        ),
      }
    })

    localStorage.setItem("cursos", JSON.stringify(nuevosCursos))
    setTema(prev => (prev ? { ...prev, progreso: nuevoProgreso } : prev))
  }, [parteActual])

  /* =====================
     IA – APRENDIZAJE
  ===================== */

  const generarAprendizajeIA = async () => {
    if (!tema?.contenido) return

    setCargandoIA(true)
    setExplicacionIA("")

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "aprendizaje",
          contenido: tema.contenido,
        }),
      })

      const data = await res.json()
      setExplicacionIA(data.resultado || "No se pudo generar explicación")
    } catch {
      setExplicacionIA("Error al conectar con la IA")
    } finally {
      setCargandoIA(false)
    }
  }

  /* =====================
     LOADING
  ===================== */

  if (!tema) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        <p>Cargando aprendizaje...</p>
      </main>
    )
  }

  /* =====================
     RENDER
  ===================== */

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 flex flex-col">
      
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Aprendizaje: {tema.nombre}
        </h1>
        <p className="text-blue-300">
          Progreso: {tema.progreso}%
        </p>
      </header>

      {/* RESPUESTA IA */}
      {cargandoIA && (
        <p className="text-blue-300 animate-pulse mb-4">
          La IA está explicando el tema…
        </p>
      )}

      {explicacionIA && (
        <section className="bg-[#111c3a] p-6 rounded-2xl whitespace-pre-line mb-6">
          {explicacionIA}
        </section>
      )}

      {/* CONTENIDO POR PARTES */}
      <section className="bg-[#111c3a] rounded-2xl p-6 mb-6 flex-1">
        {partes.length === 0 ? (
          <p className="text-gray-300">
            Este tema no tiene contenido.
          </p>
        ) : (
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {partes[parteActual]}
          </p>
        )}
      </section>

      {/* NAVEGACIÓN PARTES */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <button
          disabled={parteActual === 0}
          onClick={() => setParteActual(p => p - 1)}
          className="bg-gray-600 disabled:opacity-40 px-4 py-2 rounded-xl"
        >
          ◀ Anterior
        </button>

        <span className="text-blue-300">
          Parte {parteActual + 1} de {partes.length}
        </span>

        <button
          disabled={parteActual >= partes.length - 1}
          onClick={() => setParteActual(p => p + 1)}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-4 py-2 rounded-xl"
        >
          Siguiente ▶
        </button>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() =>
            router.push(`/curso/${cursoId}/tema/${temaId}`)
          }
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl"
        >
          Volver al tema
        </button>

        <button
          onClick={() =>
            router.push(`/curso/${cursoId}`)
          }
          className="flex-1 bg-blue-700 hover:bg-blue-800 py-3 rounded-xl font-semibold"
        >
          Volver al curso
        </button>
      </div>

      {/* MEMORIZACIÓN */}
      <button
        onClick={() =>
          router.push(`/curso/${cursoId}/tema/${temaId}/memorizacion`)
        }
        className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl text-lg font-bold mb-4"
      >
        🧠 Ir a Memorización
      </button>

      {/* EXAMEN */}
      <button
        onClick={() =>
          router.push(`/curso/${cursoId}/tema/${temaId}/examen`)
        }
        className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold"
      >
        📝 Iniciar Examen
      </button>

    </main>
  )
}
