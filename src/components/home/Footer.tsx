import { Link } from "react-router-dom";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03.7-1.5 1.5-1.5h2V2.5c-.83-.09-1.92-.17-3.13-.17C11.55 2.33 9.5 3.8 9.5 7v2.5H6.5v4h3V22h4.5v-8.5z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#000" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="eg-footer">
      {/* ── Cuerpo Principal ── */}
      <div className="eg-footer__body">
        <div className="eg-footer__inner">

          {/* ═══ Columna 1: Logo + Empresa + Contactos ═══ */}
          <div className="eg-footer__col eg-footer__col--brand">
            <Link to="/" className="eg-footer__logo-wrap" aria-label="Eagle Gaming Inicio">
              <img
                src="/icono.png"
                alt="Eagle Gaming"
                className="eg-footer__logo-img"
              />
            </Link>

            <p className="eg-footer__location-sub">
              AV GARCILAZO DE LA VEGA 1345 C.C. CYBERPLAZA TDA 1B-133, Lima, Perú
            </p>

            <div className="eg-footer__separator" />

            <div className="eg-footer__info-block">
              <h3 className="eg-footer__heading">La Empresa</h3>
              <p className="eg-footer__desc">
                Ofrecemos productos y servicios de alta calidad, diseñados para superar las expectativas de nuestros clientes. Nuestra prioridad es su satisfacción.
              </p>
            </div>

            <div className="eg-footer__info-block">
              <h3 className="eg-footer__heading">Datos de contactos</h3>
              <ul className="eg-footer__contact-list">
                <li>
                  <a href="tel:+51986638034" className="eg-footer__contact-link">
                    986 638 034
                  </a>
                </li>
                <li>
                  <a href="mailto:eaglegamingperu@gmail.com" className="eg-footer__contact-link">
                    eaglegamingperu@gmail.com
                  </a>
                </li>
                <li className="eg-footer__contact-address">
                  <span>Direccion: AV GARCILAZO DE LA VEGA 1345 C.C. CYBERPLAZA TDA 1B-133, Lima, Perú</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ═══ Columna 2: Categorías + Enlaces / Servicios / Redes ═══ */}
          <div className="eg-footer__col eg-footer__col--center">
            {/* Categorías Grid */}
            <div className="eg-footer__categories-wrap">
              <h3 className="eg-footer__cat-title">Categorías</h3>
              <div className="eg-footer__cat-divider" />

              <div className="eg-footer__cat-grid">
                {/* Fila 1 */}
                <div className="eg-footer__cat-row">
                  <Link to="/categoria/procesadores" className="eg-footer__cat-link">Procesadores</Link>
                  <Link to="/categoria/refrigeracion" className="eg-footer__cat-link">Refrigeracion</Link>
                  <Link to="/categoria/tarjetas-de-video" className="eg-footer__cat-link">Tarjeta de video</Link>
                  <Link to="/categoria/estabilizador" className="eg-footer__cat-link">Estabilizadores</Link>
                </div>

                {/* Fila 2 */}
                <div className="eg-footer__cat-row">
                  <Link to="/categoria/placa-madre" className="eg-footer__cat-link">Placa madre</Link>
                  <Link to="/categoria/monitores" className="eg-footer__cat-link">Monitores</Link>
                  <Link to="/categoria/fuente-de-poder" className="eg-footer__cat-link">Fuentes de poder</Link>
                  <Link to="/categoria/perifericos" className="eg-footer__cat-link">Periféricos</Link>
                </div>

                {/* Fila 3 */}
                <div className="eg-footer__cat-row">
                  <Link to="/categoria/memoria-ram" className="eg-footer__cat-link">Memoria RAM</Link>
                  <Link to="/categoria/perifericos" className="eg-footer__cat-link">Periféricos</Link>
                  <Link to="/categoria/pc-completa" className="eg-footer__cat-link">PC completa</Link>
                  <Link to="/categoria/laptops" className="eg-footer__cat-link">Laptops</Link>
                </div>

                {/* Fila 4 */}
                <div className="eg-footer__cat-row">
                  <Link to="/categoria/disco-ssd" className="eg-footer__cat-link">Almacenamiento SSD</Link>
                  <span className="eg-footer__cat-empty" />
                  <span className="eg-footer__cat-empty" />
                  <span className="eg-footer__cat-empty" />
                </div>
              </div>
            </div>

            {/* Subsecciones inferiores: Enlaces / Mi Cuenta & Servicios / Redes */}
            <div className="eg-footer__subsections">
              {/* Enlaces & Mi Cuenta */}
              <div className="eg-footer__subcol">
                <span className="eg-footer__badge">Enlaces</span>
                <ul className="eg-footer__sublist">
                  <li><Link to="/" className="eg-footer__sublink">Inicio</Link></li>
                  <li><Link to="/nosotros" className="eg-footer__sublink">Nosotros</Link></li>
                  <li><Link to="/arma-tu-pc" className="eg-footer__sublink">Arma tu PC</Link></li>
                  <li><Link to="/categoria/pc-completa" className="eg-footer__sublink">Combos PC</Link></li>
                </ul>

                <span className="eg-footer__badge eg-footer__badge--mt">Mi cuenta</span>
                <ul className="eg-footer__sublist">
                  <li><Link to="/register" className="eg-footer__sublink">Registrarme</Link></li>
                  <li><Link to="/login" className="eg-footer__sublink">Iniciar sesion</Link></li>
                </ul>
              </div>

              {/* Nuestros Servicios & Redes Sociales */}
              <div className="eg-footer__subcol">
                <span className="eg-footer__badge">Nuestros servicios</span>
                <ul className="eg-footer__sublist">
                  <li><Link to="/arma-tu-pc" className="eg-footer__sublink">Cotización y Armado</Link></li>
                  <li><Link to="/contactenos" className="eg-footer__sublink">Limpieza y Mantenimiento</Link></li>
                  <li><Link to="/contactenos" className="eg-footer__sublink">Diagnóstico y Mejora</Link></li>
                </ul>

                {/* Iconos de Redes Sociales en Círculos */}
                <div className="eg-footer__social-circles">
                  <a
                    href="https://www.facebook.com/share/1CrbiBQPTb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="eg-footer__circle-btn"
                  >
                    <FacebookIcon />
                  </a>
                  <a
                    href="https://www.instagram.com/eagle_gaming_peru"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="eg-footer__circle-btn"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="https://wa.me/51986638034"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="eg-footer__circle-btn"
                  >
                    <WhatsAppIcon />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="eg-footer__circle-btn"
                  >
                    <YouTubeIcon />
                  </a>
                  <a
                    href="https://www.tiktok.com/@eagle_gaming_peru"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="eg-footer__circle-btn"
                  >
                    <TikTokIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Columna 3: Tarjetas (Libro de Reclamaciones + Medios de Pago) ═══ */}
          <div className="eg-footer__col eg-footer__col--cards">
            {/* Tarjeta Libro de Reclamaciones */}
            <Link
              to="/libro-de-reclamaciones"
              className="eg-footer__card-item"
              aria-label="Libro de Reclamaciones"
            >
              <img
                src="/libro-reclamaciones.png"
                alt="Libro de Reclamaciones"
                className="eg-footer__card-img"
              />
            </Link>

            {/* Tarjeta Métodos de Pago Culqi, Mastercard, Visa */}
            <div className="eg-footer__card-item">
              <img
                src="/metodos-pago.png"
                alt="Paga con Culqi, Mastercard y Visa"
                className="eg-footer__card-img"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Franja Inferior Magenta / Rosada ── */}
      <div className="eg-footer__bottom-bar">
        <div className="eg-footer__bottom-inner">
          <span className="eg-footer__bottom-slogan">
            EL SIGUIENTE NIVEL DE EXPERIENCIA GAMING
          </span>
          <span className="eg-footer__bottom-address">
            C.C. CYBER PLAZA 1B 133- 134, Garcilazo de la Vega 1345
          </span>
          <span className="eg-footer__bottom-hours">
            Abierto 11AM A 7PM
          </span>
          <a href="tel:+51986638034" className="eg-footer__bottom-phone">
            +51 986 638 034
          </a>
        </div>
      </div>
    </footer>
  );
}
