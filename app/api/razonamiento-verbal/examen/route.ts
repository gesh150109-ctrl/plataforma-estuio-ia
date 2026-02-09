import { NextResponse } from "next/server"

export async function POST() {

  const prompt = `
Genera un examen de razonamiento verbal nivel preuniversitario con:

- 3 preguntas de sinónimos
- 3 preguntas de antónimos
- 3 preguntas de analogías
- 1 texto largo con 4 preguntas de comprensión

Formato obligatorio JSON:

{
 "preguntas": [
   {
     "pregunta": "",
     "opciones": ["", "", "", ""],
     "correcta": 0
   }
 ]
}

La propiedad "correcta" debe ser el índice correcto (0 a 3).
`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    })
  })

  const data = await res.json()

  return NextResponse.json(
    JSON.parse(data.choices[0].message.content)
  )
}
