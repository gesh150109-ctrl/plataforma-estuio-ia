"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CrearCursoPage() {
  const [nombre, setNombre] = useState("")
  const router = useRouter()

  const crearCurso = () => {
    const data = localStorage.getItem("cursos")
    const cursos = data ? JSON.parse(data) : []

    cursos.push({
      id: crypto.randomUUID(),
      nombre,
      temas: []
    })

    localStorage.setItem("cursos", JSON.stringify(cursos))
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Crear curso</h1>

      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del curso"
        className="w-full p-3 rounded-xl text-black mb-4"
      />

      <button
        onClick={crearCurso}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold"
      >
        Guardar curso
      </button>
    </main>
  )
}
