"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

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

export default function MemorizacionPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId) ? params.temaId[0] : params.temaId

  const [tema, setTema] = useState<Tema | null>(null)
  const [bloques, setBloques] = useState<string[]>([])
  const [actual, setActual] = useState(0)
  const [revelado, setRevelado] = useState(false)

  // 🔹 Cargar tema
  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const encontrado = curso.temas.find(t => t.id === temaId)
    if (!encontrado) return

    setTema(encontrado)

    const partes = encontrado.contenido
      ? encontrado.contenido.split("\n").filter(p => p.trim() !== "")
      : []

    setBloques(partes)
  }, [cursoId, temaId])

  if (!tema) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        <p>Cargando memorización...</p>
      </main>
    )
  }

  const siguiente = () => {
   if (actual < bloques.length - 1) {
    setRevelado(false)
    setActual(a => a + 1)
   } else {
    // ✅ FIN DE MEMORIZACIÓN
    router.push(`/curso/${cursoId}/tema/${temaId}`)
   }
 }


  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 flex flex-col items-center justify-center">
      
      <h1 className="text-3xl font-bold mb-4 text-center">
        Memorización: {tema.nombre}
      </h1>

      <p className="text-blue-300 mb-6">
        Fragmento {actual + 1} de {bloques.length}
      </p>

      <section className="bg-[#111c3a] rounded-2xl p-8 max-w-3xl w-full text-center mb-6 min-h-[200px] flex items-center justify-center">
        {!revelado ? (
          <p className="text-gray-300 text-lg">
            Piensa en el contenido…<br />
            Cuando lo recuerdes, revela.
          </p>
        ) : (
          <p className="text-xl whitespace-pre-line">
            {bloques[actual]}
          </p>
        )}
      </section>

      {!revelado ? (
        <button
          onClick={() => setRevelado(true)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold mb-4"
        >
          Revelar contenido
        </button>
      ) : (
        <button
         onClick={siguiente}
         className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold mb-4"
         >
         {actual < bloques.length - 1
           ? "Ya lo memoricé"
           : "Finalizar memorización"}
         </button>

      )}

      <div className="flex gap-4 mt-4 w-full max-w-3xl">
        <button
          onClick={() => router.push(`/curso/${cursoId}/tema/${temaId}`)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl"
        >
          Volver al tema
        </button>

        <button
          onClick={() => router.push(`/curso/${cursoId}/tema/${temaId}/aprendizaje`)}
          className="flex-1 bg-blue-700 hover:bg-blue-800 py-3 rounded-xl font-semibold"
        >
          Volver a aprendizaje
        </button>

        <button
         onClick={() =>
           router.push(`/curso/${cursoId}/tema/${temaId}/flashcards`)
         }
         className="w-full max-w-3xl bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold mt-2"
        >
         Ir a Flashcards
       </button>

      </div>

    </main>
  )
}
