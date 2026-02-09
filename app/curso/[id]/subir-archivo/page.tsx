"use client"

import { useState } from "react"
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

export default function SubirArchivoPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id

  const [nombre, setNombre] = useState("")
  const [contenido, setContenido] = useState("")
  const [cargando, setCargando] = useState(false)

  // 📄 Leer Word
  const leerWord = async (file: File) => {
    setCargando(true)

    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })

    setContenido(result.value)
    setCargando(false)
  }

  // 💾 Crear tema
  const guardarTema = () => {
    if (!nombre.trim()) {
      alert("Ponle un nombre al tema")
      return
    }

    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)

    const nuevosCursos = cursos.map(curso => {
      if (curso.id !== cursoId) return curso

      return {
        ...curso,
        temas: [
          ...curso.temas,
          {
            id: crypto.randomUUID(),
            nombre,
            contenido,
            progreso: 0
          }
        ]
      }
    })

    localStorage.setItem("cursos", JSON.stringify(nuevosCursos))
    router.push(`/curso/${cursoId}`)
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        📄 Crear tema desde archivo
      </h1>

      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del tema"
        className="w-full mb-4 p-3 rounded-xl bg-[#111c3a] outline-none"
      />

      <input
        type="file"
        accept=".docx"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) leerWord(file)
        }}
        className="mb-4"
      />

      {cargando && (
        <p className="text-blue-400 mb-4">
          Leyendo archivo Word…
        </p>
      )}

      <textarea
        value={contenido}
        onChange={e => setContenido(e.target.value)}
        placeholder="Contenido del tema"
        className="w-full min-h-[300px] p-4 rounded-xl bg-[#111c3a] outline-none resize-none mb-6"
      />

      <button
        onClick={guardarTema}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
      >
        Crear tema
      </button>
    </main>
  )
}