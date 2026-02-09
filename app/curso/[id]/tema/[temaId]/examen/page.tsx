"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

/* =====================
   TIPOS
===================== */

type Pregunta = {
  pregunta: string
  opciones: string[]
  correcta: number
}

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

type ResultadoExamen = {
  cursoId: string
  temaId: string
  tipo: "tema"
  puntaje: number
  total: number
  porcentaje: number
  fecha: string
}

/* =====================
   GUARDAR RESULTADO
===================== */

function guardarResultado(resultado: ResultadoExamen) {
  const data = localStorage.getItem("resultados")
  const resultados: ResultadoExamen[] = data ? JSON.parse(data) : []
  resultados.push(resultado)
  localStorage.setItem("resultados", JSON.stringify(resultados))
}

/* =====================
   COMPONENTE
===================== */

export default function ExamenTemaPage() {
  const params = useParams()
  const router = useRouter()

  const cursoId = params.id as string
  const temaId = params.temaId as string

  const [tema, setTema] = useState<Tema | null>(null)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [resultado, setResultado] = useState<number | null>(null)
  const [cargando, setCargando] = useState(false)

  const examenIncompleto = respuestas.some(r => r === -1)

  /* =====================
     CARGAR TEMA
  ===================== */

  useEffect(() => {
    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const encontrado = curso.temas.find(t => t.id === temaId)
    if (encontrado) setTema(encontrado)
  }, [cursoId, temaId])

  /* =====================
     GENERAR EXAMEN IA
  ===================== */

  const generarExamen = async () => {
    if (!tema?.contenido) return

    setCargando(true)

    try {
      const res = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "preguntas-tema",
          contenido: tema.contenido,
          cantidad: 15,
        }),
      })

      const data = await res.json()

      const preguntasParseadas: Pregunta[] = JSON.parse(data.resultado)

      if (!Array.isArray(preguntasParseadas) || preguntasParseadas.length === 0) {
        alert("La IA no devolvió preguntas válidas")
        return
      }

      setPreguntas(preguntasParseadas)
      setRespuestas(Array(preguntasParseadas.length).fill(-1))
    } catch (error) {
      console.error("Error generando examen:", error)
      alert("Error al generar examen")
    } finally {
      setCargando(false)
    }
  }

  /* =====================
     CORREGIR EXAMEN
  ===================== */

  const corregir = () => {
    let puntaje = 0

    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.correcta) puntaje++
    })

    const porcentaje = Math.round((puntaje / preguntas.length) * 100)

    guardarResultado({
      cursoId,
      temaId,
      tipo: "tema",
      puntaje,
      total: preguntas.length,
      porcentaje,
      fecha: new Date().toISOString(),
    })

    setResultado(porcentaje)
  }

  /* =====================
     UI
  ===================== */

  if (!tema) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8">
        Cargando examen…
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        📝 Examen: {tema.nombre}
      </h1>

      {preguntas.length === 0 ? (
        <button
          onClick={generarExamen}
          disabled={cargando}
          className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl text-lg font-bold"
        >
          {cargando ? "Generando examen..." : "Iniciar examen"}
        </button>
      ) : resultado === null ? (
        <>
          {preguntas.map((p, i) => (
            <div key={i} className="mb-6 bg-[#111c3a] p-6 rounded-2xl">
              <p className="font-semibold mb-3">
                {i + 1}. {p.pregunta}
              </p>

              {p.opciones.map((op, j) => (
                <label key={j} className="block mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`p${i}`}
                    checked={respuestas[i] === j}
                    onChange={() => {
                      const copia = [...respuestas]
                      copia[i] = j
                      setRespuestas(copia)
                    }}
                    className="mr-2"
                  />
                  {op}
                </label>
              ))}
            </div>
          ))}

          <button
            onClick={corregir}
            disabled={examenIncompleto}
            className={`w-full py-4 rounded-2xl text-lg font-bold
              ${
                examenIncompleto
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            Corregir examen
          </button>
        </>
      ) : (
        <>
          <p className="text-4xl font-bold mb-6 text-center">
            🎯 Nota final: {resultado}%
          </p>

          {preguntas.map((p, i) => {
            const correcta = respuestas[i] === p.correcta

            return (
              <div
                key={i}
                className={`mb-6 p-6 rounded-2xl
                  ${correcta ? "bg-green-700/20" : "bg-red-700/20"}`}
              >
                <p className="font-semibold mb-3">
                  {i + 1}. {p.pregunta}
                </p>

                {p.opciones.map((op, j) => (
                  <p
                    key={j}
                    className={`ml-4
                      ${
                        j === p.correcta
                          ? "text-green-400 font-bold"
                          : respuestas[i] === j
                          ? "text-red-400"
                          : "text-gray-300"
                      }`}
                  >
                    {j === p.correcta && "✔ "}
                    {respuestas[i] === j && j !== p.correcta && "✖ "}
                    {op}
                  </p>
                ))}
              </div>
            )
          })}

          <div className="text-center space-x-4">
            <button
              onClick={() => router.push("/resultados")}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
            >
              📊 Ver historial
            </button>

            <button
              onClick={() =>
                router.push(`/curso/${cursoId}/tema/${temaId}`)
              }
              className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-xl"
            >
              Volver al tema
            </button>
          </div>
        </>
      )}

    </main>
  )
}
