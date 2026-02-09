import Link from "next/link"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function NuevoTemaPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8">
      
      <h1 className="text-3xl font-bold mb-8">
        Añadir nuevo tema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SUBIR ARCHIVO */}
        <div className="bg-[#111c3a] p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-3">
            📄 Subir archivo
          </h2>
          <p className="text-gray-400 mb-4">
            Sube un PDF o Word.  
            Todo lo que subas será considerado contenido para memorizar.
          </p>
          <Link
             href={`/curso/${id}/subir-archivo`}
             className="inline-block bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-semibold"
            >
             Subir archivo
         </Link>

        </div>

        {/* BUSCAR TEMA */}
        <div className="bg-[#111c3a] p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-3">
            🔍 Buscar tema
          </h2>
          <p className="text-gray-400 mb-4">
            Busca el tema en internet.  
            La IA traerá definiciones, fórmulas, ejemplos y ejercicios.
          </p>
          <Link
            href={`/curso/${id}/buscar-tema`}
            className="inline-block bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-semibold"
          >
            Buscar tema
          </Link>
        </div>

      </div>

    </main>
  )
}
