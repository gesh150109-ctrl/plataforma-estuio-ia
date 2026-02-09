// app/page.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Curso, Tema } from "./lib/data"

// =====================
// CURSO FIJO
// =====================
const cursoRazonamiento: Curso = {
  id: "razonamiento-verbal",
  nombre: "Razonamiento Verbal",
  temas: [
    { id: "sinonimos", nombre: "Sinónimos", contenido: "", progreso: 0, tipo: "mixto" },
    { id: "antonimos", nombre: "Antónimos", contenido: "", progreso: 0, tipo: "mixto" },
    { id: "analogias", nombre: "Analogías", contenido: "", progreso: 0, tipo: "mixto" },
    { id: "comprension-lectora", nombre: "Comprensión lectora", contenido: "", progreso: 0, tipo: "mixto" },
  ],
}

// =====================
// PROGRESO
// =====================

function calcularProgresoCurso(curso: Curso) {
  if (!curso.temas || curso.temas.length === 0) return 0
  const total = curso.temas.reduce((acc, t: Tema) => acc + (t.progreso || 0), 0)
  return Math.round(total / curso.temas.length)
}

// =====================
// COMPONENTE
// =====================

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [cursos, setCursos] = useState<Curso[]>([])

  // =====================
  // CARGAR CURSOS
  // =====================

  useEffect(() => {
    setMounted(true)

    const data = localStorage.getItem("cursos")
    let cursosGuardados: Curso[] = data ? JSON.parse(data) : []

    // Añadir razonamiento verbal automáticamente si no existe
    const existe = cursosGuardados.some(
      (c) => c.id === "razonamiento-verbal"
    )

    if (!existe) {
      cursosGuardados.push(cursoRazonamiento)
      localStorage.setItem("cursos", JSON.stringify(cursosGuardados))
    }

    setCursos(cursosGuardados)
  }, [])

  // =====================
  // EDITAR CURSO
  // =====================

  const editarCurso = (id: string) => {
    const nuevoNombre = prompt("Nuevo nombre del curso:")
    if (!nuevoNombre) return

    const nuevos = cursos.map((c) =>
      c.id === id ? { ...c, nombre: nuevoNombre } : c
    )

    setCursos(nuevos)
    localStorage.setItem("cursos", JSON.stringify(nuevos))
  }

  // =====================
  // ELIMINAR CURSO
  // =====================

  const eliminarCurso = (id: string) => {
    if (!confirm("¿Eliminar este curso?")) return

    const nuevos = cursos.filter((c) => c.id !== id)
    setCursos(nuevos)
    localStorage.setItem("cursos", JSON.stringify(nuevos))
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8">
      {/* ENCABEZADO */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          Hola Gabriel, ¿por dónde comenzamos?
        </h1>
        <p className="text-gray-300">
          Tu centro personal de estudio inteligente
        </p>
      </header>

      {/* CURSOS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => {
          const progreso = calcularProgresoCurso(curso)

          return (
            <div
              key={curso.id}
              className="bg-[#111c3a] rounded-2xl p-6 shadow-lg flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-4">
                {curso.nombre}
              </h2>

              {/* Barra progreso */}
              <div className="w-full bg-blue-900 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <span className="text-sm text-blue-300 mb-4">
                {progreso}% completado
              </span>

              {/* Entrar */}
              <Link
                href={`/curso/${curso.id}`}
                className="text-center bg-blue-600 hover:bg-blue-700 transition rounded-xl py-2 font-semibold mb-3"
              >
                Entrar al curso
              </Link>

              {/* Editar / Eliminar */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => editarCurso(curso.id)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 rounded-xl py-1 text-sm"
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() => eliminarCurso(curso.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-1 text-sm"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </section>

      {/* BOTONES INFERIORES */}
      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => router.push("/resultados")}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl font-bold"
        >
          📊 Ver resultados
        </button>

        <button
          onClick={() => router.push("/crear-curso")}
          className="bg-blue-800 hover:bg-blue-700 px-6 py-3 rounded-2xl font-semibold"
        >
          ➕ Añadir curso
        </button>

        <Link
          href="/simulacro"
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
        >
          🧠 Simulacro general
        </Link>
      </div>
    </main>
  )
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b1220, #050914)",
    color: "#e5edff",
    padding: "40px",
    fontFamily: "Inter, sans-serif"
  },
  header: {
    marginBottom: "40px"
  },
  title: {
    fontSize: "34px",
    fontWeight: "700"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "8px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px"
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "14px"
  },
  progressBg: {
    backgroundColor: "#1e293b",
    height: "10px",
    borderRadius: "8px",
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb, #38bdf8)",
    borderRadius: "8px"
  },
  percent: {
    display: "block",
    marginTop: "10px",
    color: "#93c5fd",
    fontSize: "14px"
  },
  button: {
    marginTop: "16px",
    display: "block",
    textAlign: "center",
    padding: "10px",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    textDecoration: "none",
    fontWeight: "500"
  },
  addCard: {
    border: "2px dashed #2563eb",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  addButton: {
    background: "none",
    border: "none",
    color: "#60a5fa",
    fontSize: "18px",
    cursor: "pointer"
  }
}
