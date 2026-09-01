import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <Link to="/register" className="back-link">
          ← Volver al registro
        </Link>

        <h1 className="legal-page__title">Política de privacidad</h1>
        <p className="legal-page__updated">Última actualización: [fecha]</p>

        <section className="legal-section">
          <h2>1. Qué datos recopilamos</h2>
          <p>
            Recopilamos tu nombre, correo electrónico y contraseña
            (almacenada de forma cifrada) al momento del registro. Si te
            registras con Google, obtenemos tu nombre y correo asociados
            a esa cuenta. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Cómo usamos tus datos</h2>
          <p>
            Usamos tu información para crear y administrar tu cuenta,
            brindarte soporte, y —si lo autorizas— enviarte novedades
            sobre nuevas funciones de EagleGaming. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Con quién compartimos tus datos</h2>
          <p>
            No vendemos tu información personal a terceros. Podemos
            compartir datos con proveedores de servicios (como Firebase)
            únicamente para operar la plataforma. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Tus derechos</h2>
          <p>
            Puedes solicitar acceso, corrección o eliminación de tus
            datos personales en cualquier momento escribiéndonos a
            soporte. [Texto ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Seguridad</h2>
          <p>
            Implementamos medidas técnicas razonables para proteger tu
            información, aunque ningún sistema es 100% infalible. [Texto
            ficticio.]
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Contacto</h2>
          <p>
            Para consultas sobre privacidad, escríbenos a{" "}
            <a href="mailto:privacidad@eaglegaming.com">
              privacidad@eaglegaming.com
            </a>
            . [Texto ficticio.]
          </p>
        </section>
      </div>
    </div>
  );
}