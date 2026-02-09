"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

// Páginas especiales de razonamiento verbal
import SinonimosPage from "@/app/razonamiento-verbal/sinonimos/page"
import AntonimosPage from "@/app/razonamiento-verbal/antonimos/page"

/* =====================
   TIPOS
===================== */

type Tema = {
  id: string
  nombre: string
  contenido: string
  practica?: any[]
}

type Curso = {
  id: string
  nombre: string
  area?: string
  temas: Tema[]
}

/* =====================
   FUNCIÓN MATEMÁTICA
===================== */

function renderizarExponentes(html: string): string {
  // Convierte 2^3 → 2<sup>3</sup>
  return html.replace(/([a-zA-Z0-9]+)\^([0-9]+)/g, "$1<sup>$2</sup>")
}

/* =====================
   COMPONENTE
===================== */

export default function TemaPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId)
    ? params.temaId[0]
    : params.temaId

  /* =====================
     BLOQUE RAZONAMIENTO
  ===================== */

  if (cursoId === "razonamiento-verbal") {
    switch (temaId) {
      case "sinonimos":
        return <SinonimosPage />

      case "antonimos":
        return <AntonimosPage />

      
      default:
        return (
          <main className="min-h-screen bg-[#0a1124] text-white p-8">
            Tema de razonamiento no encontrado
          </main>
        )
    }
  }

  /* =====================
     SISTEMA NORMAL
  ===================== */

  const [tema, setTema] = useState<Tema | null>(null)
  const [curso, setCurso] = useState<Curso | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const cursoEncontrado = cursos.find(c => c.id === cursoId)
    if (!cursoEncontrado) return

    const temaEncontrado = cursoEncontrado.temas.find(
      t => t.id === temaId
    )

    if (temaEncontrado) {
      setCurso(cursoEncontrado)
      setTema(temaEncontrado)
    }
  }, [cursoId, temaId])

  if (!tema || !curso) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        Cargando tema…
      </main>
    )
  }

  /* =====================
     BLOQUEAR MEMORIZAR
  ===================== */

  const esNumerico =
    curso.nombre.toLowerCase().includes("mat") ||
    curso.nombre.toLowerCase().includes("fís") ||
    curso.nombre.toLowerCase().includes("fis") ||
    curso.nombre.toLowerCase().includes("quím") ||
    curso.nombre.toLowerCase().includes("quim")

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        {tema.nombre}
      </h1>

      {/* ===== CONTENIDO ===== */}
      <section className="bg-[#111c3a] p-6 rounded-2xl mb-8">
        <div
          className="leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{
            __html: renderizarExponentes(tema.contenido)
          }}
        />
      </section>

      {/* ===== BOTONES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {!esNumerico && (
          <button
            onClick={() =>
              router.push(
                `/curso/${cursoId}/tema/${temaId}/aprendizaje`
              )
            }
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
          >
            🧠 Memorizar
          </button>
        )}

        <button
          onClick={() =>
            router.push(
              `/curso/${cursoId}/tema/${temaId}/chat`
            )
          }
          className="bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-semibold"
        >
          🤖 Preguntar a la IA
        </button>

        <button
          onClick={() =>
            router.push(
              `/curso/${cursoId}/tema/${temaId}/examen`
            )
          }
          className="bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold"
        >
          📝 Iniciar examen
        </button>

      </div>
    </main>
  )
}
