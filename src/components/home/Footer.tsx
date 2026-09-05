import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      {/* ── Main footer body ─────────────────────────────────────────── */}
      <div className="site-footer__body">
        <div className="site-footer__inner">

          {/* Col 1 – Logo + descripción + categorías */}
          <div className="site-footer__col site-footer__col--info">
            {/* Logo */}
            <Link to="/" className="site-footer__logo">
              <img src="/icono.png" alt="Eagle Gaming" className="site-footer__logo-img" />
            </Link>

            {/* Descripción */}
            <p className="site-footer__section-label">La empresa</p>
            <p className="site-footer__description">
              Eagle Gaming Perú es una empresa dedicada a la venta de productos 
              de tecnología y gaming. Importamos las mejores marcas del mercado 
              para ofrecer a nuestros clientes lo último en hardware. 
              Nos destacamos por nuestra variedad de productos, 
              precios competitivos y un fuerte compromiso con la calidad y 
              el servicio al cliente.
            </p>

            {/* Categorías */}
            <p className="site-footer__section-label">Categorías</p>
            <div className="site-footer__categories">
              <ul className="site-footer__cat-list">
                <li><Link to="#" className="site-footer__cat-link">Periféricos</Link></li>
                <li><Link to="#" className="site-footer__cat-link">PC Completa</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Todos los productos</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Disco SSD</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Estabilizador</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Fuente de poder</Link></li>
              </ul>
              <ul className="site-footer__cat-list">
                <li><Link to="#" className="site-footer__cat-link">Memoria Ram</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Monitores</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Placa Madre</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Tarjeta de Video</Link></li>
                <li><Link to="#" className="site-footer__cat-link">Case</Link></li>
              </ul>
            </div>
          </div>

          {/* Col 2 – Mi cuenta / Servicios */}
          <div className="site-footer__col site-footer__col--links">
            {/* Mi cuenta */}
            <div className="site-footer__link-group">
              <span className="site-footer__pill">Mi cuenta</span>
              <ul className="site-footer__link-list">
                <li><Link to="/register" className="site-footer__link">Registrarme</Link></li>
                <li><Link to="/login"    className="site-footer__link">Acceder</Link></li>
              </ul>
            </div>

            {/* Servicios */}
            <div className="site-footer__link-group">
              <span className="site-footer__pill">Servicios</span>
              <ul className="site-footer__link-list">
                <li><Link to="#" className="site-footer__link">Cotización y Armado</Link></li>
                <li><Link to="#" className="site-footer__link">Limpieza y Mantenimiento</Link></li>
                <li><Link to="#" className="site-footer__link">Diagnóstico y mejora</Link></li>
              </ul>
            </div>
          </div>

          {/* Col 3 – Contacto / Enlaces */}
          <div className="site-footer__col site-footer__col--links">
            {/* Contacto */}
            <div className="site-footer__link-group">
              <span className="site-footer__pill">Contacto</span>
              <ul className="site-footer__link-list">
                <li>
                  <a href="tel:+51986638034" className="site-footer__link">
                    (51) 986638034
                  </a>
                </li>
                <li>
                  <a href="mailto:eaglegamingperu@gmail.com" className="site-footer__link">
                    eaglegamingperu@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Enlaces */}
            <div className="site-footer__link-group">
              <span className="site-footer__pill">Enlaces</span>
              <ul className="site-footer__link-list">
                <li><Link to="/"  className="site-footer__link">Inicio</Link></li>
                <li><Link to="#"  className="site-footer__link">Nosotros</Link></li>
                <li><Link to="#"  className="site-footer__link">Tienda</Link></li>
              </ul>
            </div>
          </div>

          {/* Col 4 – Mapa */}
          <div className="site-footer__col site-footer__col--map">
            <div className="site-footer__map-wrap">
              <iframe
                title="Ubicación Eagle Gaming"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d975.452141016853!2d-77.03899853038425!3d-12.056688887739233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c937f7fbe0cb%3A0x50985e49901f7989!2sEagle%20Gaming!5e0!3m2!1ses-419!2spe!4v1788641689237!5m2!1ses-419!2spe"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="site-footer__map-address">
              C.C. CYBER PLAZA 1B 133-134, Garcilazo de la Vega 1345
            </p>
          </div>

        </div>
      </div>

      {/* ── Legal links row ───────────────────────────────────────────── */}
      <div className="site-footer__legal">
        <div className="site-footer__legal-inner">
          <Link to="/privacidad"  className="site-footer__legal-link">Política de Privacidad</Link>
          <Link to="#"            className="site-footer__legal-link">Términos de Garantía</Link>
          <Link to="#"            className="site-footer__legal-link">Política de Devoluciones</Link>
          <Link to="/terminos"    className="site-footer__legal-link">Términos y Condiciones</Link>
          <a
            href="https://www.indecopi.gob.pe/libro-de-reclamaciones"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__legal-link site-footer__legal-link--red"
          >
            Libro de Reclamaciones
          </a>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="site-footer__bar">
        <div className="site-footer__bar-inner">
          {/* Slogan */}
          <span className="site-footer__bar-slogan">EL SIGUIENTE NIVEL DE EXPERIENCIA GAMING</span>

          {/* Dirección */}
          <span className="site-footer__bar-address">
            C.C. CYBER PLAZA 1B 133-134, Garcilazo de la Vega 1345
          </span>

          {/* Horario */}
          <span className="site-footer__bar-hours">ABIERTO 11AM A 7PM</span>

          {/* Teléfono */}
          <a href="tel:+51986638034" className="site-footer__bar-phone">
            (51) 986638034
          </a>

          {/* Redes sociales */}
          <div className="site-footer__socials">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1CrbiBQPTb/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="site-footer__social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="site-footer__social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon fill="#111" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="site-footer__social-link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/51986638034"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="site-footer__social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@eagle_gaming_peru?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="site-footer__social-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.21a8.16 8.16 0 0 0 4.78 1.52V7.27a4.85 4.85 0 0 1-1.01-.58z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
