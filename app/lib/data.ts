// app/lib/data.ts

// 🧠 Ejercicios de práctica
export type EjercicioPractica = {
  pregunta: string
  respuestaCorrecta: string
}

// 📘 Tema
export type Tema = {
  id: string
  nombre: string
  contenido: string
  progreso: number // 0 a 100

  // Cómo se estudia el tema
  tipo: "teoria" | "ejercicios" | "mixto"

  // Solo existe si el tema tiene práctica
  practica?: EjercicioPractica[]
}

// 📚 Curso
export type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

// 🎯 Cursos base (primera carga)
const CURSOS_BASE: Curso[] = [
  { id: "biologia", nombre: "Biología", temas: [] },
  { id: "matematica", nombre: "Matemática", temas: [] },
  { id: "fisica", nombre: "Física", temas: [] },
  { id: "quimica", nombre: "Química", temas: [] },
  {
  id: "razonamiento-verbal",
  nombre: "Razonamiento Verbal",
  temas: [
    { id: "sinonimos", nombre: "Sinónimos", contenido: "", progreso: 0, tipo: "teoria" },
    { id: "antonimos", nombre: "Antónimos", contenido: "", progreso: 0, tipo: "teoria" },
    { id: "analogias", nombre: "Analogías", contenido: "", progreso: 0, tipo: "teoria" },
    { id: "comprension-textos", nombre: "Comprensión de textos", contenido: "", progreso: 0, tipo: "teoria" },
    { id: "completar-oraciones", nombre: "Completar oraciones", contenido: "", progreso: 0, tipo: "teoria" }
  ]
}

]

// =======================
// LOCAL STORAGE (CLIENTE)
// =======================

// 🔄 Cargar cursos
function cargarCursos(): Curso[] {
  if (typeof window === "undefined") return CURSOS_BASE

  const guardados = localStorage.getItem("cursos")

  if (!guardados) {
    localStorage.setItem("cursos", JSON.stringify(CURSOS_BASE))
    return CURSOS_BASE
  }

  return JSON.parse(guardados)
}

// 💾 Guardar cursos
function guardarCursos(cursos: Curso[]) {
  localStorage.setItem("cursos", JSON.stringify(cursos))
}

// 📥 Obtener cursos
export function obtenerCursos(): Curso[] {
  return cargarCursos()
}

// =======================
// ➕ AGREGAR TEMA (CORREGIDO)
// =======================
export function agregarTema(
  cursoId: string,
  nombre: string,
  tipo: "teoria" | "ejercicios" | "mixto" = "teoria"
) {
  if (typeof window === "undefined") return

  const data = localStorage.getItem("cursos")
  if (!data) return

  const cursos: Curso[] = JSON.parse(data)
  const curso = cursos.find(c => c.id === cursoId)
  if (!curso) return

  const nuevoTema: Tema = {
    id: crypto.randomUUID(),
    nombre,
    contenido: "",
    progreso: 0,
    tipo,

    // 🔥 AQUÍ SE GENERA LA PRÁCTICA
    practica:
      tipo === "ejercicios" || tipo === "mixto"
        ? [
            {
              pregunta: `Pregunta de práctica sobre ${nombre}`,
              respuestaCorrecta: "Respuesta correcta"
            }
          ]
        : undefined
  }

  curso.temas.push(nuevoTema)
  guardarCursos(cursos)
}

// =======================
// 📊 Progreso del curso
// =======================
export function calcularProgresoCurso(curso: Curso): number {
  if (curso.temas.length === 0) return 0

  const completados = curso.temas.filter(
    tema => tema.progreso === 100
  ).length

  return Math.round((completados / curso.temas.length) * 100)
}

// =======================
// 🔒 DATOS SOLO PARA API
// =======================
export const cursosBase = CURSOS_BASE
