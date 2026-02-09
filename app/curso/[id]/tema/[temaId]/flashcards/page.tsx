"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Flashcard = {
  pregunta: string
  respuesta: string
}

type Tema = {
  id: string
  nombre: string
  contenido: string
  progreso: number
  flashcards?: Flashcard[]
}

type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

export default function FlashcardsPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId) ? params.temaId[0] : params.temaId

  const [tema, setTema] = useState<Tema | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [actual, setActual] = useState(0)
  const [revelado, setRevelado] = useState(false)
  const [cargando, setCargando] = useState(false)

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

    if (encontrado.flashcards?.length) {
      setFlashcards(encontrado.flashcards)
    }
  }, [cursoId, temaId])

  /* =====================
     GENERAR FLASHCARDS IA
  ===================== */

  const generarFlashcardsIA = async () => {
    if (!tema?.contenido) return

    setCargando(true)

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "memorizacion",
          contenido: tema.contenido.slice(0, 25000),
        }),
      })

      const data = await res.json()

      if (!data.resultado) throw new Error()

      const bloques = data.resultado
        .split("\n\n")
        .map((b: string) => b.trim())
        .filter(Boolean)

      const tarjetas: Flashcard[] = []

      bloques.forEach((b: string) => {
        const p = b.match(/Pregunta:\s*(.*)/i)
        const r = b.match(/Respuesta:\s*(.*)/i)

        if (p && r) {
          tarjetas.push({
            pregunta: p[1].trim(),
            respuesta: r[1].trim(),
          })
        }
      })

      if (tarjetas.length === 0) throw new Error()

      setFlashcards(tarjetas)
      guardarFlashcards(tarjetas)
      setActual(0)
      setRevelado(false)

    } catch (e) {
      console.error("ERROR FLASHCARDS:", e)
     alert("Error al generar flashcards. Mira la consola (F12)")
    } finally {
      setCargando(false)
    }
  }

  /* =====================
     GUARDAR FLASHCARDS
  ===================== */

  const guardarFlashcards = (tarjetas: Flashcard[]) => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)

    const nuevosCursos = cursos.map(c => {
      if (c.id !== cursoId) return c

      return {
        ...c,
        temas: c.temas.map(t =>
          t.id === temaId ? { ...t, flashcards: tarjetas } : t
        ),
      }
    })

    localStorage.setItem("cursos", JSON.stringify(nuevosCursos))
  }

  if (!tema) {
    return <main className="min-h-screen bg-[#0a1124] text-white p-8">Cargando...</main>
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold mb-6">
        Flashcards: {tema.nombre}
      </h1>

      {flashcards.length === 0 ? (
        <button
          onClick={generarFlashcardsIA}
          disabled={cargando}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-2xl text-lg font-semibold"
        >
          {cargando ? "Generando flashcards..." : "Generar Flashcards con IA"}
        </button>
      ) : (
        <>
          <p className="text-blue-300 mb-4">
            Flashcard {actual + 1} de {flashcards.length}
          </p>

          <section className="bg-[#111c3a] p-8 rounded-2xl max-w-3xl w-full text-center min-h-[220px] flex items-center justify-center">
            {!revelado ? (
              <p className="text-xl">{flashcards[actual].pregunta}</p>
            ) : (
              <p className="text-xl text-green-300">{flashcards[actual].respuesta}</p>
            )}
          </section>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setActual(a => Math.max(0, a - 1))
                setRevelado(false)
              }}
              disabled={actual === 0}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 px-5 py-3 rounded-xl"
            >
              ⬅ Anterior
            </button>

            <button
              onClick={() => setRevelado(r => !r)}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-xl"
            >
              {revelado ? "Ocultar" : "Revelar"}
            </button>

            <button
              onClick={() => {
                setActual(a => a + 1)
                setRevelado(false)
              }}
              disabled={actual >= flashcards.length - 1}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 px-5 py-3 rounded-xl"
            >
              Siguiente ➡
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => router.push(`/curso/${cursoId}/tema/${temaId}`)}
        className="mt-8 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl"
      >
        Volver al tema
      </button>

    </main>
  )
}
