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

type Curso = {
  id: string
  nombre: string
  temas: {
    contenido: string
  }[]
}

type ResultadoExamen = {
  cursoId: string
  tipo: "curso"
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
  const resultados = data ? JSON.parse(data) : []
  resultados.push(resultado)
  localStorage.setItem("resultados", JSON.stringify(resultados))
}

/* =====================
   COMPONENTE
===================== */

export default function ExamenCursoPage() {
  const params = useParams()
  const router = useRouter()
  const cursoId = Array.isArray(params.id) ? params.id[0] : params.id

  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [resultado, setResultado] = useState<number | null>(null)
  const [cargando, setCargando] = useState(false)
  const [tiempo, setTiempo] = useState(30 * 60) // 30 minutos
  const [iniciado, setIniciado] = useState(false)

  /* =====================
     TEMPORIZADOR
  ===================== */

  useEffect(() => {
    if (!iniciado || resultado !== null) return

    const timer = setInterval(() => {
      setTiempo(t => {
        if (t <= 1) {
          corregir()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [iniciado, resultado])

  /* =====================
     GENERAR EXAMEN IA
  ===================== */

  const generarExamen = async () => {
    setCargando(true)

    const data = localStorage.getItem("cursos")
    if (!data) return

    const cursos: Curso[] = JSON.parse(data)
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return

    const contenido = curso.temas.map(t => t.contenido).join("\n\n")

    const res = await fetch("/api/ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "examen-general",
        contenido,
        cantidad: 30, // 👈 MÁS DE 20, como pediste
      }),
    })

    const json = await res.json()

    const preguntasIA: Pregunta[] = json.resultado
      .split("\n\n")
      .map((bloque: string): Pregunta | null => {
        const lineas = bloque.split("\n").filter(Boolean)
        if (lineas.length < 5) return null

        const pregunta = lineas[0]
        const opciones = lineas.slice(1, 5).map(l => l.slice(3))
        const correctaLetra = lineas[5]?.slice(-1)
        const correcta = ["A", "B", "C", "D"].indexOf(correctaLetra)

        if (opciones.length !== 4 || correcta < 0) return null
        return { pregunta, opciones, correcta }
      })
      .filter(Boolean) as Pregunta[]

    setPreguntas(preguntasIA)
    setRespuestas(new Array(preguntasIA.length).fill(-1))
    setIniciado(true)
    setCargando(false)
  }

  /* =====================
     CORREGIR EXAMEN
  ===================== */

  const corregir = () => {
    let aciertos = 0
    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.correcta) aciertos++
    })

    const porcentaje = Math.round((aciertos / preguntas.length) * 100)

    guardarResultado({
      cursoId,
      tipo: "curso",
      puntaje: aciertos,
      total: preguntas.length,
      porcentaje,
      fecha: new Date().toISOString(),
    })

    setResultado(porcentaje)
  }

  /* =====================
     RENDER
  ===================== */

  if (!iniciado) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">📝 Examen del curso</h1>
        <button
          onClick={generarExamen}
          disabled={cargando}
          className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl text-xl font-bold"
        >
          {cargando ? "Generando examen..." : "Iniciar examen"}
        </button>
      </main>
    )
  }

  if (resultado !== null) {
    return (
      <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">📊 Resultado final</h1>
        <p className="text-xl mb-6">Nota: {resultado}%</p>

        {preguntas.map((p, i) => (
          <div key={i} className="mb-6 bg-[#111c3a] p-4 rounded-xl">
            <p className="font-semibold mb-2">{p.pregunta}</p>

            {p.opciones.map((op, j) => {
              const esCorrecta = j === p.correcta
              const esUsuario = j === respuestas[i]

              return (
                <p
                  key={j}
                  className={`pl-4 ${
                    esCorrecta
                      ? "text-green-400"
                      : esUsuario
                      ? "text-red-400"
                      : "text-gray-300"
                  }`}
                >
                  {op}
                </p>
              )
            })}
          </div>
        ))}

        <button
          onClick={() => router.push("/resultados")}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
        >
          📊 Ver historial
        </button>
      </main>
    )
  }

  const minutos = Math.floor(tiempo / 60)
  const segundos = tiempo % 60

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Examen en curso</h1>
        <span className="text-red-400 font-bold">
          ⏱ {minutos}:{segundos.toString().padStart(2, "0")}
        </span>
      </div>

      {preguntas.map((p, i) => (
        <div key={i} className="mb-6 bg-[#111c3a] p-6 rounded-xl">
          <p className="font-semibold mb-3">
            {i + 1}. {p.pregunta}
          </p>

          {p.opciones.map((op, j) => (
            <label key={j} className="block mb-2">
              <input
                type="radio"
                name={`p${i}`}
                checked={respuestas[i] === j}
                onChange={() => {
                  const copia = [...respuestas]
                  copia[i] = j
                  setRespuestas(copia)
                }}
              />{" "}
              {op}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={corregir}
        className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl text-lg font-bold"
      >
        Finalizar examen
      </button>
    </main>
  )
}
