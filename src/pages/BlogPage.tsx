import { Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";

interface BlogCardItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  secondaryText?: string;
  image: string;
  link?: string;
}

interface CustomGuideItem {
  id: string;
  gradientClass: string;
  bannerTitle: string;
  bannerTitleClass?: string;
  bannerSubtitle: string;
  guideTitle: string;
  guideDescription: string;
  link: string;
}

const BLOG_ITEMS: BlogCardItem[] = [
  {
    id: "procesadores",
    badge: "Procesadores",
    title: "Intel y ADM: Diferencias y cual elegir",
    description: "Descubre que procesador se adapta mejor a tus necesidades y presupuesto.",
    secondaryText:
      "Para gaming actual se recomiendan opciones como AMD o INTEL pero ¿Cuáles son sus diferencias? y ¿cual deberias elegir?.",
    image: "/blog/procesadores_blog.webp",
    link: "/categoria/procesadores",
  },
  {
    id: "tarjeta-grafica",
    badge: "Tarjeta gráfica",
    title: "¿Que tarjeta gráfica elegir?",
    description:
      "Es el componente más importante para tus gráficas en los videojuegos, aprende que opción elegir según tu presupuesto y necesidades.",
    image: "/blog/grafica_blog.webp",
    link: "/categoria/tarjetas-de-video",
  },
  {
    id: "memoria-ram",
    badge: "Memoria RAM",
    title: "¿Que memoria RAM elegir?",
    description:
      "Almacena datos a corto plazo. Lo ideal hoy en día es optar por tecnología DDR5 con un mínimo de 16 GB o 32 GB a partir de 5600/6000 MHz",
    image: "/blog/ram_blog.webp",
    link: "/categoria/memoria-ram",
  },
];

const CATEGORY_NAV_ITEMS = [
  { label: "Monitores", path: "/categoria/monitores" },
  { label: "Placa madre", path: "/categoria/placa-madre" },
  { label: "Memoria RAM", path: "/categoria/memoria-ram" },
  { label: "Almacenamiento SSD", path: "/categoria/disco-ssd" },
  { label: "Perifericós", path: "/categoria/perifericos" },
  { label: "Procesadores", path: "/categoria/procesadores" },
  { label: "Tarjeta de video", path: "/categoria/tarjetas-de-video" },
  { label: "Pc completas", path: "/categoria/pc-completa" },
];

const CUSTOM_GUIDES: CustomGuideItem[] = [
  {
    id: "monitores",
    gradientClass: "from-[#17030a] via-[#350516] to-[#c71047]",
    bannerTitle: "MONITORES",
    bannerTitleClass: "text-2xl sm:text-3xl lg:text-[36px] tracking-wide",
    bannerSubtitle: "Resolución · pantalla · HZ",
    guideTitle: "GUÍA PARA COMPRAR UN MONITOR: NECESIDADES, RESOLUCION Y TIPO DE PANTALLA.",
    guideDescription:
      "Lee nuestra guía para elegir un monitor gamer según necesidades, resolución, frecuencia, pantalla, tamaño y presupuesto. Para aprovechar al máximo su uso.",
    link: "/blog/guia-monitor",
  },
  {
    id: "almacenamiento",
    gradientClass: "from-[#021408] via-[#093516] to-[#15883a]",
    bannerTitle: "ALMACENAMIENTO",
    bannerTitleClass: "text-lg sm:text-xl md:text-2xl lg:text-[27px] tracking-tight whitespace-nowrap",
    bannerSubtitle: "SSD · HDD",
    guideTitle: "SSD Y HDD PARA GAMING: DIFERENCIAS Y CUAL ELEGIR.",
    guideDescription:
      "Compara SSD y HDD para gaming: ve tiempos de carga, capacidad, usos recomendados para potenciar tus juegos y organizar archivos.",
    link: "/categoria/disco-ssd",
  },
  {
    id: "refrigeracion-liquida",
    gradientClass: "from-[#03091e] via-[#0b1e5a] to-[#1d4ed8]",
    bannerTitle: "REFRIGERACIÓN\nLIQUIDA",
    bannerTitleClass: "text-2xl sm:text-3xl lg:text-[32px] tracking-wide leading-tight",
    bannerSubtitle: "SSD · HDD",
    guideTitle: "SSD Y HDD PARA GAMING: DIFERENCIAS Y CUAL ELEGIR.",
    guideDescription:
      "compara SSD Y HDD para gaming: ve tiempos de carga, capacidad, usos recomendados para potenciar tus juegos y organizar archivos.",
    link: "/categoria/refrigeracion",
  },
];

