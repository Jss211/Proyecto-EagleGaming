import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";

export function GuiaMonitorPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar />
      <SecondaryNav />

      <main className="w-full flex-1 py-8 sm:py-12 px-4 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* ── Botón Volver a la guía ── */}
          <div className="mb-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-[#e81950] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-[#e81950] transition-transform group-hover:-translate-x-1" />
              <span>Volver a la guía</span>
            </Link>
          </div>

          {/* ── Encabezado Principal ── */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black uppercase tracking-tight text-gray-900 leading-tight mb-4">
            GUÍA PARA COMPRAR UN MONITOR GAMER: <br />
            ¿COMO ELEGIR MI MONITOR IDEAL?.
          </h1>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-2xl mb-8 sm:mb-10 font-normal">
            guía para elegir un monitor gamer según necesidades, resolución, frecuencia,
            pantalla, tamaño y presupuesto. Para aprovechar al máximo su uso.
          </p>

          {/* ── Bloque Superior de 2 Columnas (Imagen + Explicación) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12 sm:mb-16">
            {/* Imagen a la izquierda */}
            <div className="lg:col-span-7 overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/guias/guia-monitor.jpg"
                alt="Setup gamer con monitor curvo Eagle Gaming"
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </div>

            {/* Texto y Caja de productos relacionados a la derecha */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="space-y-4 text-gray-700 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                <p>
                  Elegir un monitor gamer puede parecer complicado debido a la gran variedad
                  de modelos, características y tecnologías disponibles en el mercado. Sin
                  embargo, conocer algunos aspectos fundamentales te permitirá encontrar una
                  pantalla que se adapte a tus necesidades y mejore tu experiencia de juego
                </p>
                <p>
                  En esta guía de Eagle Gaming te explicamos qué debes considerar antes de
                  comprar un monitor, desde su resolución y frecuencia de actualización hasta el
                  tipo de panel, tamaño y presupuesto.
                </p>
              </div>

              {/* Caja de Enlaces directos con fondo gris */}
              <div className="border border-gray-200 p-5 sm:p-6 bg-[#f4f4f5]">
                <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Enlaces directos a lo productos relacionados
                </span>
                <h3 className="font-bold text-sm sm:text-[15px] text-gray-900 mb-1">
                  Nuestros productos relacionados con esta guía
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mb-4">
                  Consulta la disponibilidad, precios y opciones actuales en nuestra tienda.
                </p>
                <Link
                  to="/categoria/monitores"
                  className="inline-block text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#e81950] transition-colors underline-offset-2 hover:underline"
                >
                  Monitores
                </Link>
              </div>
            </div>
          </div>

          {/* ── Secciones Detalladas de la Guía ── */}
          <div className="space-y-10 sm:space-y-12 max-w-4xl text-gray-800 text-xs sm:text-sm leading-relaxed">
            {/* 1. IDENTIFICA TUS NECESIDADES */}
            <section>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-gray-900 mb-3 tracking-tight">
                1. IDENTIFICA TUS NECESIDADES
              </h2>
              <p className="mb-4 text-gray-700">
                Antes de elegir un monitor, es importante determinar qué uso le darás. No todos
                los usuarios necesitan las mismas características, ya que los requisitos pueden
                variar según el tipo de videojuegos, actividades y preferencias.
              </p>
              <ul className="space-y-2.5 pl-5 list-disc marker:text-gray-500 text-gray-700">
                <li>
                  <strong className="text-gray-900">Gaming competitivo:</strong> si juegas
                  títulos como Fortnite, Valorant o Counter-Strike 2, prioriza una frecuencia de
                  actualización elevada y un tiempo de respuesta reducido.
                </li>
                <li>
                  <strong className="text-gray-900">Gaming casual:</strong> si disfrutas de
                  diferentes videojuegos sin competir profesionalmente, un monitor con buena
                  resolución y una frecuencia de 144 Hz puede ofrecer una experiencia
                  equilibrada.
                </li>
                <li>
                  <strong className="text-gray-900">Diseño y contenido multimedia:</strong> si
                  trabajas con edición de imágenes, diseño gráfico o videos, busca una buena
                  reproducción de colores y una resolución adecuada.
                </li>
                <li>
                  <strong className="text-gray-900">Uso general:</strong> si necesitas el
                  monitor para estudiar, trabajar y jugar ocasionalmente, puedes optar por un
                  modelo equilibrado que combine calidad de imagen y rendimiento.
                </li>
              </ul>
            </section>

            {/* 2. RESOLUCIÓN: DEFINE LA CALIDAD DE IMAGEN */}
            <section>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-gray-900 mb-3 tracking-tight">
                2. RESOLUCIÓN: DEFINE LA CALIDAD DE IMAGEN
              </h2>
              <p className="mb-4 text-gray-700">
                La resolución determina la cantidad de píxeles que puede mostrar un monitor.
                Cuantos más píxeles tenga, mayor será el nivel de detalle de la imagen, siempre que
                el contenido y el equipo sean compatibles.
              </p>

              <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-3">
                entre las resoluciones mas habituales tenemos:
              </h3>

              <ul className="space-y-2.5 pl-5 list-disc marker:text-gray-500 text-gray-700 mb-6">
                <li>
                  <strong className="text-gray-900">Full HD (1920 × 1080):</strong> es una opción
                  accesible y adecuada para gaming, especialmente en monitores de 24 pulgadas.
                  Permite obtener buenos niveles de rendimiento sin exigir demasiado a la tarjeta
                  gráfica.
                </li>
                <li>
                  <strong className="text-gray-900">QHD (2560 × 1440):</strong> también conocida
                  como 2K, ofrece mayor definición y espacio de trabajo. Es una excelente
                  alternativa para quienes buscan un equilibrio entre calidad visual y rendimiento.
                </li>
                <li>
                  <strong className="text-gray-900">4K UHD (3840 × 2160):</strong> proporciona
                  una imagen mucho más detallada. Es recomendable para quienes priorizan la
                  calidad visual, los videojuegos con gráficos exigentes y el contenido multimedia.
                  Requiere una tarjeta gráfica más potente para jugar con altas tasas de
                  fotogramas.
                </li>
              </ul>

              <h3 className="font-black uppercase text-gray-900 text-sm sm:text-base mb-2">
                ¿CUÁL DEBO ELEGIR?
              </h3>
              <p className="text-gray-700">
                Si buscas rendimiento y economía, Full HD puede ser suficiente. Si deseas mayor
                calidad visual sin llegar a los requisitos de 4K, QHD es una excelente alternativa.
              </p>
            </section>

            {/* 3. FRECUENCIA DE ACTUALIZACIÓN Y TIEMPO DE RESPUESTA */}
            <section> 
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-gray-900 mb-3 tracking-tight">
                3. FRECUENCIA DE ACTUALIZACIÓN Y TIEMPO DE RESPUESTA
              </h2>
              <p className="mb-4 text-gray-700">
                La frecuencia de actualizacion indica cuántas veces por segundo 
                se renueva la imagen de un monitor. Se mide en hercios (Hz)
                y tiene un papel importante en la fluidez de los videojuegos.
              </p>
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-3">
                Algunas de las mas comunes son: 
              </h3>
              <ul className="space-y-2.5 pl-5 list-disc marker:text-gray-500 text-gray-700 mb-6">
                <li>
                  <strong className="text-gray-900">Pantalla de 60 Hz:</strong> Suficiente para tareas cotidianas, navegación y videojuegos casuales. 
                </li>
                <li>
                  <strong className="text-gray-900">Pantalla de 75 Hz:</strong> Ofrece una mejora moderada respecto a los 60Hz.
                </li>
                <li>
                  <strong className="text-gray-900">Pantalla de 144 Hz:</strong> Proporciona una experiencia más fluida y es una opción muy popular entre los jugadores.
                </li>
                <li>
                  <strong className="text-gray-900">Pantalla de 165 y 180 Hz:</strong> Ofrecen mayor fluidez y son buenas alternativas para el gaming competitivo.
                </li>
                <li>
                  <strong className="text-gray-900">Pantalla de 240 o más Hz:</strong> Estan orientados principalmente a jugadores competitivos que buscan aprovechar tasas de fotogramas muy elevadas.
                </li>
              </ul>
              <p className="text-gray-700">
                El tiempo de respuesta se refiere al tiempo que tarda un píxel en cambiar de color. Un tiempo de respuesta más bajo reduce el desenfoque y mejora la claridad en escenas rápidas.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default GuiaMonitorPage;
