"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/* ======================
   TIPOS
   ====================== */

type ResultadoExamen = {
  cursoId: string
  tipo: "tema" | "general"
  puntaje: number
  total: number
  porcentaje: number
  fecha: string
}

/* ======================
   COMPONENTE
   ====================== */

export default function ResultadosPage() {
  const router = useRouter()
  const [resultados, setResultados] = useState<ResultadoExamen[]>([])

  useEffect(() => {
    const data = localStorage.getItem("resultados")
    if (data) {
      setResultados(JSON.parse(data))
    }
  }, [])

  const borrarHistorial = () => {
    localStorage.removeItem("resultados")
    setResultados([])
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-5xl mx-auto">

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Historial de resultados</h1>

        <button
          onClick={borrarHistorial}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
        >
          Borrar todo
        </button>
      </header>

      {resultados.length === 0 ? (
        <p className="text-gray-400">
          Aún no has rendido ningún examen.
        </p>
      ) : (
        <div className="space-y-4">
          {resultados
            .slice()
            .reverse()
            .map((r, i) => (
              <div
                key={i}
                className="bg-[#111c3a] p-6 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {r.tipo === "general"
                      ? "📝 Examen general"
                      : "📘 Examen por tema"}
                  </p>

                  <p className="text-sm text-gray-400">
                    Curso ID: {r.cursoId}
                  </p>

                  <p className="text-sm text-gray-400">
                    {new Date(r.fecha).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    {r.puntaje} / {r.total}
                  </p>
                  <p className="text-green-400 font-bold">
                    {r.porcentaje}%
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
