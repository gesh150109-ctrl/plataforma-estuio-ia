"use client"

import { useState } from "react"
import { diccionarioSinonimos } from "../../lib/diccionario"

type Ejercicio = {
  palabra: string
  opciones: string[]
  correcta: number
  extrasPremisa: string[]
  extrasOpciones: string[][]
}

export default function SinonimosPage() {
  const [preguntas, setPreguntas] = useState<Ejercicio[]>([])
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [resultado, setResultado] = useState<number | null>(null)

  /* =====================
     GENERADOR LOCAL
  ===================== */

  const generarEjercicios = () => {
    const palabras = Object.keys(diccionarioSinonimos)

    const seleccionadas = palabras
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)

    const ejercicios: Ejercicio[] = seleccionadas.map(palabra => {
      const sinonimos = diccionarioSinonimos[palabra]

      const correcta = sinonimos[0]

      const distractoresPalabras = palabras
        .filter(p => p !== palabra)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      const distractores = distractoresPalabras.map(
        p => diccionarioSinonimos[p][0]
      )

      const opciones = [...distractores, correcta].sort(() => Math.random() - 0.5)

      const correctaIndex = opciones.indexOf(correcta)

      /* ===== SINÓNIMOS EXTRAS ===== */

      const extrasPremisa = sinonimos.filter(s => s !== correcta)

      const extrasOpciones = opciones.map(op => {
        const entrada = Object.values(diccionarioSinonimos).find(lista =>
          lista.includes(op)
        )
        return entrada ? entrada.filter(s => s !== op).slice(0, 4) : []
      })

      return {
        palabra,
        opciones,
        correcta: correctaIndex,
        extrasPremisa,
        extrasOpciones
      }
    })

    setPreguntas(ejercicios)
    setRespuestas(new Array(ejercicios.length).fill(-1))
    setResultado(null)
  }

  /* =====================
     CORREGIR
  ===================== */

  const corregir = () => {
    let aciertos = 0

    preguntas.forEach((p, i) => {
      if (respuestas[i] === p.correcta) aciertos++
    })

    setResultado(Math.round((aciertos / preguntas.length) * 100))
  }

  /* =====================
     UI
  ===================== */

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        📘 Sinónimos — Nivel preuniversitario
      </h1>

      <button
        onClick={generarEjercicios}
        className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-2xl text-lg font-bold mb-8"
      >
        Generar ejercicios
      </button>

      {preguntas.map((p, i) => (
        <div key={i} className="mb-6 bg-[#111c3a] p-6 rounded-2xl">

          {/* PREMISA */}
          <p className="font-semibold mb-2">
            {i + 1}. {p.palabra.toUpperCase()}
          </p>

          {resultado !== null && (
            <p className="text-sm text-green-300 mb-3 ml-2">
              Sinónimos: {p.extrasPremisa.join(", ")}
            </p>
          )}

          {p.opciones.map((op, j) => {
            let icono = ""

            if (resultado !== null) {
              if (j === p.correcta) icono = "✔"
              else if (respuestas[i] === j) icono = "✘"
            }

            return (
              <div key={j} className="mb-2 ml-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name={`p${i}`}
                    checked={respuestas[i] === j}
                    onChange={() => {
                      const copia = [...respuestas]
                      copia[i] = j
                      setRespuestas(copia)
                    }}
                  />
                  {icono && <span className="font-bold">{icono}</span>}
                  {op}
                </label>

                {resultado !== null && p.extrasOpciones[j]?.length > 0 && (
                  <div className="ml-8 text-sm text-gray-300">
                    {p.extrasOpciones[j].join(", ")}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {preguntas.length > 0 && resultado === null && (
        <button
          onClick={corregir}
          className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold"
        >
          Corregir
        </button>
      )}

      {resultado !== null && (
        <p className="text-4xl font-bold mt-6 text-center">
          Resultado: {resultado}%
        </p>
      )}

    </main>
  )
}
