import { NextResponse } from "next/server"

type IARequest = {
  tipo:
    | "resumen"
    | "aprendizaje"
    | "memorizacion"
    | "preguntas-tema"
    | "preguntas-curso"
    | "examen-general"
    | "sinonimos"
    | "antonimos"
    | "chat"
  contenido: string
  cantidad?: number
  pregunta?: string
}

export async function POST(req: Request) {
  try {
    const body: IARequest = await req.json()

    if (!body.tipo || !body.contenido) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const prompt = construirPrompt(body)

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              body.tipo === "sinonimos" ||
              body.tipo === "antonimos" ||
              body.tipo === "preguntas-tema" ||
              body.tipo === "preguntas-curso" ||
              body.tipo === "examen-general"
                ? `Eres un GENERADOR DE EXÁMENES PREUNIVERSITARIOS.
Devuelves SOLO JSON válido.
NO explicas.
NO comentas.
NO agregas texto adicional.
NO encabezados.
NO formateas.
JSON limpio.`
                : `Eres un PROFESOR PREUNIVERSITARIO DE ALTO NIVEL.
Explicas profundo, claro, progresivo y estructurado.
Das ejemplos, demostraciones y razonamiento.
No simplificas en exceso.
No das respuestas cortas.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.25,
      }),
    })

    const data = await response.json()
    const resultado = data.choices?.[0]?.message?.content ?? ""

    if (!resultado) throw new Error("Respuesta vacía de la IA")

    return NextResponse.json({ resultado })

  } catch (error: any) {
    console.error("ERROR IA:", error)
    return NextResponse.json(
      { error: "Error interno IA", detalle: error?.message },
      { status: 500 }
    )
  }
}

/* =======================
   PROMPTS
======================= */

function construirPrompt(data: IARequest): string {
  const cantidad = data.cantidad ?? 10

  switch (data.tipo) {

    case "resumen":
      return `
Realiza un resumen claro, estructurado y profundo del siguiente contenido.
Nivel preuniversitario.
Incluye definiciones, conceptos clave y ejemplos.

Contenido:
${data.contenido}
`

    case "chat":
      return `
Eres un TUTOR PREUNIVERSITARIO INTELIGENTE.

REGLAS ABSOLUTAS:
- Responde ÚNICAMENTE lo que el estudiante pide.
- Si pide ejercicios → SOLO crea ejercicios.
- Si dice "yo resolveré" → NO resuelvas.
- Si da respuestas → SOLO corrige.
- NO expliques si no lo pide.
- NO te adelantes.
- NO inventes.

FORMATO:
- Texto claro.
- Sin HTML.
- Sin Markdown.
- Sin asteriscos.
- Sin ^.
- Usa superíndices reales: ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹.

CONTENIDO BASE:
${data.contenido}

MENSAJE:
${data.pregunta ?? data.contenido}

Responde con precisión absoluta.
`

    case "aprendizaje":
      return `
Eres un PROFESOR PREUNIVERSITARIO ESPECIALISTA EN DIDÁCTICA MATEMÁTICA.

Genera material de estudio COMPLETO, ESTRUCTURADO y PEDAGÓGICO.

REGLAS:
- Devuelve SOLO HTML limpio.
- Usa <h2>, <h3>, <p>, <ul>, <li>, <br>.
- Usa <sup> para exponentes.

ESTRUCTURA:

<h2>TÍTULO</h2>

<h3>1) Definición</h3>
<p>...</p>

<h3>2) Conceptos fundamentales</h3>
<ul><li>...</li></ul>

<h3>3) Propiedades</h3>
<ul><li>...</li></ul>

<h3>4) Casos especiales</h3>
<ul><li>...</li></ul>

<h3>5) Ejemplos resueltos</h3>

TEMA:
${data.contenido}
`

    case "memorizacion":
      return `
Convierte el siguiente contenido en flashcards.

Formato obligatorio:

Pregunta: texto
Respuesta: texto

REGLAS:
- Usa SOLO el contenido.
- No agregues información nueva.
- No JSON.
- No listas.
- No encabezados.

Contenido:
${data.contenido}
`

    case "preguntas-tema":
      return `
Genera ${cantidad} preguntas de opción múltiple del tema.

Devuelve SOLO JSON.

Formato:
[
  {
    "pregunta": "",
    "opciones": ["", "", "", ""],
    "correcta": 0
  }
]

Tema:
${data.contenido}
`

    case "preguntas-curso":
      return `
Genera un examen completo usando TODOS los temas.

Devuelve SOLO JSON.

Formato:
[
  {
    "pregunta": "",
    "opciones": ["", "", "", ""],
    "correcta": 0
  }
]

Contenido:
${data.contenido}
`

    case "examen-general":
      return `
Genera un examen general mezclando todos los cursos.

Devuelve SOLO JSON.

Formato:
[
  {
    "pregunta": "",
    "opciones": ["", "", "", ""],
    "correcta": 0
  }
]

Contenido:
${data.contenido}
`

    case "sinonimos":
      return `
Devuelve SOLO JSON.

Formato:
[
  {
    "pregunta": "PALABRA",
    "opciones": ["", "", "", ""],
    "correcta": 0
  }
]

Genera ${cantidad} preguntas.
`

    case "antonimos":
      return `
Devuelve SOLO JSON.

Formato:
[
  {
    "pregunta": "PALABRA",
    "opciones": ["", "", "", ""],
    "correcta": 0
  }
]

Genera ${cantidad} preguntas.
`

    default:
      return data.contenido
  }
}
