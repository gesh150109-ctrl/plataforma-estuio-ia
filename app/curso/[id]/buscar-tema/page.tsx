"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

/* =====================
   TIPOS
===================== */

type Tema = {
  id: string
  nombre: string
  contenido: string
}

type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

/* =====================
   COMPONENTE
===================== */

export default function BuscarTemaPage() {
  const params = useParams()
  const router = useRouter()
  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id

  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  /* =====================
     BUSCAR TEMA CON IA
  ===================== */

  const buscarTema = async () => {
    if (!busqueda.trim()) return

    setCargando(true)
    setError("")

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "aprendizaje",
          contenido: busqueda,
        }),
      })

      const data = await res.json()
      if (!data.resultado) throw new Error()

      const contenidoIA = data.resultado

      const dataCursos = localStorage.getItem("cursos")
      if (!dataCursos) throw new Error()

      const cursos: Curso[] = JSON.parse(dataCursos)
      const curso = cursos.find(c => c.id === cursoId)
      if (!curso) throw new Error()

      const nuevoTema: Tema = {
        id: crypto.randomUUID(),
        nombre: busqueda,
        contenido: contenidoIA, // 🔥 AQUÍ ESTABA EL ERROR
      }

      curso.temas.push(nuevoTema)

      localStorage.setItem("cursos", JSON.stringify(cursos))

      router.push(`/curso/${cursoId}/tema/${nuevoTema.id}`)
    } catch {
      setError("Error al buscar el tema con IA")
    } finally {
      setCargando(false)
    }
  }

  /* =====================
     RENDER
  ===================== */

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Buscar tema con IA
      </h1>

      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Ej: Teoría de exponentes"
        className="w-full p-4 rounded-xl bg-[#111c3a] mb-4"
      />

      {error && <p className="text-red-400 mb-3">{error}</p>}

      <button
        onClick={buscarTema}
        disabled={cargando}
        className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold"
      >
        {cargando ? "Buscando..." : "Buscar con IA"}
      </button>
    </main>
  )
}
