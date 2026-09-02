import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <Link to="/register" className="back-link">
          ← Volver al registro
        </Link>

        <h1 className="legal-page__title">Términos de uso</h1>
        <p className="legal-page__updated">Última actualización: 02/09/2026</p>

        <section className="legal-section">
          <h2>Aceptación de los términos</h2>
          <p>
            Al registrarse o usar este sitio, usted acepta estos Términos y Condiciones de Uso y todas las leyes y políticas a los que se hace referencia aquí.
          </p>
        </section>

        <section className="legal-section">
          <h2>Descripción del Sitio</h2>
          <p>
            Nos reservamos el derecho de modificar o eliminar cualquier contenido en este sitio en cualquier momento sin previo aviso.
          </p>
        </section>

        <section className="legal-section">
          <h2>Uso del Sitio</h2>
          <p>
            Se prohíbe expresamente: (a) usar este sitio para fines ilegales; (b) publicar contenido difamatorio, obsceno o que viole derechos de autor; (c) recopilar o almacenar información personal de otros usuarios; (d) interferir con o interrumpir este sitio.
          </p>
        </section>

        <section className="legal-section">
          <h2>Enlaces a Otros Sitios</h2>
          <p>
            Este sitio contiene enlaces a otros sitios que no están bajo nuestro control. No somos responsables del contenido de esos sitios.
          </p>
        </section>

        <section className="legal-section">
          <h2>Propiedad Intelectual</h2>
          <p>
            El contenido de este sitio no es de uso público. Queda prohibida su reproducción sin permiso.
          </p>
        </section>

        <section className="legal-section">
          <h2>Membresías Pagadas</h2>
          <p>
            Los cargos serán cobrados automáticamente hasta que cancele su membresía. Puede cancelar en cualquier momento.
          </p>
        </section>

        <section className="legal-section">
          <h2>Privacidad</h2>
          <p>
            Su privacidad y seguridad es muy importante. Consulta nuestra {" "}  
            <Link to="/privacidad" className="privacy-link">
               Política de Privacidad
            </Link>
          </p>
        </section>

        <section className="legal-section">
          <h2>Jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de este País
          </p>
        </section>

        <section className="legal-section">
          <h2>Contacto</h2>
          <p>
            Si tienes preguntas sobre estos términos, escríbenos a{" "}
            <a href="mailto:eaglegamingperu@gmail.com">
              eaglegamingperu@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}