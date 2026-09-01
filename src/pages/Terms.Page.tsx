import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <Link to="/register" className="back-link">
          ← Volver al registro
        </Link>

        <h1 className="legal-page__title">Términos de uso</h1>
        <p className="legal-page__updated">Última actualización: [fecha]</p>

        <section className="legal-section">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al crear una cuenta en EagleGaming, aceptas cumplir estos
            términos de uso. Si no estás de acuerdo con alguna parte, no
            debes registrarte ni usar la plataforma. [Texto ficticio —
            reemplazar con el contenido real.]
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Uso de la cuenta</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu
            contraseña y de toda actividad realizada desde tu cuenta.
            EagleGaming no se hace responsable por accesos no autorizados
            derivados de negligencia del usuario. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Conducta del usuario</h2>
          <p>
            Está prohibido usar la plataforma para actividades ilegales,
            acoso, suplantación de identidad, o cualquier conducta que
            viole los derechos de terceros. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Propiedad intelectual</h2>
          <p>
            Todo el contenido, marcas y logotipos de EagleGaming son
            propiedad de la empresa y están protegidos por las leyes de
            propiedad intelectual aplicables. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Modificaciones</h2>
          <p>
            Podemos actualizar estos términos en cualquier momento.
            Notificaremos cambios importantes a través de la plataforma o
            por correo electrónico. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Contacto</h2>
          <p>
            Si tienes preguntas sobre estos términos, escríbenos a{" "}
            <a href="mailto:contacto@eaglegaming.com">
              contacto@eaglegaming.com
            </a>
            . [Texto ficticio.]
          </p>
        </section>
      </div>
    </div>
  );
}