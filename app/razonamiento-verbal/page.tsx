"use client"

import Link from "next/link"

export default function RazonamientoVerbalMenu() {
  return (
    <main className="min-h-screen bg-[#0a1124] text-white p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        📖 Razonamiento Verbal
      </h1>

      {/* BLOQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <Link href="/razonamiento-verbal/sinonimos" className="block">
          <div className="bg-[#111c3a] hover:bg-[#162457] p-6 rounded-2xl cursor-pointer">
            <h2 className="text-xl font-bold">Sinónimos</h2>
            <p className="text-gray-300">Relación de significados equivalentes</p>
          </div>
        </Link>

        <Link href="/razonamiento-verbal/antonimos" className="block">
          <div className="bg-[#111c3a] hover:bg-[#162457] p-6 rounded-2xl cursor-pointer">
            <h2 className="text-xl font-bold">Antónimos</h2>
            <p className="text-gray-300">Relaciones de oposición semántica</p>
          </div>
        </Link>

        
      </div>

      
    </main>
  )
}
