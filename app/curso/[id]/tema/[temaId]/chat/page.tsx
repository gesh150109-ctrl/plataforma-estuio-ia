"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

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

type Mensaje = {
  rol: "usuario" | "ia"
  texto: string
}

export default function ChatTemaPage() {
  const params = useParams()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id
  const temaId = Array.isArray(params.temaId) ? params.temaId[0] : params.temaId

  const [tema, setTema] = useState<Tema | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  /* ======================
     CARGAR TEMA (LOCALSTORAGE)
  ====================== */
  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const encontrado = curso.temas.find(t => t.id === temaId)
    if (!encontrado) return

    setTema(encontrado)
  }, [cursoId, temaId])

  /* ======================
     ENVIAR MENSAJE
  ====================== */
  async function enviarMensaje() {
    if (!input.trim() || !tema) return

    const nuevo: Mensaje = { rol: "usuario", texto: input }

    setMensajes(prev => [...prev, nuevo])
    setInput("")
    setCargando(true)
    setError("")

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  tipo: "chat",
  contenido: `
Eres un PROFESOR PREUNIVERSITARIO experto en matemáticas.

REGLAS OBLIGATORIAS:
- NO uses HTML.
- NO uses etiquetas <>, ni <sup>.
- NO uses Markdown.
- NO uses asteriscos.
- NO uses ^ para exponentes.
- Usa superíndices matemáticos reales: ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹.
- Para fracciones usa formato vertical cuando sea posible, por ejemplo: 16/9.

CONTENIDO BASE:
${tema.contenido}

PREGUNTA:
${nuevo.texto}

Explica paso a paso, claro, ordenado y con ejemplos.
`
}),


      })

      const data = await res.json()
      if (!data.resultado) throw new Error()

      setMensajes(prev => [
        ...prev,
        { rol: "ia", texto: data.resultado },
      ])
    } catch {
      setError("La IA no respondió")
    } finally {
      setCargando(false)
    }
  }

  /* ======================
     UI
  ====================== */
  if (!tema) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        Cargando chat…
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 flex flex-col max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-4">
        💬 Tutor IA — {tema.nombre}
      </h1>

      <div className="flex-1 overflow-y-auto space-y-3 bg-[#111c3a] p-4 rounded-xl">
        {mensajes.length === 0 && (
          <p className="text-gray-400">
            Haz cualquier pregunta sobre este tema.
          </p>
        )}

        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line ${
              m.rol === "usuario"
                ? "bg-blue-700 ml-auto"
                : "bg-gray-700"
            }`}
          >
            {m.texto}
          </div>
        ))}

        {cargando && (
          <p className="text-sm text-gray-400">
            La IA está escribiendo…
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && enviarMensaje()}
          placeholder="Escribe tu pregunta…"
          className="flex-1 border rounded-xl px-4 py-2 text-black"
        />
        <button
          onClick={enviarMensaje}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold"
        >
          Enviar
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

    </main>
  )
}
