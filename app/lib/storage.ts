"use client"

export type Tema = {
  id: string
  nombre: string
  completado: boolean
}

export type Curso = {
  id: string
  nombre: string
  temas: Tema[]
}

const KEY = "cursos_estudio_ia"

/* ======================
   LECTURA / ESCRITURA
====================== */

export function obtenerCursos(): Curso[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function guardarCursos(cursos: Curso[]) {
  localStorage.setItem(KEY, JSON.stringify(cursos))
}

/* ======================
   CURSOS
====================== */

export function crearCurso(nombre: string) {
  const cursos = obtenerCursos()
  cursos.push({
    id: crypto.randomUUID(),
    nombre,
    temas: []
  })
  guardarCursos(cursos)
}

export function obtenerCurso(id: string): Curso | undefined {
  return obtenerCursos().find(c => c.id === id)
}

/* ======================
   TEMAS
====================== */

export function agregarTema(cursoId: string, nombreTema: string) {
  const cursos = obtenerCursos()
  const curso = cursos.find(c => c.id === cursoId)
  if (!curso) return

  curso.temas.push({
    id: crypto.randomUUID(),
    nombre: nombreTema,
    completado: false
  })

  guardarCursos(cursos)
}

/* ======================
   PROGRESO
====================== */

export function progresoCurso(curso: Curso): number {
  if (curso.temas.length === 0) return 0
  const completos = curso.temas.filter(t => t.completado).length
  return Math.round((completos / curso.temas.length) * 100)
}
