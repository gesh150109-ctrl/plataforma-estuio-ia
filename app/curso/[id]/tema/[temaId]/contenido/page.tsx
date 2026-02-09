"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

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

export default function EditarContenidoPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId)
    ? params.temaId[0]
    : params.temaId

  const [contenido, setContenido] = useState("")
  const [nombreTema, setNombreTema] = useState("")
  const [guardado, setGuardado] = useState(false)

  /* ======================
     CARGAR CONTENIDO
  ====================== */

  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const tema = curso.temas.find(t => t.id === temaId)
    if (!tema) return

    setContenido(tema.contenido || "")
    setNombreTema(tema.nombre)
  }, [cursoId, temaId])

  /* ======================
     GUARDAR CAMBIOS
  ====================== */

  const guardarContenido = () => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)

    const nuevosCursos = cursos.map(curso => {
      if (curso.id !== cursoId) return curso

      return {
        ...curso,
        temas: curso.temas.map(tema =>
          tema.id === temaId
            ? { ...tema, contenido }
            : tema
        ),
      }
    })

    localStorage.setItem("cursos", JSON.stringify(nuevosCursos))
    setGuardado(true)

    setTimeout(() => setGuardado(false), 2000)
  }

  /* ======================
     UI
  ====================== */

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        ✏️ Editar contenido
      </h1>

      <p className="text-gray-400 mb-6">
        Tema: <strong>{nombreTema}</strong>
      </p>

      <textarea
        value={contenido}
        onChange={e => setContenido(e.target.value)}
        className="w-full min-h-[400px] bg-[#111c3a] p-4 rounded-xl outline-none text-sm leading-relaxed"
        placeholder="Escribe o edita el contenido del tema aquí..."
      />

      <div className="flex gap-4 mt-6">
        <button
          onClick={guardarContenido}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold"
        >
          💾 Guardar cambios
        </button>

        <button
          onClick={() =>
            router.push(`/curso/${cursoId}/tema/${temaId}`)
          }
          className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl"
        >
          ⬅ Volver al tema
        </button>
      </div>

      {guardado && (
        <p className="mt-4 text-green-400 font-semibold">
          ✅ Contenido guardado correctamente
        </p>
      )}
    </main>
  )
}
