"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import mammoth from "mammoth"

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

export default function EditarTemaPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const temaId = Array.isArray(params.temaId)
    ? params.temaId[0]
    : params.temaId

  const [texto, setTexto] = useState("")
  const [tema, setTema] = useState<Tema | null>(null)

  // 🔹 Cargar tema
  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const encontrado = curso.temas.find(t => t.id === temaId)
    if (encontrado) {
      setTema(encontrado)
    }
  }, [cursoId, temaId])

  // 🔹 Leer archivo (TXT o DOCX)
  const leerArchivo = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  console.log("Archivo:", file.name, file.type)

  // TXT
  if (file.name.endsWith(".txt")) {
    const contenido = await file.text()
    setTexto(contenido)
    return
  }

  // DOCX (Word)
  if (file.name.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      setTexto(result.value || "")
    } catch (error) {
      console.error("Error leyendo Word:", error)
      alert("No se pudo leer el archivo Word")
    }
    return
  }

  alert("Formato no soportado. Usa .txt o .docx")
}


  // 🔹 Guardar contenido (se AÑADE)
  const guardarContenido = () => {
    if (!texto.trim() || !tema) return

    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)

    const nuevosCursos = cursos.map(curso => {
      if (curso.id !== cursoId) return curso

      return {
        ...curso,
        temas: curso.temas.map(t =>
          t.id === temaId
            ? {
                ...t,
                contenido:
                  (t.contenido || "") +
                  "\n\n---\n\n" +
                  texto
              }
            : t
        ),
      }
    })

    localStorage.setItem("cursos", JSON.stringify(nuevosCursos))
    router.push(`/curso/${cursoId}/tema/${temaId}`)
  }

  if (!tema) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        <p>Cargando tema...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        Añadir contenido – {tema.nombre}
      </h1>

      <p className="text-gray-400 mb-4">
        Puedes escribir, pegar texto o subir un archivo Word.
      </p>

      {/* SUBIR ARCHIVO */}
      <input
        type="file"
        accept=".txt,.docx"
        onChange={leerArchivo}
        className="mb-4 block text-sm text-gray-300"
      />

      {/* TEXTO */}
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Escribe aquí o sube un archivo Word (.docx)..."
        className="w-full min-h-[300px] p-4 rounded-xl bg-[#111c3a] text-white outline-none resize-none mb-6"
      />

      <button
        onClick={guardarContenido}
        className="w-full bg-green-600 hover:bg-green-700 transition py-3 rounded-xl font-semibold"
      >
        Añadir contenido
      </button>
    </main>
  )
}