export function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar />
      <SecondaryNav />

      {/* ── 1. Hero Banner Superior ── */}
      <section className="relative w-full bg-[#0a0714] overflow-hidden min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center md:bg-right"
          style={{
            backgroundImage: "url('/blog/principal arriba_blog.webp')",
          }}
          aria-hidden="true"
        />

        {/* Gradiente sutil para garantizar legibilidad del texto en móviles y desktop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent md:w-3/5" />

        {/* Contenido sobre el banner */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-14 py-12 md:py-16 w-full">
          <div className="max-w-xl">
            {/* Badge Blog */}
            <span className="inline-block bg-[#e81950] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
              Blog
            </span>

            {/* Título principal */}
            <h1 className="text-3xl sm:text-5xl md:text-[56px] font-black tracking-tight leading-[1.05] text-white">
              ARMA TU <br />
              <span className="text-[#e81950]">PROPIA PC</span>
            </h1>

            {/* Bajada / Subtítulo */}
            <p className="mt-4 text-gray-200 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-md font-normal">
              Explora nuestro blog y descubre guías, consejos y recomendaciones para
              construir y personalizar tu PC ideal.
            </p>

            {/* Botón Explora nuestra tienda */}
            <div className="mt-6 sm:mt-8">
              <Link
                to="/"
                className="inline-block border border-[#e81950] bg-black/40 hover:bg-[#e81950]/20 text-white text-xs sm:text-sm font-semibold px-8 py-3 transition-colors duration-200 shadow-md backdrop-blur-sm"
              >
                Explora nuestra tienda
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Sección 1: ¿Qué componentes necesito para armar una PC gamer? ── */}
      <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Título de la sección */}
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#4b5563] mb-8 sm:mb-10 tracking-tight">
            ¿Que componentes necesito para armar una PC gamer?
          </h2>

          {/* Grid de 3 Tarjetas en Negro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
            {BLOG_ITEMS.map((item) => (
              <article
                key={item.id}
                className="bg-black text-white flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Contenedor de la Imagen con Badge en la esquina inferior izquierda */}
                <div className="relative w-full aspect-[16/9] bg-[#111827] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Badge en rojo/rosado */}
                  <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5">
                    <span className="inline-block bg-[#e81950] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-sm shadow">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Título de la tarjeta */}
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-3">
                      {item.title}
                    </h3>

                    {/* Descripción principal */}
                    <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Texto secundario (si existe) */}
                    {item.secondaryText && (
                      <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed">
                        {item.secondaryText}
                      </p>
                    )}
                  </div>

                  {/* Enlace "Conoce más" */}
                  <div className="pt-6 mt-4">
                    <Link
                      to={item.link || "/arma-tu-pc"}
                      className="text-gray-300 hover:text-[#e81950] text-xs font-normal transition-colors inline-block"
                    >
                      Conoce más
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Barra Horizontal: EXPLORAR NUESTRAS CATEGORIAS (Antes de Guías Personalizadas) ── */}
      <section className="w-full bg-white border-t border-b border-gray-200/90 py-5 sm:py-6 px-4 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
          {/* Título a la izquierda */}
          <span className="font-bold text-xs sm:text-[14px] tracking-wide text-gray-900 uppercase whitespace-nowrap">
            EXPLORAR NUESTRAS CATEGORIAS
          </span>

          {/* Enlaces de Categorías */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto scrollbar-none py-1">
            {CATEGORY_NAV_ITEMS.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                className="text-gray-700 hover:text-[#e81950] text-xs sm:text-[13px] font-normal transition-colors whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Sección 2: GUÍAS PERSONALIZADAS (Con letras grandes según imagen) ── */}
      <section className="w-full bg-white flex-1 py-14 sm:py-20 px-4 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Subtítulo y Título */}
          <span className="text-sm sm:text-base md:text-[17px] font-black tracking-wide text-black uppercase block mb-2.5">
            GUÍAS PERSONALIZADAS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#6b7280] leading-tight mb-8 sm:mb-12">
            Información para elegir <br />
            la mejor
          </h2>

          {/* Grid de 3 Tarjetas de Guías con letras GRANDES e impactantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
            {CUSTOM_GUIDES.map((guide) => (
              <article
                key={guide.id}
                className="border border-gray-200 bg-white flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Banner superior con gradiente y tipografía optimizada */}
                <div
                  className={`bg-gradient-to-r ${guide.gradientClass} h-60 sm:h-64 p-6 sm:p-7 flex flex-col justify-end text-white select-none overflow-hidden`}
                >
                  <h3
                    className={`${guide.bannerTitleClass || "text-2xl sm:text-3xl lg:text-[34px]"} font-black leading-[1.08] whitespace-pre-line uppercase`}
                  >
                    {guide.bannerTitle}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm font-semibold mt-2 tracking-wider">
                    {guide.bannerSubtitle}
                  </p>
                </div>

                {/* Contenedor inferior de información en fondo blanco */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Título de la guía en tamaño grande y negrita */}
                    <h4 className="font-black text-xs sm:text-[13px] uppercase text-gray-900 leading-snug tracking-tight mb-3">
                      {guide.guideTitle}
                    </h4>

                    {/* Descripción con texto claro y legible */}
                    <p className="text-gray-600 text-xs sm:text-[12.5px] leading-relaxed">
                      {guide.guideDescription}
                    </p>
                  </div>

                    {/* Divisor y botón de enlace "Leer guía →" (sin popup ni modal) */}
                  <div className="pt-5 mt-5 border-t border-gray-200">
                    <Link
                      to={guide.link}
                      className="text-xs sm:text-[13px] font-bold text-gray-900 hover:text-[#e81950] transition-colors inline-flex items-center gap-1.5"
                    >
                      Leer guía →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BlogPage;
