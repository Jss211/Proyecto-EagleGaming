import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-800">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        ¡EagleGaming está listo! 🦅
      </h1>
      <p className="mb-4 text-lg">
        React + TypeScript + Tailwind CSS v4
      </p>
      <button 
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 cursor-pointer"
        onClick={() => setCount((count) => count + 1)}
      >
        Clicks: {count}
      </button>
    </div>
  )
}

export default App
